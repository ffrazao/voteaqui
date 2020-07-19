class OpcaoDao {
  nomeTabela = 'Opcao';

  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ${this.nomeTabela} (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo     TEXT NOT NULL,
      nome       TEXT NOT NULL,
      descricao  TEXT NOT NULL,
      pautaId    INTEGER NOT NULL,
      CONSTRAINT ${this.nomeTabela}_fk_pautaId FOREIGN KEY (pautaId)
      REFERENCES Pauta(id) ON UPDATE CASCADE ON DELETE CASCADE
    )`;
    return this.dao.run(sql);
  }

  create(codigo, nome, descricao, pautaId) {
    return this.dao.run(
      `INSERT INTO ${this.nomeTabela} (
        codigo,
        nome,
        descricao,
        pautaId)
      VALUES (?, ?, ?, ?)`,
      [codigo, nome, descricao, pautaId]
    );
  }

  update(id, codigo, nome, descricao, pautaId) {
    return this.dao.run(
      `UPDATE ${this.nomeTabela}
       SET --codigo = ?,
           nome = ?,
           descricao = ?,
           pautaId = ?
      WHERE id = ?`,
      [/*codigo, */nome, descricao, pautaId, id]
    );
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

  getByPautaId(id) {
    return this.dao.all(`SELECT * FROM ${this.nomeTabela} WHERE pautaId = ?`, [id]);
  }

  getByCodigo(valor) {
    return this.dao.get(`SELECT * FROM ${this.nomeTabela} WHERE codigo = ?`, [valor]);
  }

}

module.exports = OpcaoDao;
