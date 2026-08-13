import { Routes } from '@angular/router';
import { PublicRoutes } from './ui/public/routes';
import { AdminRoutes } from './ui/admin/routes';


export const routes: Routes = [
  // Public
  {
    path: '',
    loadComponent: () => import('./ui/public/container/component').then((m) => m.PublicComponent),
    children: PublicRoutes,
  },
  {
    path: 'admin',
    loadComponent: () => import('./ui/admin/container/component').then((m) => m.AdminComponent),
    children: AdminRoutes,
  },
  // Admin
];

// https://learn-unior.web.app/
// https://learn-unior.web.app/inicio
// https://learn-unior.web.app/iniciar-sesion
// https://learn-unior.web.app/programas
// https://learn-unior.web.app/programa/diplomado-en-administracion-de-servidores-gnu-linux :slug


// https://learn-unior.web.app/admin/portal
