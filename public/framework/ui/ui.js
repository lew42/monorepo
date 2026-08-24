import { table } from "./table/table.js";
import { timeline } from "./timeline/timeline.js";
import { keys } from "./kbd/kbd.js";

/* The css-only components: no export, a `<style>` tag, and a page that hands you
 * the markup with a copy button. Imported here so the classes exist site-wide.
 * ⚠ `tree` GRADUATED 2026-08-21 — the class is `/framework/ux/Tree/`, and new code
 * takes that. `tree.js` stays in this list for the `.ui-tree-*` stylesheet, which
 * is the template's and never moved; `tree()` itself retired the same day. */
import "./tree/tree.js";
import "./crumbs/crumbs.js";
import "./badge/badge.js";
import "./alert/alert.js";
import "./panel/panel.js";
import "./tooltip/tooltip.js";
import "./avatar/avatar.js";
import "./dialog/dialog.js";
import "./menu/menu.js";
import "./accordion/accordion.js";
import "./words/words.js";   // the config words — not a component; the same trap applies

// Three functions, because three of the twenty carry a loop. The rest are
// copy-paste templates and deliberately have nothing to import — readme.md.
export const ui = { table, timeline, keys };

export { table, timeline, keys };

export { css, component } from "./parts.js";

export default ui;
