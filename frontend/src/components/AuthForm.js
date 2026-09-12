import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';

export default function AuthForm({ onAuthenticated }) {
  const [registering, setRegistering] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmacao: '' });
  useEffect(() => {
    let active = true;
    api.get('/auth/config').then(({ data }) => { if (active) setCanRegister(data.registrationEnabled); })
      .catch(() => { if (active) setError('Não foi possível conectar à API. Confira se ela está em execução.'); });
    return () => { active = false; };
  }, []);
  const change = event => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault(); setError('');
    if (registering && form.senha !== form.confirmacao) return setError('As senhas não coincidem.');
    setLoading(true);
    try {
      const { data } = await api.post(registering ? '/auth/register' : '/auth/login',
        registering ? { nome: form.nome, email: form.email, senha: form.senha } : { email: form.email, senha: form.senha });
      onAuthenticated(data);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }
  return <section className="card auth-card" aria-labelledby="auth-title">
    <h2 id="auth-title">{registering ? 'Criar conta de acesso' : 'Entrar na sua conta'}</h2>
    <p className="muted">Acesse o painel para consultar e gerenciar os cadastros.</p>
    {error && <p role="alert" className="notice error">{error}</p>}
    <form onSubmit={submit}>
      <fieldset disabled={loading}>
        {registering && <label>Nome<input name="nome" value={form.nome} onChange={change} minLength={2} maxLength={255} required autoComplete="name" /></label>}
        <label>E-mail<input type="email" name="email" value={form.email} onChange={change} maxLength={254} required autoComplete="username" /></label>
        <label>Senha<input type="password" name="senha" value={form.senha} onChange={change} minLength={registering ? 15 : 1} maxLength={128} required autoComplete={registering ? 'new-password' : 'current-password'} /></label>
        {registering && <><p className="muted">Use uma frase-senha com pelo menos 15 caracteres.</p>
          <label>Confirmar senha<input type="password" name="confirmacao" value={form.confirmacao} onChange={change} required autoComplete="new-password" /></label></>}
        <button type="submit">{loading ? 'Aguarde…' : registering ? 'Criar conta' : 'Entrar'}</button>
      </fieldset>
    </form>
    {canRegister && <button className="secondary" disabled={loading} onClick={() => {
      setRegistering(!registering); setError(''); setForm({ ...form, senha: '', confirmacao: '' });
    }}>{registering ? 'Já tenho uma conta' : 'Criar uma conta'}</button>}
  </section>;
}
