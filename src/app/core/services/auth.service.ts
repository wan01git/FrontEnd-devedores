import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CadastroRequest, LoginRequest, TokenResponse } from '../../shared/models/auth.model';

const CHAVE_TOKEN = 'caderneta_token';

// providedIn: 'root' registra este serviço como singleton da aplicação
// inteira — é o equivalente a declarar no "providers" do AppModule antigo,
// só que o próprio serviço se registra, sem precisar de um módulo central
// listando tudo.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // O signal começa lendo o que já está salvo no localStorage — assim, se a
  // pessoa recarregar a página (F5), ela continua logada em vez de cair no
  // login de novo a cada atualização.
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(CHAVE_TOKEN));

  // computed() deriva um novo signal a partir de outro. Sempre que
  // tokenSignal mudar, estaAutenticado recalcula sozinho — qualquer
  // template ou componente que usar estaAutenticado() é notificado pelo
  // Angular automaticamente, sem você disparar evento nenhum manualmente.
  readonly estaAutenticado = computed(() => this.tokenSignal() !== null);

  cadastrar(request: CadastroRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/cadastro`, request)
      .pipe(tap(resposta => this.salvarToken(resposta.token)));
  }

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(resposta => this.salvarToken(resposta.token)));
  }

  logout(): void {
    localStorage.removeItem(CHAVE_TOKEN);
    this.tokenSignal.set(null);
  }

  obterToken(): string | null {
    return this.tokenSignal();
  }

  private salvarToken(token: string): void {
    localStorage.setItem(CHAVE_TOKEN, token);
    this.tokenSignal.set(token);
  }
}
