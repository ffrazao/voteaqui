const express = require('express');
const path = require('path');
const nomeApp = process.env.npm_package_name;
const dbDao = require('./inicia-conexao-db.dao');

const app = express();

// Serve os arquivos estáticos da pasta dist (gerada pelo ng build)
app.use(express.static(`${__dirname}/../dist/${nomeApp}`));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// ROTAS DA API

// API Votacao CREATE
app.post('/api/votacao', function (req, res) {
  var votacao = req.body;
  console.log('criar votacao', votacao);
  res.write('1');
  res.end();
});

// API Votacao RESTORE
app.get('/api/votacao', function (req, res) {
  var votacao = req.body;
  console.log('criar votacao', votacao);
  res.write('1');
  res.end();
});

// API Votacao UPDATE
app.put('/api/votacao', function (req, res) {
  var votacao = req.body;
  console.log('criar votacao', votacao);
  res.write('1');
  res.end();
});

// API Votacao DELETE
app.delete('/api/votacao', function (req, res) {
  var votacao = req.body;
  console.log('criar votacao', votacao);
  res.write('1');
  res.end();
});

// baixar font-end
app.get('/*', function (req, res) {
  console.log('executando cliente', req.path);
  res.sendFile(path.join(`${__dirname}/../dist/${nomeApp}/index.html`));
});

// Inicia a aplicação pela porta configurada
app.listen(process.env.PORT || 8080);
