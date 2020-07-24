const VotacaoDao = require("../dao/votacao.dao");
const PautaBo = require("./pauta.bo");
const ParticipanteBo = require("./participante.bo");
const VotoBo = require("./voto.bo");
require("../util/funcoes");

class VotacaoBo {
  constructor(dao) {
    this.dbDao = dao;
    this.dao = new VotacaoDao(this.dbDao);
    this.pautaBo = new PautaBo(this.dbDao);
    this.participanteBo = new ParticipanteBo(this.dbDao);
    this.votoBo = new VotoBo(this.dbDao);
  }

  novo(registro) {
    registro = {};
    registro.pautaLista = [];
    registro.participanteLista = [];
    console.log("nova votacao", registro);
    return registro;
  }

  // API Votacao CREATE
  async create(registro) {
    console.log("criar votacao", registro);

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
      result = registro;
      result.pautaLista = await this.pautaBo.getByVotacaoId(result.id);
      result.participanteLista = await this.participanteBo.getByVotacaoId(
        result.id
      );
    }
    console.log(`votacao (${JSON.stringify(result)})`);
    return result;
  }

  // API Votacao UPDATE
  async update(registro) {
    console.log("atualizar votacao", registro);

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
    console.log("carregar lista de votacao");
    var result = null;
    var registro = await this.dao.getAll();
    if (registro) {
      result = [];
      for (var r of registro) {
        result.push(await this.restore(r.id));
      }
    }
    console.log(`lista de votacao (${JSON.stringify(result)})`);
    return result;
  }

  async getByParticipanteIdentificacao(identificacao) {
    var result = null;
    var registro = await this.dao.getByParticipanteIdentificacao(identificacao);
    if (registro && registro.length) {
      console.log("registro encontrado ===> ", registro);
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
          senha: r.senha,
          votou: r.votou,
        };
        votacao.pautaLista = await this.pautaBo.getByVotacaoId(r.id);
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
          getConexaoMySql().query("BEGIN");
          console.log("Início apuração");
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
              console.log(`p.opcaoLista ===> ${JSON.stringify(p.opcaoLista)} leng = ${p.opcaoLista}`);
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
                      valor = "branco";
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

          getConexaoMySql().query("COMMIT");
        } catch (e) {
          getConexaoMySql().query("ROLLBACK");
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

  async alterarSenha(votacaoId, senhaAtual, senhaNova) {
    const votacao = await this.restore(votacaoId);
    if (!votacao) {
      throw new Error('Votação não encontrada!');
    }
    if (senhaAtual !== votacao.senha) {
      throw new Error('Senha inválida!');
    }
    console.log('senhaNova.trim().length', senhaNova.trim().length);
    if (!senhaNova || !senhaNova.trim().length) {
      throw new Error('Senha nula!');
    }
    this.dao.updateSenha(votacaoId, senhaNova);
    return true;
  }
}

module.exports = VotacaoBo;
