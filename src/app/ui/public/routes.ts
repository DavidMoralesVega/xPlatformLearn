import { Routes } from '@angular/router';

export const PublicRoutes: Routes = [
  { path: '', redirectTo: 'programas', pathMatch: 'full' },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/home/container/component').then((m) => m.HomePublicComponent),
  },
  {
    path: 'iniciar-sesion',
    loadComponent: () =>
      import('./pages/login/container/component').then((m) => m.LoginPublicComponent),
  },
  {
    path: 'programas',
    loadComponent: () =>
      import('./pages/programs/container/component').then((m) => m.ProgramsPublicComponent),
  },
  {
    path: 'programa/:slug',
    loadComponent: () =>
      import('./pages/program/container/component').then((m) => m.ProgramPublicComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/notFound/container/component').then((m) => m.NotFoundPublicComponent),
  },
];

// Estrategias de carga
// Carga ansiosa Eager
// Carga perezosa Lazy
// Carga estrategica Preload
