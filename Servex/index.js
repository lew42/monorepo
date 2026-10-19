import Servex from "./Servex.js";

/* `node Servex/index.js` from the repo root. Everything is a field with a
 * default — `new Servex({ proxy_port: 80, root: "D:/work" })` is the whole
 * configuration story. Servex/readme.md is one screen and says the rest. */
await Servex.only_one();   // a second Servex on this port refuses here, before it touches the shared registry
export default new Servex();
