/**
 * Servicio 1 · **la autenticación**.
 *
 * El único del proyecto que sabe cómo se entra y cómo se sale. Ningún
 * componente llama a `firebase/auth`: le preguntan a este.
 *
 * Firebase avisa de los cambios de sesión con una suscripción de toda la vida
 * (`onAuthStateChanged`). Acá se traduce a una señal, y a partir de ahí toda la
 * aplicación pregunta por la sesión leyendo una señal en la plantilla.
 *
 * Los tres estados que hay que distinguir, y que casi todos confunden:
 *
 *   1. `loading` — todavía no sabemos. Dura milisegundos y es el que produce el
 *      parpadeo de «Entrar / avatar / Entrar» si uno no lo contempla.
 *   2. hay sesión.
 *   3. no hay sesión.
 *
 * Tratar 1 y 3 como lo mismo es el error clásico: manda al login a gente que ya
 * estaba adentro.
 */
import { Service, computed, inject, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { AUTH } from './firebase';
import { User } from '../domain/user';

@Service()
export class Auth {
  private readonly auth = inject(AUTH);

  // Las señales privadas se escriben acá adentro y en ningún otro lado.
  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal(true);

  /** Hacia afuera solo se pueden leer: `asReadonly()` quita el `set`. */
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();

  /** Derivada: se recalcula sola cuando cambia `_user`. */
  readonly isAuthenticated = computed(() => this._user() !== null);

  /**
   * Se resuelve cuando Firebase contestó por primera vez.
   *
   * Una señal sirve para dibujar, pero un guardián de ruta no dibuja: tiene que
   * responder sí o no una sola vez, y si pregunta antes de que Firebase conteste
   * siempre lee `null` y manda al login a quien ya estaba adentro. Por eso el
   * mismo estado se ofrece también como promesa, que es lo que se puede esperar.
   */
  readonly ready: Promise<void>;

  /** La función que resuelve la promesa de arriba. Se llama una sola vez. */
  private markReady!: () => void;

  constructor() {
    this.ready = new Promise<void>((resolve) => (this.markReady = resolve));

    if (!this.auth) {
      // Estamos en el servidor: no hay sesión que consultar. Se apaga «loading»
      // para que nadie quede esperando.
      this._loading.set(false);
      this.markReady();
      return;
    }

    // Se dispara al entrar, al salir y al recargar la página. De todo lo que
    // manda Firebase se sacan cuatro campos y el resto se deja ir.
    onAuthStateChanged(this.auth, (firebaseUser) => {
      this._user.set(
        firebaseUser
          ? {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName ?? 'Sin nombre',
              email: firebaseUser.email ?? '',
              photo: firebaseUser.photoURL,
            }
          : null,
      );
      this._loading.set(false);
      // Llamarla de nuevo no hace nada: una promesa se resuelve una sola vez.
      this.markReady();
    });
  }

  /**
   * Entrar con Google. Abre la ventana emergente del proveedor.
   *
   * No hace falta guardar nada del resultado: `onAuthStateChanged` se entera
   * solo y actualiza la señal.
   */
  async signInWithGoogle(): Promise<void> {
    if (!this.auth) return;
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  /** Entrar con correo y contraseña. */
  async signInWithEmail(email: string, password: string): Promise<void> {
    if (!this.auth) return;
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Crear la cuenta. Sin esto, nadie tendría con qué entrar.
   *
   * Firebase crea el usuario **y lo deja adentro**: no hay que llamar a
   * `signInWithEmail` después.
   *
   * Con Google esto no existe: la cuenta ya está creada en Google, y entrar la
   * primera vez ES registrarse.
   */
  async registerWithEmail(email: string, password: string): Promise<void> {
    if (!this.auth) return;
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signOut(): Promise<void> {
    if (!this.auth) return;
    await signOut(this.auth);
  }

  /**
   * Traduce el error del SDK a una frase que sirva.
   *
   * Es un método de la clase, no una función suelta: saber qué significa
   * `auth/invalid-credential` es parte de saber de autenticación, y de eso
   * sabe este servicio. La pantalla llama `this.auth.errorMessage(error)` y no
   * necesita conocer un solo código de Firebase.
   *
   * Firebase contesta con códigos como `auth/invalid-credential`. Mostrarlos tal
   * cual es empujarle al usuario un problema nuestro. Y hay un detalle de
   * seguridad: Firebase ya NO distingue entre «no existe ese correo» y «la
   * contraseña está mal» —los dos dan `invalid-credential`— justo para no
   * revelar qué correos están registrados. El mensaje respeta eso.
   */
  errorMessage(error: unknown): string {
    // El error del SDK llega como `unknown`, que es «no sé qué es esto». Para
    // leerle el código hay que decir con qué forma se lo va a mirar.
    const code = (error as { code?: string })?.code ?? '';

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'El correo o la contraseña no coinciden.';
      case 'auth/invalid-email':
        return 'Ese correo no parece válido.';
      case 'auth/email-already-in-use':
        return 'Ese correo ya tiene cuenta. Entre en vez de registrarse.';
      case 'auth/weak-password':
        return 'La contraseña es muy corta. Use al menos 6 caracteres.';
      case 'auth/user-disabled':
        return 'Esta cuenta está deshabilitada. Escriba a Postgrado.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espere unos minutos y vuelva a probar.';
      // Este NO es culpa del usuario: es que el proveedor está apagado en la
      // consola de Firebase. Se dice sin rodeos, porque quien tiene que
      // arreglarlo es quien programa.
      case 'auth/operation-not-allowed':
        return 'El acceso con correo y contraseña no está habilitado en Firebase.';
      case 'auth/network-request-failed':
        return 'Sin conexión. Revise su internet e inténtelo otra vez.';
      // El más común con la ventana emergente no es un fallo: es que la persona
      // la cerró. Decirle «error de autenticación» sería mentirle.
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'No se completó el ingreso. Puede intentarlo de nuevo.';
      default:
        return 'No se pudo entrar. Inténtelo de nuevo en un momento.';
    }
  }
}
