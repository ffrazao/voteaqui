import { AlterarSenhaComponent } from './../../cedula/alterar-senha/alterar-senha.component';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfigService } from './../config.service';
import { Participante } from './../../modelo/entidade/participante';
import { Opcao } from './../../modelo/entidade/opcao';
import { Pauta } from './../../modelo/entidade/pauta';
import { Votacao } from './../../modelo/entidade/votacao';
import { MensagemService } from './../../comum/service/mensagem/mensagem.service';
import { environment } from './../../../environments/environment';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  public id: number;
  public entidade: Votacao = null;
  public frm: FormGroup = this.carregar(new Votacao());

  public filtro = '';
  public filtroTexto = '';
  public selecionaTodos = false;

  constructor(
    private fb: FormBuilder,
    private servico: ConfigService,
    private _route: ActivatedRoute,
    private _router: Router,
    private mensagem: MensagemService,
  ) { }

  agora(): Date {
    return new Date();
  }

  ngOnInit(): void {
    this._route.params.subscribe(p => {
      this.id = p.id;
      this._route.data.subscribe((info) => {
        info.dados.subscribe((d) => {
          this.entidade = d;
          this.frm = this.carregar(this.entidade);
        }, (e) => {
          this.mensagem.erro('Acesso não autorizado');
          this._router.navigate(['/config']);
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
    if (votacao.id) {
      result.get('senha').clearValidators();
    }
    return result;
  }

  private criarPautaLista(lista: Pauta[]): FormArray {
    const items = [];
    if (lista && lista.length) {
      lista.forEach(e => items.push(this.criarPauta(e)));
    }
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
    if (lista && lista.length) {
      lista.forEach(e => items.push(this.criarOpcao(e)));
    }
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
    if (lista && lista.length) {
      lista.forEach(e => items.push(this.criarParticipante(e)));
    }
    const result = this.fb.array(items, [Validators.required]);
    return result;
  }

  private criarParticipante(valor: Participante): FormGroup {
    const result = this.fb.group({
      id: [valor.id, []],
      identificacao: [valor.identificacao, [Validators.required]],
      nome: [valor.nome, [Validators.required]],
      telefone: [valor.telefone, []],
      email: [valor.email, []],
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
      let identificacao = -1;
      let nome = -1;
      let telefone = -1;
      let email = -1;
      linhas.forEach(l => {
        const colunas = l.split(/;/);
        if (identificacao === -1) {
          for (let p = 0; p < colunas.length; p++) {
            if (colunas[p] === 'identificacao') {
              identificacao = p;
            }
            if (colunas[p] === 'nome') {
              nome = p;
            }
            if (colunas[p] === 'telefone') {
              telefone = p;
            }
            if (colunas[p] === 'email') {
              email = p;
            }
          }
        } else {
          const participante = new Participante();
          participante.identificacao = identificacao < 0 ? null : colunas[identificacao];
          participante.nome = nome < 0 ? null : colunas[nome];
          participante.telefone = telefone < 0 ? null : this.formataTelefone1(colunas[telefone]);
          participante.email = email < 0 ? null : colunas[email];
          const reg = this.criarParticipante(participante);
          (this.frm.get('participanteLista') as FormArray).push(reg);
        }
      });
    };

    arquivo.readAsText(event.target.files[0]);
  }

  enviarLink(meio: string, votacao: Votacao, participante: Participante): void {
    let mensagem = null;

    let url = '';
    if (meio === 'whatsapp') {
      mensagem =
        `Olá ${participante.nome}!,

Encaminhamos o link ${environment.API_URL}/${participante.identificacao}/${votacao.id}
e a sua senha *${participante.senha}*
para a votação *_${votacao.nome}_*

ATENÇÃO: memorize esta senha, ela será solicitada durante o processo de votação`;
      url = `https://api.whatsapp.com/send?phone=${participante.telefone}&text=${encodeURI(mensagem)}&preview_url=true`;
      console.log(`enviando url ${url}`);
      const win = window.open(url, '_blank');
    } else {
      this.servico.enviarEmail({
        votacao: {
          id: votacao.id,
          nome: votacao.nome
        },
        API_URL: environment.API_URL,
        participanteIdLista: [participante.id]
      }).subscribe(r => {
        this.mensagem.sucesso('E-mail enviado!!!');
      });
    }
  }

  enviarLinkTodos(meio: string): void {
    const votacao = this.frm.value;
    const lista = this.frm.get('participanteLista').value;
    const tempo = 2 * 1000;
    const participanteIdLista = [];

    if (lista && lista.length && confirm(`Confirma o envio do link, a todos os participantes selecionados, por ${meio}?`)) {
      lista.forEach((v: Participante) => {
        if (v['selecao']) {
          if (meio === 'whatsapp') {
            new Promise((resolve, reject) => {
              setTimeout(() => {
                this.enviarLink(meio, votacao, v);
                resolve(true);
              }, tempo);
            }).then(r => console.log('Enviado ...', v.nome));
          } else {
            participanteIdLista.push(v.id);
          }
        }
      });
      if (meio === 'email' && participanteIdLista && participanteIdLista.length) {
        this.servico.enviarEmail({
          votacao: {
            id: votacao.id,
            nome: votacao.nome
          },
          API_URL: environment.API_URL,
          participanteIdLista
        }).subscribe(r => {
          this.mensagem.sucesso('E-mails enviados!!!');
        }, e => {
          this.mensagem.erro('Erro no serviço de envio de e-mail!!!');
          console.log(e);
        });
      }
    }

  }

  enviar(event): void {
    event.preventDefault();
    if (this.frm.invalid) {
      const msg = 'Dados inválidos. Corrija-os antes de enviar.';
      this.mensagem.erro(msg);
      throw new Error(msg);
    }
    if (!this.frm.value.id) {
      this.servico.create(this.frm.value as Votacao).subscribe((r) => {
        console.log(r);
        this.mensagem.sucesso('Sucesso. As informações foram salvas!');
        this._router.navigate(['/config']);
      }, (err) => {
        console.log(err);
        this.mensagem.erro(`Erro ao processar. (${err})`);
      });
    } else {
      this.servico.update(this.frm.value as Votacao).subscribe((r) => {
        console.log(r);
        this.mensagem.sucesso('Sucesso. As informações foram salvas!');
        this._router.navigate(['/config']);
      }, (err) => {
        console.log(err);
        this.mensagem.erro(`Erro ao processar.`);
      });

    }
  }

  filtrar(participante: any, params): boolean {
    return (!params[0] || params[0].trim().length === 0 ||
      (params[0] === 'V' && participante.value.votou) ||
      (params[0] === 'N' && !participante.value.votou)) &&
      (!params[1] || params[1].trim().length === 0 ||
        participante.value.nome.trim().toLowerCase().indexOf(params[1].toLowerCase()) >= 0 ||
        participante.value.identificacao.trim().toLowerCase().indexOf(params[1].toLowerCase()) >= 0
      );
  }

  seleciona(event): void {
    this.frm.value.participanteLista.forEach(p => p.selecao = !this.selecionaTodos);
  }

  totalSelecao(): number {
    let total = 0;
    this.frm.value.participanteLista.forEach(p => total = total + (p.selecao ? 1 : 0));
    return total;
  }

  formataTelefone(): void {
    this.frm.value.participanteLista.forEach(p => p.telefone = this.formataTelefone1(p.telefone));
  }

  formataTelefone1(numero: string): string {
    if (numero && numero.trim() && numero.trim().length < 13) {
      numero = numero.replace(/[^0-9]/gi, '');
      if (numero.length <= 9) {
        numero = '5561' + numero;
      } else {
        numero = '55' + numero;
      }
    }
    return numero;
  }

  async alterarSenha(): Promise<void> {
    const votacao = this.frm.value;
    const senhas = await this.mensagem.confirmeModelo('Digite', AlterarSenhaComponent);
    if (senhas) {
      if (!senhas.senhaAtual || !senhas.senhaNova) {
        this.mensagem.erro('Senhas não informadas!');
      } else {
        this.servico.alterarSenha(votacao.id, senhas).subscribe((r) => {
          this.mensagem.sucesso('Senha Alterada com sucesso!');
        }, (e) => {
          this.mensagem.erro('Erro ao alterar senha');
          console.log(e);
        });
      }
    }
  }

}
