const KEY = 'crud_session';
export function getToken() { return sessionStorage.getItem(KEY); }
export function saveToken(token) { sessionStorage.setItem(KEY, token); }
export function clearToken() {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem('jwt_token'); // Limpa tokens de demonstração da versão anterior.
}
export function sessionExpiry(token) {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000; }
  catch { return 0; }
}
