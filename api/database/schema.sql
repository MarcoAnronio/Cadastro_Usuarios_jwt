-- Executar no banco configurado em DB_NAME. Não remove registros existentes.
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  fone VARCHAR(50) NOT NULL,
  data_nascimento DATE NOT NULL
);

-- Contas de acesso são separadas dos cadastros administrados no CRUD.
CREATE TABLE IF NOT EXISTS contas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
