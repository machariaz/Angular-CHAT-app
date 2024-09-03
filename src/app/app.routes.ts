import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { UpdateComponent } from './pages/update/update.component';

export const routes: Routes = [
  
  
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'update',
    component: UpdateComponent,
  },
{
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/chat/chat.component').then((com) => com.ChatComponent),
  },
  {
    path: 'auction',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/auction/auction.component').then((com) => com.AuctionComponent),
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

