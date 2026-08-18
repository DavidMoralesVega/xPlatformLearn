import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Seo } from '../../../../../services/seo';

@Component({
  selector: 'public-home',
  templateUrl: './component.html',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
})
export class HomePublicComponent {
  private readonly seo = inject(Seo);

  constructor() {
    // Los metadatos se ponen al armarse la pantalla. Sin esto las seis pantallas
    // comparten el título de `index.html`, porque el navegador lo carga una vez.
    this.seo.set({
      title: 'Posgrado UNIOR · Universidad Privada de Oruro',
      description:
        'Diplomados de posgrado con horario compatible con el trabajo, docentes en ejercicio y certificación de la Universidad Privada de Oruro.',
      path: '/inicio',
    });
  }
}
