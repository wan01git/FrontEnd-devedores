import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // fb.nonNullable.group tipa os controles como sempre string (nunca
  // string | null) — sem isso, o TypeScript trataria o valor de cada campo
  // como possivelmente nulo, mesmo ele nunca sendo de fato nulo na prática.
  protected readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); // faz os erros aparecerem mesmo sem o campo ter sido tocado
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    this.authService.login(this.formulario.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (erro) => {
        this.enviando.set(false);
        // erro.error é o corpo JSON que o GlobalExceptionHandler do backend
        // devolveu — para credenciais inválidas, é {"erro": "e-mail ou senha inválidos"}
        this.erro.set(erro.error?.erro ?? 'não foi possível entrar. tente novamente.');
      },
    });
  }
}
