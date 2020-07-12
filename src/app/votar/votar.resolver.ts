import { VotarService } from './votar.service';
import { Injectable } from '@angular/core';

import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VotarResolver implements Resolve<string> {
  constructor(
    private servico: VotarService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<string>|Promise<string>|string {
    return this.servico.getIdentificacao(route.paramMap.get('id'));
  }
}
