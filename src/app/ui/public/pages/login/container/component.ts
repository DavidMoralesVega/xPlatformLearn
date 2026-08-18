import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { email, form, minLength, required, FormField } from '@angular/forms/signals';
import { Auth } from '../../../../../services/auth';
import { Seo } from '../../../../../services/seo';

@Component({
  selector: 'public-login',
  templateUrl: './component.html',
  imports: [
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    FormField,
  ],
})
export class LoginPublicComponent {
  private readonly auth = inject(Auth);
  private readonly seo = inject(Seo);
  private readonly router = inject(Router);

  /** El mensaje de error que se muestra debajo del formulario. Vacío = sin error. */
  readonly error = signal('');

  /** Verdadero mientras Firebase contesta, para no dejar apretar dos veces. */
  readonly working = signal(false);

  /**
   * El dato.
   *
   * Es una señal con un objeto adentro. De acá salen los dos campos del
   * formulario y acá vuelve lo que la persona escribe: el formulario no guarda
   * el estado, lo guarda esta señal.
   */
  readonly credentials = signal({ email: '', password: '' });

  /**
   * El dato y sus reglas, juntos.
   *
   * `form()` envuelve la señal y devuelve un árbol de campos: `form.email`,
   * `form.password`. Las reglas van en la misma llamada —no en un objeto suelto
   * arriba del archivo— porque son de este formulario y de ningún otro.
   */
  readonly form = form(this.credentials, (credentials) => {
    required(credentials.email, { message: 'El correo electrónico es obligatorio' });
    email(credentials.email, { message: 'El correo electrónico no es válido' });
    required(credentials.password, { message: 'La contraseña es obligatoria' });
    minLength(credentials.password, 6, { message: 'La contraseña debe tener al menos 6 caracteres' });
  });

  constructor() {
    this.seo.set({
      title: 'Iniciar sesión · Plataforma UNIOR',
      description: 'Acceda a la plataforma de posgrado de la Universidad Privada de Oruro.',
      path: '/iniciar-sesion',
      // Una pantalla de ingreso no se indexa: no le sirve a nadie que llegue
      // desde Google, y le da a un buscador una puerta que no lleva a contenido.
      index: false,
    });
  }

  /** Entrar con correo y contraseña. */
  async onLogin(): Promise<void> {
    // Si el formulario no cumple sus reglas, no se sale a la red. La validación
    // del navegador es comodidad, no seguridad: quien valida de verdad es
    // Firebase del otro lado.
    if (this.form().invalid()) return;

    this.error.set('');
    this.working.set(true);

    const { email, password } = this.credentials();

    try {
      await this.auth.signInWithEmail(email, password);
      await this.enter();
    } catch (error) {
      // El servicio traduce el código de Firebase a una frase que se puede leer.
      this.error.set(this.auth.errorMessage(error));
    } finally {
      // `finally` corre salga bien o salga mal: el botón siempre se desbloquea.
      this.working.set(false);
    }
  }

  /** Entrar con Google. Abre la ventana emergente del proveedor. */
  async onGoogle(): Promise<void> {
    this.error.set('');
    this.working.set(true);

    try {
      await this.auth.signInWithGoogle();
      await this.enter();
    } catch (error) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.working.set(false);
    }
  }

  /**
   * A dónde va quien acaba de entrar.
   *
   * Está en un método propio porque las dos formas de ingresar terminan igual.
   * Si mañana hay que llevarlo a la pantalla que quiso abrir antes de que lo
   * mandaran acá, se cambia en un solo lugar.
   */
  private async enter(): Promise<void> {
    await this.router.navigate(['/admin/portal']);
  }
}
