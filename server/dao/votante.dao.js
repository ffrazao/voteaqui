class VotanteDao {
  nomeTabela = 'Votante';

  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ${this.nomeTabela} (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      identificacao TEXT NOT NULL,
      nome          TEXT NOT NULL,
      contato       TEXT NOT NULL,
      senha         TEXT NOT NULL,
      votou         BOOLEAN NOT NULL,
      votacaoId     INTEGER NOT NULL,
      CONSTRAINT    ${this.nomeTabela}_fk_votacaoId FOREIGN KEY (votacaoId)
      REFERENCES    Votacao(id) ON UPDATE CASCADE ON DELETE CASCADE
    )`;
    return this.dao.run(sql);
  }

  create(identificacao, nome, contato, senha, votou, votacaoId) {
    return this.dao.run(
      `INSERT INTO ${this.nomeTabela} (
        identificacao,
        nome,
        contato,
        senha,
        votou,
        votacaoId)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [identificacao, nome, contato, senha, votou, votacaoId]
    );
  }

  update(id, identificacao, nome, contato, senha, votou, votacaoId) {
    return this.dao.run(
      `UPDATE ${this.nomeTabela}
       SET identificacao = ?,
           nome = ?,
           contato = ?,
           senha = ?,
           votou = ?,
           votacaoId = ?
      WHERE id = ?`,
      [identificacao, nome, contato, senha, votou, votacaoId, id]
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

  getByVotacaoId(id) {
    return this.dao.get(`SELECT * FROM ${this.nomeTabela} WHERE votacaoId = ?`, [id]);
  }

  getByIdentificacao(valor) {
    return this.dao.get(`SELECT * FROM ${this.nomeTabela} WHERE identificacao = ?`, [valor]);
  }

}

module.exports = VotanteDao;
