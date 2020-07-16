class VotacaoDao {

  nomeTabela = 'Votacao';

  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ${this.nomeTabela} (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo    TEXT NOT NULL,
      nome      TEXT NOT NULL,
      descricao TEXT NOT NULL,
      senha     TEXT NOT NULL,
      inicio    TEXT NOT NULL,
      termino   TEXT NOT NULL
    )`;
    return this.dao.run(sql);
  }

  create(codigo, nome, descricao, senha, inicio, termino) {
    return this.dao.run(
      `INSERT INTO ${this.nomeTabela} (
        codigo,
        nome,
        descricao,
        senha,
        inicio,
        termino)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo, nome, descricao, senha, inicio, termino]
    );
  }

  update(id, codigo, nome, descricao, senha, inicio, termino) {
    return this.dao.run(
      `UPDATE ${this.nomeTabela}
       SET codigo = ?,
           nome = ?,
           descricao = ?,
           senha = ?,
           inicio = ?,
           termino = ?
      WHERE id = ?`,
      [codigo, nome, descricao, senha, inicio, termino, id]
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

  getByCodigo(valor) {
    return this.dao.get(`SELECT * FROM ${this.nomeTabela} WHERE codigo = ?`, [valor]);
  }

  getByParticipanteIdentificacao(identificacao) {
    return this.dao.all(
      `SELECT   p.nome as participanteNome,
                v.id,
                v.codigo,
                v.nome,
                v.descricao,
                v.inicio,
                v.termino,
                p.senha
      FROM      Votacao v
       JOIN     Participante p
       ON       p.votacaoid = v.id
       WHERE    v.inicio BETWEEN strftime('%Y-%m-%d', 'now', '-1 month') AND strftime('%Y-%m-%d', 'now', '+1 month')
       AND      p.identificacao = ?
       ORDER BY v.inicio`,
      [identificacao]);
  }


}

module.exports = VotacaoDao;
