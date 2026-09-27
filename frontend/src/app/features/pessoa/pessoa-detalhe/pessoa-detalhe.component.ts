import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PessoaService } from '../../../core/services/pessoa.service';
import { LancamentoService } from '../../../core/services/lancamento.service';
import { PessoaResponse } from '../../../shared/models/pessoa.model';
import { LancamentoResponse, TipoLancamento } from '../../../shared/models/lancamento.model';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';
import { MoedaPipe } from '../../../shared/pipes/moeda.pipe';

@Component({
  selector: 'app-pessoa-detalhe',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CountUpDirective, MoedaPipe],
  templateUrl: './pessoa-detalhe.component.html',
  styleUrl: './pessoa-detalhe.component.scss',
})
export class PessoaDetalheComponent {
  private readonly pessoaService = inject(PessoaService);
  private readonly lancamentoService = inject(LancamentoService);
  private readonly fb = inject(FormBuilder);

  // Lido uma única vez, via snapshot: nesta tela, a pessoa não muda sem uma
  // navegação nova (voltar ao dashboard e entrar em outra). Se um dia
  // adicionarmos navegação direta entre pessoas dentro da própria tela
  // (um "próxima pessoa", por exemplo), isso precisaria virar uma
  // assinatura em route.paramMap em vez de uma leitura só na criação do
  // componente — porque o Angular reaproveita a mesma instância do
  // componente ao navegar entre rotas com o mesmo path e parâmetro
  // diferente, e o snapshot não se atualiza sozinho nesse caso.
  private readonly pessoaId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly pessoa = signal<PessoaResponse | null>(null);
  protected readonly lancamentos = signal<LancamentoResponse[]>([]);

  protected readonly mostrarFormNovoLancamento = signal(false);
  protected readonly salvando = signal(false);
  protected readonly excluindoId = signal<number | null>(null);

  protected readonly formLancamento = this.fb.nonNullable.group({
    tipo: this.fb.nonNullable.control<TipoLancamento>('A_RECEBER', Validators.required),
    valor: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0.01)]),
    descricao: this.fb.nonNullable.control<string>(''),
    dataLancamento: this.fb.nonNullable.control<string>(this.hoje()),
  });

  protected readonly formFiltro = this.fb.nonNullable.group({
    inicio: [''],
    fim: [''],
  });

  constructor() {
    this.carregarTudo();
  }

  protected abrirFormNovoLancamento(): void {
    this.mostrarFormNovoLancamento.set(true);
  }

  protected cancelarNovoLancamento(): void {
    this.mostrarFormNovoLancamento.set(false);
    this.formLancamento.reset({ tipo: 'A_RECEBER', valor: 0, descricao: '', dataLancamento: this.hoje() });
  }

  protected salvarLancamento(): void {
    if (this.formLancamento.invalid) {
      this.formLancamento.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const valores = this.formLancamento.getRawValue();

    this.lancamentoService
      .criar(this.pessoaId, {
        tipo: valores.tipo,
        valor: valores.valor,
        descricao: valores.descricao || undefined,
        dataLancamento: valores.dataLancamento || undefined,
      })
      .subscribe({
        next: () => {
          this.salvando.set(false);
          this.cancelarNovoLancamento();
          this.carregarTudo(); // recarrega pessoa (saldo novo) e a lista de lançamentos juntos
        },
        error: (erro) => {
          this.salvando.set(false);
          this.formLancamento.controls.valor.setErrors({
            servidor: erro.error?.valor ?? erro.error?.erro ?? 'não foi possível salvar.',
          });
        },
      });
  }

  protected excluirLancamento(lancamentoId: number): void {
    this.excluindoId.set(lancamentoId);

    this.lancamentoService.excluir(this.pessoaId, lancamentoId).subscribe({
      next: () => {
        this.excluindoId.set(null);
        this.carregarTudo();
      },
      error: () => {
        this.excluindoId.set(null);
        this.erro.set('não foi possível excluir o lançamento.');
      },
    });
  }

  protected aplicarFiltro(): void {
    this.carregarLancamentos();
  }

  protected limparFiltro(): void {
    this.formFiltro.reset({ inicio: '', fim: '' });
    this.carregarLancamentos();
  }

  private carregarTudo(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.pessoaService.buscar(this.pessoaId).subscribe({
      next: (pessoa) => {
        this.pessoa.set(pessoa);
        this.carregarLancamentos();
      },
      error: () => {
        this.erro.set('não foi possível carregar esta pessoa.');
        this.carregando.set(false);
      },
    });
  }

  private carregarLancamentos(): void {
    const { inicio, fim } = this.formFiltro.getRawValue();

    this.lancamentoService.listar(this.pessoaId, inicio || undefined, fim || undefined).subscribe({
      next: (lista) => {
        this.lancamentos.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('não foi possível carregar os lançamentos.');
        this.carregando.set(false);
      },
    });
  }

  private hoje(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
