import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderPublicComponent } from '../../public/components/header/container/component';

@Component({
  selector: 'admin',
  templateUrl: './component.html',
  // Se reutiliza la misma barra del sitio público. Ya sabe dibujar la sesión y
  // salir; una segunda barra solo para el área privada sería el mismo código
  // escrito dos veces, con dos sitios donde arreglar el mismo error.
  imports: [RouterOutlet, HeaderPublicComponent],
})
export class AdminComponent {}
