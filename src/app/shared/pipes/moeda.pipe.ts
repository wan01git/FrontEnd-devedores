import { Pipe, PipeTransform } from '@angular/core';
import { formatarMoeda } from '../utils/formatar-moeda';

@Pipe({
  name: 'moeda',
  standalone: true,
})
export class MoedaPipe implements PipeTransform {
  transform(valor: number): string {
    return formatarMoeda(valor);
  }
}
