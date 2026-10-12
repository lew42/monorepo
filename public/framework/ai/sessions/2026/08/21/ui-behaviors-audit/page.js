import { Page, md, ui } from "/app.js";

/* Exec summary for the ui/ux split question — task.jsonl has the method and the
   log; this page is the verdict. 21 dirs under ui/, 21 rows below (one of them,
   `doc/`, is the module's own docs dir, not a component — marked n/a). */
export default new Page({
	meta: import.meta,
	title: "UI behaviors audit",
	description: "1 behavioral / 20 components — ui/ is already almost entirely templates; tree is the one that should split.",
	icon: "fact_check",

	content(){

		md("**1 behavioral / 20 components** (21 dirs scanned under `ui/`, 21 rows below — `doc/` is the module's own docs dir, not a component, and scores n/a). The owner's target — `ui/*` as templates, behavior graduates to a `ux` class — is **already the case almost everywhere**: nine components (`accordion` `alert` `avatar` `badge` `crumbs` `dialog` `menu` `panel` `tooltip`) get their interactivity for free from native HTML (`<details>`, `<dialog>`, `:hover`/`:focus-visible`) and carry zero JS logic; three exported functions (`table`, `keys`, `timeline`) loop and return markup with no closure state and no listeners. `tree` is the sole outlier — a closure holding row state and selection, with click listeners and an `update()`/`select()` lifecycle — and its own readme already lists the next asks (keyboard roving, drag-reorder) as extensions, which is exactly the shape a `ux` class buys.");

		ui.table(
			["module", "own .js beyond page.js?", "verdict", "the behavior", "recommendation"],
			[
				["accordion", "yes (CSS only)", "template", "none — native `<details>` disclosure", "stay ui"],
				["alert", "yes (CSS only)", "template", "none — static border + icon tint", "stay ui"],
				["avatar", "yes (CSS only)", "template", "none — static circle/ring", "stay ui"],
				["badge", "yes (CSS only)", "template", "none — static tone classes", "stay ui"],
				["card", "no", "template", "none — surface + pad", "stay ui"],
				["crumbs", "yes (CSS only)", "template", "none — link underline reset", "stay ui"],
				["dialog", "yes (CSS only)", "template", "none — native `<dialog>` owns open/close/focus-trap", "stay ui"],
				["doc", "—", "n/a", "not a component — the module's own docs dir", "n/a"],
				["field", "no", "template", "none — label + input + note", "stay ui"],
				["kbd", "yes (`keys()` fn)", "template", "loop interleaving a `+` separator, zero state", "stay ui"],
				["menu", "yes (CSS only)", "template", "none — native `<details>`; the close-on-click line lives only in the copy-paste demo, not the component", "stay ui"],
				["pagination", "no", "template", "none — buttons; caller owns the current page + handler", "stay ui"],
				["panel", "yes (CSS only)", "template", "none — two hairlines + a shadow", "stay ui"],
				["progress", "no", "template", "none — a styled bar", "stay ui"],
				["stats", "no", "template", "none — static number tiles", "stay ui"],
				["table", "yes (`table()` fn)", "template", "nested loop building thead/tbody, zero state", "stay ui"],
				["tags", "no", "template", "none — the `×` has no listener, the input no handler; deliberately inert", "stay ui"],
				["timeline", "yes (`timeline()` fn)", "template", "loop building dated rows, zero state", "stay ui"],
				["toolbar", "no", "template", "none — a flex row of buttons/title", "stay ui"],
				["tooltip", "yes (CSS only)", "template", "none — `:hover`/`:focus-visible`/`.shown` reveal", "stay ui"],
				["tree", "yes (`tree()` fn)", "behavioral", "click toggles expand/collapse + row selection, held in closure state across `update()`/`select()`", "split — `.ui-tree-*` CSS stays in ui/, the stateful closure becomes a `ux/Tree` class"],
			]
		);

		md("**Three pattern-level findings.**");

		md("1. **`tree` is the outlier, and it's already shaped like a would-be class** — instance state (`rows` Map, `selected_row`), listeners, a mutable `update()`/`select()` lifecycle — just written as a closure instead of a class, so it can't be subclassed. Its own readme's \"Left\" section (no keyboard roving, no drag-reorder) is two ready-made `ux/Tree` extensions once it's a class.");

		md("2. **The other 20 already hit the target by construction, not restraint.** The nine CSS-only components lean on native disclosure/hover/dialog semantics for anything that looks interactive; the three loop-based functions (`table`, `keys`, `timeline`) are markup generators with `component()` wrapping them only for the `.c()` ergonomic form, never for behavior.");

		md("3. **The framework has already tried and un-shipped stateful `ui/` components at least three times** — `doc/decisions.md`'s own refrain is \"there is no `ui.pagination()`/`ui.dialog()`/`ui.menu()`/`ui.tags()`/`ui.field()`.\" Each one's one line of real logic (menu's close-on-pick, pagination's current-page state, tags' `×` handler) was deliberately left out of the component and shown only inline, in the copy-paste demo, because a caller's case was always half a step off. That's the `ui`/`ux` boundary the owner is naming now, arrived at independently three separate times.");

		md("Method and log: [`task.jsonl`](/framework/ai/2026-08-21/ui-behaviors-audit/) · [`requirements.md`](/framework/ai/2026-08-21/ui-behaviors-audit/requirements.md). Source: [`ui/doc/decisions.md`](/framework/ui/doc/decisions.md) — the 2026-08-17 per-component ladder this audit re-verified against the current `.js` files and re-scored after `tree` was added.");
	},
});
