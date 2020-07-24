const ParticipanteDao = require(`../dao/participante.dao`);

class ParticipanteBo {
  constructor(dao, transporterEmail) {
    this.dbDao = dao;
    this.dao = new ParticipanteDao(this.dbDao);
    this.transporterEmail = transporterEmail;
  }

  novo(registro) {
    registro = {};
    console.log(`novo participante`, registro);
    return registro;
  }

  // API Participante CREATE
  async create(registro, votacaoId) {
    console.log(`criar participante`, registro);

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
  async restore(id) {
    console.log(`carregar participante`, id);
    var result = null;
    var registro = await this.dao.getById(id);
    if (registro) {
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

  async enviarEmail(mensagem) {
    for (var id of mensagem.participanteIdLista) {
      var participante = await this.restore(id);

      console.log(`enviando email para ${participante.nome}`);

      var msg = `<p>Olá ${participante.nome}!,</p>
<p></p>
<p>Encaminhamos o link <a href="${mensagem.API_URL}/${participante.identificacao}/${mensagem.votacao.id}">${mensagem.API_URL}/${participante.identificacao}/${mensagem.votacao.id}</a></p>
<p>e a sua senha <b>${participante.senha}</b></p>
<p>para a votação <b><u>${mensagem.votacao.nome}</u></b></p>
<p></p>
<p>ATENÇÃO: memorize esta senha, ela será solicitada durante o processo de votação</p>`;

      var mailOptions = {
        from: `voteaqui@gmail.com`,
        to: `${participante.email}`,
        subject: `Cédula de Votação`,
        html: msg,
      };

      // mailOptions = {};

      this.transporterEmail.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(`Erro ao enviar: `, error);
          break;
        } else {
          console.log(`Email sent: ` + info.response);
        }
      });
    }
  }
}

module.exports = ParticipanteBo;
