import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { ResultadoService } from './resultado.service';

@Injectable({ providedIn: 'root' })
export class ResultadoResolver implements Resolve<string> {

  constructor(
    private servico: ResultadoService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<string>|Promise<string>|string {
    return this.servico.getResultado(parseInt(route.paramMap.get('votacaoId'), 10));
  }
}
