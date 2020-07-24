import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterStateSnapshot } from '@angular/router';

import { ConfigService } from './../config.service';
import { Votacao } from './../../modelo/entidade/votacao';
import { ConfirmarVotoComponent } from './../../cedula/confirmar-voto/confirmar-voto.component';
import { MensagemService } from './../../comum/service/mensagem/mensagem.service';

@Injectable()
export class FormResolve implements Resolve<Votacao> {

  constructor(
    private servico: ConfigService,
    private mensagem: MensagemService,
  ) {
  }

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    return this.servico.restore(route.params.id, await this.mensagem.confirmeModelo('Digite a senha de acesso', ConfirmarVotoComponent));
  }

}
