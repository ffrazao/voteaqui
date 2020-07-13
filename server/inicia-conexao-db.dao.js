const Promise = require('bluebird');

const Dao = require('./dao/dao');
const VotacaoDao = require('./dao/votacao.dao');
const PautaDao = require('./dao/pauta.dao');
const OpcaoDao = require('./dao/opcao.dao');
const VotanteDao = require('./dao/votante.dao');

const conexaoDbDao = new Dao('./server/db.sqlite3');

function iniciarBancoDeDados() {
  console.log('iniciando banco de dados');
  const votacaoDao = new VotacaoDao(conexaoDbDao);
  const pautaDao = new PautaDao(conexaoDbDao);
  const opcaoDao = new OpcaoDao(conexaoDbDao);
  const votanteDao = new VotanteDao(conexaoDbDao);

  votacaoDao.createTable().then(() => console.log(`Tabela Votacao verificada!`)).catch((err) => {
    console.log('Error: ')
    console.log(JSON.stringify(err))
  });;
  pautaDao.createTable().then(() => console.log(`Tabela Pauta verificada!`)).catch((err) => {
    console.log('Error: ')
    console.log(JSON.stringify(err))
  });;
  opcaoDao.createTable().then(() => console.log(`Tabela Opcao verificada!`)).catch((err) => {
    console.log('Error: ')
    console.log(JSON.stringify(err))
  });;
  votanteDao.createTable().then(() => console.log(`Tabela Votante verificada!`)).catch((err) => {
    console.log('Error: ')
    console.log(JSON.stringify(err))
  });;

}

iniciarBancoDeDados();

module.exports = conexaoDbDao;
