import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../../../../services/auth';

@Component({
  selector: 'public-header',
  templateUrl: './component.html',
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
})
export class HeaderPublicComponent {
  /**
   * Público porque la plantilla lo lee. `readonly` porque nadie lo reemplaza.
   *
   * La barra no guarda ninguna copia de la sesión: lee las señales del servicio
   * directamente. Un dato que se puede leer no se copia, porque una copia se
   * desincroniza.
   */
  protected readonly auth = inject(Auth);

  private readonly router = inject(Router);

  /** El primer nombre, para que la barra no crezca con «María Fernanda Rojas». */
  firstName(name: string): string {
    return name.split(' ')[0];
  }

  async onSignOut(): Promise<void> {
    await this.auth.signOut();
    // Se sale a la portada. Quedarse en una pantalla privada tras cerrar sesión
    // deja al guardián redirigiendo al login, que se lee como un error.
    await this.router.navigate(['/inicio']);
  }
}
