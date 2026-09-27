import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { formatarMoeda } from '../utils/formatar-moeda';

// Uma diretiva "standalone" funciona sozinha — sem precisar declarar em
// nenhum NgModule, só importar no array "imports" do componente que for
// usá-la (é o mesmo espírito dos componentes standalone).
//
// Uso no template: <span [appCountUp]="saldoGeral()">
//
// Toda vez que o valor de entrada mudar, em vez de simplesmente trocar o
// texto na tela, ela anima uma contagem do valor antigo até o novo — como
// uma tally sendo somada. É um "detalhe pequeno" no sentido do brief: não
// chama atenção sozinho, só faz a mudança de saldo parecer uma coisa que
// aconteceu, em vez de um número que só trocou.
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnChanges, OnDestroy {

  @Input('appCountUp') valor = 0;
  @Input() duracaoMs = 650;

  private readonly elemento = inject(ElementRef<HTMLElement>).nativeElement;
  private valorAnterior = 0;
  private frameId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!('valor' in changes) || changes['valor'].isFirstChange()) {
      this.elemento.textContent = formatarMoeda(this.valor);
      this.valorAnterior = this.valor;
      return;
    }

    this.animar(this.valorAnterior, this.valor);
  }

  ngOnDestroy(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private animar(de: number, para: number): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    const inicio = performance.now();

    const passo = (agora: number) => {
      const progresso = Math.min((agora - inicio) / this.duracaoMs, 1);
      // ease-out cúbico: começa rápido, desacelera no final — parece um
      // "acerto de contas" se assentando, não um contador de caça-níquel
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      const atual = de + (para - de) * suavizado;

      this.elemento.textContent = formatarMoeda(atual);

      if (progresso < 1) {
        this.frameId = requestAnimationFrame(passo);
      } else {
        this.valorAnterior = para;
        this.frameId = null;
      }
    };

    this.frameId = requestAnimationFrame(passo);
  }
}
