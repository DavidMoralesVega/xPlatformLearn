/**
 * El modelo de un diplomado.
 *
 * `domain/` es lo que sabe el negocio. **No importa nada de `@angular/*` ni de
 * `firebase/*`.** Por eso se escribe primero: hasta que no está claro qué es un
 * diplomado, no hay nada que mostrar ni nada que pedirle a la base.
 *
 * Los nombres van en inglés y su significado al lado, en español.
 */

/** Las cuatro áreas. Cerrado, no `string`: un error de tipeo no compila. */
export type Area = 'Tecnología' | 'Gestión' | 'Salud' | 'Educación';

/** Cómo se cursa. */
export type DeliveryMode = 'Presencial' | 'Virtual' | 'Híbrida';

export interface Program {
  /** identificador del documento en Firestore. */
  readonly id: string;
  /** ruta legible — lo que va en la URL: /programa/full-stack. */
  readonly slug: string;
  /** nombre — el título del diplomado. */
  name: string;
  /** área. */
  area: Area;
  /** horas académicas. */
  hours: number;
  /** precio en bolivianos. La unidad va en el nombre. */
  priceBs: number;
  /** modalidad. */
  mode: DeliveryMode;
  /** activo — si se sigue ofertando. Un diplomado viejo no se borra: se apaga. */
  active: boolean;
}
