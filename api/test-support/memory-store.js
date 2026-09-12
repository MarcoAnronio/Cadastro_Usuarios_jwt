export function memoryStore() {
  const accounts = new Map(); const users = new Map(); let accountId = 0; let userId = 0;
  return {
    accounts, users,
    async ping() {},
    async findAccount(email) { return [...accounts.values()].find(a => a.email === email); },
    async getAccount(id) { const a = accounts.get(id); return a && { id: a.id, nome: a.nome, email: a.email }; },
    async createAccount(account) {
      if (await this.findAccount(account.email)) throw Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' });
      const a = { id: ++accountId, ...account }; accounts.set(a.id, a);
      return { id: a.id, nome: a.nome, email: a.email };
    },
    async listUsers(q = '') { return [...users.values()].filter(u => `${u.nome} ${u.email}`.toLowerCase().includes(q.toLowerCase())); },
    async getUser(id) { return users.get(id); },
    async createUser(user) { const u = { id: ++userId, ...user }; users.set(u.id, u); return u; },
    async updateUser(id, user) { if (!users.has(id)) return false; users.set(id, { id, ...user }); return true; },
    async deleteUser(id) { return users.delete(id); },
  };
}
