import templates from "./templates.js";
import { TOOLS } from "./tools.js";
import { SPLIT } from "./split.js";
import { TEXT } from "./text.js";
import { INSERT } from "./insert.js";
import { REPEAT } from "./repeat.js";
import { DISPLAY } from "./display.js";

/* What a document was OPENED with. `workspace({ templates, tools })` writes both onto the
   ROOT panel, so every leaf reads the one its own document carries and a second workspace
   on the page is unaffected. Resolved on every read rather than held anywhere.
   Imports flow one way: this file reads each surface's defaults, and none reads it back. */

export const vocab = item => item.root().templates ?? templates;

// The site's own T vocabulary rather than a caller's — what the two offers below test.
export const standard = item => vocab(item) === templates;

/* ⚠ A workspace holding regions rather than content is not offered `random`, which would
   give an editor two canvases. */
export const offer = item => standard(item) ? ["random", ...Object.keys(templates)] : Object.keys(vocab(item));

/* Same idiom, one key per surface: a workspace naming one flag still gets the module
   defaults for the rest. Every surface is gated from HERE, at its one call site, rather
   than reading its own module global — the global stays only as this resolver's default. */
const DEFAULTS = { align: TOOLS.align, zoom: TOOLS.zoom, inspect: TOOLS.inspect, edges: SPLIT.edges, insert: INSERT.on, text: TEXT.on, display: DISPLAY.on, repeat: REPEAT.on };

export const tools = item => ({ ...DEFAULTS, ...item.root().tools });
