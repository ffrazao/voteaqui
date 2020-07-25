const ParticipanteDao = require(`../dao/participante.dao`);

class ParticipanteBo {
  constructor(dao) {
    this.dbDao = dao;
    this.dao = new ParticipanteDao(this.dbDao);
  }

  novo(registro) {
    registro = {};
    console.log(`novo participante`, registro);
    return registro;
  }

  // API Participante CREATE
  async create(registro, votacaoId) {
    console.log(`criar participante`, registro);

    // GERAR SENHA AUTOMATICAMENTE
    registro.senha = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);

    registro.id = (
      await this.dao.create(
        registro.identificacao,
        registro.nome,
        registro.telefone,
        registro.email,
        registro.senha,
        false,
        votacaoId
      )
    ).id;

    console.log(`participante id (${registro.id})`);
    return registro.id;
  }

  // API Participante RESTORE
  async restore(id, escondeSenha = true) {
    console.log(`carregar participante`, id);
    var result = null;
    var registro = await this.dao.getById(id);
    if (registro) {
      if (escondeSenha) {
        console.log("escondendo senha de participante");
        delete registro.senha;
      }
      result = registro;
    }
    return result;
  }

  // API Votacao UPDATE
  async update(registro, id) {
    console.log(`atualizar participante`, registro);

    // resgatar registro anterior
    var anterior = await this.dao.getById(registro.id);

    if (!anterior) {
      throw new Error(`Registro inexistente (${registro.id})`);
    }

    await this.dao.update(
      registro.id,
      registro.identificacao,
      registro.nome,
      registro.telefone,
      registro.email,
      registro.senha,
      false,
      id
    );

    console.log(`participante id (${registro.id})`);
    return registro.id;
  }

  // API Votacao DELETE
  async delete(id) {
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
    return result;
  }

  async getPodeVotarByIdentificacaoAndVotacaoId(identificacao, votacaoId) {
    var result = await this.dao.getPodeVotarByIdentificacaoAndVotacaoId(
      identificacao,
      votacaoId
    );
    return result;
  }

  async votar(participanteId) {
    var result = await this.dao.votar(participanteId);
    return result;
  }

  async alterarSenha(id, senhaAtual, senhaNova) {
    if (!(await this.validaSenha(id, senhaAtual))) {
      throw new Error("Senha inválida!");
    }
    if (!senhaNova || !senhaNova.trim().length) {
      throw new Error("Senha nula!");
    }
    // this.dao.updateSenha(id, bcrypt.hashSync(senhaNova, 10));
    this.dao.updateSenha(id, senhaNova);
    return true;
  }

  // API Votacao RESTORE
  async validaSenha(id, senha) {
    var registro = await this.dao.getById(id);
    var result = false;
    if (!registro) {
      return result;
    }
    if (senha === registro.senha) {
      result = true;
      console.log("acertou");
    } else {
      registro.senhaTentativa++;
      console.log("errou", registro.senhaTentativa);
    }
    if (registro.senhaTentativa >= 3) {
      var bloqueio = new Date(new Date().getTime() + (30 * 60000));
      registro.senhaBloqueio = bloqueio;
      console.log(
        "bloqueando senha ",
        registro.senhaTentativa,
        registro.senhaBloqueio
      );
    }
    console.log("atualizando bloqueio", id, registro);
    this.dao.updateSenhaBloqueio(id, registro);
    var bloqueadoPorTempo = await this.dao.senhaEmCarencia(id);
    console.log(`bloqueadoPorTempo`, JSON.stringify(bloqueadoPorTempo));
    if (bloqueadoPorTempo.bloqueado) {
      console.log(
        "Dentro da carencia do bloqueio ",
        registro.senhaTentativa,
        registro.senhaBloqueio
      );
      throw new Error("Senha BLOQUEADA, aguardando tempo de desbloqueio");
    }
    return result;
  }

  async updateDesbloqueiaSenha(id) {
    this.dao.updateDesbloqueiaSenha(id);
  }
}

module.exports = ParticipanteBo;
