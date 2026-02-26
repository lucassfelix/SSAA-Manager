//
// Política de acesso do SSAA: resolver para permissões na camada da aplicação.
//

import { createAccessResolver, allRules, noRules, filterRows } from "@neofront/core";
import type { RoleResolver, FieldCapability } from "@neofront/core";

// #region ------------------------------------------------------------------------------- Constants

/** Valores dos papéis conforme armazenados em `tipo_permissao`. */
const ROLE = {
  usuario: 1,
  responsavel: 2,
  administrador: 3,
  superusuario: 4,
} as const;

// #endregion

// #region ---------------------------------------------------------------------- Resolvers per role

const resolveUsuario: RoleResolver = (user, viewName, data): ReturnType<RoleResolver> => {
  const userId = user.id;
  const clinicaId = user.clinica_id;

  switch (viewName) {
    case 'clinicas':
      return {
        viewCaps: {
          rules: { browse: true, detail: false, edit: false, add: false, delete: false },
        },
        data: { ...data, clinicas: filterRows(data.clinicas, r => r.id === clinicaId) },
      };

    case 'usuarios':
      return {
        viewCaps: {
          rules: { browse: false, detail: false, edit: true, add: false, delete: false },
          fields: {
            clinica_id: { readOnly: true },
            tipo_permissao: { readOnly: true },
          },
        },
        data: {
          ...data,
          usuarios: filterRows(data.usuarios, r => r.id === userId),
          permissoes_usuario: filterRows(data.permissoes_usuario, r => r.value === 1),
        },
      };

    case 'pacientes':
      return {
        viewCaps: {
          rules: { browse: true, detail: true, edit: true, add: true, delete: false },
          fields: {
            clinica_id: { readOnly: true },
            usuario_id: { readOnly: true },
          },
        },
        data: { ...data, pacientes: filterRows(data.pacientes, r => r.clinica_id === clinicaId) },
      };

    case 'projetos':
      return {
        viewCaps: {
          rules: { browse: true, detail: true, edit: true, add: true, delete: false },
          fields: { paciente_id: { readOnly: true } },
        },
        data: { ...data, projetos: filterRows(data.projetos, r => r.clinica_id === clinicaId) },
      };

    default:
      return { viewCaps: { rules: noRules() }, data };
  }
};

const resolveResponsavel: RoleResolver = (user, viewName, data): ReturnType<RoleResolver> => {
  const clinicaId = user.clinica_id;

  switch (viewName) {
    case 'clinicas':
      return {
        viewCaps: { rules: { browse: true, detail: true, edit: true, add: false, delete: false } },
        data: { ...data, clinicas: filterRows(data.clinicas, r => r.id === clinicaId) },
      };

    case 'usuarios':
      return {
        viewCaps: {
          rules: allRules(),
          fields: { clinica_id: { readOnly: true } },
        },
        data: {
          ...data,
          usuarios: filterRows(data.usuarios, r => r.clinica_id === clinicaId),
          permissoes_usuario: filterRows(data.permissoes_usuario, r => r.value <= 2),
        },
      };

    case 'pacientes':
      return {
        viewCaps: {
          rules: allRules(),
          fields: { clinica_id: { readOnly: true } },
        },
        data: { ...data, pacientes: filterRows(data.pacientes, r => r.clinica_id === clinicaId) },
      };

    case 'projetos':
      return {
        viewCaps: {
          rules: allRules(),
          fields: { paciente_id: { readOnly: true } },
        },
        data: { ...data, projetos: filterRows(data.projetos, r => r.clinica_id === clinicaId) },
      };

    default:
      return { viewCaps: { rules: noRules() }, data };
  }
};

const resolveAdministrador: RoleResolver = (_user, viewName, data): ReturnType<RoleResolver> => {
  switch (viewName) {
    case 'clinicas':
      return { viewCaps: { rules: allRules() }, data };

    case 'usuarios':
      return {
        viewCaps: {
          rules: allRules(),
          fields: { senha: { visible: true } },
        },
        data: {
          ...data,
          permissoes_usuario: filterRows(data.permissoes_usuario, r => r.value <= 3),
        },
      };

    case 'pacientes':
      return {
        viewCaps: {
          rules: allRules(),
          fields: { status: { readOnly: false } },
        },
        data,
      };

    case 'projetos':
      return { viewCaps: { rules: allRules() }, data };

    default:
      return { viewCaps: { rules: noRules() }, data };
  }
};

const resolveSuperusuario: RoleResolver = (_user, viewName, data): ReturnType<RoleResolver> => {
  const allFieldsUnlocked: Record<string, FieldCapability> = { allFields: { readOnly: false } };

  switch (viewName) {
    case 'clinicas':
    case 'pacientes':
    case 'projetos':
    case 'usuarios':
      return { viewCaps: { rules: allRules(), fields: allFieldsUnlocked }, data };

    default:
      return { viewCaps: { rules: noRules() }, data };
  }
};

// #endregion

// #region -------------------------------------------------------------------------------- Resolver

/** Resolver de acesso do SSAA, construído a partir das funções de política por papel. */
export const ssaaAccessResolver = createAccessResolver({
  userTable: 'usuarios',
  usernameAccessor: 'username',
  allViewNames: ['clinicas', 'usuarios', 'pacientes', 'projetos'],
  roleAccessor: 'tipo_permissao',
  roleResolvers: {
    [ROLE.usuario]: resolveUsuario,
    [ROLE.responsavel]: resolveResponsavel,
    [ROLE.administrador]: resolveAdministrador,
    [ROLE.superusuario]: resolveSuperusuario,
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
