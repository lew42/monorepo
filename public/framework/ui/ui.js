import { table } from "./table/table.js";
import { timeline } from "./timeline/timeline.js";
import { keys } from "./kbd/kbd.js";

/* The css-only components: no export, a `<style>` tag, and a page that hands you
 * the markup with a copy button. Imported here so the classes exist site-wide. */
import "./crumbs/crumbs.js";
import "./badge/badge.js";
import "./alert/alert.js";
import "./panel/panel.js";
import "./tooltip/tooltip.js";
import "./avatar/avatar.js";
import "./dialog/dialog.js";
import "./menu/menu.js";
import "./accordion/accordion.js";

// Three functions, because three of the nineteen carry a loop. The rest are
// copy-paste templates and deliberately have nothing to import — readme.md.
export const ui = { table, timeline, keys };

export { table, timeline, keys };

export { css, component, palette, copy } from "./parts.js";

export default ui;
