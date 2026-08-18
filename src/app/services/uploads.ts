/**
 * Servicio de **subida de archivos**.
 *
 * El único archivo que sabe cómo se guarda una imagen. Quien lo usa le pasa el
 * archivo que eligió la persona y recibe una dirección de vuelta; de carpetas,
 * reintentos y progreso no se entera.
 *
 * Va a Firebase Storage, no a Firestore. Son dos productos distintos y se
 * confunden todo el tiempo: Firestore guarda **datos** —un documento entero
 * admite 1 MB— y Storage guarda **archivos**, sin ese límite. Lo que se guarda
 * en Firestore es la dirección que devuelve este servicio, un texto de cien
 * caracteres.
 */

// `Service` deja la clase lista para inyectar; `signal` es lo que hace que el
// progreso se pueda leer desde una plantilla sin escribir una sola línea de
// código de actualización.
import { Service, inject, signal } from '@angular/core';

// Del SDK de Storage se traen cuatro funciones y nada más.
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import { STORAGE } from './firebase';

@Service()
export class Uploads {
  /** El almacenamiento, ya inicializado en `app.config.ts`. */
  private readonly storage = inject(STORAGE);

  /**
   * Lo que pesa como máximo una imagen, en bytes.
   *
   * `2 * 1024 * 1024` y no `2097152`: la cuenta se lee y el número no. Es un
   * campo privado porque es una decisión de este servicio, y el día que suba a
   * 5 MB se cambia acá.
   */
  private readonly maxBytes = 2 * 1024 * 1024;

  /** Los formatos que se aceptan. Un PDF con nombre `.jpg` no entra. */
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  // Las señales privadas se escriben acá adentro y en ningún otro lado.
  private readonly _progress = signal(0);
  private readonly _uploading = signal(false);

  /**
   * Cuánto va subido, de 0 a 100.
   *
   * Hacia afuera solo se puede leer: `asReadonly()` quita el `set`. La barra de
   * progreso de la pantalla lee esta señal y se dibuja sola.
   */
  readonly progress = this._progress.asReadonly();

  /** Verdadero mientras hay una subida en curso. Sirve para bloquear el botón. */
  readonly uploading = this._uploading.asReadonly();

  /**
   * Sube una imagen y devuelve su dirección pública.
   *
   * `folder` es la carpeta lógica —`programs`, `avatars`—. El nombre del archivo
   * lo decide este servicio, no la persona que lo eligió: ver `safeName`.
   *
   * Una subida a la vez. La señal de progreso es una sola, así que dos subidas
   * simultáneas se pisarían el número; en un formulario, que es donde esto se
   * usa, no pasa.
   */
  async image(file: File, folder: string): Promise<string> {
    // Lo que no cumple no sale a la red. Se comprueba antes de gastar datos de
    // la persona, no después de que el servidor lo rechace.
    this.check(file);

    // La dirección donde va a quedar: carpeta + nombre limpio.
    const target = ref(this.storage, `${folder}/${this.safeName(file.name)}`);

    this._progress.set(0);
    this._uploading.set(true);

    try {
      // **`uploadBytesResumable` y no `uploadBytes`.** La versión simple sube y
      // avisa al final: con una foto de 2 MB en el internet de Oruro son varios
      // segundos sin una sola señal en pantalla, y la persona aprieta de nuevo.
      // Esta versión va informando, y si la conexión se corta retoma donde iba.
      const task = uploadBytesResumable(target, file, { contentType: file.type });

      // El SDK avisa del avance con una suscripción de toda la vida. Acá se la
      // traduce a una señal, que es como habla el resto de la aplicación.
      task.on('state_changed', (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this._progress.set(Math.round(percent));
      });

      // La tarea también es una promesa: `await` espera a que termine y lanza si
      // falla, así que el error sube a quien llamó y la pantalla decide qué decir.
      await task;

      // La dirección no se arma a mano: se pide. Lleva un token de descarga que
      // Firebase genera, y sin ese token la imagen no se ve aunque se adivine
      // la ruta.
      return await getDownloadURL(target);
    } finally {
      // Salga bien o salga mal, la pantalla se desbloquea.
      this._uploading.set(false);
    }
  }

  /**
   * Borra un archivo por su dirección.
   *
   * Se usa al reemplazar una imagen: si nadie borra la vieja, el proyecto va
   * juntando archivos que ya no muestra nadie y que igual se pagan.
   */
  async remove(url: string): Promise<void> {
    try {
      // `ref` también acepta una dirección completa y saca de ahí la ruta.
      await deleteObject(ref(this.storage, url));
    } catch (error) {
      // Que no esté es exactamente lo que se quería. No es un error que valga
      // la pena mostrarle a nadie.
      console.warn('[uploads] No se pudo borrar el archivo.', error);
    }
  }

  // ── De acá para abajo, lo que la pantalla no necesita saber ────────────────

  /**
   * Las dos comprobaciones que se hacen antes de subir.
   *
   * Y una advertencia que conviene decir en voz alta: **esto es comodidad, no
   * seguridad.** Cualquiera puede saltarse este código desde la consola del
   * navegador. Lo que de verdad impide subir un archivo de 80 MB son las reglas
   * de Storage, que corren en los servidores de Google.
   */
  private check(file: File): void {
    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('El archivo tiene que ser una imagen JPG, PNG o WEBP.');
    }

    if (file.size > this.maxBytes) {
      const max = this.maxBytes / 1024 / 1024;
      throw new Error(`La imagen no puede pesar más de ${max} MB.`);
    }
  }

  /**
   * Un nombre de archivo que no rompa nada.
   *
   * El nombre que trae el archivo viene de la computadora de otra persona:
   * `Diseño final (2).PNG`, con tildes, espacios y paréntesis. Eso termina en
   * una dirección web, y ahí cada uno de esos caracteres se escapa y la
   * dirección se vuelve ilegible.
   *
   * Además lleva la marca de tiempo adelante: dos personas que suban
   * `foto.jpg` no se pisan el archivo.
   */
  private safeName(original: string): string {
    const clean = original
      .toLowerCase()
      // `NFD` separa la tilde de su letra —`á` pasa a ser `a` + ´— y el reemplazo
      // descarta esas marcas sueltas. Es el rango Unicode de los acentos.
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Todo lo que no sea letra, número o punto pasa a ser un guion.
      .replace(/[^a-z0-9.]+/g, '-');

    return `${Date.now()}-${clean}`;
  }
}
