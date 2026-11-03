// sync.mjs — keep maps/refs.js's `icon` and `class_card` in step with the real pages
// they point to, instead of a human re-typing them by hand (CLAUDE.md law 7: compute,
// don't recall).
//
// WHAT THIS FIXES (doc/syntax.md has the longer version):
//   - `icon` used to be a hand-typed guess at each page's own `icon:` property, with
//     nothing to notice when the two drifted apart.
//   - `class_card` is new: whether `#Name` should render with the same dark, always-dark
//     "this is a CLASS" look the module index pages use (deliverable 3, 2026-10-02) — and
//     that fact already exists, computed once per page at runtime by `ext/Doc`'s own
//     `nav().class_card` (`Doc.is_class(this.subject)`). This script reads that SAME
//     computed answer instead of re-guessing it from source text, by actually loading
//     each page headless and asking it.
//
// TWO PASSES, for two different reasons:
//   1. ICON — read each target `page.js`'s own TEXT (never imported/executed: these files
//      import "/app.js", a browser-only path Node can't resolve) and pull its one-tab-
//      indented `icon: "…"` literal, the page's own top-level config property.
//   2. CLASS_CARD — text alone can't answer "is the Doc's `subject` really a class" without
//      chasing every import by hand (and getting it wrong the way pass 1 almost did for
//      Sidebar's demo data). The page already computes this correctly every time it
//      renders, so pass 2 loads each page in a real headless Chromium (Server/Browser.mjs,
//      the one way this repo ever starts a browser) and reads `app.router.active.nav()
//      .class_card` straight off the live Page instance — no heuristic, the real answer.
//
// Run it: `node public/framework/ext/Mention/sync.mjs [base-url]` — base-url defaults to
// http://framework-home.localhost (this task's worktree server); pass the real site's own
// url when running this against a different server. Prints every change, writes refs.js
// only if something changed.
//
// NOT covered, on purpose: the four one-off links (CLAUDE.md, skills, MCP, dev-server)
// borrow another page's url just to have somewhere to click (refs.js's own comment says
// which page and why) — their icon and class_card describe THEIR OWN concept, not
// whatever page they happen to land on, so both passes skip them. `maps/people.js` is
// left alone too: those are agent ROLES, not pages, and several share one url on purpose.

import { readFileSync, writeFileSync } from "node:fs";
import { browser, close } from "../../../../Server/Browser.mjs";
import { REFS_PATH as refs_path, ENTRY, CONCEPT_ONLY, entry_name, resolve_icon, has_source } from "./sync-icon.mjs";

// Default to the real site — a worktree's own <slug>.localhost host stops existing the
// moment that branch merges, so a script whose default only works mid-task would silently
// find nothing ever after (review finding 1, 2026-10-02). Pass a worktree host explicitly
// (`node sync.mjs http://framework-home.localhost`) while this branch is still alive.
const base_url = process.argv[2] || "http://monorepo.localhost";

const source = readFileSync(refs_path, "utf8");

// Pass 1 (icon, cheap — every url's own page.js/page.jsonl text) now lives in sync-icon.mjs,
// shared with the dev server's own auto-sync watcher (Server/plugins/MentionSync.js,
// 2026-10-03) so the computation is written once, not twice (Law 6). This script still does
// pass 1 itself (via `resolve_icon`, below) AND the expensive pass 2 the watcher can't afford
// to do on every keystroke — class_card, next.

// ---- pass 2: class_card, from the live, already-computed answer ------------------
async function class_cards_for(urls){
	const b = await browser();
	const page = await (await b.newContext()).newPage();
	const result = new Map();

	for (const url of urls){
		try {
			await page.goto(new URL(url, base_url).href, { waitUntil: "networkidle" });
			const value = await page.evaluate(() => window.app?.router?.active?.nav?.().class_card ?? false);
			result.set(url, !!value);
		} catch (e) {
			console.error(`  ! ${url} — could not load (${e.message.split("\n")[0]}), class_card left unchanged`);
		}
	}

	await page.close();
	return result;
}

// ---- gather every page-backed, non-concept entry, run both passes, rewrite the file --
const names = [], urls = new Set();
for (const m of source.matchAll(ENTRY)){
	const name = entry_name(m.groups.head);
	if (CONCEPT_ONLY.has(name)) continue;
	if (!has_source(m.groups.url)) continue;
	names.push(name);
	urls.add(m.groups.url);
}

const class_card_of = await class_cards_for([...urls]);
await close();

let changed_icon = 0, changed_class = 0, no_page = 0, concept = 0;
const report = [];

const next = source.replace(ENTRY, (line, ...args) => {
	const groups = args.at(-1);
	const { head, url, icon: current_icon, tail } = groups;
	const name = entry_name(head);

	if (CONCEPT_ONLY.has(name)){ concept++; return line; }

	const { icon, status } = resolve_icon(url, current_icon);
	if (status === "no-page"){ no_page++; return line; }
	if (status === "changed"){ changed_icon++; report.push(`  ~ icon  ${url} — "${current_icon}" -> "${icon}"`); }

	const was_class = /class_card:\s*true/.test(line);
	const is_class = class_card_of.get(url) ?? was_class;
	if (is_class !== was_class) { changed_class++; report.push(`  ~ class ${url} — ${was_class} -> ${is_class}`); }

	return `${head} url: "${url}", icon: "${icon}"${is_class ? ", class_card: true" : ""} }${tail}`;
});

console.log(`sync: ${names.length} page-backed entries checked (${no_page} with no page.js, ${concept} concept-only, left alone)`);
console.log(`  icons changed: ${changed_icon} · class_card changed: ${changed_class}`);
report.forEach(line => console.log(line));

if (changed_icon || changed_class) writeFileSync(refs_path, next, "utf8");
else console.log("refs.js already matches every page's own icon and class_card — nothing written.");
