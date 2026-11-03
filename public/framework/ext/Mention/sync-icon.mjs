// sync-icon.mjs — the one place an `icon` is computed from, for `maps/refs.js`'s
// page-backed entries. Shared by two callers (Law 6: compute it once, not twice):
//   - `sync.mjs`, the human-run script (also does the expensive `class_card` browser pass).
//   - `Server/plugins/MentionSync.js`, the dev server's own watcher (2026-10-03) — it calls
//     ONLY this, on every real change to a watched `page.js`/`page.jsonl`, so `refs.js`'s
//     icon never needs a human to remember to re-run anything for the cold-cache case
//     (`Mention.js`'s `live()` already covers the hot one — see doc/syntax.md).
//
// Deliberately text-only, no headless browser, no import of the target file (page.js files
// import "/app.js", a browser-only path Node can't resolve) — this is the CHEAP half of what
// sync.mjs always did (its own doc comment calls it "pass 1"). `class_card` stays the
// expensive half, still only ever computed by a human running sync.mjs, because it needs a
// real page load and `live()` already answers it for any page already visited this session.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_PUBLIC = resolve(here, "..", "..", "..");   // ext/Mention -> ext -> framework -> public
export const REFS_PATH = resolve(here, "maps", "refs.js");

// One entry per line: `  Name: { url: "/framework/...", icon: "word" },`, optionally already
// carrying `, class_card: true`. Captured as `head` (through the opening brace) and `tail`
// (closing comma/whitespace) so a line can be rebuilt without disturbing any other line —
// comments, ordering and spacing elsewhere in the file are untouched.
export const ENTRY = /^(?<head>\s*(?:"[^"]+"|[\w.-]+):\s*\{)\s*url:\s*"(?<url>[^"]+)",\s*icon:\s*"(?<icon>[^"]+)"(?:,\s*class_card:\s*(?:true|false))?\s*\}(?<tail>,?\s*)$/gm;

// Borrow another page's url just to have somewhere to click (refs.js's own header comment) —
// their icon describes their own concept, never whatever page they land on, so neither pass
// ever touches them.
export const CONCEPT_ONLY = new Set(["CLAUDE.md", "skills", "MCP", "dev-server"]);

export function entry_name(head){
	return head.match(/("[^"]+"|[\w.-]+):\s*\{$/)[1].replace(/^"|"$/g, "");
}

// A classic page: read its own page.js TEXT for the one-tab-indented `icon: "…"` literal —
// every page.js in this codebase writes its config's top-level properties at that one indent,
// as `new Page({ ... })`'s direct properties. (A naive "first icon: in the file" instead once
// caught core/Sidebar/page.js's own DEMO data, nested two tabs deep, and nearly overwrote
// "view_sidebar" with "flag" — caught by hand-checking sync.mjs's first run before trusting it.)
function icon_from_page_js(page_path){
	if (!existsSync(page_path)) return null;
	const m = /^\ticon:\s*"([^"]+)"/m.exec(readFileSync(page_path, "utf8"));
	return m ? m[1] : null;
}

// A page.jsonl page ("page.jsonl pages included" — the owner, 2026-10-03) has no icon of its
// own: its identity is its first (`assign`) line, not a page.js. That line's `class` names the
// page TEMPLATE it actually renders through (e.g. "/framework/ai/cards/card.js", an AITask card) —
// borrow THAT page's own icon, the same way a concept-only entry borrows a url: one real
// `icon:` literal, never a second guess at it. No current refs.js entry is backed by a
// page.jsonl page, but a future one works through this exact same code path, not a new one.
function icon_from_jsonl(jsonl_path){
	if (!existsSync(jsonl_path)) return null;
	const first_line = readFileSync(jsonl_path, "utf8").split("\n", 1)[0];
	if (!first_line?.trim()) return null;
	let parsed;
	try { parsed = JSON.parse(first_line); } catch { return null; }
	const cls = parsed.assign?.class ?? parsed.class;
	return cls ? icon_from_page_js(resolve(REPO_PUBLIC, "." + cls)) : null;
}

/** The icon `refs.js`'s entry for `url` should have right now, read from the real page
 * (page.js text, or — "page.jsonl pages included" — its page.jsonl's own template page).
 * `status` is "same" | "changed" | "no-page" (nothing on disk answers for this url: the
 * entry is left exactly as it was, same as `sync.mjs` always did). */
export function resolve_icon(url, current_icon){
	const dir = resolve(REPO_PUBLIC, "." + url);
	const icon = icon_from_page_js(resolve(dir, "page.js")) ?? icon_from_jsonl(resolve(dir, "page.jsonl"));
	if (icon == null) return { icon: current_icon, status: "no-page" };
	return { icon, status: icon === current_icon ? "same" : "changed" };
}

/** Every `url` this computation can even answer for right now — a page.js or a page.jsonl on
 * disk at that path. Callers use this to decide whether a changed file is worth reacting to. */
export function has_source(url){
	const dir = resolve(REPO_PUBLIC, "." + url);
	return existsSync(resolve(dir, "page.js")) || existsSync(resolve(dir, "page.jsonl"));
}
