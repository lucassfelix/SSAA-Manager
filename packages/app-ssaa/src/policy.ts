//
// Políticas de acesso com resolvedor para permissões na camada da aplicação.
//
// Nota: a implementação real exigirá uma abordagem mais robusta com validação no backend. Esta
// versão implementa uma política simplificada, sem níveis de permissão. O acesso é determinado por
// `clinica_id`: NULL ou 1 pode acessar tudo, enquanto outros valores veem apenas os dados da
// própria clínica.
//

// #region --------------------------------------------------------------------------------- Imports

import { createViewBasedAccessResolver, allRules, filterRows } from "@neofront/core";
import type { ViewResolverPayload, ViewResolverResultType } from "@neofront/core";

// #endregion

// #region ---------------------------------------------------------------------- Resolvers per view

/** Permissões e filtros para a view "clinicas". */
const resolveClinicas = ({ user, data }: ViewResolverPayload): ViewResolverResultType => {
  const clinicaId = user.clinica_id;

  const clinicas = clinicaId == null || clinicaId === 1
    ? (data.clinicas ?? [])
    : filterRows(data.clinicas, r => r.id === clinicaId);

  return { viewCaps: { rules: allRules() }, data: { ...data, clinicas } };
};

/** Permissões e filtros para a view "usuarios". */
const resolveUsuarios = ({ user, data }: ViewResolverPayload): ViewResolverResultType => {
  const clinicaId = user.clinica_id;

  const usuarios = clinicaId == null || clinicaId === 1
    ? (data.usuarios ?? [])
    : filterRows(data.usuarios, r => r.clinica_id === clinicaId);

  return { viewCaps: { rules: allRules() }, data: { ...data, usuarios } };
};

/** Permissões e filtros para a view "pacientes". */
const resolvePacientes = ({ user, data }: ViewResolverPayload): ViewResolverResultType => {
  const clinicaId = user.clinica_id;

  const pacientes = clinicaId == null || clinicaId === 1
    ? (data.pacientes ?? [])
    : filterRows(data.pacientes, r => r.clinica_id === clinicaId);

  return { viewCaps: { rules: allRules() }, data: { ...data, pacientes } };
};

/** Permissões e filtros para a view "projetos". */
const resolveProjetos = ({ user, data }: ViewResolverPayload): ViewResolverResultType => {
  const clinicaId = user.clinica_id;

  const projetos = clinicaId == null || clinicaId === 1
    ? (data.projetos ?? [])
    : filterRows(data.projetos, r => r.clinica_id === clinicaId);

  return { viewCaps: { rules: allRules() }, data: { ...data, projetos } };
};

// #endregion

// #region -------------------------------------------------------------------------------- Resolver

/** Resolvedor de acesso construído a partir das funções de política por view. */
export const accessResolver = createViewBasedAccessResolver({
  userTable: 'usuarios',
  usernameAccessor: 'username',
  roleAccessor: 'status',
  viewResolvers: {
    clinicas: resolveClinicas,
    usuarios: resolveUsuarios,
    pacientes: resolvePacientes,
    projetos: resolveProjetos,
  },
  buildPrincipal: (user) => ({
    id: user.id,
    username: String(user.username ?? ''),
    role: Number(user.status ?? 0),
    attrs: {
      clinica_id: user.clinica_id,
    },
  }),
});

// #endregion
