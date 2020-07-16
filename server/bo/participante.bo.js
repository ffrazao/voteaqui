const ParticipanteDao = require('../dao/participante.dao');

class ParticipanteBo {

  constructor(dao) {
    this.dbDao = dao;
    this.dao = new ParticipanteDao(this.dbDao);
  }

  novo(registro) {
    registro = {};
    console.log('novo participante', registro);
    return registro;
  }

  // API Participante CREATE
  async create (registro, votacaoId) {
    console.log('criar participante', registro);

    registro.id = (
      await this.dao.create(
        registro.identificacao,
        registro.nome,
        registro.contato,
        registro.senha,
        false,
        votacaoId
      )
    ).id;

    console.log(`participante id (${registro.id})`);
    return registro.id;
  }

  // API Participante RESTORE
  async restore (id) {
    console.log('carregar participante', id);
    var result = null;
    var registro = await this.dao.getById(id);
    if (registro) {
      result = registro;
    }
    return result;
  }

  // API Votacao UPDATE
  async update (registro, id) {
    console.log('atualizar participante', registro);

    // resgatar registro anterior
    var anterior = await this.dao.getById(registro.id);

    if (!anterior) {
      throw new Error(`Registro inexistente (${registro.id})`);
    }

    await this.dao.update(
      registro.id,
      registro.identificacao,
      registro.nome,
      registro.contato,
      registro.senha,
      false,
      id
    );

    console.log(`participante id (${registro.id})`);
    return registro.id;
  }

  // API Votacao DELETE
  async delete (id) {
    await this.dao.delete(id);
  }

  async saveLista(id, lista) {
    for (var registro of lista) {
      if (registro.id) {
        await this.update(registro, id);
      } else {
        registro.id = await this.create(registro, id);
      }
    }
  }

  async getByVotacaoId(id) {
    var result = await this.dao.getByVotacaoId(id);
    for (var registro of result) {
      await delete registro.votacaoId;
    }
    return  result;
  }

}

module.exports = ParticipanteBo;
