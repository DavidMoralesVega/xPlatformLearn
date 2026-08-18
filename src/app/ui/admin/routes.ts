import { Routes } from '@angular/router';
import { requireSession } from '../../services/guards';

export const AdminRoutes: Routes = [
  { path: '', redirectTo: 'portal', pathMatch: 'full' },
  {
    path: 'portal',
    // El guardián corre antes de descargar el componente: quien no entró no se
    // baja el código de la pantalla privada.
    canActivate: [requireSession],
    loadComponent: () => import('./pages/my/container/component').then((m) => m.MyAdminComponent),
  },
];
