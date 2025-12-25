
// Carrega os mock data

import instituicoes from "./instituicoes/data.json";
import status_instituicoes from "./instituicoes/status_instituicao.json";

import usuarios from "./usuarios/data.json";
import status_usuario from "./usuarios/status_usuario.json";

import pacientes from "./pacientes/data.json";
import status_paciente from "./pacientes/status_paciente.json";

import projetos from "./projetos/data.json";
import status_projeto from "./projetos/status_projeto.json";

// Acrescenta dinamicamente registros-filhos e campos adicionais às tabelas

projetos.forEach(pr => {
  pr.usuario_id = pacientes.find(p => p.id === pr.paciente_id).usuario_id;
  pr.instituicao_id = usuarios.find(u => u.id === pr.usuario_id).instituicao_id;
});

pacientes.forEach(p => {
  p.projetos = projetos.filter(pr => pr.paciente_id === p.id);
  p.instituicao_id = usuarios.find(u => u.id === p.usuario_id).instituicao_id;
});

usuarios.forEach(u => {
  u.pacientes = pacientes.filter(p => p.usuario_id === u.id);
  u.projetos = projetos.filter(i => i.usuario_id === u.id);
});

instituicoes.forEach(i => {
  i.usuarios = usuarios.filter(u => u.instituicao_id === i.id);
  i.usuarios.forEach(u => {
    i.pacientes = (i.pacientes || []).concat(pacientes.filter(p => p.usuario_id === u.id));
  });
});

export default {
  instituicoes,
  status_instituicoes,

  usuarios,
  status_usuario,

  pacientes,
  status_paciente,

  projetos,
  status_projeto,
};
