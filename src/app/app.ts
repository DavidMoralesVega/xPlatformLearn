/**
 * La raíz de la aplicación.
 *
 * No dibuja nada propio: solo el hueco donde el enrutador pone lo que
 * corresponda. Quien decide si se ve el sitio público o el área privada es la
 * tabla de `app.routes.ts`, y cada uno de esos dos contenedores trae su propia
 * barra y su propio pie.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {}
