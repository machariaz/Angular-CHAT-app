import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/chat/chat.component').then((com) => com.ChatComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((com) => com.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((com) => com.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((com) => com.RegisterComponent),
  },
  {
    path: 'update',
    loadComponent: () =>
      import('./pages/update/update.component').then((com) => com.UpdateComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/login/login.component').then((com) => com.LoginComponent),
  },
  {
    path: '**',
    redirectTo: '/login', // Redirect to login or a 404 page
    pathMatch: 'full',
  },
];

