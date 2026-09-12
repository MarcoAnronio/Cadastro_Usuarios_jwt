import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import api from './api';
import { saveToken, getToken } from './auth';
jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn() }, errorMessage: () => 'Falha de conexão.' }));
const account = { id: 1, nome: 'Operador' };
beforeEach(() => {
  sessionStorage.clear(); localStorage.clear();
  api.get.mockImplementation(path => Promise.resolve({ data: path === '/auth/me' ? account : path === '/users' ? [] : { registrationEnabled: false } }));
});
function validSession() { saveToken(`test.${btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 }))}.signature`); }
test('sem sessão abre login e não busca um token público', async () => {
  render(<App />);
  expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  expect(api.get.mock.calls.some(([path]) => path === '/get-token')).toBe(false);
});
test('restaura conta, busca usuários e encerra a sessão no logout', async () => {
  validSession(); render(<App />);
  await screen.findByRole('heading', { name: 'Usuários cadastrados' });
  fireEvent.change(screen.getByLabelText('Buscar por nome ou e-mail'), { target: { value: 'Maria' } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/users', { params: { q: 'Maria' } }));
  fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
  expect(getToken()).toBeNull();
  expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
});
test('evento de sessão expirada remove o acesso ao painel', async () => {
  validSession(); render(<App />); await screen.findByRole('button', { name: 'Sair' });
  act(() => window.dispatchEvent(new Event('session-expired')));
  expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  expect(screen.getByText('Sua sessão expirou. Entre novamente.')).toBeInTheDocument();
  expect(getToken()).toBeNull();
});
