const Promise = require("bluebird");

const Dao = require("./dao/dao");
const VotacaoDao = require("./dao/votacao.dao");
const PautaDao = require("./dao/pauta.dao");
const OpcaoDao = require("./dao/opcao.dao");
const ParticipanteDao = require("./dao/participante.dao");
const VotoDao = require("./dao/voto.dao");

const conexaoDbDao = new Dao("./server/db.sqlite3");

function iniciarBancoDeDados() {
  console.log("iniciando banco de dados");
  const votacaoDao = new VotacaoDao(conexaoDbDao);
  const pautaDao = new PautaDao(conexaoDbDao);
  const opcaoDao = new OpcaoDao(conexaoDbDao);
  const participanteDao = new ParticipanteDao(conexaoDbDao);
  const votoDao = new VotoDao(conexaoDbDao);

  votacaoDao
    .createTable()
    .then(() => {
      console.log(`Tabela Votacao verificada!`);
      votacaoDao.dao
        .run(`CREATE UNIQUE INDEX IF NOT EXISTS VotacaoUq ON Votacao(codigo)`)
        .then(() => console.log(`Indice VotacaoUq verificado!`))
        .catch((err) => {
          console.log(`Error: ${JSON.stringify(err)}`);
        });
    })
    .catch((err) => {
      console.log(`Error: ${JSON.stringify(err)}`);
    });
  pautaDao
    .createTable()
    .then(() => {
      console.log(`Tabela Pauta verificada!`);
      pautaDao.dao
        .run(
          `CREATE UNIQUE INDEX IF NOT EXISTS PautaUq ON Pauta(votacaoId, codigo)`
        )
        .then(() => console.log(`Indice PautaUq verificado!`))
        .catch((err) => {
          console.log(`Error: ${JSON.stringify(err)}`);
        });
    })
    .catch((err) => {
      console.log(`Error: ${JSON.stringify(err)}`);
    });
  opcaoDao
    .createTable()
    .then(() => {
      console.log(`Tabela Opcao verificada!`);
      pautaDao.dao
        .run(`CREATE UNIQUE INDEX IF NOT EXISTS OpcaoUq ON Opcao(pautaId, codigo)`)
        .then(() => console.log(`Indice OpcaoUq verificado!`))
        .catch((err) => {
          console.log(`Error: ${JSON.stringify(err)}`);
        });
    })
    .catch((err) => {
      console.log(`Error: ${JSON.stringify(err)}`);
    });
  participanteDao
    .createTable()
    .then(() => console.log(`Tabela Participante verificada!`))
    .catch((err) => {
      console.log(`Error: ${JSON.stringify(err)}`);
    });
  votoDao
    .createTable()
    .then(() => console.log(`Tabela Voto verificada!`))
    .catch((err) => {
      console.log(`Error: ${JSON.stringify(err)}`);
    });
}

iniciarBancoDeDados();

module.exports = conexaoDbDao;
