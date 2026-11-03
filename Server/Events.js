// Server/Events.js is now a thin shim over core/Plugin (the one events + plugins class): same default and named export,
// same constructor order (assign, "new", instantiate). Instance on/off/emit now come from core/Events and chain.
// The class-level "new" event now also reaches a parent's listeners (it used to reach only the exact class).
import { Plugin } from "../public/framework/core/Plugin/Plugin.js";

export default class Events extends Plugin {}

export { Events }
