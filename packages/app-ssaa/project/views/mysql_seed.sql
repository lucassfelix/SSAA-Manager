-- NeoFront app-ssaa mock data -> MySQL seed
-- Source JSONs (packages/app-ssaa/project/views/**):
-- - clinicas/data.json
-- - usuarios/data.json
-- - usuarios/status_usuario.json
-- - pacientes/data.json
-- - projetos/data.json

-- Gerado automaticamente pelo GitHub Copilot (GPT 5.2) a partir dos JSONs de teste acima
-- e acrescido de registros-filhos e campos adicionais

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- Drop (dependents first)
DROP TABLE IF EXISTS projetos;
DROP TABLE IF EXISTS pacientes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS clinicas;
DROP TABLE IF EXISTS status_usuario;

-- Lookup tables
CREATE TABLE status_usuario (
  value INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  className VARCHAR(50) NULL,
  PRIMARY KEY (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Core tables
CREATE TABLE clinicas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE usuarios (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nome_completo VARCHAR(255) NOT NULL,
  username VARCHAR(80) NOT NULL,
  clinica_id BIGINT NULL,
  status INT NULL,
  senha VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_username (username),
  KEY ix_usuarios_clinica_id (clinica_id),
  KEY ix_usuarios_status (status),
  CONSTRAINT fk_usuarios_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_usuarios_status FOREIGN KEY (status) REFERENCES status_usuario(value)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE pacientes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nome_completo VARCHAR(255) NOT NULL,
  clinica_id BIGINT NULL,
  PRIMARY KEY (id),
  KEY ix_pacientes_clinica_id (clinica_id),
  CONSTRAINT fk_pacientes_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE projetos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  sku VARCHAR(80) NULL,
  nome VARCHAR(255) NOT NULL,
  paciente_id BIGINT NULL,
  clinica_id BIGINT NULL,
  PRIMARY KEY (id),
  KEY ix_projetos_paciente_id (paciente_id),
  KEY ix_projetos_clinica_id (clinica_id),
  CONSTRAINT fk_projetos_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_projetos_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed lookup data
INSERT INTO status_usuario (value, label, className) VALUES
  (1, 'Ativo', 'success'),
  (2, 'Inativo', 'default');

-- Seed core data
INSERT INTO clinicas (id, nome) VALUES
  (1, 'Clínica Teichert'),
  (2, 'Companhia AlfaDent de Odontologia'),
  (3, 'Beta Dentária Ltda.'),
  (4, 'Delta Teeth Soluções Odontológicas'),
  (5, 'Clínica Gamalon Solutions'),
  (6, 'ZetaTech Odontologia Avançada'),
  (7, 'Sigma Comércio e Serviços Dentários'),
  (8, 'Ômega Serviços Odontológicos Integrados');

INSERT INTO usuarios (id, nome_completo, username, clinica_id, status, senha) VALUES
  (1, 'Ruy Teichert Filho', 'ruyteichert', 1, 1, '1234567890'),
  (2, 'Letícia Polydoro de Albuquerque', 'letipolya', NULL, 1, NULL),
  (3, 'Rubem Pechansky', 'rubempech', NULL, 1, NULL),
  (4, 'Lucas Salaverry Félix', 'lucasfelix', NULL, 1, NULL),
  (40, 'Maria Beatriz Figueira Gomes', 'maria_fig', 5, 1, '1234567890'),
  (107, 'João Carlos Ayres Guimarães', 'jayres', 8, 2, '1234567890'),
  (195, 'Marcelo Barroso Goulart', 'mar33', 7, 1, NULL),
  (340, 'Ana Lúcia Schneider Fernandes', 'anafer21', 5, 1, '1234567890'),
  (980, 'Pedro Henrique de Castro Bernardes Machado Neto', 'pedroh98', 3, 2, NULL),
  (2209, 'Mariana Duarte da Costa', 'maricosta', 5, 1, '1234567890');

INSERT INTO pacientes (id, nome_completo, clinica_id) VALUES
  (1, 'Carlos Alberto Silva', 1),
  (2, 'Sofia de Oliveira Pereira', 5),
  (3, 'Lucas Madeira Olivetti', 5),
  (4, 'Beatriz Lima Andrade', 1),
  (5, 'Rafael Costa Moreira Filho', 7),
  (6, 'Fernanda de Almeida Rocha', 5);

INSERT INTO projetos (id, sku, nome, paciente_id, clinica_id) VALUES
  (1, NULL, 'Original', 2, 5),
  (2, 'LG-MX3', 'Teste com proporção áurea', 2, 5),
  (3, NULL, 'Teste 3 com Lysippus (75%), mais claro', 3, 5),
  (4, NULL, 'Teste meio escuro', 6, 5),
  (5, NULL, 'Teste 2', 5, 7),
  (6, NULL, 'Teste 4', 5, 7),
  (7, NULL, 'Teste 5', 1, 1),
  (8, NULL, 'Mais um teste', 4, 1);

SET FOREIGN_KEY_CHECKS = 1;
