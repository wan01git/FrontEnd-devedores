import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { PessoaService } from '../../core/services/pessoa.service';
import { DashboardResponse } from '../../shared/models/dashboard.model';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { MoedaPipe } from '../../shared/pipes/moeda.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CountUpDirective, MoedaPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly pessoaService = inject(PessoaService);
  private readonly fb = inject(FormBuilder);

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly dashboard = signal<DashboardResponse | null>(null);

  protected readonly mostrarFormNovaPessoa = signal(false);
  protected readonly criandoPessoa = signal(false);

  protected readonly formNovaPessoa = this.fb.nonNullable.group({
    nome: ['', Validators.required],
  });

  // Um componente standalone pode buscar dados direto no constructor (ou
  // num ngOnInit — tanto faz aqui). Numa etapa futura, se a tela crescer,
  // isso pode virar um Resolver de rota; para uma chamada simples como
  // esta, manter no componente é suficiente e mais fácil de acompanhar.
  constructor() {
    this.carregarDashboard();
  }

  protected abrirFormNovaPessoa(): void {
    this.mostrarFormNovaPessoa.set(true);
  }

  protected cancelarNovaPessoa(): void {
    this.mostrarFormNovaPessoa.set(false);
    this.formNovaPessoa.reset();
  }

  protected criarPessoa(): void {
    if (this.formNovaPessoa.invalid) {
      this.formNovaPessoa.markAllAsTouched();
      return;
    }

    this.criandoPessoa.set(true);

    this.pessoaService.criar(this.formNovaPessoa.getRawValue()).subscribe({
      next: () => {
        this.criandoPessoa.set(false);
        this.mostrarFormNovaPessoa.set(false);
        this.formNovaPessoa.reset();
        this.carregarDashboard(); // recarrega para a pessoa nova já aparecer na lista, com saldo zero
      },
      error: (erro) => {
        this.criandoPessoa.set(false);
        // 409 do UNIQUE(usuario_id, nome) cai aqui: "já existe um registro..."
        this.formNovaPessoa.controls.nome.setErrors({
          servidor: erro.error?.erro ?? 'não foi possível criar. tente outro nome.',
        });
      },
    });
  }

  private carregarDashboard(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.dashboardService.obter().subscribe({
      next: (resposta) => {
        this.dashboard.set(resposta);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('não foi possível carregar o dashboard. verifique se o backend está rodando.');
        this.carregando.set(false);
      },
    });
  }
}
