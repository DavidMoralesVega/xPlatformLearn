/**
 * La prueba de la raíz.
 *
 * Comprueba lo único que hace `App`: montarse y dejar el hueco donde el
 * enrutador pone cada pantalla. Necesita `provideRouter([])` porque
 * `router-outlet` no funciona sin un enrutador, aunque la tabla esté vacía.
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('se monta', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deja el hueco del enrutador', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
