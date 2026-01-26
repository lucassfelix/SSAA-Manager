-- NeoFront app-ssaa mock data -> MySQL seed
-- Source JSONs (packages/app-ssaa/project/views/**):
-- - clinicas/data.json
-- - clinicas/status_clinica.json
-- - usuarios/data.json
-- - usuarios/status_usuario.json
-- - usuarios/permissoes_usuario.json
-- - pacientes/data.json
-- - pacientes/status_paciente.json
-- - projetos/data.json
-- - projetos/status_projeto.json

-- Gerado automaticamente pelo GitHub Copilot (GPT 5.2) a partir dos JSONs de teste acima
-- e acrescido de registros-filhos e campos adicionais

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- Drop (dependents first)
DROP TABLE IF EXISTS paciente_usuarios;
DROP TABLE IF EXISTS projetos;
DROP TABLE IF EXISTS pacientes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS clinicas;
DROP TABLE IF EXISTS status_projeto;
DROP TABLE IF EXISTS status_paciente;
DROP TABLE IF EXISTS permissoes_usuario;
DROP TABLE IF EXISTS status_usuario;
DROP TABLE IF EXISTS status_clinicas;

-- Lookup tables
CREATE TABLE status_clinicas (
  value INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  className VARCHAR(50) NULL,
  PRIMARY KEY (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE status_usuario (
  value INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  className VARCHAR(50) NULL,
  PRIMARY KEY (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE permissoes_usuario (
  value INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  PRIMARY KEY (value),
  UNIQUE KEY uq_permissoes_usuario_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE status_paciente (
  value INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  className VARCHAR(50) NULL,
  PRIMARY KEY (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE status_projeto (
  value INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  className VARCHAR(50) NULL,
  PRIMARY KEY (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Core tables
CREATE TABLE clinicas (
  id BIGINT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  nome_abreviado VARCHAR(120) NOT NULL,
  cnpj VARCHAR(32) NULL,
  data_criacao DATE NULL,
  data_expiracao DATE NULL,
  ativa TINYINT(1) NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE usuarios (
  id BIGINT NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  nome_abreviado VARCHAR(255) NOT NULL,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(255) NULL,
  clinica_id BIGINT NULL,
  status INT NULL,
  senha VARCHAR(255) NULL,
  data_criacao DATE NULL,
  data_expiracao DATE NULL,
  tipo_permissao INT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_username (username),
  KEY ix_usuarios_clinica_id (clinica_id),
  KEY ix_usuarios_status (status),
  KEY ix_usuarios_tipo_permissao (tipo_permissao),
  CONSTRAINT fk_usuarios_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_usuarios_status FOREIGN KEY (status) REFERENCES status_usuario(value)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_usuarios_permissao FOREIGN KEY (tipo_permissao) REFERENCES permissoes_usuario(value)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE pacientes (
  id BIGINT NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  data_criacao DATE NULL,
  status INT NULL,
  usuario_id BIGINT NULL,
  clinica_id BIGINT NULL,
  PRIMARY KEY (id),
  KEY ix_pacientes_usuario_id (usuario_id),
  KEY ix_pacientes_clinica_id (clinica_id),
  KEY ix_pacientes_status (status),
  CONSTRAINT fk_pacientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_pacientes_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_pacientes_status FOREIGN KEY (status) REFERENCES status_paciente(value)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- pacientes.usuarios[] -> join table
CREATE TABLE paciente_usuarios (
  paciente_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  PRIMARY KEY (paciente_id, usuario_id),
  KEY ix_paciente_usuarios_usuario_id (usuario_id),
  CONSTRAINT fk_paciente_usuarios_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_paciente_usuarios_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE projetos (
  id BIGINT NOT NULL,
  sku VARCHAR(80) NULL,
  nome VARCHAR(255) NOT NULL,
  data_criacao DATE NULL,
  ultima_edicao DATE NULL,
  status INT NULL,
  paciente_id BIGINT NULL,
  usuario_id BIGINT NULL,
  clinica_id BIGINT NULL,
  PRIMARY KEY (id),
  KEY ix_projetos_paciente_id (paciente_id),
  KEY ix_projetos_usuario_id (usuario_id),
  KEY ix_projetos_clinica_id (clinica_id),
  KEY ix_projetos_status (status),
  CONSTRAINT fk_projetos_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_projetos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_projetos_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_projetos_status FOREIGN KEY (status) REFERENCES status_projeto(value)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed lookup data
INSERT INTO status_clinicas (value, label, className) VALUES
  (1, 'Ativo', 'success'),
  (2, 'Inativo', 'default'),
  (3, 'Cancelado', 'error');

INSERT INTO status_usuario (value, label, className) VALUES
  (1, 'Ativo', 'success'),
  (2, 'Inativo', 'default'),
  (3, 'Cancelado', 'error');

INSERT INTO permissoes_usuario (value, name, label) VALUES
  (1, 'usuario', 'Usuário padrão'),
  (2, 'responsavel', 'Responsável'),
  (3, 'administrador', 'Administrador'),
  (4, 'superusuario', 'Super usuário');

INSERT INTO status_paciente (value, label, className) VALUES
  (1, 'Ativo', 'success'),
  (2, 'Inativo', 'default');

INSERT INTO status_projeto (value, label, className) VALUES
  (1, 'Aberto', 'default'),
  (2, 'Concluído', 'success'),
  (3, 'Pausado', 'warning'),
  (4, 'Cancelado', 'error');

-- Seed core data
INSERT INTO clinicas (id, nome, nome_abreviado, cnpj, data_criacao, data_expiracao, ativa) VALUES
  (1, 'Clínica Teichert', 'Teichert', '12.345.678/0001-90', '2020-01-10', '9999-12-31', 1),
  (2, 'Companhia AlfaDent de Odontologia', 'AlfaDent', '12.345.678/0001-90', '2020-01-15', '2026-01-15', 1),
  (3, 'Beta Dentária Ltda.', 'Beta Dentária', '7765432000101', '2021-06-10', '2026-06-10', 1),
  (4, 'Delta Teeth Soluções Odontológicas', 'Delta Teeth', '49505234000103', '2021-06-10', '2026-06-10', 0),
  (5, 'Clínica Gamalon Solutions', 'Gamalon', '15.987.654/0001-32', '2021-06-10', '2026-06-10', 1),
  (6, 'ZetaTech Odontologia Avançada', 'ZetaTech', '76000187', '2021-06-10', '2026-06-10', NULL),
  (7, 'Sigma Comércio e Serviços Dentários', 'Sigma', '92.834.352/0001-08', '2021-06-10', '2026-06-10', 1),
  (8, 'Ômega Serviços Odontológicos Integrados', 'Ômega', '9.213.671/0001-09', '2021-06-10', '2026-06-10', 1);

INSERT INTO usuarios (id, nome_completo, nome_abreviado, username, email, clinica_id, status, senha, data_criacao, data_expiracao, tipo_permissao) VALUES
  (1, 'Ruy Teichert Filho', 'Ruy Teichert Filho', 'ruy_teichert', 'ruyteichert@gmail.com', 1, 1, '1234567890', '2025-01-10', '9999-12-31', 3),
  (2, 'Letícia Polydoro de Albuquerque', 'Letícia Polydoro', 'letipolya', 'leticia@hypervisual.com.br', 1, 1, '1234567890', '2025-01-10', '9999-12-31', 1),
  (3, 'Rubem Pechansky', 'Rubem Pechansky', 'rubempech', 'pechansky@hypervisual.com.br', NULL, 1, NULL, '2025-01-10', '9999-12-31', 4),
  (40, 'Maria Beatriz Figueira Gomes', 'Maria B. Gomes', 'maria_fig', 'marifigueira@google.com', 5, 1, '1234567890', '2025-01-10', '2025-12-31', 1),
  (107, 'João Carlos Ayres Guimarães', 'João Carlos Guimarães', 'jayres', 'joao.ayres18@uol.com.br', 8, 2, '1234567890', '2025-01-10', '2025-12-31', 1),
  (195, 'Marcelo Barroso Goulart', 'Marcelo Barroso', 'mar33', 'marcelobgoulart77@yahoo.com', 7, 1, NULL, '2025-01-10', '2025-12-31', 2),
  (340, 'Ana Lúcia Schneider Fernandes', 'Ana Lúcia', 'anafer21', 'anaschneider21@uol.com.br', 5, 1, '1234567890', '2025-01-10', '2025-12-31', 2),
  (980, 'Pedro Henrique de Castro Bernardes Machado Neto', 'Pedro Machado', 'pedroh98', 'pedro98@google.com', 3, 3, NULL, '2025-01-10', '2025-12-31', 1),
  (2209, 'Mariana Duarte da Costa', 'Mariana Duarte', 'maricosta', 'mari_costa@ig.com.br', 5, 1, '1234567890', '2025-01-10', '2025-12-31', 2);

INSERT INTO pacientes (id, nome_completo, data_criacao, status, usuario_id, clinica_id) VALUES
  (1, 'Carlos Alberto Silva', '2025-01-10', 2, 1, 1),
  (2, 'Sofia de Oliveira Pereira', '2025-01-10', 1, 2209, 5),
  (3, 'Lucas Madeira Olivetti', '2025-01-10', 2, 340, 5),
  (4, 'Beatriz Lima Andrade', '2025-01-10', 1, 1, 1),
  (5, 'Rafael Costa Moreira Filho', '2025-01-10', 1, 195, 7),
  (6, 'Fernanda de Almeida Rocha', '2025-01-10', 1, 340, 5);

INSERT INTO paciente_usuarios (paciente_id, usuario_id) VALUES
  (1, 1),
  (1, 2),
  (2, 2209),
  (3, 340),
  (4, 40),
  (5, 195),
  (6, 340),
  (6, 40);

INSERT INTO projetos (id, sku, nome, data_criacao, ultima_edicao, status, paciente_id, usuario_id, clinica_id) VALUES
  (1, NULL, 'Original', '2025-01-15', '2025-02-20', 1, 2, 2209, 5),
  (2, 'LG-MX3', 'Teste com proporção áurea', '2025-12-02', '2025-02-20', 1, 2, 2209, 5),
  (3, NULL, 'Teste 3 com Lysippus (75%), mais claro', '2025-03-10', '2025-02-20', 2, 3, 340, 5),
  (4, NULL, 'Teste meio escuro', '2026-04-05', '2025-02-20', 1, 6, 340, 5),
  (5, NULL, 'Teste 2', '2025-05-18', '2025-02-20', 3, 5, 195, 7),
  (6, NULL, 'Teste 3', '2025-11-20', '2025-02-20', 2, 5, 195, 7),
  (7, NULL, 'Teste 3', '2025-07-10', '2025-02-20', 1, 1, 1, 1),
  (8, NULL, 'Mais um teste', '2025-07-10', '2025-02-20', 4, 4, 1, 1);

SET FOREIGN_KEY_CHECKS = 1;
