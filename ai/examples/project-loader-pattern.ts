/**
 * Example: Project loader wiring pattern (app package).
 *
 * This is the architectural boundary:
 * - App package loads metadata and data (JSON files).
 * - Engine stays generic and only receives props/context.
 */

export {};

/*

packages/app-demo/src/main.tsx

  //
  // Ponto de entrada desta aplicação.
  //

  // #region --------------------------------------------------------------------------------- Imports

  import { BrowserRouter } from "react-router-dom";
  import { App, getRoot } from "@neofront/core";

  // Application configuration

  import appCfg from "project/app.json";
  import menuCfg from "project/menu.json";
  import loginCfg from "project/login.json";
  import viewsCfg from "project/views/views.json";

  import metadata from "project/views/metadataloader.js";
  import data from "project/views/dataloader.js";

  import "./styles/theme.css";
  import "./styles/app.css";

  // #endregion

  // #region ----------------------------------------------------------------------------- Entry point

  getRoot().render(
    <BrowserRouter>
      <App
        appCfg={appCfg}
        menuCfg={menuCfg}
        loginCfg={loginCfg}
        activeViews={viewsCfg.active}

        // Metadata shape:
        // { listView: Record<string, ListViewProps>, form: Record<string, FormDataConfig>, fieldConfig: Record<string, FieldsConfig> }
        metadata={metadata}

        // mockData type: ViewResultProps["data"] => Record<string, any[]>
        mockData={data}

        // Optional API wiring:
        // apiTableNames={["usuarios", "empresas", ...]}
        // dataEnhancer={(payload) => payload}
      />
    </BrowserRouter>
  );

  // #endregion

TODO: Keep app-specific transformations (like SSAA's enhanceData) inside the app
package, and pass them via `dataEnhancer`.

*/
