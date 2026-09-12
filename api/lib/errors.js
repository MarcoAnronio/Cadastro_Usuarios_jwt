export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' });
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Requisição muito grande.' });
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  // Não enviar SQL, configurações de conexão nem detalhes internos ao cliente.
  return res.status(500).json({ error: 'Não foi possível concluir a operação. Tente novamente.' });
}
