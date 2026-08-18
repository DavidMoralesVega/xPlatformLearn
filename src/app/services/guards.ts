/**
 * El guardián de las rutas privadas.
 *
 * Y una advertencia que hay que decir en voz alta: **esto es comodidad, no
 * seguridad.** Todo el código que llega al navegador se puede leer y saltar.
 * Lo que de verdad impide que alguien lea los datos de otro son las reglas de
 * Firestore, que corren en los servidores de Google. Este guardián solo evita
 * que se muestre una pantalla vacía a quien todavía no entró.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const requireSession: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Se espera a que Firebase conteste. Sin esta línea el guardián preguntaría
  // durante los milisegundos en los que todavía no se sabe nada, leería «no hay
  // sesión» y mandaría al login a quien ya estaba adentro.
  await auth.ready;

  if (auth.isAuthenticated()) return true;

  // No se devuelve `false` a secas: eso deja al usuario donde estaba, sin
  // explicación. Se devuelve la dirección a la que hay que ir.
  return router.createUrlTree(['/iniciar-sesion']);
};
