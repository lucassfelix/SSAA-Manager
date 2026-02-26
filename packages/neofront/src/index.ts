//
// NeoFront library exports
//

// #region --------------------------------------------------------------------------------- Exports

export { default as App } from "./components/app/App";
export { getRoot, createViewLoader, createDataLoader } from "./components/app/mainUtils";
export { createAccessResolver, allRules, noRules, filterRows } from "./components/app/accessCapabilities";
export type { AccessCapabilities, AccessResolver, AccessResolverResult, AccessResolverConfig, RoleResolver, PrincipalContext, ViewCapabilities, ViewRules, FieldCapability, Row, DataPayload } from "./components/app/accessCapabilities";
export * from "./contexts";

// #endregion
