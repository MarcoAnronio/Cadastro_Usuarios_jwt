import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthForm from './AuthForm';
import Form from './Form';
import Grid from './Grid';
import api from '../api';
jest.mock('../api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  errorMessage: err => err.response?.data?.error || 'Erro de conexão.' }));
const user = { id: 7, nome: 'Pessoa de teste', email: 'pessoa@example.test', fone: '11999999999', data_nascimento: '2000-02-29T00:00:00.000Z' };
beforeEach(() => { api.get.mockResolvedValue({ data: { registrationEnabled: true } }); });

test('login envia credenciais, apresenta falha e mantém os campos preenchidos', async () => {
  api.post.mockRejectedValue({ response: { data: { error: 'E-mail ou senha incorretos.' } } });
  const done = jest.fn(); render(<AuthForm onAuthenticated={done} />);
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'teste@example.test' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha de teste' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
  expect(screen.getByLabelText('E-mail')).toHaveValue('teste@example.test');
  expect(done).not.toHaveBeenCalled();
});
test('cadastro exige confirmação de senha e entrega sessão após sucesso', async () => {
  api.post.mockResolvedValue({ data: { token: 'teste', account: { nome: 'Conta' } } });
  const done = jest.fn(); render(<AuthForm onAuthenticated={done} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Criar uma conta' }));
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Conta' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'teste@example.test' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'frase de senha para teste' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'outra senha' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Criar conta' }).closest('form'));
  expect(screen.getByRole('alert')).toHaveTextContent('As senhas não coincidem.');
  expect(api.post).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'frase de senha para teste' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Criar conta' }).closest('form'));
  await waitFor(() => expect(done).toHaveBeenCalledWith({ token: 'teste', account: { nome: 'Conta' } }));
});
test('edição trata data ISO e preserva o formulário quando a API falha', async () => {
  api.put.mockRejectedValue({ response: { data: { error: 'Falha ao salvar.' } } });
  const saved = jest.fn(); render(<Form onEdit={user} onSaved={saved} onCancel={jest.fn()} />);
  expect(screen.getByLabelText('Data de nascimento')).toHaveValue('2000-02-29');
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar.');
  expect(screen.getByLabelText('Nome')).toHaveValue(user.nome);
  expect(saved).not.toHaveBeenCalled();
});
test('novo cadastro só limpa os campos após confirmação da API', async () => {
  api.post.mockResolvedValue({ data: { ...user, id: 8 } });
  const saved = jest.fn(); render(<Form onEdit={null} onSaved={saved} onCancel={jest.fn()} />);
  for (const [label, value] of [['Nome',user.nome],['E-mail',user.email],['Telefone',user.fone],['Data de nascimento','2000-02-29']])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  await waitFor(() => expect(saved).toHaveBeenCalledWith('Usuário cadastrado.'));
  expect(screen.getByLabelText('Nome')).toHaveValue('');
});
test('exclusão pede confirmação e só remove da tela após sucesso', async () => {
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  const deleted = jest.fn(), failed = jest.fn();
  render(<Grid users={[user]} onEdit={jest.fn()} onDeleted={deleted} onError={failed} />);
  fireEvent.click(screen.getByRole('button', { name: `Excluir ${user.nome}` }));
  expect(api.delete).not.toHaveBeenCalled();
  confirm.mockReturnValue(true); api.delete.mockRejectedValue({ response: { data: { error: 'Falha.' } } });
  fireEvent.click(screen.getByRole('button', { name: `Excluir ${user.nome}` }));
  await waitFor(() => expect(failed).toHaveBeenCalledWith('Falha.'));
  expect(deleted).not.toHaveBeenCalled();
  api.delete.mockResolvedValue({});
  fireEvent.click(screen.getByRole('button', { name: `Excluir ${user.nome}` }));
  await waitFor(() => expect(deleted).toHaveBeenCalledWith(7));
  confirm.mockRestore();
});
