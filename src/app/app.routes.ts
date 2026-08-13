import { Routes } from '@angular/router';
import { PublicRoutes } from './ui/public/routes';
export const routes: Routes = [
  // Public
  {
    path: 'public',
    loadComponent: () => import('./ui/public/container/component').then((m) => m.PublicComponent),
    children: PublicRoutes,
  },
  {
    path: 'admin',
    loadComponent: () => import('./ui/admin/container/component').then((m) => m.AdminComponent),
  },
  // Admin
];

// https://learn-unior.web.app/public
// https://learn-unior.web.app/public/inicio
// https://learn-unior.web.app/public/programas
// https://learn-unior.web.app/public/programa/diplomado-en-administracion-de-servidores-gnu-linux :slug
// https://learn-unior.web.app/public/iniciar-sesion

// https://learn-unior.web.app/admin/portal
