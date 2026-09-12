import api from './api';
import { saveToken, getToken } from './auth';
jest.mock('axios', () => ({ create: () => ({ interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } }) }));
const before = api.interceptors.request.use.mock.calls[0][0];
const failed = api.interceptors.response.use.mock.calls[0][1];
beforeEach(() => sessionStorage.clear());
test('envia Bearer apenas às rotas que usam a sessão', () => {
  saveToken('token-de-teste');
  expect(before({ url: '/users', headers: {} }).headers.Authorization).toBe('Bearer token-de-teste');
  expect(before({ url: '/auth/login', headers: {} }).headers.Authorization).toBeUndefined();
});
test('401 protegido encerra sessão; erro de login não dispara expiração', async () => {
  const listener = jest.fn(); window.addEventListener('session-expired', listener); saveToken('teste');
  const error = { response: { status: 401 }, config: { url: '/auth/login' } };
  await expect(failed(error)).rejects.toBe(error); expect(listener).not.toHaveBeenCalled();
  error.config.url = '/users'; await expect(failed(error)).rejects.toBe(error);
  expect(listener).toHaveBeenCalledTimes(1); expect(getToken()).toBeNull();
  window.removeEventListener('session-expired', listener);
});
