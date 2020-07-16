import { VotarService } from './votar.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-votar',
  templateUrl: './votar.component.html',
  styleUrls: ['./votar.component.scss']
})
export class VotarComponent implements OnInit {

  public identificacao: string;
  public participante: string;
  public votacao = null;
  public sessaoVotacao = null;
  public filtro = 'E';
  public filtroTexto = '';

  public listaVisivel = true;
  public votacaoVisivel = false;
  public confirmacaoVisivel = false;
  public resultadoVisivel = false;

  constructor(
    private route: ActivatedRoute,
    private servico: VotarService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(async (p) => {
      this.identificacao = p.id;
      this.votacao = null;
      while (!this.votacao) {
        try {
          this.votacao = await this.servico.getVotacaoByIdentificacao(this.identificacao).toPromise();
        } catch (e) {
          this.votacao = null;
        }
        if (!this.votacao) {
          alert(`Nenhuma votação encontrada para o identificador ${this.identificacao}`);
          this.identificacao = prompt('Digite a sua identificação:', this.identificacao);
          if (!this.identificacao) {
            break;
          }
        } else {
          this.participante = this.votacao.participante.nome;
        }
      }
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

  votar(vot: any): void {
    this.sessaoVotacao = vot;
    this.votacaoVisivel = true;
    this.listaVisivel = false;
  }

  confirmarOpcoes(): void {
    this.confirmacaoVisivel = true;
    this.votacaoVisivel = false;
  }

  confirmarVoto(): void {
    alert('Voto Confirmado');
    this.listaVisivel = true;
    this.confirmacaoVisivel = false;
  }

  verResultado(vot: any): void {
    console.log(vot);
    this.resultadoVisivel = true;
    this.listaVisivel = false;
  }

  voltarResultado(): void {
    this.listaVisivel = true;
    this.confirmacaoVisivel = false;
  }

}
