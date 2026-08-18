import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { Programs } from './services/programs';

/**
 * Dónde se dibuja cada ruta.
 *
 * `Prerender` significa que el HTML se escribe durante `ng build` y llega a
 * Firebase como un archivo. `Client` significa que llega un HTML vacío y lo
 * arma el navegador. La diferencia se ve en una sola prueba: pedir la dirección
 * con `curl` —sin ejecutar JavaScript— y mirar si el contenido está o no.
 */
export const serverRoutes: ServerRoute[] = [
  {
    /**
     * El área privada se dibuja en el navegador.
     *
     * En el servidor no hay sesión —no hay cookies ni nadie conectado—, así que
     * el guardián siempre respondería que no. Prerenderizar esta ruta guardaría
     * en un archivo la redirección al login y todo el mundo la vería, incluso
     * después de entrar.
     */
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    /**
     * Una ficha por cada programa, escrita durante la compilación.
     *
     * Angular no puede adivinar los `:slug`: se los tiene que decir alguien.
     * Eso es `getPrerenderParams`, y acá lo resuelve el mismo servicio que usa
     * la pantalla. Cada programa activo termina siendo un archivo HTML con su
     * nombre, su precio y sus metadatos ya escritos adentro.
     *
     * El costo es que la lista queda congelada en el momento de compilar: un
     * programa nuevo aparece en el sitio recién en el siguiente despliegue. Para
     * un catálogo que cambia una vez por semestre, es el intercambio correcto.
     */
    path: 'programa/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const programs = await inject(Programs).all();
      return programs.map((program) => ({ slug: program.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
