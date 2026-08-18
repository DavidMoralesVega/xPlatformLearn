import { Routes } from '@angular/router';
import { PublicRoutes } from './ui/public/routes';
import { AdminRoutes } from './ui/admin/routes';

/**
 * La tabla de rutas de primer nivel.
 *
 * **El orden importa y acá es la única regla del archivo.** Angular recorre esta
 * lista de arriba abajo y se queda con la primera que coincida. Una ruta con
 * `path: ''` coincide como prefijo con CUALQUIER dirección, así que si estuviera
 * primera se quedaría también con `/admin/portal`: entraría al contenedor
 * público, buscaría `admin/portal` entre las rutas públicas, no lo encontraría y
 * terminaría en el `**` que dibuja el 404.
 *
 * Por eso `admin` va antes: lo específico primero, el comodín al final.
 */
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./ui/admin/container/component').then((m) => m.AdminComponent),
    children: AdminRoutes,
  },
  {
    path: '',
    loadComponent: () => import('./ui/public/container/component').then((m) => m.PublicComponent),
    children: PublicRoutes,
  },
];

// Las direcciones que produce esta tabla:
//
//   https://learn-unior.web.app/                  → redirige a /programas
//   https://learn-unior.web.app/inicio
//   https://learn-unior.web.app/iniciar-sesion
//   https://learn-unior.web.app/programas
//   https://learn-unior.web.app/programa/:slug    → /programa/gestion-de-proyectos
//   https://learn-unior.web.app/admin/portal      → pide sesión
