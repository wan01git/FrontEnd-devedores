export interface PessoaRequest {
  nome: string;
}

export interface PessoaResponse {
  id: number;
  nome: string;
  saldo: number; // positivo = credor (te deve); negativo = devedor (você deve)
}
