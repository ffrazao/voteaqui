import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VotarService {

  constructor(
    private http: HttpClient
  ) {
  }

  public getIdentificacao(id: string): any {
    return null;
  }

  public getVotacaoByIdentificacao(identificacao: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/participante/${identificacao}`);
  }

}
