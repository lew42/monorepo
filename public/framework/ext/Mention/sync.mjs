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
//      renders, so pass 2 loads each page in a real headless Chromium (Server/browser.mjs,
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

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { browser, close } from "../../../../Server/browser.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo_public = resolve(here, "..", "..", "..");   // public/framework/ext/Mention -> public
const refs_path = resolve(here, "maps", "refs.js");
// Default to the real site — a worktree's own <slug>.localhost host stops existing the
// moment that branch merges, so a script whose default only works mid-task would silently
// find nothing ever after (review finding 1, 2026-10-02). Pass a worktree host explicitly
// (`node sync.mjs http://framework-home.localhost`) while this branch is still alive.
const base_url = process.argv[2] || "http://monorepo.localhost";

const source = readFileSync(refs_path, "utf8");

// One entry per line: `  Name: { url: "/framework/...", icon: "word" },`, optionally
// already carrying `, class_card: true` from a previous run of this same script. Captured
// as `head` (everything up to the opening brace, including the name) and `tail` (the
// closing comma/whitespace) so the line can be fully rebuilt without disturbing anything
// else in the file — comments, ordering and spacing on every OTHER line are untouched.
const ENTRY = /^(?<head>\s*(?:"[^"]+"|[\w.-]+):\s*\{)\s*url:\s*"(?<url>[^"]+)",\s*icon:\s*"(?<icon>[^"]+)"(?:,\s*class_card:\s*(?:true|false))?\s*\}(?<tail>,?\s*)$/gm;

const CONCEPT_ONLY = new Set(["CLAUDE.md", "skills", "MCP", "dev-server"]);

function entry_name(head){
	return head.match(/("[^"]+"|[\w.-]+):\s*\{$/)[1].replace(/^"|"$/g, "");
}

// ---- pass 1: icon, from each page.js's own text ----------------------------------
function sync_icon(url, current_icon){
	const page_path = resolve(repo_public, "." + url, "page.js");
	if (!existsSync(page_path)) return { icon: current_icon, status: "no-page" };

	const page_source = readFileSync(page_path, "utf8");
	// Exactly one leading tab: every page.js in this codebase writes its config's
	// top-level properties (title, description, icon, …) at that one indent, as
	// `new Page({ ... })`'s direct properties. A naive "first icon: in the file" instead
	// caught core/Sidebar/page.js's own DEMO data once (a sample array shown as a code
	// example, nested two tabs deep) and nearly overwrote "view_sidebar" with "flag" —
	// caught by hand-checking this script's first run before trusting it.
	const m = /^\ticon:\s*"([^"]+)"/m.exec(page_source);
	if (!m) return { icon: current_icon, status: "no-match" };
	return { icon: m[1], status: m[1] === current_icon ? "same" : "changed" };
}

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
	if (!existsSync(resolve(repo_public, "." + m.groups.url, "page.js"))) continue;
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

	const { icon, status } = sync_icon(url, current_icon);
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
