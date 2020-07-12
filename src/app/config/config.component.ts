import { Votante } from './../modelo/entidade/votante';
import { Opcao } from './../modelo/entidade/opcao';
import { Pauta } from './../modelo/entidade/pauta';
import { Votacao } from './../modelo/entidade/votacao';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  votacao: Votacao;

  frm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  agora(): Date {
    return new Date();
  }

  ngOnInit(): void {
    this.carregar(new Votacao());
  }

  private carregar(votacao: Votacao): void {
    this.frm = this.criarVotacao(votacao);
  }

  getLista(frm: FormGroup, lista: string): FormArray {
    return frm.get(lista) as FormArray;
  }

  private criarVotacao(votacao: Votacao): FormGroup {
    const result = this.fb.group({
      codigo: [votacao.codigo, [Validators.required]],
      nome: [votacao.nome, [Validators.required]],
      descricao: [votacao.descricao, [Validators.required]],
      senha: [votacao.senha, [Validators.required]],
      inicio: [votacao.inicio, [Validators.required]],
      termino: [votacao.termino, [Validators.required]],
      pautaLista: this.criarPautaLista(votacao.pautaLista),
      votanteLista: this.criarVotanteLista(votacao.votanteLista),
    });
    return result;
  }

  private criarPautaLista(lista: Pauta[]): FormArray {
    const items = [];
    lista.forEach(e => items.push(this.criarPauta(e)));
    const result = this.fb.array(items, [Validators.required]);
    return result;
  }

  private criarPauta(valor: Pauta): FormGroup {
    const result = this.fb.group({
      codigo: [valor.codigo, [Validators.required]],
      nome: [valor.nome, [Validators.required]],
      descricao: [valor.descricao, [Validators.required]],
      quantidadeEscolha: [valor.quantidadeEscolha, [Validators.required]],
      opcaoLista: this.criarOpcaoLista(valor.opcaoLista),
    });
    return result;
  }

  private criarOpcaoLista(lista: Opcao[]): FormArray {
    const items = [];
    lista.forEach(e => items.push(this.criarOpcao(e)));
    const result = this.fb.array(items, [Validators.required]);
    return result;
  }

  private criarOpcao(valor: Opcao): FormGroup {
    const result = this.fb.group({
      codigo: [valor.codigo, [Validators.required]],
      nome: [valor.nome, [Validators.required]],
      descricao: [valor.descricao, [Validators.required]],
    });
    return result;
  }

  private criarVotanteLista(lista: Votante[]): FormArray {
    const items = [];
    lista.forEach(e => items.push(this.criarVotante(e)));
    const result = this.fb.array(items, [Validators.required]);
    return result;
  }

  private criarVotante(valor: Votante): FormGroup {
    const result = this.fb.group({
      id: [valor.id, [Validators.required]],
      nome: [valor.nome, [Validators.required]],
      contato: [valor.contato, [Validators.required]],
      senha: [valor.senha, [Validators.required]],
      votou: [valor.votou, []],
    });
    return result;
  }

  pautaIncluir(frm: FormGroup): void {
    const reg = this.criarPauta(new Pauta());
    reg['editando'] = true;
    (frm.get('pautaLista') as FormArray).push(reg);
  }

  pautaSalvar(reg: FormGroup): void {
    reg['editando'] = false;
  }

  pautaEditar(reg: FormGroup): void {
    reg['editando'] = true;
  }

  pautaExcluir(frm: FormGroup, pos): void {
    if (confirm('Confirme a exclusão!')) {
      (frm.get('pautaLista') as FormArray).removeAt(pos);
    }
  }

  opcaoIncluir(frm: FormGroup): void {
    const reg = this.criarOpcao(new Opcao());
    reg['editando'] = true;
    (frm.get('opcaoLista') as FormArray).push(reg);
  }

  opcaoSalvar(reg: FormGroup): void {
    reg['editando'] = false;
  }

  opcaoEditar(reg: FormGroup): void {
    reg['editando'] = true;
  }

  opcaoExcluir(frm: FormGroup, pos): void {
    if (confirm('Confirme a exclusão!')) {
      (frm.get('opcaoLista') as FormArray).removeAt(pos);
    }
  }

  votanteIncluir(frm: FormGroup): void {
    const reg = this.criarVotante(new Votante());
    reg['editando'] = true;
    (frm.get('votanteLista') as FormArray).push(reg);
  }

  votanteSalvar(reg: FormGroup): void {
    reg['editando'] = false;
  }

  votanteEditar(reg: FormGroup): void {
    reg['editando'] = true;
  }

  votanteExcluir(frm: FormGroup, pos): void {
    if (confirm('Confirme a exclusão!')) {
      (frm.get('votanteLista') as FormArray).removeAt(pos);
    }
  }

  lerArquivo(event): void {
    const arquivo: FileReader = new FileReader();
    arquivo.onloadend = (e) => {
      (this.frm.get('votanteLista') as FormArray).clear();
      const linhas = (arquivo.result as string).split(/\r\n|\n/);
      let id = 0;
      let nome = 0;
      let contato = 0;
      linhas.forEach(l => {
        const colunas = l.split(/;/);
        if (id === 0) {
          for (let p = 0; p < colunas.length; p++) {
            if (colunas[p] === 'identificacao') {
              id = p;
            }
            if (colunas[p] === 'nome') {
              nome = p;
            }
            if (colunas[p] === 'contato') {
              contato = p;
            }
          }
        } else {
          const votante = new Votante();
          votante.id = colunas[id];
          votante.nome = colunas[nome];
          votante.contato = colunas[contato];
          const reg = this.criarVotante(votante);
          (this.frm.get('votanteLista') as FormArray).push(reg);
        }
      });
    };

    arquivo.readAsText(event.target.files[0]);
  }

  enviarLink(votante: Votante): void {
    const url = `https://api.whatsapp.com/send?phone=${votante.contato}&text=${votante.senha}`;
    const win = window.open(url, '_blank');
  }

  enviarLinkTodos(): void {
    const lista = this.frm.get('votanteLista').value;
    if (lista && lista.length && confirm('Confirme o envio')) {
      lista.forEach((v: Votante) => {
        this.enviarLink(v);
      });
    }
  }

}
