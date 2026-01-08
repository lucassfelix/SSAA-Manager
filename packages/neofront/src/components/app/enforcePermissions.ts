//
// Utilities to simplify code in main.tsx files for NeoFront applications.
//

// #region --------------------------------------------------------------------------------- Imports

import { FieldsConfig, ViewResultProps } from "context";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

type CompareOp = '==' | '!=' | '<' | '<=' | '>' | '>=';
type PredicateValue = string | number | boolean | null;
type PredicateShorthand = string; // e.g. "clinica_id == $user.clinica_id" (space-separated)
type Predicate = 'all' | PredicateShorthand | PredicateObject;
type FieldRule = PredicateShorthand | { readOnly?: boolean; visible?: boolean; filter?: FieldFilter };

interface PredicateObject {
  field: string;
  op: string;
  value: PredicateValue;
}

interface FieldFilter {
  op: string;
  value: PredicateValue;
}

interface ViewRules {
  browse?: boolean;
  detail?: boolean;
  edit?: boolean | Predicate;
  add?: boolean | Predicate;
  delete?: boolean | Predicate;
}

interface ViewPermissions {
  rules?: ViewRules;
  fields?: Record<string, FieldRule>;
}

interface RolePermissions {
  value: number;
  scope?: Predicate;
  views?: Record<string, ViewPermissions>;
}

export interface PermissionsConfig {
  userTable: string;
  roleAccessor: string;
  roles: Record<string, RolePermissions>;
}

// #endregion

// #region ------------------------------------------------------------------------------- Functions

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function isPermissionsConfig(val: unknown): val is PermissionsConfig {
  if (!isRecord(val)) {
    return false;
  }
  return typeof val.userTable === 'string' && typeof val.roleAccessor === 'string' && isRecord(val.roles);
}

function isPredicateObject(val: unknown): val is PredicateObject {
  if (!isRecord(val)) {
    return false;
  }
  return typeof val.field === 'string' && typeof val.op === 'string' && 'value' in val;
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (isRecord(acc) ? acc[key] : undefined), obj);
}

function parseOp(op: string): CompareOp | null {
  switch (op) {
    case '==':
    case '!=':
    case '<':
    case '<=':
    case '>':
    case '>=':
      return op;
    default:
      return null;
  }
}

function compare(op: string, a: unknown, b: unknown): boolean {
  const cmp = parseOp(op);
  if (!cmp) {
    return true;
  }
  switch (cmp) {
    case '==': return a == b;
    case '!=': return a != b;
    case '<':
      return (typeof a === 'number' && typeof b === 'number') ||
        (typeof a === 'string' && typeof b === 'string')
        ? a < b
        : false;
    case '<=':
      return (typeof a === 'number' && typeof b === 'number') ||
        (typeof a === 'string' && typeof b === 'string')
        ? a <= b
        : false;
    case '>':
      return (typeof a === 'number' && typeof b === 'number') ||
        (typeof a === 'string' && typeof b === 'string')
        ? a > b
        : false;
    case '>=':
      return (typeof a === 'number' && typeof b === 'number') ||
        (typeof a === 'string' && typeof b === 'string')
        ? a >= b
        : false;
  }

  return true;
}

/**
 * Enforces permissions on the provided data based on the permissions configuration and view name.
 * @param permissions The permissions configuration object.
 * @param data The data to enforce permissions on.
 * @param viewName The name of the view for which permissions are enforced.
 * @returns The data filtered according to the permissions.
 */
export function enforcePermissions(data: ViewResultProps["data"], 
  viewName: string, permissions?: PermissionsConfig, fieldsCfg?: FieldsConfig) {

  if(!permissions) {
    return data;
  }

  const op = new URLSearchParams(window.location.search).get('op');
  const isBrowse = !op;
  const isDetail = op === 'detail';

  const viewData = ((): ViewResultProps["data"] => {

    if (!isPermissionsConfig(permissions)) {
      return data;
    }

    const users = data[permissions.userTable] ?? [];
    const userId = sessionStorage.getItem('__nf_user_id');
    const user = userId ? users.find(u => isRecord(u) && String(u?.id) === String(userId)) : users[0];

    if (!isRecord(user)) {
      return data;
    }

    const roleVal = user[permissions.roleAccessor];
    const role = Object.values(permissions.roles ?? {}).find((r) => r?.value === roleVal);
    const viewPerm = role?.views?.[viewName];
    const records = data[viewName];

    if (!role || !viewPerm) {
      return data;
    }

    const blocked = (isBrowse && viewPerm?.rules?.browse === false) || (isDetail && viewPerm?.rules?.detail === false);

    // Evaluate predicates
    const evalPredicate = (pred: Predicate, rec: unknown) => {
      if (!pred || pred === 'all') {
        return true;
      }
      if (typeof pred === 'string') {
        const [left, op, right] = pred.split(' ');
        if (!left || !op || !right) {
          return true;
        }
        const a = getByPath(rec, left);
        const b = right.startsWith('$user.') ? getByPath(user, right.slice(6)) :
          (/^-?\d+(?:\.\d+)?$/.test(right) ? Number(right) : right);
        return compare(op, a, b);
      }

      if (!isPredicateObject(pred)) {
        return true;
      }

      const raw = pred.value;
      const a = getByPath(rec, pred.field);
      const b = typeof raw === 'string' && raw.startsWith('$user.') ? getByPath(user, raw.slice(6)) : raw;
      return compare(pred.op, a, b);
    };

    const preds: Predicate[] = [];
    if (role.scope && role.scope !== 'all') {
      preds.push(role.scope);
    }

    // Field-level filters
    const fields = viewPerm?.fields ?? {};
    for (const [fieldName, cfg] of Object.entries(fields)) {
      if (typeof cfg === 'string') {
        preds.push(cfg);
      } else if (isRecord(cfg) && isRecord(cfg.filter) && typeof cfg.filter.op === 'string') {
        preds.push({
          field: fieldName,
          op: cfg.filter.op as CompareOp,
          value: cfg.filter.value as PredicateValue,
        });
      }
    }

    let nextData: ViewResultProps["data"] = data;

    // Row filtering only for browse/detail
    const canRowFilter = (isBrowse || isDetail) && Array.isArray(records);
    if (blocked && canRowFilter) {
      nextData = { ...nextData, [viewName]: [] };
    } else if (preds.length && canRowFilter) {
      nextData = { ...nextData, [viewName]: records.filter(r => preds.every(pr => evalPredicate(pr, r))) };
    }

    // Select options filtering for fields with { filter }
    const viewFields = fieldsCfg?.fields;
    if (!viewFields || !isRecord(viewFields)) {
      return nextData;
    }

    for (const [fieldName, fieldDef] of Object.entries(viewFields)) {
      if (!isRecord(fieldDef) || fieldDef.dataType !== 'select' || !isRecord(fieldDef.options)) {
        continue;
      }
      const rule = viewPerm?.fields?.[fieldName];
      if (!isRecord(rule) || !isRecord(rule.filter) || typeof rule.filter.op !== 'string') {
        continue;
      }
      const tableName = typeof fieldDef.options.table === 'string' ? fieldDef.options.table : null;
      if (!tableName) {
        continue;
      }
      const optRecords = nextData[tableName];
      if (!Array.isArray(optRecords)) {
        continue;
      }
      const valueAccessor = typeof fieldDef.options.valueAccessor === 'string' ? fieldDef.options.valueAccessor : 'value';
      const pred: PredicateObject = { field: valueAccessor, op: rule.filter.op, value: rule.filter.value as PredicateValue };
      nextData = { ...nextData, [tableName]: optRecords.filter(r => evalPredicate(pred, r)) };
    }

    return nextData;

  })();

  return viewData;
}

// #endregion
