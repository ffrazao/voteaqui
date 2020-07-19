const Promise = require('bluebird');

const Dao = require('./dao/dao');
const VotacaoDao = require('./dao/votacao.dao');
const PautaDao = require('./dao/pauta.dao');
const OpcaoDao = require('./dao/opcao.dao');
const ParticipanteDao = require('./dao/participante.dao');
const VotoDao = require('./dao/voto.dao');

const conexaoDbDao = new Dao('./server/db.sqlite3');

function iniciarBancoDeDados() {
  console.log('iniciando banco de dados');
  const votacaoDao = new VotacaoDao(conexaoDbDao);
  const pautaDao = new PautaDao(conexaoDbDao);
  const opcaoDao = new OpcaoDao(conexaoDbDao);
  const participanteDao = new ParticipanteDao(conexaoDbDao);
  const votoDao = new VotoDao(conexaoDbDao);

  votacaoDao.createTable().then(() => console.log(`Tabela Votacao verificada!`)).catch((err) => {
    console.log(`Error: ${JSON.stringify(err)}`)
  });
  pautaDao.createTable().then(() => console.log(`Tabela Pauta verificada!`)).catch((err) => {
    console.log(`Error: ${JSON.stringify(err)}`)
  });
  opcaoDao.createTable().then(() => console.log(`Tabela Opcao verificada!`)).catch((err) => {
    console.log(`Error: ${JSON.stringify(err)}`)
  });
  participanteDao.createTable().then(() => console.log(`Tabela Participante verificada!`)).catch((err) => {
    console.log(`Error: ${JSON.stringify(err)}`)
  });
  votoDao.createTable().then(() => console.log(`Tabela Voto verificada!`)).catch((err) => {
    console.log(`Error: ${JSON.stringify(err)}`)
  });

}

iniciarBancoDeDados();

module.exports = conexaoDbDao;
