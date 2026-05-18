/**
 * Mirrors app-ssaa policy: clinica_id null or 1 => global admin for data scope.
 * @param {{ clinica_id?: number | null }} p
 */
export function isAdminPrincipal(p) {
  const c = p?.clinica_id;
  return c == null || Number(c) === 1;
}

/**
 * Build scoped SELECT for SSAA tables (tenant isolation).
 * @param {string} schema
 * @param {string} table
 * @param {{ sub: string, clinica_id?: number | null } | null} principal
 * @param {(n: string) => string} quoteIdent
 */
export function buildSelectForTable(schema, table, principal, quoteIdent) {
  const qSch = quoteIdent(schema);
  const qTbl = quoteIdent(table);
  const base = `SELECT * FROM ${qSch}.${qTbl}`;

  if (!principal || isAdminPrincipal(principal)) {
    return { text: base, values: [] };
  }

  const cid = principal.clinica_id;
  const uid = principal.sub;

  if (table === "status_usuario") {
    return { text: base, values: [] };
  }

  if (table === "clinicas") {
    return {
      text: `${base} WHERE ${quoteIdent("id")} = $1`,
      values: [cid],
    };
  }

  if (table === "usuarios") {
    return {
      text: `${base} WHERE (${quoteIdent("clinica_id")} = $1 OR ${quoteIdent("id")}::text = $2)`,
      values: [cid, String(uid)],
    };
  }

  if (table === "pacientes" || table === "projetos") {
    return {
      text: `${base} WHERE ${quoteIdent("clinica_id")} = $1`,
      values: [cid],
    };
  }

  return { text: `${base} WHERE false`, values: [] };
}

/**
 * WHERE clause for a single row by id + tenant (for UPDATE/DELETE).
 * @param {string} schema
 * @param {string} table
 * @param {string} idAccessor
 * @param {string|number} idVal
 * @param {{ sub: string, clinica_id?: number | null } | null} principal
 * @param {(n: string) => string} quoteIdent
 */
export function buildOwnershipWhere(schema, table, idAccessor, idVal, principal, quoteIdent) {
  const qId = quoteIdent(idAccessor);
  const baseWhere = `${qId} = $1`;

  if (!principal || isAdminPrincipal(principal)) {
    return { text: baseWhere, values: [idVal] };
  }

  const cid = principal.clinica_id;
  const uid = principal.sub;

  if (table === "status_usuario") {
    return { text: "false", values: [] };
  }

  if (table === "clinicas") {
    return {
      text: `${baseWhere} AND ${quoteIdent("id")} = $2`,
      values: [idVal, cid],
    };
  }

  if (table === "usuarios") {
    return {
      text: `${baseWhere} AND (${quoteIdent("clinica_id")} = $2 OR ${quoteIdent("id")}::text = $3)`,
      values: [idVal, cid, String(uid)],
    };
  }

  if (table === "pacientes" || table === "projetos") {
    return {
      text: `${baseWhere} AND ${quoteIdent("clinica_id")} = $2`,
      values: [idVal, cid],
    };
  }

  return { text: "false", values: [] };
}

/**
 * Force tenant id on insert body for non-admin; block privileged tables.
 * @param {string} table
 * @param {Record<string, unknown>} fields
 * @param {{ sub: string, clinica_id?: number | null } | null} principal
 */
export function applyInsertTenantFields(table, fields, principal) {
  if (!principal || isAdminPrincipal(principal)) {
    return fields;
  }

  if (table === "clinicas" || table === "status_usuario") {
    return null;
  }

  const cid = principal.clinica_id;
  const out = { ...fields };

  if (table === "pacientes" || table === "projetos" || table === "usuarios") {
    if (cid != null) {
      out.clinica_id = cid;
    }
    return out;
  }

  return null;
}
