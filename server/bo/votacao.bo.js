var request = require('request');

const VotacaoDao = require('../dao/votacao.dao');
const PautaBo = require('./pauta.bo');
const ParticipanteBo = require('./participante.bo');
const VotoBo = require('./voto.bo');
require('../util/funcoes');
const bcrypt = require('bcrypt');

class VotacaoBo {
  constructor(dao, transporterEmail) {
    this.dbDao = dao;
    this.dao = new VotacaoDao(this.dbDao);
    this.pautaBo = new PautaBo(this.dbDao);
    this.participanteBo = new ParticipanteBo(this.dbDao);
    this.votoBo = new VotoBo(this.dbDao);
    this.transporterEmail = transporterEmail;
  }

  novo(registro) {
    registro = {};
    registro.pautaLista = [];
    registro.participanteLista = [];
    console.log('nova votacao', registro);
    return registro;
  }

  // API Votacao CREATE
  async create(registro) {
    console.log('criar votacao');

    if (!registro.senha || !registro.senha.length) {
      throw new Error('Senha nula não permitida');
    }
    // encryptar a senha
    registro.senha = bcrypt.hashSync(registro.senha, 10);

    registro.id = (
      await this.dao.create(
        registro.codigo,
        registro.nome,
        registro.descricao,
        registro.senha,
        registro.inicio,
        registro.termino
      )
    ).id;

    this.pautaBo.saveLista(registro.id, registro.pautaLista);
    this.participanteBo.saveLista(registro.id, registro.participanteLista);

    console.log(`votacao id (${registro.id})`);
    return registro.id;
  }

  // API Votacao RESTORE
  async restore(id) {
    console.log(`carregar votacao [${id}]`);
    var result = null;
    var registro = await this.dao.getById(id);
    if (registro) {
      registro.inicio = registro.inicioF;
      registro.termino = registro.terminoF;
      delete registro.inicioF;
      delete registro.terminoF;
      delete registro.senha;
      result = registro;
      result.pautaLista = await this.pautaBo.getByVotacaoId(result.id);
      result.participanteLista = await this.participanteBo.getByVotacaoId(
        result.id
      );
    }
    // console.log(`votacao (${JSON.stringify(result)})`);
    return result;
  }

  // API Votacao UPDATE
  async update(registro) {
    console.log('atualizar votacao', registro.id);

    // resgatar registro anterior
    var anterior = await this.restore(registro.id);

    if (!anterior) {
      throw new Error(`Registro inexistente (${registro.id})`);
    }

    await this.dao.update(
      registro.id,
      registro.codigo,
      registro.nome,
      registro.descricao,
      registro.senha,
      registro.inicio,
      registro.termino
    );

    await this.pautaBo.saveLista(registro.id, registro.pautaLista);
    await this.participanteBo.saveLista(
      registro.id,
      registro.participanteLista
    );

    await removeOrfaos(registro.pautaLista, anterior.pautaLista, this.pautaBo);
    await removeOrfaos(
      registro.participanteLista,
      anterior.participanteLista,
      this.participanteBo
    );

    console.log(`votacao id (${registro.id})`);
    return registro.id;
  }

  // API Votacao DELETE
  async delete(id) {
    await this.dao.delete(id);
  }

  // API Votacao RESTORE
  async list() {
    console.log('carregar lista de votacao');
    var result = null;
    var registro = await this.dao.getAll();
    if (registro) {
      result = [];
      for (var r of registro) {
        result.push(await this.restore(r.id));
      }
    }
    // console.log(`lista de votacao (${JSON.stringify(result)})`);
    return result;
  }

  async getByParticipanteIdentificacao(identificacao) {
    var result = null;
    var registro = await this.dao.getByParticipanteIdentificacao(identificacao);
    if (registro && registro.length) {
      // console.log('registro encontrado ===> ', registro);
      var votacaoLista = [];
      var participante = null;
      for (var r of registro) {
        if (!participante) {
          participante = {
            nome: r.participanteNome,
          };
        }
        var votacao = {
          id: r.id,
          codigo: r.codigo,
          nome: r.nome,
          descricao: r.descricao,
          inicio: r.inicio,
          termino: r.termino,
          situacao: r.situacao,
          senhaBloqueio: r.senhaBloqueio,
          votou: r.votou,
        };
        votacao.pautaLista = await this.pautaBo.getByVotacaoId(r.id);
        delete votacao.senha;
        votacaoLista.push(votacao);
      }
      result = {
        participante,
        votacaoLista,
      };
    }
    return result;
  }

  async resultado(votacaoId) {
    var result = await this.dao.getResultado(votacaoId);
    if (!result) {
      throw new Error(`Votação inexistente (${votacaoId})`);
    }
    if (!result.encerrado) {
      throw new Error(`Votação ainda não encerrada (${votacaoId})`);
    }
    if (!result.resultado) {
      new Promise(async (resolve, reject) => {
        try {
          getConexaoMySql().query('BEGIN');
          console.log('Início apuração');
          var votacao = await this.restore(votacaoId);
          const resultadoJson = {
            codigo: votacao.codigo,
            nome: votacao.nome,
            descricao: votacao.descricao,
            inicio: votacao.inicio,
            termino: votacao.termino,
            pautaLista: [],
          };
          for (const pauta of votacao.pautaLista) {
            const pautaJson = {
              codigo: pauta.codigo,
              nome: pauta.nome,
              descricao: pauta.descricao,
              opcaoLista: [],
              nulos: 0,
              brancos: 0,
            };
            for (const opcao of pauta.opcaoLista) {
              const opcaoJson = {
                codigo: opcao.codigo,
                nome: opcao.nome,
                descricao: opcao.descricao,
                valor: { S: 0, branco: 0, N: 0 },
              };
              pautaJson.opcaoLista.push(opcaoJson);
            }
            resultadoJson.pautaLista.push(pautaJson);
          }

          // votos
          var votos = await this.votoBo.getByVotacaoId(votacaoId);
          for (const voto of votos) {
            var votoJson = JSON.parse(voto.valor);
            for (const p of votoJson.pautaLista) {
              var pr = resultadoJson.pautaLista.find(
                (pl) => pl.codigo === p.codigo
              );
              console.log(
                `p.opcaoLista ===> ${JSON.stringify(p.opcaoLista)} leng = ${
                  p.opcaoLista
                }`
              );
              if (p.nulo) {
                pr.nulos++;
              } else {
                console.log(`um branco ${JSON.stringify(pr)}`);
                if (!p.opcaoLista || !p.opcaoLista.length) {
                  pr.brancos++;
                } else {
                  for (const o of p.opcaoLista) {
                    var valor = o.valor;
                    var r = resultadoJson.pautaLista
                      .find((pl) => pl.codigo === p.codigo)
                      .opcaoLista.find((ol) => ol.codigo === o.codigo);
                    if (!valor) {
                      valor = 'branco';
                    }
                    if (!r.valor[valor]) {
                      r.valor[valor] = 0;
                    }
                    r.valor[valor]++;
                  }
                }
              }
            }
          }
          // ordenar os votos
          resultadoJson.pautaLista.forEach((p) => {
            p.opcao = p.opcaoLista.sort((a, b) => {
              return a.valor.N > b.valor.N ? 1 : -1;
            });
            p.opcao = p.opcaoLista.sort((a, b) => {
              return a.valor.S < b.valor.S ? 1 : -1;
            });
          });

          // participantes
          var votantes = await this.dao.getTotalVotantes(votacaoId);

          var result = {
            participantes: votacao.participanteLista.length,
            votantes: votantes.total,
            resultado: resultadoJson,
          };

          console.log('resultado ===> ', JSON.stringify(result));
          await this.dao.updateResultado(votacaoId, JSON.stringify(result));
          resolve(true);

          getConexaoMySql().query('COMMIT');
        } catch (e) {
          getConexaoMySql().query('ROLLBACK');
          reject(e);
          throw e;
        }
      })
        .then((r) => {
          console.log(`Apuração encerrada! ${r}`);
        })
        .catch((e) => {
          console.log(`APURAÇÃO ERRO! ${e}`);
        });
      throw new Error(`Votação em apuração (${votacaoId})`);
    }
    return JSON.parse(result.resultado);
  }

  async alterarSenha(id, senhaAtual, senhaNova) {
    if (!(await this.validaSenha(id, senhaAtual))) {
      throw new Error('Senha inválida!');
    }
    if (!senhaNova || !senhaNova.trim().length) {
      throw new Error('Senha nula!');
    }
    this.dao.updateSenha(id, bcrypt.hashSync(senhaNova, 10));
    return true;
  }

  // API Votacao RESTORE
  async validaSenha(id, senha) {
    console.log(`validaSenha(${id}, ${senha})`);
    var registro = await this.dao.getById(id);
    var result = false;
    if (!registro) {
      return result;
    }
    if (bcrypt.compareSync(senha, registro.senha)) {
      result = true;
      console.log('acertou');
    } else {
      registro.senhaTentativa++;
      console.log('errou', registro.senhaTentativa);
    }
    if (registro.senhaTentativa >= 3) {
      var bloqueio = new Date(new Date().getTime() + 30 * 60000);
      registro.senhaBloqueio = bloqueio;
      console.log(
        'bloqueando senha ',
        registro.senhaTentativa,
        registro.senhaBloqueio
      );
    }
    this.dao.updateSenhaBloqueio(id, registro);
    var bloqueadoPorTempo = await this.dao.senhaEmCarencia(id);
    console.log(`bloqueadoPorTempo`, JSON.stringify(bloqueadoPorTempo));
    if (bloqueadoPorTempo.bloqueado) {
      console.log(
        'Dentro da carencia do bloqueio ',
        registro.senhaTentativa,
        registro.senhaBloqueio
      );
      throw new Error('Senha BLOQUEADA, aguardando tempo de desbloqueio');
    }
    return result;
  }
  async updateDesbloqueiaSenha(votacaoId) {
    this.dao.updateDesbloqueiaSenha(votacaoId);
  }

  async enviarCedula(mensagem) {
    if (!(await this.validaSenha(mensagem.votacao.id, mensagem.senha))) {
      throw new Error('Senha inválida!');
    }
    var resultado = [];
    for (var id of mensagem.participanteIdLista) {
      var participante = await this.participanteBo.restore(id, false);

      var link = `${mensagem.API_URL}/${participante.identificacao}/${mensagem.votacao.id}`;
      var participanteNome = participante.nome;
      var participanteSenha = participante.senha;
      var participanteTelefone = participante.telefone;
      var participanteEmail = participante.email;
      var votacaoNome = mensagem.votacao.nome;

      console.log(`enviando ${mensagem.meio} para ${participanteNome}`);

      if (mensagem.meio === 'whatsapp') {
        var msg = `Olá ${participanteNome.substr(0, 12)}!,

Votação *_${votacaoNome}_*
Sua senha *${participanteSenha}*
Link ${link}

ATENÇÃO: *_memorize esta senha_*, ela será solicitada durante o processo de votação`;

        resultado.push({
          url: `https://api.whatsapp.com/send?phone=${participanteTelefone}&text=${encodeURI(msg)}&preview_url=true`,
        });
      } else if (mensagem.meio === 'email') {
        var msg = `<p>Olá ${participanteNome}!,</p>
        <p></p>
        <p>Para a votação <b><u>${votacaoNome}</u></b></p>
        <p>Encaminhamos a sua senha <h1><b>${participanteSenha}</b></h1></p>
        <p>Para iniciar clique no link <a href='${link}'>Vote Aqui</a></p>
        <p></p>
        <p>ATENÇÃO: memorize esta senha, ela será solicitada durante o processo de votação</p>`;

        var mailOptions = {
          from: `voteaquidf@gmail.com`,
          to: `${participanteEmail}`,
          subject: `Cédula de Votação`,
          html: msg,
        };

        this.transporterEmail.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(`Erro ao enviar: `, error);
            // break;
          } else {
            console.log(`Email sent: ` + info.response);
          }
        });
      } else if (mensagem.meio === 'sms') {
        var msg =
`Link: ${link}
Senha: ${participanteSenha}
Nome: ${participanteNome.substr(0, 15)}!,
Votação: ${votacaoNome.substr(0, 15)}`.substr(0, 159);

        request({
          uri: 'http://app.smsconecta.com.br/SendAPI/Send.aspx',
          qs: {
            usr: 'ffrazao@gmail.com',
            pwd: 'frazaosms2020',
            sender: 'VoteAqui',
            number: participanteTelefone,
            msg: msg,
          },
          function(error, response, body) {
            console.log(`enviando SMS ... ${participanteNome}`);
            if (!error && response.statusCode === 200) {
              console.log(body);
              res.json(body);
            } else {
              console.log(`Erro envio SMS: ${JSON.stringify(body)}`);
              res.json(error);
              throw new Error(`Erro envio SMS: ${JSON.stringify(body)}`);
            }
          },
        });
      } else {

      }
    }
    return resultado;
  }
}

module.exports = VotacaoBo;
