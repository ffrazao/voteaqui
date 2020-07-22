class VotacaoDao {
  nomeTabela = 'Votacao';

  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ${this.nomeTabela} (
      id        INTEGER PRIMARY KEY AUTO_INCREMENT,
      codigo    VARCHAR(255) NOT NULL,
      nome      TEXT NOT NULL,
      descricao TEXT NOT NULL,
      senha     VARCHAR(255) NOT NULL,
      inicio    DATETIME NOT NULL,
      termino   DATETIME NOT NULL,
      resultado TEXT
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
       SET nome = ?,
           descricao = ?,
           senha = ?,
           inicio = ?,
           termino = ?
      WHERE id = ?`,
      [/*codigo, */ nome, descricao, senha, inicio, termino, id]
    );
  }

  delete(id) {
    return this.dao.run(`DELETE FROM ${this.nomeTabela} WHERE id = ?`, [id]);
  }

  getById(id) {
    return this.dao.get(`SELECT *, DATE_FORMAT(inicio, '%Y-%m-%dT%H:%i') as inicioF, DATE_FORMAT(termino, '%Y-%m-%dT%H:%i') as terminoF FROM ${this.nomeTabela} WHERE id = ?`, [id]);
  }

  getAll() {
    return this.dao.all(`SELECT * FROM ${this.nomeTabela}`);
  }

  getByCodigo(valor) {
    return this.dao.get(`SELECT * FROM ${this.nomeTabela} WHERE codigo = ?`, [
      valor,
    ]);
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
                p.senha,
                p.votou
      FROM      Votacao v
       JOIN     Participante p
       ON       p.votacaoid = v.id
       WHERE    v.inicio BETWEEN DATE_ADD(CONVERT_TZ(NOW(), @@session.time_zone, '-3:00'), INTERVAL -1 MONTH) AND DATE_ADD(CONVERT_TZ(NOW(), @@session.time_zone, '-3:00'), INTERVAL +1 MONTH)
       AND      p.identificacao = ?
       ORDER BY v.inicio`,
      [identificacao]
    );
  }

  getResultado(votacaoid) {
    return this.dao.get(
      `SELECT v.resultado, CONVERT_TZ(NOW(), @@session.time_zone, '-3:00') > v.termino as encerrado
       FROM Votacao v
       WHERE  id = ?`,
      [votacaoid]
    );
  }

  updateResultado(id, resultado) {
    return this.dao.run(
      `UPDATE ${this.nomeTabela}
       SET resultado = ?
      WHERE id = ?`,
      [resultado, id]
    );
  }

  getTotalVotantes(votacaoId) {
    return this.dao.get(`
    SELECT COUNT(*) AS total
    FROM   Participante
    WHERE  votacaoId = ?
    AND    votou = 1`, [votacaoId]);
  }

}

module.exports = VotacaoDao;
