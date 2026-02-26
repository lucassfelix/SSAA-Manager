//
// Política de acesso do SSAA: resolver para permissões na camada da aplicação.
// IMPORTANTE: casos reais exigirão uma abordagem mais robusta, com validação no backend.
//

// #region --------------------------------------------------------------------------------- Imports

import { createViewBasedAccessResolver, allRules, filterRows } from "@neofront/core";
import type { ViewResolverPayload, ViewResolverResult, FieldCapability } from "@neofront/core";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

type VRR = ViewResolverResult | undefined;

// #endregion

// #region ------------------------------------------------------------------------------- Constants

/** Valores dos papéis conforme armazenados em `tipo_permissao`. */
const ROLE = {
  usuario: 1,
  responsavel: 2,
  administrador: 3,
  superusuario: 4,
} as const;

/** Campos desbloqueados para superusuário. */
const allFieldsUnlocked: Record<string, FieldCapability> = { allFields: { readOnly: false } };

// #endregion

// #region ---------------------------------------------------------------------- Resolvers per view

/** Permissões e filtros para a view "clinicas", por papel. */
const resolveClinicas = ({ user, role, data }: ViewResolverPayload): VRR => {
  const clinicaId = user.clinica_id;

  switch (role) {
    case ROLE.usuario:
      return {
        viewCaps: { rules: { browse: true, detail: false, edit: false, add: false, delete: false } },
        data: { ...data, clinicas: filterRows(data.clinicas, r => r.id === clinicaId) },
      };
    case ROLE.responsavel:
      return {
        viewCaps: { rules: { browse: true, detail: true, edit: true, add: false, delete: false } },
        data: { ...data, clinicas: filterRows(data.clinicas, r => r.id === clinicaId) },
      };
    case ROLE.administrador:
      return { viewCaps: { rules: allRules() }, data };
  }
};

/** Permissões e filtros para a view "usuarios", por papel. */
const resolveUsuarios = ({ user, role, data }: ViewResolverPayload): VRR => {
  const userId = user.id;
  const clinicaId = user.clinica_id;
  const readOnlyPolicyFields = {
    clinica_id: { readOnly: true }, tipo_permissao: { readOnly: true },
    data_expiracao: { readOnly: true },
  };

  switch (role) {
    case ROLE.usuario:
      return {
        viewCaps: {
          rules: { browse: false, detail: false, edit: true, add: false, delete: false },
          fields: readOnlyPolicyFields,
        },
        data: {
          ...data,
          usuarios: filterRows(data.usuarios, r => r.id === userId),
          permissoes_usuario: filterRows(data.permissoes_usuario, r => r.value === 1),
        },
      };
    case ROLE.responsavel:
      return {
        viewCaps: {
          rules: allRules(),
          fields: readOnlyPolicyFields,
        },
        data: {
          ...data,
          usuarios: filterRows(data.usuarios, r => r.clinica_id === clinicaId),
          permissoes_usuario: filterRows(data.permissoes_usuario, r => r.value <= 2),
        },
      };
    case ROLE.administrador:
      return {
        viewCaps: {
          rules: allRules(),
          fields: { senha: { visible: true }, tipo_permissao: { readOnly: true } },
        },
        data: {
          ...data,
          permissoes_usuario: filterRows(data.permissoes_usuario, r => r.value <= 3),
        },
      };
  }
};

/** Permissões e filtros para a view "pacientes", por papel. */
const resolvePacientes = ({ user, role, data }: ViewResolverPayload): VRR => {
  const clinicaId = user.clinica_id;

  switch (role) {
    case ROLE.usuario:
      return {
        viewCaps: {
          rules: { browse: true, detail: true, edit: true, add: true, delete: false },
          fields: { clinica_id: { readOnly: true }, usuario_id: { readOnly: true } },
        },
        data: { ...data, pacientes: filterRows(data.pacientes, r => r.clinica_id === clinicaId) },
      };
    case ROLE.responsavel:
      return {
        viewCaps: {
          rules: allRules(),
          fields: { clinica_id: { readOnly: true } },
        },
        data: { ...data, pacientes: filterRows(data.pacientes, r => r.clinica_id === clinicaId) },
      };
    case ROLE.administrador:
      return {
        viewCaps: {
          rules: allRules(),
          fields: { status: { readOnly: false } },
        },
        data,
      };
  }
};

/** Permissões e filtros para a view "projetos", por papel. */
const resolveProjetos = ({ user, role, data }: ViewResolverPayload): VRR => {
  const clinicaId = user.clinica_id;

  switch (role) {
    case ROLE.usuario:
      return {
        viewCaps: {
          rules: { browse: true, detail: true, edit: true, add: true, delete: false },
          fields: { paciente_id: { readOnly: true } },
        },
        data: { ...data, projetos: filterRows(data.projetos, r => r.clinica_id === clinicaId) },
      };
    case ROLE.responsavel:
      return {
        viewCaps: {
          rules: allRules(),
          fields: { paciente_id: { readOnly: true } },
        },
        data: { ...data, projetos: filterRows(data.projetos, r => r.clinica_id === clinicaId) },
      };
    case ROLE.administrador:
      return { viewCaps: { rules: allRules() }, data };
  }
};

// #endregion

// #region -------------------------------------------------------------------------------- Resolver

/** Resolver de acesso do SSAA, construído a partir das funções de política por view. */
export const ssaaAccessResolver = createViewBasedAccessResolver({
  userTable: 'usuarios',
  usernameAccessor: 'username',
  roleAccessor: 'tipo_permissao',
  roleOverrides: {
    [ROLE.superusuario]: { rules: allRules(), fields: allFieldsUnlocked },
  },
  viewResolvers: {
    clinicas: resolveClinicas,
    usuarios: resolveUsuarios,
    pacientes: resolvePacientes,
    projetos: resolveProjetos,
  },
  buildPrincipal: (user) => ({
    id: user.id,
    username: String(user.username ?? ''),
    role: user.tipo_permissao,
    attrs: {
      clinica_id: user.clinica_id,
      nome_abreviado: user.nome_abreviado,
    },
  }),
});

// #endregion
