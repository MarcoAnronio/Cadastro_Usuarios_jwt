export function createStore(db) {
  const fields = 'id, nome, email, fone, data_nascimento';
  return {
    async listUsers(search = '') {
      // Busca literal: os caracteres % e _ digitados não viram curingas SQL.
      const [rows] = await db.execute(`SELECT ${fields} FROM usuarios
        WHERE LOCATE(?, nome) > 0 OR LOCATE(?, email) > 0 ORDER BY nome, id`, [search, search]);
      return rows;
    },
    async getUser(id) { const [rows] = await db.execute(`SELECT ${fields} FROM usuarios WHERE id = ?`, [id]); return rows[0]; },
    async createUser(user) {
      const [result] = await db.execute('INSERT INTO usuarios (nome, email, fone, data_nascimento) VALUES (?, ?, ?, ?)',
        [user.nome, user.email, user.fone, user.data_nascimento]);
      return { id: result.insertId, ...user };
    },
    async updateUser(id, user) {
      const [result] = await db.execute('UPDATE usuarios SET nome = ?, email = ?, fone = ?, data_nascimento = ? WHERE id = ?',
        [user.nome, user.email, user.fone, user.data_nascimento, id]);
      return result.affectedRows > 0;
    },
    async deleteUser(id) { const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]); return result.affectedRows > 0; },
    async findAccount(email) { const [rows] = await db.execute('SELECT id, nome, email, password_hash FROM contas WHERE email = ?', [email]); return rows[0]; },
    async getAccount(id) { const [rows] = await db.execute('SELECT id, nome, email FROM contas WHERE id = ?', [id]); return rows[0]; },
    async createAccount(account) {
      const [result] = await db.execute('INSERT INTO contas (nome, email, password_hash) VALUES (?, ?, ?)',
        [account.nome, account.email, account.password_hash]);
      return { id: result.insertId, nome: account.nome, email: account.email };
    },
    async ping() { await db.query('SELECT 1'); },
  };
}
