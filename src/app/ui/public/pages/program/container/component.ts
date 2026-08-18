import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Programs } from '../../../../../services/programs';
import { Seo } from '../../../../../services/seo';
import { Program } from '../../../../../domain/program';

@Component({
  selector: 'public-program',
  templateUrl: './component.html',
  imports: [
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
})
export class ProgramPublicComponent {
  private readonly programs = inject(Programs);
  private readonly seo = inject(Seo);
  private readonly route = inject(ActivatedRoute);

  /**
   * El `:slug` de la dirección.
   *
   * `snapshot` es el valor en el momento de entrar, y alcanza porque esta
   * pantalla se construye de nuevo en cada navegación.
   */
  private readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';

  /** El programa, o `undefined` si el slug de la URL no existe. */
  readonly program = signal<Program | undefined>(
    // Igual que en el catálogo: si el servidor ya mandó los programas dentro
    // del HTML, se busca el de esta ficha ahí mismo y no se sale a la red.
    this.programs.transferred().find((program) => program.slug === this.slug),
  );

  readonly loading = signal(this.program() === undefined);

  constructor() {
    if (this.loading()) {
      this.load();
      return;
    }

    // Vino en el HTML: solo faltan los metadatos.
    this.describe(this.program());
  }

  /** La portada que le corresponde al programa, por su área. */
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
    const program = await this.programs.bySlug(this.slug);

    this.program.set(program);
    this.loading.set(false);
    this.describe(program);
  }

  /**
   * Los metadatos de la ficha.
   *
   * Se ponen cuando se sabe qué programa es, no antes: el título de esta
   * pantalla ES el nombre del programa. Está aparte porque los datos pueden
   * llegar por dos caminos —dentro del HTML o por la red— y en los dos hay que
   * describir la página igual.
   */
  private describe(program: Program | undefined): void {
    if (program) {
      this.seo.set({
        title: `${program.name} · UNIOR`,
        description: `${program.area} · ${program.hours} horas académicas · Modalidad ${program.mode}.`,
        path: `/programa/${program.slug}`,
      });
      return;
    }

    // El slug no existe. Se pide explícitamente que no se indexe: una dirección
    // que no lleva a ningún programa no debería aparecer en un buscador.
    this.seo.set({
      title: 'Programa no disponible · UNIOR',
      description: 'El programa que busca ya no se oferta. Vea el catálogo abierto.',
      path: `/programa/${this.slug}`,
      index: false,
    });
  }
}
