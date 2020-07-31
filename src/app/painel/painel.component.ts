import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MensagemService } from './../comum/servico/mensagem/mensagem.service';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.scss']
})
export class PainelComponent implements OnInit {

  public identificacao = null;

  public entidade = null;

  public filtro = '';
  public filtroTexto = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mensagem: MensagemService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(async (p) => {
      this.identificacao = p.id;
      this.route.data.subscribe(r => {
        this.entidade = r.dados;
        if (!this.entidade) {
          this.mensagem.erro(`Nenhuma votação encontrada para o identificador ${this.identificacao}`);
          this.router.navigate(['../']);
        } else {
          this.entidade.votacaoLista.forEach(e => {
            e.inicio = e.inicio.replace(/-/g, '/');
            e.termino = e.termino.replace(/-/g, '/');
          });
        }
      });
    });
  }

  situacao(inicio, termino): { sigla: string, nome: string } {
    let agora = new Date();
    inicio = new Date(inicio.replace(/-/g, '/'));
    termino = new Date(termino.replace(/-/g, '/'));
    if (agora.getTime() >= inicio.getTime() && agora.getTime() <= termino.getTime()) {
      return { sigla: 'E', nome: 'Em andamento' };
    } else if (agora.getTime() < inicio.getTime()) {
      return { sigla: 'F', nome: 'Futuro' };
    } else if (agora.getTime() > termino.getTime()) {
      return { sigla: 'X', nome: 'Encerrado' };
    } else {
      return { sigla: '', nome: '' };
    }
  }

  filtrarVotacao(votacao: any, params): boolean {
    return (!params[2] || params[2].trim().length === 0 ||
      votacao.nome.trim().toLowerCase().indexOf(params[2].toLowerCase()) >= 0) &&
      (!params[0] || params[0].trim().length === 0 ||
        params[1](votacao.inicio, votacao.termino).sigla === params[0]);
  }

}
