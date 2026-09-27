import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard funcional: no lugar de "class AuthGuard implements CanActivate"
// com um método canActivate(), uma função que devolve true (libera a
// navegação) ou false (bloqueia). Registrado numa rota via "canActivate:
// [authGuard]", no app.routes.ts.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
