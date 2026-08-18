import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Programs } from '../../../../../services/programs';
import { Seo } from '../../../../../services/seo';
import { Program } from '../../../../../domain/program';

@Component({
  selector: 'public-programs',
  templateUrl: './component.html',
  imports: [DecimalPipe, RouterLink, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
})
export class ProgramsPublicComponent {
  private readonly programs = inject(Programs);
  private readonly seo = inject(Seo);

  /**
   * El catálogo. Arranca con lo que el servidor ya dejó dentro del HTML.
   *
   * Si viene lleno, el navegador dibuja lo mismo que recibió y no hay parpadeo;
   * si viene vacío —porque se llegó navegando y no recargando— se pide a la red.
   */
  readonly catalog = signal<Program[]>(this.programs.transferred());

  /** Verdadero mientras se espera la respuesta. Es el estado que casi todos se saltan. */
  readonly loading = signal(this.catalog().length === 0);

  constructor() {
    this.seo.set({
      title: 'Programas de posgrado · UNIOR',
      description:
        'Diplomados y programas de posgrado de la Universidad Privada de Oruro: modalidad, carga horaria e inversión.',
      path: '/programas',
    });

    // Pedir los datos desde el constructor está bien: es una LECTURA, y leer de
    // más no rompe nada. Escribir desde el constructor sí —correría en el
    // servidor, otra vez al hidratar y otra por cada ruta que prerenderiza
    // `ng build`—.
    if (this.loading()) this.load();
  }

  /**
   * La portada que le corresponde a un programa.
   *
   * Recibe el programa y devuelve la imagen, en vez de exponer una tabla para
   * que la plantilla la revise. El `Area` es un tipo cerrado de cuatro valores,
   * así que el `switch` los cubre todos y no hace falta un caso por defecto: si
   * mañana se agrega un área, este método deja de compilar hasta que alguien
   * decida qué imagen le toca.
   */
  cover(program: Program): string {
    switch (program.area) {
      case 'Tecnología':
        return 'img/covers/tecnologia.svg';
      case 'Gestión':
        return 'img/covers/gestion.svg';
      case 'Salud':
        return 'img/covers/salud.svg';
      case 'Educación':
        return 'img/covers/educacion.svg';
    }
  }

  private async load(): Promise<void> {
    this.catalog.set(await this.programs.all());
    this.loading.set(false);
  }
}
