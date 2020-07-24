import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from './../../environments/environment';
import { Votacao } from './../modelo/entidade/votacao';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private http: HttpClient
  ) { }

  public novo(dados: Votacao): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/votacao/novo`, dados);
  }

  public create(dados: Votacao): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/votacao`, dados);
  }

  public restore(id: number, senha: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/votacao/${id}/${senha}`);
  }

  public update(dados: Votacao): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/votacao`, dados);
  }

  public list(): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/votacao`);
  }

  public enviarCedula(mensagem: {
    senha: string,
    meio: string,
    votacao: { id: number, nome: string },
    API_URL: string,
    participanteIdLista: number[]
  }): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/votacao/cedula`, mensagem);
  }

  public alterarSenha(id: any, senhas: any): Observable<any> {
    if (senhas && senhas.senhaAtual && senhas.senhaNova) {
      return this.http.put(`${environment.API_URL}/api/votacao/${id}/alterar-senha/${senhas.senhaAtual}/${senhas.senhaNova}`, null);
    }
  }

}
