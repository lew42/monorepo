import { Page, md, code } from "/app.js";
import day from "/framework/ai/2026-08-13/page.js";

export default new Page({
	meta: import.meta,
	title: "Task previews",
	description: "Cards that say where a task is, at every tier — and the bridge that lets a task's own page.js draw its own row.",
	icon: "dashboard",

	content(){
		md("**Three tiers, one mechanism.** A task's `page.js` may override `preview(nav)`, and the [day dashboard](/framework/ai/2026-08-13/)'s `card()` bridge draws THAT instead of the manifest row. This task's first cut demoed the bridge on itself with a checklist card — retired the same day: an unexplained checklist sitting in a list of uniform manifest rows read as noise, not status. The mechanism stays for a task that made something genuinely **viewable** — a live thumb, not a restyled status line:");

		code.js(`preview(nav){
    return this.preview_card(nav, () => div.c("zoom-25", () => this.layout()));
}`);

		md("[`ext/AITask/dashboard.js`](/framework/ext/AITask/)'s `card(t)` calls the override whenever a declared child's `preview` isn't the inherited `Page.prototype.preview` — the whole bridge is one ternary:");

		code.js(`const card = t => t.child?.preview && t.child.preview !== Page.prototype.preview
    ? t.child.preview(t.nav)
    : manifest_card(t);`);

		md("The same override, one tier up, turns a **day**'s own tile on [`/framework/ai/`](/framework/ai/) from a bare title into a live glance — [`Page.preview_card()`](/framework/core/Page/)'s `thumb` argument already existed for exactly this, and it's INERT (no link of its own), because the label below it is the card's real link. This IS that tile — `day.preview(day.nav())`, called from here, live:");

		day.preview(day.nav());

		code.js(`preview(nav){ return this.preview_card(nav, () => glance(this)); }`);

		md("That's `framework/ai/2026-08-13/page.js`, verbatim — `glance(day)` above is the exact same function, called on the real day page, live. Four tiers, one question each answers for itself: the **ai index** asks a day, a **day** asks each task (via `dashboard.js`'s `card()`), a **task** answers however it wants — nothing at all, for most. A fourth (**sub**) tier — `date/task/sub/page.js` — needs no new mechanism: its parent task would call `dashboard()`/`card()` on itself exactly as a day does, the moment it has sub-dirs worth summarizing.");

		md("Design notes, open questions, and the field-by-field answer to *\"what does the card need vs. what should page UI own\"* are in `notes.md`, beside this file.");
	},
});
