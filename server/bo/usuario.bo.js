const UsuarioDao = require('../dao/usuario.dao');

class UsuarioBo {

  constructor(dao) {
    this.dbDao = dao;
    this.dao = new UsuarioDao(this.dbDao);
  }

  novo(registro) {
    registro = {};
    console.log('novo usuario', registro);
    return registro;
  }

  // API Usuario CREATE
  async create (registro) {
    console.log('criar usuario', registro);

    registro.id = (
      await this.dao.create(
        registro.valor,
        registro.votacaoId
      )
    ).id;

    console.log(`usuario id (${registro.id})`);
    return registro.id;
  }

  // API Usuario RESTORE
  async restore (id) {
    console.log('carregar usuario', id);
    var result = null;
    var registro = await this.dao.getById(id);
    if (registro) {
      result = registro;
    }
    return result;
  }

  // API Usuario UPDATE
  async update (registro) {
    console.log('atualizar usuario', registro.id);

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

    console.log(`usuario id (${registro.id})`);
    return registro.id;
  }

  // API Votacao DELETE
  async delete (id) {
    await this.dao.delete(id);
  }

  async getByLogin(valor) {
    return await this.dao.getByLogin(valor);
  }

  async list() {
    console.log('carregar lista de usuarios');
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

}

module.exports = UsuarioBo;
