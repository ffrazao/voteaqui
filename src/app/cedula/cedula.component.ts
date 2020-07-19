import { Pauta } from './../modelo/entidade/pauta';
import { ConfirmarVotoComponent } from './confirmar-voto/confirmar-voto.component';
import { ConfirmeComponent } from './../comum/service/mensagem/confirme.component';
import { Voto } from './../modelo/entidade/voto';
import { CedulaService } from './cedula.service';
import { Opcao } from './../modelo/entidade/opcao';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MensagemService } from '../comum/service/mensagem/mensagem.service';

@Component({
  selector: 'app-cedula',
  templateUrl: './cedula.component.html',
  styleUrls: ['./cedula.component.scss']
})
export class CedulaComponent implements OnInit {

  public identificacao: string;
  public entidade = null;

  public filtro = 'E';
  public filtroTexto = '';

  public etapa = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mensagem: MensagemService,
    private servico: CedulaService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(async (p) => {
      this.identificacao = p.id;
      this.route.data.subscribe(r => {
        this.entidade = r.dados;
        const agora = new Date();

        if (!this.entidade) {
          this.mensagem.erro(`Votação (${p.votacao}) não encontrada para o identificador ${this.identificacao}`);
          this.router.navigate(['../', this.identificacao]);
          return;
        }
        const inicio = new Date(this.entidade.votacaoLista[0].inicio);
        const termino = new Date(this.entidade.votacaoLista[0].termino);
        if (agora.getTime() < inicio.getTime()) {
          this.mensagem.erro(`Votação (${this.entidade.votacaoLista[0].nome}) ainda não foi iniciada. Início previsto para (${inicio})`);
          this.router.navigate(['../', this.identificacao]);
        } else if (agora.getTime() > termino.getTime()) {
          this.mensagem.erro(`Votação (${this.entidade.votacaoLista[0].nome}) encerrada em (${termino})`);
          this.router.navigate(['../', this.identificacao]);
        } else {
          for (const pauta of this.entidade.votacaoLista[0].pautaLista) {
            for (const opcao of pauta.opcaoLista) {
              opcao.voto = '';
            }
          }
        }
      });
    });
  }

  situacao(inicio, termino): { sigla: string, nome: string } {
    let agora = new Date();
    inicio = new Date(inicio);
    termino = new Date(termino);
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

  async confirmar(): Promise<any> {
    let senha = '';
    senha = await this.mensagem.confirmeModelo('Confirme o seu voto! Insira a senha enviada', ConfirmarVotoComponent);
    if (senha) {
      const votoJson = { codigo: this.entidade.votacaoLista[0].codigo, pautaLista: [] };

      for (const pauta of this.entidade.votacaoLista[0].pautaLista) {
        const pautaJson = { codigo: pauta.codigo, opcaoLista: [] };
        for (const opcao of pauta.opcaoLista) {
          const opcaoJson = { codigo: opcao.codigo, valor: opcao.voto };
          pautaJson.opcaoLista.push(opcaoJson);
        }
        votoJson.pautaLista.push(pautaJson);
      }

      const voto = new Voto();
      voto.valor = JSON.stringify(votoJson);

      this.servico.votar(this.identificacao, this.entidade.votacaoLista[0].id, senha, voto).subscribe(r => {
        this.mensagem.sucesso('Voto registrado com sucesso!!!');
        this.router.navigate(['../', this.identificacao]);
      }, e => {
        console.log(e);
        this.mensagem.erro(e.error.msg);
      });
    }
  }

  votoSimNao(opcao: Opcao): boolean {
    return opcao['voto'] === 'S' || opcao['voto'] === 'N';
  }

  escolhas(pauta: Pauta): number {
    let qtdSim = 0;
    pauta.opcaoLista.forEach((o) => {
      qtdSim = qtdSim + (o['voto'] === 'S' ? 1 : 0);
    });
    return qtdSim;
  }

  maxPermitido(pauta: Pauta): boolean {
    return pauta.quantidadeEscolha <= this.escolhas(pauta);
  }

}
