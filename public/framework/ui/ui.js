import { table } from "./table/table.js";
import { crumbs } from "./crumbs/crumbs.js";
import { pagination } from "./pagination/pagination.js";
import { card } from "./card/card.js";
import { stats } from "./stats/stats.js";
import { badge } from "./badge/badge.js";
import { alert } from "./alert/alert.js";
import { tags } from "./tags/tags.js";
import { panel } from "./panel/panel.js";
import { tooltip } from "./tooltip/tooltip.js";
import { avatar, avatars } from "./avatar/avatar.js";
import { dialog } from "./dialog/dialog.js";
import { menu } from "./menu/menu.js";
import { accordion } from "./accordion/accordion.js";
import { timeline } from "./timeline/timeline.js";
import { key, keys, shortcut } from "./kbd/kbd.js";

/* One namespace, so a page writes `ui.card()` and has all of them. `field`,
 * `toolbar` and `progress` are documented as copy-paste templates and are
 * deliberately absent — readme.md. */
export const ui = {
	table, crumbs, pagination, card, stats, badge, alert, tags, panel, tooltip,
	avatar, avatars, dialog, menu, accordion, timeline, key, keys, shortcut,
};

export {
	table, crumbs, pagination, card, stats, badge, alert, tags, panel, tooltip,
	avatar, avatars, dialog, menu, accordion, timeline, key, keys, shortcut,
};

export { css, component, palette, copy } from "./parts.js";

export default ui;
