-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 30, 2026 at 05:10 PM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u122909690_ssaa`
--

-- --------------------------------------------------------

--
-- Table structure for table `clinicas`
--

CREATE TABLE `clinicas` (
  `id` bigint(20) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `nome_abreviado` varchar(120) NOT NULL,
  `cnpj` varchar(32) DEFAULT NULL,
  `data_criacao` date DEFAULT NULL,
  `data_expiracao` date DEFAULT NULL,
  `ativa` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clinicas`
--

INSERT INTO `clinicas` (`id`, `nome`, `nome_abreviado`, `cnpj`, `data_criacao`, `data_expiracao`, `ativa`) VALUES
(1, 'Clínica Teichert', 'Teichert', '12.345.678/0001-90', '2020-01-10', '9999-12-31', 1),
(2, 'Companhia AlfaDent de Odontologia', 'AlfaDent', '12.345.678/0001-90', '2020-01-15', '2026-01-15', 1),
(3, 'Beta Dentária Ltda.', 'Beta Dentária', '7765432000101', '2021-06-10', '2026-06-10', 1),
(4, 'Delta Teeth Soluções Odontológicas', 'Delta Teeth', '49505234000103', '2021-06-10', '2026-06-10', 0),
(5, 'Clínica Gamalon Solutions', 'Gamalon', '15.987.654/0001-32', '2021-06-10', '2026-06-10', 1),
(6, 'ZetaTech Odontologia Avançada', 'ZetaTech', '76000187', '2021-06-10', '2026-06-10', NULL),
(7, 'Sigma Comércio e Serviços Dentários', 'Sigma', '92.834.352/0001-08', '2021-06-10', '2026-06-10', 1),
(8, 'Ômega Serviços Odontológicos Integrados', 'Ômega', '9.213.671/0001-09', '2021-06-10', '2026-06-10', 1);

-- --------------------------------------------------------

--
-- Table structure for table `pacientes`
--

CREATE TABLE `pacientes` (
  `id` bigint(20) NOT NULL,
  `nome_completo` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `usuario_id` bigint(20) DEFAULT NULL,
  `clinica_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pacientes`
--

INSERT INTO `pacientes` (`id`, `nome_completo`, `data_criacao`, `status`, `usuario_id`, `clinica_id`) VALUES
(1, 'Carlos Alberto Silva', '2025-01-10', 2, 1, 1),
(2, 'Sofia de Oliveira Pereira', '2025-01-10', 1, 2209, 5),
(3, 'Lucas Madeira Olivetti', '2025-01-10', 2, 340, 5),
(4, 'Beatriz Lima Andrade', '2025-01-10', 1, 1, 1),
(5, 'Rafael Costa Moreira Filho', '2025-01-10', 1, 195, 7),
(6, 'Fernanda de Almeida Rocha', '2025-01-10', 1, 340, 5);

-- --------------------------------------------------------

--
-- Table structure for table `paciente_usuarios`
--

CREATE TABLE `paciente_usuarios` (
  `paciente_id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `paciente_usuarios`
--

INSERT INTO `paciente_usuarios` (`paciente_id`, `usuario_id`) VALUES
(1, 1),
(1, 2),
(4, 40),
(6, 40),
(5, 195),
(3, 340),
(6, 340),
(2, 2209);

-- --------------------------------------------------------

--
-- Table structure for table `permissoes_usuario`
--

CREATE TABLE `permissoes_usuario` (
  `value` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `permissoes_usuario`
--

INSERT INTO `permissoes_usuario` (`value`, `name`, `label`) VALUES
(1, 'usuario', 'Usuário padrão'),
(2, 'responsavel', 'Responsável'),
(3, 'administrador', 'Administrador'),
(4, 'superusuario', 'Super usuário');

-- --------------------------------------------------------

--
-- Table structure for table `projetos`
--

CREATE TABLE `projetos` (
  `id` bigint(20) NOT NULL,
  `sku` varchar(80) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT NULL,
  `ultima_edicao` date DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `paciente_id` bigint(20) DEFAULT NULL,
  `usuario_id` bigint(20) DEFAULT NULL,
  `clinica_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `projetos`
--

INSERT INTO `projetos` (`id`, `sku`, `nome`, `data_criacao`, `ultima_edicao`, `status`, `paciente_id`, `usuario_id`, `clinica_id`) VALUES
(1, NULL, 'Original', '2025-01-15', '2025-02-20', 1, 2, 2209, 5),
(2, 'LG-MX3', 'Teste com proporção áurea', '2025-12-02', '2025-02-20', 1, 2, 2209, 5),
(3, NULL, 'Teste 3 com Lysippus (75%), mais claro', '2025-03-10', '2025-02-20', 2, 3, 340, 5),
(4, NULL, 'Teste meio escuro', '2026-04-05', '2025-02-20', 1, 6, 340, 5),
(5, NULL, 'Teste 2', '2025-05-18', '2025-02-20', 3, 5, 195, 7),
(6, NULL, 'Teste 4', '2025-11-20', '2025-02-20', 2, 5, 195, 7),
(7, NULL, 'Teste 5', '2025-07-10', '2025-02-20', 1, 1, 1, 1),
(8, NULL, 'Mais um teste', '2025-07-10', '2025-02-20', 4, 4, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `status_clinicas`
--

CREATE TABLE `status_clinicas` (
  `value` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `className` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `status_clinicas`
--

INSERT INTO `status_clinicas` (`value`, `label`, `className`) VALUES
(1, 'Ativo', 'success'),
(2, 'Inativo', 'default'),
(3, 'Cancelado', 'error');

-- --------------------------------------------------------

--
-- Table structure for table `status_paciente`
--

CREATE TABLE `status_paciente` (
  `value` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `className` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `status_paciente`
--

INSERT INTO `status_paciente` (`value`, `label`, `className`) VALUES
(1, 'Ativo', 'success'),
(2, 'Inativo', 'default');

-- --------------------------------------------------------

--
-- Table structure for table `status_projeto`
--

CREATE TABLE `status_projeto` (
  `value` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `className` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `status_projeto`
--

INSERT INTO `status_projeto` (`value`, `label`, `className`) VALUES
(1, 'Aberto', 'default'),
(2, 'Concluído', 'success'),
(3, 'Pausado', 'warning'),
(4, 'Cancelado', 'error');

-- --------------------------------------------------------

--
-- Table structure for table `status_usuario`
--

CREATE TABLE `status_usuario` (
  `value` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `className` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `status_usuario`
--

INSERT INTO `status_usuario` (`value`, `label`, `className`) VALUES
(1, 'Ativo', 'success'),
(2, 'Inativo', 'default'),
(3, 'Cancelado', 'error');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL,
  `nome_completo` varchar(255) NOT NULL,
  `nome_abreviado` varchar(255) NOT NULL,
  `username` varchar(80) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `clinica_id` bigint(20) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `data_criacao` date DEFAULT NULL,
  `data_expiracao` date DEFAULT NULL,
  `tipo_permissao` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome_completo`, `nome_abreviado`, `username`, `email`, `clinica_id`, `status`, `senha`, `data_criacao`, `data_expiracao`, `tipo_permissao`) VALUES
(1, 'Ruy Teichert Filho', 'Ruy Teichert Filho', 'ruy_teichert', 'ruyteichert@gmail.com', 1, 1, '1234567890', '2025-01-10', '9999-12-31', 3),
(2, 'Letícia Polydoro de Albuquerque', 'Letícia Polydoro', 'letipolya', 'leticia@hypervisual.com.br', 1, 1, '1234567890', '2025-01-10', '9999-12-31', 1),
(3, 'Rubem Pechansky', 'Rubem Pechansky', 'rubempech', 'pechansky@hypervisual.com.br', NULL, 1, NULL, '2025-01-10', '9999-12-31', 4),
(40, 'Maria Beatriz Figueira Gomes', 'Maria B. Gomes', 'maria_fig', 'marifigueira@google.com', 5, 1, '1234567890', '2025-01-10', '2025-12-31', 1),
(107, 'João Carlos Ayres Guimarães', 'João Carlos Guimarães', 'jayres', 'joao.ayres18@uol.com.br', 8, 2, '1234567890', '2025-01-10', '2025-12-31', 1),
(195, 'Marcelo Barroso Goulart', 'Marcelo Barroso', 'mar33', 'marcelobgoulart77@yahoo.com', 7, 1, NULL, '2025-01-10', '2025-12-31', 2),
(340, 'Ana Lúcia Schneider Fernandes', 'Ana Lúcia', 'anafer21', 'anaschneider21@uol.com.br', 5, 1, '1234567890', '2025-01-10', '2025-12-31', 2),
(980, 'Pedro Henrique de Castro Bernardes Machado Neto', 'Pedro Machado', 'pedroh98', 'pedro98@google.com', 3, 3, NULL, '2025-01-10', '2025-12-31', 1),
(2209, 'Mariana Duarte da Costa', 'Mariana Duarte', 'maricosta', 'mari_costa@ig.com.br', 5, 1, '1234567890', '2025-01-10', '2025-12-31', 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clinicas`
--
ALTER TABLE `clinicas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_pacientes_usuario_id` (`usuario_id`),
  ADD KEY `ix_pacientes_clinica_id` (`clinica_id`),
  ADD KEY `ix_pacientes_status` (`status`);

--
-- Indexes for table `paciente_usuarios`
--
ALTER TABLE `paciente_usuarios`
  ADD PRIMARY KEY (`paciente_id`,`usuario_id`),
  ADD KEY `ix_paciente_usuarios_usuario_id` (`usuario_id`);

--
-- Indexes for table `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD PRIMARY KEY (`value`),
  ADD UNIQUE KEY `uq_permissoes_usuario_name` (`name`);

--
-- Indexes for table `projetos`
--
ALTER TABLE `projetos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_projetos_paciente_id` (`paciente_id`),
  ADD KEY `ix_projetos_usuario_id` (`usuario_id`),
  ADD KEY `ix_projetos_clinica_id` (`clinica_id`),
  ADD KEY `ix_projetos_status` (`status`);

--
-- Indexes for table `status_clinicas`
--
ALTER TABLE `status_clinicas`
  ADD PRIMARY KEY (`value`);

--
-- Indexes for table `status_paciente`
--
ALTER TABLE `status_paciente`
  ADD PRIMARY KEY (`value`);

--
-- Indexes for table `status_projeto`
--
ALTER TABLE `status_projeto`
  ADD PRIMARY KEY (`value`);

--
-- Indexes for table `status_usuario`
--
ALTER TABLE `status_usuario`
  ADD PRIMARY KEY (`value`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuarios_username` (`username`),
  ADD KEY `ix_usuarios_clinica_id` (`clinica_id`),
  ADD KEY `ix_usuarios_status` (`status`),
  ADD KEY `ix_usuarios_tipo_permissao` (`tipo_permissao`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `fk_pacientes_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pacientes_status` FOREIGN KEY (`status`) REFERENCES `status_paciente` (`value`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pacientes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `paciente_usuarios`
--
ALTER TABLE `paciente_usuarios`
  ADD CONSTRAINT `fk_paciente_usuarios_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_paciente_usuarios_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projetos`
--
ALTER TABLE `projetos`
  ADD CONSTRAINT `fk_projetos_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_projetos_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_projetos_status` FOREIGN KEY (`status`) REFERENCES `status_projeto` (`value`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_projetos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuarios_permissao` FOREIGN KEY (`tipo_permissao`) REFERENCES `permissoes_usuario` (`value`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuarios_status` FOREIGN KEY (`status`) REFERENCES `status_usuario` (`value`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
