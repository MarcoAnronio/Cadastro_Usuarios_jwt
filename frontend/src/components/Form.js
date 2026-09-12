import { useEffect, useState, useRef } from 'react';
import api, { errorMessage } from '../api';

const empty = { nome: '', email: '', fone: '', data_nascimento: '' };
export default function Form({ onEdit, onSaved, onCancel }) {
  const [values, setValues] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef(null);
  useEffect(() => {
    setValues(onEdit ? { nome: onEdit.nome, email: onEdit.email, fone: onEdit.fone,
      data_nascimento: String(onEdit.data_nascimento).slice(0, 10) } : empty);
    setError(''); if (onEdit) nameRef.current?.focus();
  }, [onEdit]);
  const change = event => setValues({ ...values, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      if (onEdit) await api.put(`/users/${onEdit.id}`, values);
      else await api.post('/users', values);
      setValues(empty); onSaved(onEdit ? 'Cadastro atualizado.' : 'Usuário cadastrado.');
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }
  return <section className="card" aria-labelledby="form-title">
    <h2 id="form-title">{onEdit ? 'Editar cadastro' : 'Novo usuário'}</h2>
    {error && <p className="notice error" role="alert">{error}</p>}
    <form onSubmit={submit}>
      <fieldset className="form-grid" disabled={saving}>
        <label>Nome<input ref={nameRef} name="nome" value={values.nome} onChange={change} required minLength={2} maxLength={255} autoComplete="name" /></label>
        <label>E-mail<input name="email" type="email" value={values.email} onChange={change} required maxLength={254} autoComplete="email" /></label>
        <label>Telefone<input name="fone" type="tel" value={values.fone} onChange={change} required maxLength={50} autoComplete="tel" /></label>
        <label>Data de nascimento<input name="data_nascimento" type="date" value={values.data_nascimento} onChange={change} required min="1900-01-01" max={new Date().toISOString().slice(0, 10)} /></label>
        <div className="actions"><button type="submit">{saving ? 'Salvando…' : 'Salvar'}</button>
          {onEdit && <button type="button" className="secondary" onClick={onCancel}>Cancelar edição</button>}</div>
      </fieldset>
    </form>
  </section>;
}
