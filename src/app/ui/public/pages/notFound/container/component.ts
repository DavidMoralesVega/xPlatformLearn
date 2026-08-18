import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Seo } from '../../../../../services/seo';

@Component({
  selector: 'public-not-found',
  templateUrl: './component.html',
  imports: [RouterLink, MatButtonModule],
})
export class NotFoundPublicComponent {
  private readonly seo = inject(Seo);

  constructor() {
    this.seo.set({
      title: 'Página no encontrada · UNIOR',
      description: 'La dirección no corresponde a ninguna página de la plataforma.',
      path: '/404',
      // Se le pide al buscador que no la indexe. Sin esta línea, un 404 que se
      // dibuja con estilo termina apareciendo entre los resultados.
      index: false,
    });
  }
}
