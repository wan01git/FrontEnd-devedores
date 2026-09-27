import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly formulario = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly enviando = signal(false);
  protected readonly erroGeral = signal<string | null>(null);

  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erroGeral.set(null);

    this.authService.cadastrar(this.formulario.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (erro) => {
        this.enviando.set(false);

        // Erro 400 do @Valid no backend vem como { "campo": "mensagem" }
        // (veja o GlobalExceptionHandler, método que trata
        // MethodArgumentNotValidException). Usamos isso para colocar a
        // mensagem exata do backend embaixo do campo certo, em vez de um
        // erro genérico solto no topo do formulário.
        if (erro.status === 400 && erro.error) {
          for (const campo of Object.keys(erro.error)) {
            this.formulario.get(campo)?.setErrors({ servidor: erro.error[campo] });
          }
          return;
        }

        // 409 (e-mail já cadastrado) ou qualquer outro erro inesperado
        this.erroGeral.set(erro.error?.erro ?? 'não foi possível criar a conta. tente novamente.');
      },
    });
  }
}
