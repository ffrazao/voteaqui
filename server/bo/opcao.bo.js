const OpcaoDao = require('../dao/opcao.dao');

class OpcaoBo {

  constructor(dao) {
    this.dbDao = dao;
    this.dao = new OpcaoDao(this.dbDao);
  }

  novo(registro) {
    registro = {};
    console.log('nova opcao', registro);
    return registro;
  }

  // API Opcao CREATE
  async create (registro, pautaId) {
    console.log('criar opcao');

    registro.id = (
      await this.dao.create(
        registro.codigo,
        registro.nome,
        registro.descricao,
        pautaId
      )
    ).id;

    console.log(`opcao id (${registro.id})`);
    return registro.id;
  }

  // API Opcao RESTORE
  async restore (id) {
    console.log('carregar opcao', id);
    var result = null;
    var registro = await this.dao.getById(id);
    if (registro) {
      result = registro;
    }
    return result;
  }

  // API Opcao UPDATE
  async update (registro, id) {
    console.log('atualizar opcao', registro);

    // resgatar registro anterior
    var anterior = await this.dao.getById(registro.id);

    if (!anterior) {
      throw new Error(`Registro inexistente (${registro.id})`);
    }

    await this.dao.update(
      registro.id,
      registro.codigo,
      registro.nome,
      registro.descricao,
      id
    );

    console.log(`opcao id (${registro.id})`);
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

  async getByPautaId(id) {
    var result = await this.dao.getByPautaId(id);
    for (var registro of result) {
      await delete registro.pautaId;
    }
    return result;
  }

}

module.exports = OpcaoBo;
