import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PessoaRequest, PessoaResponse } from '../../shared/models/pessoa.model';

@Injectable({ providedIn: 'root' })
export class PessoaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pessoas`;

  listar(): Observable<PessoaResponse[]> {
    return this.http.get<PessoaResponse[]>(this.baseUrl);
  }

  buscar(id: number): Observable<PessoaResponse> {
    return this.http.get<PessoaResponse>(`${this.baseUrl}/${id}`);
  }

  criar(request: PessoaRequest): Observable<PessoaResponse> {
    return this.http.post<PessoaResponse>(this.baseUrl, request);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
