import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// loadComponent (em vez de "component: LoginComponent" direto) faz lazy
// loading: o JavaScript de cada tela só é baixado pelo navegador quando a
// pessoa navega até aquela rota, em vez de tudo ir junto no bundle inicial.
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./features/auth/cadastro/cadastro.component').then(m => m.CadastroComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'pessoas/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pessoa/pessoa-detalhe/pessoa-detalhe.component').then(m => m.PessoaDetalheComponent),
  },
  { path: '**', redirectTo: '' },
];
