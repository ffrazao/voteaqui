import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfigService } from './../config.service';
import { Participante } from './../../modelo/entidade/participante';
import { Opcao } from './../../modelo/entidade/opcao';
import { Pauta } from './../../modelo/entidade/pauta';
import { Votacao } from './../../modelo/entidade/votacao';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  id: number;
  entidade: Votacao;
  frm: FormGroup = this.carregar(new Votacao());

  constructor(
    private fb: FormBuilder,
    private servico: ConfigService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  agora(): Date {
    return new Date();
  }

  ngOnInit(): void {
    this._route.params.subscribe(p => {
      this.id = p.id;
      this._route.data.subscribe((info) => {
        info.resolve.principal.subscribe((p: Votacao) => {
          this.entidade = p;
          if (this.id && (prompt('Digite a senha de acesso') !== this.entidade.senha)) {
            alert('Senha inválida');
            this._router.navigate(['/config']);
          }
          this.frm = this.carregar(this.entidade);
        });
      });
    });


  }

  private carregar(votacao: Votacao): FormGroup {
    return this.criarVotacao(votacao);
  }

  getLista(frm: FormGroup, lista: string): FormArray {
    return frm.get(lista) as FormArray;
  }

  private criarVotacao(votacao: Votacao): FormGroup {
    const result = this.fb.group({
      id: [votacao.id, []],
      codigo: [votacao.codigo, [Validators.required]],
      nome: [votacao.nome, [Validators.required]],
      descricao: [votacao.descricao, [Validators.required]],
      senha: [votacao.senha, [Validators.required]],
      inicio: [votacao.inicio, [Validators.required]],
      termino: [votacao.termino, [Validators.required]],
      pautaLista: this.criarPautaLista(votacao.pautaLista),
      participanteLista: this.criarParticipanteLista(votacao.participanteLista),
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
      id: [valor.id, []],
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
      id: [valor.id, []],
      codigo: [valor.codigo, [Validators.required]],
      nome: [valor.nome, [Validators.required]],
      descricao: [valor.descricao, [Validators.required]],
    });
    return result;
  }

  private criarParticipanteLista(lista: Participante[]): FormArray {
    const items = [];
    lista.forEach(e => items.push(this.criarParticipante(e)));
    const result = this.fb.array(items, [Validators.required]);
    return result;
  }

  private criarParticipante(valor: Participante): FormGroup {
    const result = this.fb.group({
      id: [valor.id, []],
      identificacao: [valor.identificacao, [Validators.required]],
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

  participanteIncluir(frm: FormGroup): void {
    const reg = this.criarParticipante(new Participante());
    reg['editando'] = true;
    (frm.get('participanteLista') as FormArray).push(reg);
  }

  participanteSalvar(reg: FormGroup): void {
    reg['editando'] = false;
  }

  participanteEditar(reg: FormGroup): void {
    reg['editando'] = true;
  }

  participanteExcluir(frm: FormGroup, pos): void {
    if (confirm('Confirme a exclusão!')) {
      (frm.get('participanteLista') as FormArray).removeAt(pos);
    }
  }

  lerArquivo(event): void {
    const arquivo: FileReader = new FileReader();
    arquivo.onloadend = (e) => {
      (this.frm.get('participanteLista') as FormArray).clear();
      const linhas = (arquivo.result as string).split(/\r\n|\n/);
      let identificacao = 0;
      let nome = 0;
      let contato = 0;
      linhas.forEach(l => {
        const colunas = l.split(/;/);
        if (identificacao === 0) {
          for (let p = 0; p < colunas.length; p++) {
            if (colunas[p] === 'identificacao') {
              identificacao = p;
            }
            if (colunas[p] === 'nome') {
              nome = p;
            }
            if (colunas[p] === 'contato') {
              contato = p;
            }
          }
        } else {
          const participante = new Participante();
          participante.identificacao = colunas[identificacao];
          participante.nome = colunas[nome];
          participante.contato = colunas[contato];
          const reg = this.criarParticipante(participante);
          (this.frm.get('participanteLista') as FormArray).push(reg);
        }
      });
    };

    arquivo.readAsText(event.target.files[0]);
  }

  enviarLink(participante: Participante): void {
    const url = `https://api.whatsapp.com/send?phone=${participante.contato}&text=${participante.senha}`;
    const win = window.open(url, '_blank');
  }

  enviarLinkTodos(): void {
    const lista = this.frm.get('participanteLista').value;
    if (lista && lista.length && confirm('Confirme o envio')) {
      lista.forEach((v: Participante) => {
        this.enviarLink(v);
      });
    }
  }

  enviar(event): void {
    event.preventDefault();
    if (this.frm.invalid) {
      const msg = 'Dados inválidos. Corrija-os antes de enviar.';
      alert(msg);
      throw new Error(msg);
    }
    if (!this.frm.value.id) {
      this.servico.create(this.frm.value as Votacao).subscribe((r) => {
        console.log(r);
        alert('Sucesso. As informações foram salvas!');
        this._router.navigate(['/config']);
      }, (err) => {
        console.log(err);
        alert(`Erro ao processar.`);
      });
    } else {
      this.servico.update(this.frm.value as Votacao).subscribe((r) => {
        console.log(r);
        alert('Sucesso. As informações foram salvas!');
        this._router.navigate(['/config']);
      }, (err) => {
        console.log(err);
        alert(`Erro ao processar.`);
      });

    }
  }

}
