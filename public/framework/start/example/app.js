import App from "/framework/core/App/App.js";

window.app = new App();

// Why every page imports from here instead of from the framework: one place to
// add an ext, and the browser hands out the same module instance to all of them.
export * from "/framework/core/App/App.js";
