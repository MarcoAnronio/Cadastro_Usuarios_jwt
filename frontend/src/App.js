import { useEffect, useState, useCallback } from 'react';
import GlobalStyle from './styles/global';
import api, { errorMessage } from './api';
import { getToken, saveToken, clearToken, sessionExpiry } from './auth';
import AuthForm from './components/AuthForm';
import Form from './components/Form';
import Grid from './components/Grid';

function Dashboard() {
  const [users, setUsers] = useState([]); const [onEdit, setOnEdit] = useState(null);
  const [query, setQuery] = useState(''); const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [message, setMessage] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.get('/users', { params: { q: search } }).then(({ data }) => { if (active) setUsers(data); })
      .catch(err => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, revision]);
  function saved(message) { setOnEdit(null); setMessage(message); setRevision(value => value + 1); }
  return <>
    {message && <p role="status" className="notice">{message}</p>}
    <Form onEdit={onEdit} onSaved={saved} onCancel={() => setOnEdit(null)} />
    <section className="card" aria-labelledby="list-title">
      <div className="section-heading"><h2 id="list-title">Usuários cadastrados</h2><span className="muted">{users.length} resultado(s)</span></div>
      <form className="search" onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setRevision(value => value + 1); }}>
        <label className="grow">Buscar por nome ou e-mail<input value={query} onChange={event => setQuery(event.target.value)} type="search" maxLength={100} /></label>
        <button type="submit">Buscar</button>
        {search && <button type="button" className="secondary" onClick={() => { setQuery(''); setSearch(''); }}>Limpar busca</button>}
      </form>
      {error && <div className="notice error" role="alert">{error} <button className="secondary" onClick={() => setRevision(value => value + 1)}>Tentar novamente</button></div>}
      {loading ? <p role="status">Carregando cadastros…</p> : !error && <Grid users={users} onEdit={setOnEdit} onError={setError} onDeleted={id => {
        if (onEdit?.id === id) setOnEdit(null);
        setMessage('Cadastro excluído.'); setRevision(value => value + 1);
      }} />}
    </section>
  </>;
}

export default function App() {
  const [account, setAccount] = useState(null); const [checking, setChecking] = useState(true);
  const [notice, setNotice] = useState('');
  const logout = useCallback((expired = false) => {
    clearToken(); setAccount(null); setNotice(expired ? 'Sua sessão expirou. Entre novamente.' : 'Você saiu da sua conta.');
  }, []);
  useEffect(() => {
    let active = true;
    localStorage.removeItem('jwt_token');
    if (!getToken()) { setChecking(false); return; }
    api.get('/auth/me').then(({ data }) => { if (active) setAccount(data); })
      .catch(err => { if (active) { clearToken(); setNotice(errorMessage(err)); } })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const expired = () => logout(true);
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, [logout]);
  useEffect(() => {
    if (!account) return;
    const remaining = sessionExpiry(getToken() || '') - Date.now();
    const timer = setTimeout(() => logout(true), Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [account, logout]);
  return <><GlobalStyle /><main className="container">
    <header className="app-header"><div><p className="eyebrow">CRUD · JWT</p><h1>Cadastro de usuários</h1><p className="muted">Consulte, cadastre e mantenha os dados organizados.</p></div>
      {account && <div className="account"><span>{account.nome}</span><button className="secondary" onClick={() => logout()}>Sair</button></div>}
    </header>
    {notice && <p role="status" className="notice">{notice}</p>}
    {checking ? <p role="status">Verificando sessão…</p> : account ? <Dashboard /> : <AuthForm onAuthenticated={({ token, account }) => {
      saveToken(token); setAccount(account); setNotice('');
    }} />}
  </main></>;
}
