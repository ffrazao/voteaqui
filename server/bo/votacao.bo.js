const VotacaoDao = require("../dao/votacao.dao");
const PautaBo = require("./pauta.bo");
const ParticipanteBo = require("./participante.bo");
require("../util/funcoes");

class VotacaoBo {
  constructor(dao) {
    this.dbDao = dao;
    this.dao = new VotacaoDao(this.dbDao);
    this.pautaBo = new PautaBo(this.dbDao);
    this.participanteBo = new ParticipanteBo(this.dbDao);
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
    console.log("carregar votacao", id);
    var result = null;
    var registro = await this.dao.getById(id);
    if (registro) {
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
      console.log('registro encontrado ===> ', registro);
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
          senha: r.senha
        };
        votacao.pautaLista = await this.pautaBo.getByVotacaoId(r.id);
        votacaoLista.push(votacao);
      }
      result = {
        participante,
        votacaoLista
      };
    }
    return result;
  }
}

module.exports = VotacaoBo;
