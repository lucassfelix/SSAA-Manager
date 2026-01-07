
// Carrega os mock data

import clinicas from "./clinicas/data.json";
import status_clinicas from "./clinicas/status_clinica.json";

import usuarios from "./usuarios/data.json";
import status_usuario from "./usuarios/status_usuario.json";
import permissoes_usuario from "./usuarios/permissoes_usuario.json";

import pacientes from "./pacientes/data.json";
import status_paciente from "./pacientes/status_paciente.json";

import projetos from "./projetos/data.json";
import status_projeto from "./projetos/status_projeto.json";

// Acrescenta dinamicamente registros-filhos e campos adicionais às tabelas

projetos.forEach(pr => {
  pr.usuario_id = pacientes.find(p => p.id === pr.paciente_id)?.usuario_id;
  pr.clinica_id = usuarios.find(u => u.id === pr.usuario_id)?.clinica_id;
});

pacientes.forEach(p => {
  p.projetos = projetos.filter(pr => pr.paciente_id === p.id);
  p.clinica_id = usuarios.find(u => u.id === p.usuario_id)?.clinica_id;
});

usuarios.forEach(u => {
  u.pacientes = pacientes.filter(p => p.usuario_id === u.id);
  u.projetos = projetos.filter(i => i.usuario_id === u.id);
});

clinicas.forEach(i => {
  i.usuarios = usuarios.filter(u => u.clinica_id === i.id);
  i.usuarios.forEach(u => {
    i.pacientes = (i.pacientes || []).concat(pacientes.filter(p => p.usuario_id === u.id));
  });
});

export default {
  clinicas,
  status_clinicas,

  usuarios,
  status_usuario,
  permissoes_usuario,

  pacientes,
  status_paciente,

  projetos,
  status_projeto,
};
