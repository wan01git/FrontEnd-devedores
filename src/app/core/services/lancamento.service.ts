import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LancamentoRequest, LancamentoResponse } from '../../shared/models/lancamento.model';

@Injectable({ providedIn: 'root' })
export class LancamentoService {
  private readonly http = inject(HttpClient);

  private baseUrl(pessoaId: number): string {
    return `${environment.apiUrl}/pessoas/${pessoaId}/lancamentos`;
  }

  // inicio/fim são opcionais — sem eles, o backend devolve todos os
  // lançamentos da pessoa (mesmo comportamento do
  // findByPessoaIdOrderByDataLancamentoDesc lá no LancamentoRepository).
  listar(pessoaId: number, inicio?: string, fim?: string): Observable<LancamentoResponse[]> {
    let params = new HttpParams();
    if (inicio && fim) {
      params = params.set('inicio', inicio).set('fim', fim);
    }
    return this.http.get<LancamentoResponse[]>(this.baseUrl(pessoaId), { params });
  }

  criar(pessoaId: number, request: LancamentoRequest): Observable<LancamentoResponse> {
    return this.http.post<LancamentoResponse>(this.baseUrl(pessoaId), request);
  }

  excluir(pessoaId: number, lancamentoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(pessoaId)}/${lancamentoId}`);
  }
}
