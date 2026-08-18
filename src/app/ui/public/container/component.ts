/**
 * El contenedor del sitio público.
 *
 * Es el marco que comparten la portada, el catálogo, la ficha y el ingreso:
 * barra arriba, contenido en el medio y pie abajo. Las pantallas se dibujan
 * dentro del `router-outlet` y ninguna vuelve a escribir la barra ni el pie.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderPublicComponent } from '../components/header/container/component';

@Component({
  selector: 'public',
  templateUrl: './component.html',
  imports: [RouterOutlet, HeaderPublicComponent],
})
export class PublicComponent {}
