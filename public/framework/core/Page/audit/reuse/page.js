import { Page, md, h2 } from "/app.js";

/* Why the system gets broken, and how reuse becomes the default (page-audit, 2026-09-30).
   The owner: "Those kinds of things should never happen. Once we have a system, we don't want
   to deviate from our system. We want to lean into our system and reuse it." Skill edits go to
   the system architect (mastermind-servex); this page is the proposal and its status. */

export default new Page({
	meta: import.meta,
	title: "Why pages drift, and how reuse becomes the default",
	label: "Why pages drift",
	icon: "recycling",
	description: "A page drifts when nothing hands it an existing layout at the moment it is made. Four changes fix that.",

	content(){
		md(`**A new page drifts from the system when nothing hands it an existing layout at the moment it is made.** The markup mostly reuses well: only three pages hand-build their own tab strip or wall, and all three say why. The drift is in how pages *look*, and nothing checks that.`);

		h2("What the audit found");
		md(`1. **No single list to pick from.** The \`page\` skill points to a list of seven page types (\`ai/audits/paging/types.json\`, counted by grep). [Layout](../../layout/) points to ten more indexes. Its step "a layout word from the table above" names a table that isn't there.
2. **Making a page doesn't start from a layout.** \`create_page\` takes an optional \`layout\` as free text. Nothing checks it against the layouts in use, and it doesn't default to the parent's.
3. **A shared layout can break in CSS.** AI 2 used the shared tabs, but one local \`order\` rule met a shared filler with none, and the tabs went flush right. No check compares a rendered page with its layout.
4. **The default is a catch-all.** 200 pages are the Standard page, many without choosing it.
5. **Weight isn't used yet.** Only 8 pages have weight lines, so priority here comes from links in.`);

		h2("Four changes");
		md(`| # | Change | Who | Status |
|---|---|---|---|
| 1 | **One list.** The \`page\` skill says: pick the layout from [this audit](../), most-used first, with its opt-in call. A child starts from its parent's layout. A new layout, or a hand-built tab strip, sidebar or shell, is a proposal first. | the architect (skills) | sent |
| 2 | **\`create_page\` picks from the list.** \`layout\` becomes one of the audited ids (doc, columns, wall, catalog, browse, switcher, floating, standard), defaults to the parent's, and writes the opt-in call. | Servex (tool) | sent |
| 3 | **The check that catches drift.** \`layout-check --bands\` measures tab rows, stacked padding and wraps at 400 to 3440. It also names the layout a page renders as, so a landing that renders "custom" is flagged. | page mastermind | see the [design pass](../design/) |
| 4 | **The audit stays true.** The crawl and the classifier re-run, and this page's data is rewritten, never edited by hand. | page mastermind | built: \`ai/2026-09-30/page-audit/classify.mjs\` |`);
	},
});
