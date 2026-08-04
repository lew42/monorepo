// The whole of an app.js.
//
// Bring in the framework, re-export it so every page.js can say
// `import { Page, p } from "/app.js"`, and start it. Nothing else is required.
//
// This file is a specimen: it is real, it would run, and nothing imports it —
// it exists so /start/files/ can show you bytes instead of a retyped copy.

import { App } from "/framework/core/new/1/App.js";

export * from "/framework/core/new/1/App.js";

export default window.app = new App();
