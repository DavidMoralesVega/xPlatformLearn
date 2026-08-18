/**
 * Quien entra.
 *
 * Firebase devuelve un objeto enorme, con métodos incluidos. De todo eso, la
 * aplicación necesita cuatro campos. Lo que no se guarda no hay que mantenerlo.
 */
export interface User {
  /** identificador de Firebase. */
  readonly uid: string;
  /** nombre para mostrar. */
  readonly name: string;
  /** correo. */
  readonly email: string;
  /** foto de perfil. `null` para quien entró con correo y contraseña. */
  readonly photo: string | null;
}
