import { PessoaResponse } from './pessoa.model';

export interface DashboardResponse {
  saldoGeral: number;
  totalAReceber: number;
  totalAPagar: number;
  pessoas: PessoaResponse[];
}
