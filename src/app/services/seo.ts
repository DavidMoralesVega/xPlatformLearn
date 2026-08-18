/**
 * Servicio de **metadatos**.
 *
 * Cambiar el `<title>` y las etiquetas `<meta>` de cada pantalla. Suena a
 * detalle y no lo es: en una aplicación de una sola página el navegador carga
 * `index.html` UNA vez, así que sin esto las seis pantallas comparten el mismo
 * título, la misma descripción y la misma tarjeta al compartirse por WhatsApp.
 *
 * Lo hace el servicio y no cada componente porque las etiquetas son siempre las
 * mismas siete: el que llama dice QUÉ, y este archivo sabe CÓMO.
 */
import { Service, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { PageSeo } from '../domain/page';

@Service()
export class Seo {
  // `Title` y `Meta` son de Angular, no del navegador. Esa es la razón de que
  // esto funcione también en el servidor: al renderizar del lado del servidor no
  // existe `document`, y estas dos clases escriben igual en el HTML que se envía.
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  // El documento, pedido por inyección y no tomado de la variable global. En el
  // servidor no existe un `document` global: Angular provee uno de mentira que
  // se escribe igual, y por eso las etiquetas también salen en el HTML que viaja
  // por la red. Usar `document` a secas rompería el renderizado en servidor.
  private readonly document = inject(DOCUMENT);

  /**
   * El dominio del sitio.
   *
   * Está escrito y no se pregunta al navegador. Pedirle `location.origin` da
   * `http://localhost:4200` mientras se programa y, peor, el puerto interno del
   * prerenderizador al construir: quedaría `og:url` apuntando a un servidor que
   * no existe. La dirección canónica de un sitio es una decisión, no algo que
   * se averigüe en tiempo de ejecución.
   */
  private readonly site = 'https://learn-unior.web.app';

  /**
   * Aplica los metadatos de una pantalla.
   *
   * Se llama desde el constructor del componente: cuando la pantalla se arma,
   * sus etiquetas se arman con ella.
   */
  set(page: PageSeo): void {
    // Lo que se ve en la pestaña del navegador y como titular en Google.
    this.title.setTitle(page.title);

    // `updateTag` reemplaza la etiqueta si ya existe y la crea si no. Por eso
    // navegar entre pantallas no va dejando descripciones acumuladas.
    this.meta.updateTag({ name: 'description', content: page.description });

    // Permiso explícito para los buscadores. Una ficha de programa se indexa;
    // el panel privado del estudiante, no. El valor por defecto es indexar.
    this.meta.updateTag({
      name: 'robots',
      content: page.index === false ? 'noindex, nofollow' : 'index, follow',
    });

    // La dirección canónica de ESTA pantalla. Sin ella, dos direcciones que
    // muestran lo mismo compiten entre sí en el buscador.
    const url = `${this.site}${page.path}`;
    this.meta.updateTag({ property: 'og:url', content: url });
    this.canonical(url);

    // Open Graph: lo que se ve cuando alguien pega el enlace en WhatsApp,
    // Facebook o LinkedIn. El título y la descripción se repiten a propósito;
    // son etiquetas distintas y las lee otro programa.
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });

    // La imagen tiene que ser una dirección absoluta: quien la muestra es un
    // servidor de Meta o de LinkedIn, no el navegador de nadie.
    this.meta.updateTag({
      property: 'og:image',
      content: page.image ?? `${this.site}/icons/icon-512x512.png`,
    });
  }

  // ── De acá para abajo, lo que la pantalla no necesita saber ────────────────

  /**
   * La etiqueta `<link rel="canonical">`.
   *
   * `Meta` solo sabe de `<meta>`, y esta es un `<link>`, así que hay que
   * escribirla a mano en la cabecera: se busca la que haya y se le cambia la
   * dirección; si no hay ninguna, no se inventa —la de `index.html` alcanza—.
   */
  private canonical(url: string): void {
    const link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (link) link.href = url;
  }
}
