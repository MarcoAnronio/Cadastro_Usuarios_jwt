import { useState } from 'react';
import api, { errorMessage } from '../api';

export default function Grid({ users, onEdit, onDeleted, onError }) {
  const [pending, setPending] = useState(null);
  async function remove(user) {
    if (!window.confirm(`Excluir o cadastro de ${user.nome}? Esta ação não pode ser desfeita.`)) return;
    setPending(user.id);
    try { await api.delete(`/users/${user.id}`); onDeleted(user.id); }
    catch (err) { onError(errorMessage(err)); }
    finally { setPending(null); }
  }
  if (!users.length) return <p className="empty">Nenhum usuário encontrado. Cadastre um usuário ou ajuste a busca.</p>;
  return <div className="table-scroll"><table>
    <caption className="sr-only">Usuários cadastrados</caption>
    <thead><tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Telefone</th><th scope="col">Nascimento</th><th scope="col">Ações</th></tr></thead>
    <tbody>{users.map(user => <tr key={user.id}>
      <td>{user.nome}</td><td>{user.email}</td><td>{user.fone}</td>
      <td>{String(user.data_nascimento).slice(0, 10).split('-').reverse().join('/')}</td>
      <td><div className="actions"><button type="button" className="secondary" disabled={pending !== null} aria-label={`Editar ${user.nome}`} onClick={() => onEdit(user)}>Editar</button>
        <button type="button" className="danger" disabled={pending !== null} aria-label={`Excluir ${user.nome}`} onClick={() => remove(user)}>{pending === user.id ? 'Excluindo…' : 'Excluir'}</button></div></td>
    </tr>)}</tbody>
  </table></div>;
}
