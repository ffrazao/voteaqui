const VotoDao = require('../dao/voto.dao');

class VotoBo {

  constructor(dao) {
    this.dbDao = dao;
    this.dao = new VotoDao(this.dbDao);
  }

  novo(registro) {
    registro = {};
    console.log('novo voto', registro);
    return registro;
  }

  // API Voto CREATE
  async create (registro) {
    console.log('criar voto', registro);

    registro.id = (
      await this.dao.create(
        registro.valor,
        registro.votacaoId
      )
    ).id;

    console.log(`voto id (${registro.id})`);
    return registro.id;
  }

  // API Voto RESTORE
  async restore (id) {
    console.log('carregar voto', id);
    var result = null;
    var registro = await this.dao.getById(id);
    if (registro) {
      result = registro;
    }
    return result;
  }

  // API Voto UPDATE
  async update (registro) {
    console.log('atualizar voto', registro);

    // resgatar registro anterior
    var anterior = await this.dao.getById(registro.id);

    if (!anterior) {
      throw new Error(`Registro inexistente (${registro.id})`);
    }

    await this.dao.update(
      registro.id,
      registro.valor,
      registro.votacaoId
    );

    console.log(`voto id (${registro.id})`);
    return registro.id;
  }

  // API Votacao DELETE
  async delete (id) {
    await this.dao.delete(id);
  }

  async getByVotacaoId(votacaoCodigo) {
    return await this.dao.getByVotacaoId(votacaoCodigo);
  }

}

module.exports = VotoBo;
