import { section, outline } from "/framework/ux/Content/structure/Structure.js";

/**
 * THE ORGANIZATION CARD'S BODY — placed into the card via a `{"place": "organization.js"}`
 * line (core's own `place()`, `Page/Log.js`), the documented route for structured content
 * inside a card: no second vocabulary, just `section`/`outline` from
 * `/framework/ux/Content/structure/`. Every item is a real link (`href`), never a sub-card —
 * the owner's own words: "all the things on that card might actually navigate away."
 *
 * `section()` already sorts its items heaviest first, so `weight` here IS the priority order
 * the owner asked for (ask 4: quick fixes that carry a lot of weight come first).
 */

/* ── Tier 1: the Page class + paging system, top of the card (owner update,
   2026-09-28 13:3x: "this is now the PAGE mastermind"). Each facet of the
   docs audit points at /framework/core/Page/ or the paging audit — no page
   for the audit itself exists yet, so that is the real page to land on. */
const MOST_IMPORTANT = [
	{ name: "Page docs: simplest example first, per kind", icon: "menu_book", weight: 3, href: "/framework/core/Page/" },
	{ name: "Every way to make a page: page.js, page.jsonl, index pages", icon: "construction", weight: 3, href: "/framework/core/Page/" },
	{ name: "Layout vocabulary: standard / wide / fill, top-down", icon: "space_dashboard", weight: 3, href: "/framework/core/Page/" },
	{ name: "Paging audit (the live reference)", icon: "route", weight: 3, href: "/framework/ai/audits/paging/" },
	{ name: "Rethink the top tabs + left nav", icon: "tab", weight: 2, href: "/framework/core/Page/" },
	{ name: "Mine /imagine/ for past layout work", icon: "travel_explore", weight: 2, href: "/framework/ai/audits/paging/" },
	{ name: "Page audit", icon: "fact_check", weight: 2, href: "/framework/ai/2026-09-25/page-audit/" },
	{ name: "Layout-check tool", icon: "photo_size_select_large", weight: 2, href: "/framework/ai/2026-09-25/layout-check/" },
	{ name: "Page system tools", icon: "build", weight: 1, href: "/framework/ai/2026-09-25/page-system/" },
	{ name: "Loose-ends: paging tuning", icon: "tune", weight: 1, href: "/framework/ai/2026-09-24/loose-ends/report.md" },
];

/* ── Tier 2: secondary — groups of related open work (ask 2) ───────────────── */
const SECONDARY = [
	{ name: "Feedback council fixes", icon: "bolt", weight: 3, href: "/framework/ai/todo.md" },
	{ name: "Hide every process window", icon: "bolt", weight: 3, href: "/framework/ai/todo.md" },
	{ name: "Feedback council", icon: "groups", weight: 2, href: "/framework/ai/2026-09-25/feedback-council/" },
	{ name: "CSS audit", icon: "css", weight: 2, href: "/framework/ai/2026-09-25/css-audit/" },
	{ name: "Layout system check", icon: "space_dashboard", weight: 2, href: "/framework/ai/todo.md" },
	{ name: "Reuse audit", icon: "recycling", weight: 2, href: "/framework/ai/2026-09-22/reuse-audit/" },
	{ name: "Fresh-eyes review", icon: "visibility", weight: 2, href: "/framework/ai/2026-09-28/fresh-eyes-review/" },
	{ name: "Task-mastermind messaging (Servex)", icon: "forum", weight: 1, href: "/framework/ai/todo.md" },
];

/* ── Tier 3: one-offs — don't group well ────────────────────────────────────── */
const ONE_OFFS = [
	{ name: "Nightly crawl", icon: "nights_stay", weight: 3, href: "/framework/ai/todo.md" },
	{ name: "AI 2 row vanish", icon: "bug_report", weight: 2, href: "/framework/ai/2026-09-28/ai2-row-vanish/requirements.md" },
	{ name: "To do list", icon: "checklist", weight: 2, href: "/framework/ai/todo.md" },
	{ name: "Fresh-eyes review proofs", icon: "science", weight: 1, href: "/framework/ai/2026-09-28/fresh-eyes-review/proof/" },
	{ name: "Naming checks", icon: "badge", weight: 1, href: "/framework/ai/2026-09-22/naming-checks/" },
];

/* ── Earlier audits — every one from the scan, one icon item each (ask 3) ──── */
const AUDITS = [
	{ name: "Loose-ends sweep", href: "/framework/ai/2026-09-24/loose-ends/" },
	{ name: "Task audit (09-17 to 09-24)", href: "/framework/ai/2026-09-24/task-audit/" },
	{ name: "Review of three days", href: "/framework/ai/2026-09-22/review-3-days/" },
	{ name: "CSS audit", href: "/framework/ai/2026-09-25/css-audit/" },
	{ name: "Feedback council", href: "/framework/ai/2026-09-25/feedback-council/" },
	{ name: "Naming checks", href: "/framework/ai/2026-09-22/naming-checks/" },
	{ name: "Reuse audit", href: "/framework/ai/2026-09-22/reuse-audit/" },
	{ name: "Fresh-eyes review", href: "/framework/ai/2026-09-28/fresh-eyes-review/" },
	{ name: "Paging audit", href: "/framework/ai/audits/paging/" },
	{ name: "Page audit", href: "/framework/ai/2026-09-25/page-audit/" },
	{ name: "Layout-check tool", href: "/framework/ai/2026-09-25/layout-check/" },
	{ name: "Page system tools", href: "/framework/ai/2026-09-25/page-system/" },
	{ name: "To do list", href: "/framework/ai/todo.md" },
	{ name: "Open tasks card", href: "/framework/ai2/2026/09/25/open-tasks-where-each-one-is-and-what-ne/" },
].map(a => ({ ...a, icon: "fact_check", weight: 2 }));

/** Called by `Page/Log.js`'s `draw_module()` as `fn(page, box, data)` — the box is already
 *  the current captor, so `section()`/`outline()` (both `div.c(...)`) append straight into it. */
export default function organization(){
	section({ title: "Most important — the Page class + paging", items: MOST_IMPORTANT, bg: true });
	section({ title: "Secondary", items: SECONDARY, bg: true });
	section({ title: "One-offs", items: ONE_OFFS, bg: true });
	section({ title: "Earlier audits", items: AUDITS, bg: true });
}
