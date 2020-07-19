import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResultadoService {

  constructor(
    private http: HttpClient
  ) {
  }

  public getResultado(votacaoId: number): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/votacao/resultado/${votacaoId}`);
  }

}
