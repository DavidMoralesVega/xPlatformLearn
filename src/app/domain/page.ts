/**
 * Lo que hace falta para describir una pantalla ante Google y ante WhatsApp.
 *
 * Vive en `domain/` porque es un dato del negocio: qué se dice de cada página.
 * El servicio `Seo` sabe traducirlo a etiquetas `<meta>`, pero eso ya es
 * detalle de implementación y no tiene por qué aparecer acá.
 */
export interface PageSeo {
  /** Lo que se ve en la pestaña y como titular en el buscador. Hasta 60 caracteres. */
  title: string;
  /** El párrafo que acompaña al titular. Hasta 155 caracteres. */
  description: string;
  /** La ruta, empezando por barra: `/programas`. El dominio lo pone el servicio. */
  path: string;
  /** La imagen de la tarjeta al compartir. Si falta se usa el escudo. */
  image?: string;
  /**
   * Si el buscador puede indexarla. Por defecto sí.
   *
   * Se pone en `false` en las pantallas que no le sirven a nadie que llegue
   * desde Google: el ingreso, el portal privado y las direcciones que no existen.
   */
  index?: boolean;
}
