import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { Votacao } from './../../modelo/entidade/votacao';
import { ConfigService } from './../config.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {

  entidade: Votacao[];

  constructor(
    private servico: ConfigService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._route.data.subscribe((info) => {
      info.resolve.principal.subscribe((p: Votacao[]) => {
        this.entidade = p;
      });
    });
  }

}
