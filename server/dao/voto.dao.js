class VotoDao {

  nomeTabela = 'Voto';

  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ${this.nomeTabela} (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      valor     TEXT NOT NULL
    )`;
    return this.dao.run(sql);
  }

  create(valor) {
    return this.dao.run(
      `INSERT INTO ${this.nomeTabela} (
        valor)
      VALUES (json(?))`,
      [valor]
    );
  }

  update(id, valor) {
    throw new Error('Não é permitido a alteração dos dados do voto');
  }

  delete(id) {
    return this.dao.run(`DELETE FROM ${this.nomeTabela} WHERE id = ?`, [id]);
  }

  getById(id) {
    return this.dao.get(`SELECT * FROM ${this.nomeTabela} WHERE id = ?`, [id]);
  }

  getAll() {
    return this.dao.all(`SELECT * FROM ${this.nomeTabela}`);
  }

  getByVotacaoCodigo(votacaoCodigo) {
    return this.dao.all(`SELECT * FROM ${this.nomeTabela} WHERE json_extract(valor, '$.codigo') = ?`, [votacaoCodigo]);
  }

}

module.exports = VotoDao;
