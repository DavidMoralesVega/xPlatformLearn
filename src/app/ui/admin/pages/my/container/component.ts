import { Component, inject } from '@angular/core';
import { Auth } from '../../../../../services/auth';
import { Seo } from '../../../../../services/seo';

@Component({
  selector: 'admin-my',
  templateUrl: './component.html',
  imports: [],
})
export class MyAdminComponent {
  /** Público para la plantilla: acá se lee quién entró. */
  protected readonly auth = inject(Auth);

  private readonly seo = inject(Seo);

  constructor() {
    this.seo.set({
      title: 'Mi portal · Plataforma UNIOR',
      description: 'Sus programas y su avance en la Universidad Privada de Oruro.',
      path: '/admin/portal',
      // Una pantalla privada no se indexa: el buscador no puede entrar y la
      // dirección no le sirve a nadie que llegue desde Google.
      index: false,
    });
  }
}
