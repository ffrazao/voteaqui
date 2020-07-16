const express = require('express');
const cors = require('cors');
const path = require('path');
const nomeApp = process.env.npm_package_name;

const dbDao = require('./inicia-conexao-db.dao');

const VotacaoBo = require('./bo/votacao.bo');
const votacaoBo = new VotacaoBo(dbDao);
const ParticipanteBo = require('./bo/participante.bo');
const participanteBo = new ParticipanteBo(dbDao);

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
app.post('/api/votacao/novo', async function (req, res) {
  var registro = req.body;
  res.write(JSON.stringify(await votacaoBo.novo(registro)));
  res.end();
});
app.post('/api/votacao', async function (req, res) {
  var registro = req.body;
  try {
    dbDao.db.exec('BEGIN');
    var result = await votacaoBo.create(registro);
    res.write(`${result}`);
    dbDao.db.exec('COMMIT');
  } catch (e) {
    // rollback
    dbDao.db.exec('ROLLBACK');
    var msg = `Erro ao inserir registro (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.get('/api/votacao/:id', async function (req, res) {
  try {
    var result = await votacaoBo.restore(req.params.id);
    console.log('result', result);
    if (result) {
      console.log(JSON.stringify(result));
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
app.put('/api/votacao', async function (req, res) {
  var registro = req.body;
  try {
    dbDao.db.exec('BEGIN');
    var result = await votacaoBo.update(registro);
    res.write(`${result}`);
    dbDao.db.exec('COMMIT');
  } catch (e) {
    // rollback
    dbDao.db.exec('ROLLBACK');
    var msg = `Erro ao atualizar registro (${e})`;
    console.log(msg);
    res.status(500);
    res.statusMessage = msg;
    res.write(JSON.stringify({ msg }));
  }
  res.end();
});
app.delete('/api/votacao', async function (req, res) {
  var registro = req.body;
  await votacaoBo.delete(registro.id);
  res.end();
});
app.get('/api/votacao', async function (req, res) {
  try {
    var result = await votacaoBo.list();
    console.log('result', result);
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


// API Participante

app.get('/api/participante/:identificacao', async function (req, res) {
  try {
    var result = await votacaoBo.getByParticipanteIdentificacao(req.params.identificacao);
    console.log('result', result);
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

// baixar font-end
app.get('/*', function (req, res) {
  console.log('executando cliente', req.path);
  res.sendFile(path.join(`${__dirname}/../dist/${nomeApp}/index.html`));
});

// Inicia a aplicação pela porta configurada
app.listen(process.env.PORT || 8080);
