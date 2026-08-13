import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: 'portal',
    loadComponent: () =>
      import('./pages/my/container/component').then((m) => m.MyAdminComponent),
  },
];
