import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Um interceptor funcional é só uma função — recebe a requisição e uma
// função "next" que continua a cadeia (podem existir vários interceptors
// encadeados, cada um passando adiante para o próximo). Isso substitui a
// antiga classe que implementava a interface HttpInterceptor com um método
// intercept(). O array passado em withInterceptors([...]) no app.config.ts
// é essa cadeia.
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.obterToken();

  // Requisições HTTP no Angular são imutáveis por design — "adicionar um
  // header" nunca altera o objeto original, sempre cria uma cópia (clone)
  // com a mudança aplicada.
  const requisicaoComToken = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(requisicaoComToken).pipe(
    catchError(erro => {
      // Token ausente, expirado ou inválido: o backend responde 401 em
      // qualquer rota protegida (é o JwtAuthenticationFilter recusando a
      // requisição, lá no Java). Em vez de cada componente tratar isso
      // individualmente, resolvemos uma vez só, aqui no interceptor: desloga
      // e manda para a tela de login.
      if (erro.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => erro);
    })
  );
};
