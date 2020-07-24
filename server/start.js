const express = require("express");
const cors = require("cors");
const path = require("path");
const nomeApp = process.env.npm_package_name;

const conexaoDbDao = require("./inicia-conexao-db.dao");
const conexaoEmail = require("./inicia-conexao-email");

const VotacaoBo = require("./bo/votacao.bo");
const votacaoBo = new VotacaoBo(conexaoDbDao);
const ParticipanteBo = require("./bo/participante.bo");
const participanteBo = new ParticipanteBo(conexaoDbDao, conexaoEmail);
const VotoBo = require("./bo/voto.bo");
const votoBo = new VotoBo(conexaoDbDao);

const app = express();

// Ativar o CORS
app.use(cors());

// Serve os arquivos estáticos da pasta dist (gerada pelo ng build)
app.use(express.static(`${__dirname}/../dist/${nomeApp}`));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// ROTAS DA API

// API Votacao
app.post("/api/votacao/novo", async function (req, res) {
  var registro = req.body;
  res.write(JSON.stringify(await votacaoBo.novo(registro)));
  res.end();
});
app.post("/api/votacao", async function (req, res) {
  var registro = req.body;
  try {
    getConexaoMySql().query("BEGIN");
    var result = await votacaoBo.create(registro);
    res.write(`${result}`);
    getConexaoMySql().query("COMMIT");
  } catch (e) {
    // rollback
    getConexaoMySql().query("ROLLBACK");
    var msg = `Erro ao inserir registro (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.get("/api/votacao/resultado/:votacaoId", async function (req, res) {
  try {
    var result = await votacaoBo.resultado(req.params.votacaoId);
    if (result) {
      res.write(JSON.stringify(result));
    } else {
      var msg = `Registro não encontrado`;
      console.log(msg);
      res.sendStatus(404);
    }
  } catch (e) {
    var msg = `Erro ao carregar registro (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.get("/api/votacao/:id/:senha", async function (req, res) {
  try {
    var result = await votacaoBo.restore(req.params.id);
    if (result) {
      if (result.senha !== req.params.senha) {
        var msg = `Senha inválida`;
        res.statusMessage = msg;
        res.sendStatus(500);
      } else {
        delete result.senha;
        res.write(JSON.stringify(result));
      }
    } else {
      var msg = `Registro não encontrado`;
      res.statusMessage = msg;
      res.sendStatus(404);
    }
  } catch (e) {
    var msg = `Erro ao carregar registro (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.put("/api/votacao", async function (req, res) {
  var registro = req.body;
  try {
    getConexaoMySql().query("BEGIN");
    var result = await votacaoBo.update(registro);
    res.write(`${result}`);
    getConexaoMySql().query("COMMIT");
  } catch (e) {
    // rollback
    getConexaoMySql().query("ROLLBACK");
    var msg = `Erro ao atualizar registro (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.delete("/api/votacao", async function (req, res) {
  var registro = req.body;
  await votacaoBo.delete(registro.id);
  res.end();
});
app.get("/api/votacao", async function (req, res) {
  try {
    var result = await votacaoBo.list();
    console.log("result", result);
    if (result) {
      console.log(JSON.stringify(result));
      res.write(JSON.stringify(result));
    } else {
      var msg = `Registro não encontrado`;
      console.log(msg);
      res.sendStatus(404);
    }
  } catch (e) {
    var msg = `Erro ao carregar registros (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.put("/api/votacao/:id/alterar-senha/:senhaAtual/:senhaNova", async function (req, res) {
  console.log('altera senha', req.params);
  try {
    getConexaoMySql().query("BEGIN");
    var result = await votacaoBo.alterarSenha(req.params.id, req.params.senhaAtual, req.params.senhaNova);
    res.write(`${result}`);
    getConexaoMySql().query("COMMIT");
  } catch (e) {
    // rollback
    getConexaoMySql().query("ROLLBACK");
    var msg = `Erro ao alterar senha (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});


// API Participante

app.get("/api/participante/:identificacao", async function (req, res) {
  try {
    var result = await votacaoBo.getByParticipanteIdentificacao(
      req.params.identificacao
    );
    console.log("result", result);
    if (result) {
      console.log(JSON.stringify(result));
      res.write(JSON.stringify(result));
    } else {
      // var msg = `Registro não encontrado`;
      // console.log(msg);
      // res.sendStatus(404);
      res.write("");
    }
  } catch (e) {
    var msg = `Erro ao carregar registros (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.get("/api/participante/:identificacao/:votacao", async function (req, res) {
  try {
    var result = await votacaoBo.getByParticipanteIdentificacao(
      req.params.identificacao
    );
    if (result) {
      for (var i = result.votacaoLista.length - 1; i >= 0; i--) {
        if (result.votacaoLista[i].id !== parseInt(req.params.votacao)) {
          result.votacaoLista.splice(i, 1);
        }
      }
      if (result.votacaoLista.length === 1) {
        res.write(JSON.stringify(result));
      } else {
        res.write("");
      }
    }
  } catch (e) {
    var msg = `Erro ao carregar registros (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.post("/api/participante/email", async function (req, res) {
  var registro = req.body;
  try {
    var resposta = await participanteBo.enviarEmail(registro);
    console.log("resposta do email", resposta);
  } catch (e) {
    console.log(e);
    res.status(500);
    res.statusMessage =
      "Erro no servidor de e-mails [" + JSON.stringify(e) + "]";
    res.write(res.statusMessage);
  }
  res.end();
});

// API Voto

app.post("/api/voto/novo", async function (req, res) {
  var registro = req.body;
  res.write(JSON.stringify(await votacaoBo.novo(registro)));
  res.end();
});
app.post("/api/voto/:identificacao/:votacaoId/:senha", async function (
  req,
  res
) {
  var registro = req.body;
  try {
    getConexaoMySql().query("BEGIN");
    var participante = await participanteBo.getPodeVotarByIdentificacaoAndVotacaoId(
      req.params.identificacao,
      req.params.votacaoId
    );
    if (!participante) {
      throw new Error("Voto não autorizado!");
    }
    if (participante.senha !== req.params.senha) {
      throw new Error("Senha inválida!");
    }
    var result = await votoBo.create(registro);
    await participanteBo.votar(participante.id);
    res.write(`${result}`);
    getConexaoMySql().query("COMMIT");
  } catch (e) {
    // rollback
    getConexaoMySql().query("ROLLBACK");
    var msg = `Erro ao inserir registro (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});

// baixar front-end
app.get("/*", function (req, res) {
  console.log("executando cliente", req.path);
  res.sendFile(path.join(`${__dirname}/../dist/${nomeApp}/index.html`));
});

// Inicia a aplicação pela porta configurada
app.listen(process.env.PORT || 8080);
