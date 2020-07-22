class ParticipanteDao {
  nomeTabela = 'Participante';

  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ${this.nomeTabela} (
      id            INTEGER PRIMARY KEY AUTO_INCREMENT,
      identificacao VARCHAR(255) NOT NULL,
      nome          TEXT NOT NULL,
      telefone      TEXT,
      email         TEXT,
      senha         TEXT NOT NULL,
      votou         BOOLEAN NOT NULL,
      votacaoId     INTEGER NOT NULL,
      CONSTRAINT    ${this.nomeTabela}_fk_votacaoId FOREIGN KEY (votacaoId)
      REFERENCES    Votacao(id) ON UPDATE CASCADE ON DELETE CASCADE
    )`;
    return this.dao.run(sql);
  }

  create(identificacao, nome, telefone, email, senha, votou, votacaoId) {
    return this.dao.run(
      `INSERT INTO ${this.nomeTabela} (
        identificacao,
        nome,
        telefone,
        email,
        senha,
        votou,
        votacaoId)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [identificacao, nome, telefone, email, senha, 0, votacaoId]
    );
  }

  update(id, identificacao, nome, telefone, email, senha, votou, votacaoId) {
    return this.dao.run(
      `UPDATE ${this.nomeTabela}
       SET identificacao = ?,
           nome = ?,
           telefone = ?,
           email = ?,
           votacaoId = ?
      WHERE id = ?`,
      [identificacao, nome, telefone, email, votacaoId, id]
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
    return this.dao.all(
      `SELECT * FROM ${this.nomeTabela} WHERE votacaoId = ?`,
      [id]
    );
  }

  getByIdentificacao(valor) {
    return this.dao.get(
      `SELECT * FROM ${this.nomeTabela} WHERE identificacao = ?`,
      [valor]
    );
  }

  getPodeVotarByIdentificacaoAndVotacaoId(identificacao, votacaoId) {
    return this.dao.get(
      `
      SELECT p.id, p.senha
      FROM   ${this.nomeTabela} p
      JOIN   Votacao v
      ON     v.id = p.votacaoId
      WHERE  (CONVERT_TZ(NOW(), @@session.time_zone, '-3:00') BETWEEN v.inicio AND v.termino)
      AND    p.votou = 0
      AND    p.identificacao = ?
      AND    v.id = ?`,
      [identificacao, votacaoId]
    );
  }

  votar(id) {
    return this.dao.run(
      `UPDATE ${this.nomeTabela}
       SET votou = 1
      WHERE id = ?`,
      [id]
    );
  }
}

module.exports = ParticipanteDao;
