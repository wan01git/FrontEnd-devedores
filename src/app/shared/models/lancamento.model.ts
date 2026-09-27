export type TipoLancamento = 'A_PAGAR' | 'A_RECEBER';

export interface LancamentoRequest {
  tipo: TipoLancamento;
  valor: number;
  descricao?: string;
  dataLancamento?: string; // formato ISO yyyy-MM-dd — casa com o LocalDate do backend
}

export interface LancamentoResponse {
  id: number;
  tipo: TipoLancamento;
  valor: number;
  descricao: string | null;
  dataLancamento: string;
}
