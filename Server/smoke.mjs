/* `node Server/smoke.mjs <worktree dir> [paths...] [--port N | --base URL] [--main <repo>]`
 * A smoke test: does the site still load, and do its links go anywhere? It opens
 * /framework/, /framework/ai2/ and every path you give (against the worktree's own dev
 * server, never the owner's), waits 1.5 s after each load, and counts what went wrong:
 * console errors, uncaught page errors, a failed request, an HTTP 404+ on a script,
 * stylesheet or page — OR the page rendering core/App's own "Page Load Error" screen
 * (App.js error(): a lone `div.page.active-page` holding `h1("Page Load Error")` next
 * to a `pre.error` — checked for that exact shape, not just the words, so a page that
 * merely mentions them in prose never false-positives).
 *
 * IT FOLLOWS LINKS, ONE LEVEL DEEP (2026-09-28, smoke-links). Every page YOU PASS IN
 * is a SEED whose links get checked. On each one, once it has loaded, every
 * same-origin `<a href>` is collected — skipping `#anchors`, `mailto:`/`tel:`/
 * `javascript:`, and files (an extension in SKIP_EXT: images, .md, .json, .css, .js,
 * fonts, …) — deduplicated against everything already queued or loaded, and loaded in
 * turn. A link found on a FOLLOWED page is not itself followed (one level, not a
 * crawl). `/framework/` and `/framework/ai2/`, the two always-on canaries, are loaded
 * and checked but NOT link-followed — their own nav alone is 80+ links, which would
 * fill the whole cap before ever reaching the pages you actually meant to check. The
 * whole run is capped at CAP pages so one page full of links cannot turn a merge into
 * a crawl. Why this exists: 7 concept-tile links shipped 404ing and nothing here
 * caught it, because nothing had ever clicked them. `public/framework/ai/2026-09-28/smoke-links/`.
 *
 * Ignored: /favicon.ico, live-reload streams cut at page close, anything served by
 * another origin (e.g. Servex on :8090, which a worktree does not have) is printed as
 * a warn line but never fails the run, and neither does the browser's bare
 * "Failed to load resource" line (the response check above already names the URL for
 * the files that matter; a missing data file such as usage.json is not a crash).
 * SKIPPED, not failed: a url whose folder this worktree lacks but the main tree holds UNCOMMITTED
 * (a card dir another agent is still writing) prints "skip … (skipped: exists uncommitted in the main
 * tree)" and never fails the run (2026-09-30, node-reliability). --main <repo> is for proofs only.
 * The port comes from .worktrees.json at the main repo root, or --port / --base.
 * Exit 0 = all clean, 1 = an error was seen, 2 = bad usage or no server answering. */
import { browser as launch } from "./browser.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

/* THE CONSOLE-NOISE GATE (2026-10-03, console-clean). Owner: "we want to use these warnings
 * and errors as feedback so that when something happens, we can fix it" — so a page's
 * console is now part of the smoke test, not ignored:
 *   - a 404 (or other 4xx/5xx) on a SAME-ORIGIN request is always an error, whatever kind of
 *     request it was (script, fetch, document, …) — the old check only looked at script/
 *     stylesheet/document and missed every plain `fetch()` 404 (weight.jsonl, page.jsonl —
 *     the ~100-line storm this task found on one load of /framework/ai/live/).
 *   - every console.warn/console.log line is counted; more than CONSOLE_BUDGET on one page
 *     is a FAIL, UNLESS it matches a live entry in console-allow.jsonl (beside this file) —
 *     "some warnings are okay if it's a temporary problem that's going to be fixed by
 *     something else" (the owner). An allow-list entry that has passed its `until` date no
 *     longer covers anything, so a fix nobody finished starts failing merges again on its own. */
const CONSOLE_BUDGET = 5;
const ALLOWLIST_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "console-allow.jsonl");

function load_allowlist(){
	if (!fs.existsSync(ALLOWLIST_PATH)) return [];
	const today = new Date().toISOString().slice(0, 10);
	return fs.readFileSync(ALLOWLIST_PATH, "utf8").split("\n").map(l => l.trim()).filter(Boolean)
		.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
		.filter(entry => entry.pattern && entry.until)
		.map(entry => ({ ...entry, expired: entry.until < today }))
		.filter(entry => { if (entry.expired) console.log(`  (console-allow.jsonl: "${entry.pattern}" expired ${entry.until} — no longer covered)`); return true; });
}
const ALLOWLIST = load_allowlist();

// Does any LIVE (not expired) allow-list entry cover this console line?
function allowed(text){
	return ALLOWLIST.some(entry => !entry.expired && new RegExp(entry.pattern).test(text));
}

const argv = process.argv.slice(2);
const opt = name => { const i = argv.indexOf("--" + name); if (i < 0) return; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const portOpt = opt("port"), baseOpt = opt("base"), mainOpt = opt("main");
const [dir, ...rest] = argv;
// Git Bash (MSYS) rewrites "/x/" into "C:/Program Files/Git/x/"; strip that install root back off.
const extra = rest.map(p => { const m = /^[A-Za-z]:[\\/].*?[\\/]Git([\\/].*)$/i.exec(p); p = (m ? m[1] : p).replace(/\\/g, "/"); return p.startsWith("/") ? p : "/" + p; });
const usage = msg => { console.error(msg + "\nusage: node Server/smoke.mjs <worktree dir> [paths...] [--port N | --base URL] [--main <repo>]"); process.exit(2); };
if (!dir) usage("no worktree dir given");

const norm = p => path.resolve(p).replace(/\\/g, "/").toLowerCase();
let base = baseOpt || (portOpt && `http://127.0.0.1:${portOpt}`);
if (!base) {
	// the main repo root is where .worktrees.json lives: the first git worktree entry
	const here = path.dirname(fileURLToPath(import.meta.url));
	const candidates = [path.resolve(dir), path.resolve(here, "..")];
	for (const c of candidates) for (const root of [c, "C:/Code/lew42/monorepo"]) {
		const f = path.join(root, ".worktrees.json");
		if (!fs.existsSync(f)) continue;
		const entry = Object.values(JSON.parse(fs.readFileSync(f, "utf8"))).find(e => norm(e.path) === norm(dir));
		if (entry) { base = `http://127.0.0.1:${entry.port}`; break; }
	}
	if (!base) usage("no worktree entry for " + dir + " in .worktrees.json (use --port or --base)");
}
base = base.replace(/\/$/, "");

const canaries = ["/framework/", "/framework/ai2/"];
const given = extra.map(p => (p.startsWith("/") ? p : "/" + p));
const asset = new Set(["script", "stylesheet", "document"]);
const CAP = 60;
// files a link can point at that are never themselves a page — skip, don't 404-check them as a route
const SKIP_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "pdf", "zip", "csv", "txt",
	"md", "json", "jsonl", "mp4", "mp3", "wav", "woff", "woff2", "ttf", "otf", "css", "js", "map"]);

/* A url whose folder the WORKTREE lacks but the MAIN tree holds uncommitted (a card dir another
 * agent is still writing) can never load here, and it is not this branch's fault: such a target is
 * reported "skip", never "FAIL" (node-reliability, 2026-09-30 — /framework/ai2/ links into card dirs
 * that exist only uncommitted in the main tree failed every worktree merge with "Page Load Error").
 * One git call per FAILING url only. MAIN = the repo holding this smoke.mjs (merge.mjs runs the main
 * tree's copy). */
const MAIN = mainOpt ? path.resolve(mainOpt) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");   // --main: proofs only
function uncommitted_in_main(p){
	const pathname = decodeURIComponent(new URL(p, "http://x").pathname);
	const card = /^\/framework\/ai2\/(\d{4}\/\d{2}\/\d{2}\/.+?)\/?$/.exec(pathname);   // a card renders under ai2/, lives under ai/
	const rel = "public" + (card ? "/framework/ai/" + card[1] : pathname.replace(/\/$/, ""));
	if (rel === "public" || norm(MAIN) === norm(dir)) return false;
	if (fs.existsSync(path.join(dir, rel, "page.js")) || fs.existsSync(path.join(dir, rel, "page.jsonl"))) return false;
	if (!fs.existsSync(path.join(MAIN, rel))) return false;
	const st = spawnSync("git", ["-C", MAIN, "status", "--porcelain", "--", rel], { encoding: "utf8", windowsHide: true });
	return st.status === 0 && st.stdout.trim() !== "";
}

let browser;
try { browser = await launch(); } catch (e) { usage("cannot start Playwright: " + e.message); }
const context = await browser.newContext();
let bad = 0;
const loaded = new Set();   // normalized pathnames already loaded or queued this run, seeds and followed alike
const queue = [...canaries.map(p => ({ url: p, follow: false, foundOn: null })),
	...given.map(p => ({ url: p, follow: true, foundOn: null }))];
for (const s of queue) loaded.add(s.url);

// Same-origin <a href> on the page just loaded, minus anchors/mailto/files, deduped against `loaded`.
async function links_on(page){
	let hrefs;
	// core/Page renders the WHOLE ancestor chain as nested columns (a deep url shows every
	// ancestor's own content, not just the leaf — display:contents peers, doc/data-children.md) —
	// so "every <a href> on the page" without scoping means every ancestor's content AND the
	// persistent chrome (core/Sidebar's ".sidebar-rail", the crumb trail, the dev rail), which
	// repeats on every single page site-wide. `.page.active-page` is the one leaf that IS this
	// url (Page.class.js's own "is any of this mine" test). Proof (a) found this the hard way: a
	// content link was 169th on the page (behind the whole site nav plus the HOME page's own
	// content) and never got a turn before the cap.
	try { hrefs = await page.$$eval(".page.active-page a[href]", as => as.filter(a => !a.closest(".sidebar-rail,.page-crumbs,.dev-bar")).map(a => a.getAttribute("href"))); }
	catch { return []; }
	const out = [];
	for (const href of hrefs) {
		if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) continue;
		// Resolve against the PAGE the link was found on, not the bare server origin: a
		// relative href ("./floating/") still raw at crawl time (md.resolve() rewrites
		// readme links async, and this snapshot can beat it) must resolve the same way a
		// real browser resolves it — against the current url, not the site root, or a
		// perfectly working link false-fails as a 404 at the wrong path.
		let u; try { u = new URL(href, page.url()); } catch { continue; }
		if (u.origin !== new URL(base).origin) continue;
		const ext = (u.pathname.match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();
		if (SKIP_EXT.has(ext)) continue;
		const norm_path = u.pathname + u.search;
		if (loaded.has(norm_path)) continue;
		loaded.add(norm_path);
		out.push(norm_path);
	}
	return out;
}

/* THE LAYOUT-EDGE GATE (2026-10-03, layout-gate). The owner's own bug report: the AI-cost
 * line sat flush against /framework/ai/'s top edge with zero padding, pushed the whole page
 * down, and nothing here caught it — because nothing here ever looked at where things SIT,
 * only at whether they loaded. Two checks, run once per page, inside the browser (this is
 * page geometry — pixels after layout — so it has to run in page.evaluate, not in Node):
 *   - text touching its box: walk every visible text node inside `.page.active-page` up to
 *     the NEAREST ancestor that opted into a visual box (non-zero padding, a visible border,
 *     or a non-transparent background) and treat that ancestor's content box as the "safe
 *     area" the text should sit inside. Within 2px of any edge of that box is a finding — a
 *     padded ancestor with text flush against its OWN padding is fine, the bug is text with
 *     NO padding at all between it and the edge, exactly the dollar-sign line.
 *   - something above the title: the page's own `h1.page-title`/`h1.doc-title` should be the
 *     first thing a reader sees. Anything else inside `.page.active-page`, painted higher on
 *     the page than that title, is a finding.
 * Same scoping `links_on` already uses (`.page.active-page`, minus `.sidebar-rail`,
 * `.page-crumbs`, `.dev-bar` — the chrome that repeats on every page and isn't this page's own
 * content). Returns plain objects; the caller below turns them into the same kind of plain-
 * English string a console error becomes, so they fail the run the same way.
 * Detail: `Server/doc/review.md`. */
async function layout_edge_problems(page){
	return page.evaluate(() => {
		const EXCLUDE = ".sidebar-rail, .page-crumbs, .dev-bar";
		const root = document.querySelector(".page.active-page");
		if (!root) return [];
		const excluded = el => el.closest(EXCLUDE) !== null;
		const hidden = el => { const s = getComputedStyle(el); return s.visibility === "hidden" || s.display === "none" || parseFloat(s.opacity) === 0; };

		// A short, readable name for an element — its id, or its classes, never the whole
		// ancestor chain: "a CSS selector (or short description)", not a debugging dump.
		function describe(el){
			if (!el || el === document.body) return "(body)";
			if (el.id) return "#" + el.id;
			const cls = (el.className || "").toString().trim().split(/\s+/).filter(Boolean);
			return cls.length ? "." + cls.join(".") : el.tagName.toLowerCase();
		}

		const problems = [];

		// ── 1. text touching its box ──
		// ⚠ The box is found PER SIDE, not once for all four. A `<ul>` with
		//   `padding-block` but no `padding-inline` (a real, common pattern — the
		//   vertical gap is deliberate, the horizontal one is handled by an outer
		//   gutter) IS "a box with non-zero padding", but only on two of its four
		//   sides. Checking all four sides against that one box's rect produced a
		//   flood of false "0px from left" findings on completely ordinary `ul`,
		//   `td`, `code` elements the first time this ran (never a real bug, never
		//   reported) — so each side keeps walking past an ancestor that doesn't
		//   itself guard THAT side, until it finds one that does, or runs out.
		const SIDES = ["top", "right", "bottom", "left"];
		const CAP_WORD = { top: "Top", right: "Right", bottom: "Bottom", left: "Left" };
		function visualBg(s){ const bg = s.backgroundColor; return bg && bg !== "transparent" && !/^rgba\([^)]*,\s*0\s*\)$/.test(bg); }
		function hasEscaped(el){
			// `.bleed` is this codebase's own name for "this deliberately touches the
			// edge, on purpose" (CLAUDE.md) — the sanctioned opt-out, not a bug.
			// `position: fixed/absolute` takes an element out of its ancestors'
			// padding box entirely, so "nearest padded ancestor" stops meaning
			// anything (a demo widget's overlay control, say) — skip, don't guess.
			for (let a = el; a && a !== root.parentElement; a = a.parentElement) {
				if (a.classList?.contains("bleed")) return true;
				const pos = getComputedStyle(a).position;
				if (pos === "fixed" || pos === "absolute") return true;
			}
			return false;
		}

		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode(node){
				if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_SKIP;
				const el = node.parentElement;
				if (!el || excluded(el) || hidden(el)) return NodeFilter.FILTER_SKIP;
				return NodeFilter.FILTER_ACCEPT;
			}
		});
		let node;
		textloop: while ((node = walker.nextNode())) {
			const range = document.createRange();
			range.selectNodeContents(node);
			const rect = range.getBoundingClientRect();
			if (rect.width === 0 && rect.height === 0) continue;   // collapsed whitespace, not actually painted
			if (hasEscaped(node.parentElement)) continue;

			// For each side, walk up to the nearest ancestor that guards THAT side —
			// its own padding or border on that side, or any ancestor's background
			// (a filled box reaches its own padding edge on every side alike).
			const found = {};
			let el = node.parentElement;
			while (el && el !== root.parentElement && SIDES.some(s => !found[s])) {
				const s = getComputedStyle(el);
				const bg = visualBg(s);
				for (const side of SIDES) {
					if (found[side]) continue;
					const pad = parseFloat(s["padding" + CAP_WORD[side]]) || 0;
					const borderW = parseFloat(s["border" + CAP_WORD[side] + "Width"]) || 0;
					const hasBorder = borderW > 0 && s["border" + CAP_WORD[side] + "Style"] !== "none";
					if (pad > 0 || hasBorder || bg) found[side] = { el, pad, border: hasBorder ? borderW : 0 };
				}
				el = el.parentElement;
			}

			const EDGE = 2;
			// ⚠ NOT the same number as EDGE. A side is exempt the moment it has ANY
			// real padding or border at all, however small — `code { padding: 0.15em
			// 0.4em }` resolves to ~1.8px top at this site's usual font sizes, which
			// is deliberate (a monospace snippet's vertical padding is allowed to be
			// tighter than its horizontal one) and would otherwise fail this check on
			// every single inline `<code>` on the site, a false positive this caught
			// empirically on 2026-10-03. The bug this check exists for is padding
			// that is actually ABSENT (0), not merely small.
			const MEANINGFUL = 0.5;
			for (const side of SIDES) {
				const f = found[side];
				if (!f) continue;   // nothing up to the page root guards this side — nothing to measure against
				const inset = f.pad + f.border;
				// ⚠ REAL padding on THIS side already does its job, whatever the text
				// does next to it. Text that simply fills its container — which is
				// most text, almost all the time — ends exactly at the inner edge of
				// that padding (distance ~0 from the CONTENT box), and that is normal,
				// not a bug: "a padded ancestor with the text flush against its
				// padding IS fine — padding already keeps 2px+ away" (from the edge
				// that actually matters, the box's OUTER one). So a side only needs
				// checking at all when its own inset is itself near-zero — a box that
				// qualified here only through a background or a border, or only
				// through padding on some OTHER side (the `<ul>` with vertical but no
				// horizontal padding, the first false-positive class this caught on
				// 2026-10-03: content box ≈ outer box on this side, so "distance to
				// the content edge" IS "distance to the edge that's actually there".
				if (inset >= MEANINGFUL) continue;
				if ((side === "left" || side === "right") && hasEscaped(f.el)) continue;
				const r = f.el.getBoundingClientRect();
				const safeEdge = side === "top" ? r.top + inset : side === "bottom" ? r.bottom - inset
					: side === "left" ? r.left + inset : r.right - inset;
				const dist = side === "top" ? rect.top - safeEdge : side === "bottom" ? safeEdge - rect.bottom
					: side === "left" ? rect.left - safeEdge : safeEdge - rect.right;
				// A big negative distance means this text isn't really inside that
				// ancestor's box at all (a transform, a scroller, overlapping layout) —
				// not the flush-against-an-edge bug this check is for.
				if (dist < EDGE && dist > -20) {
					problems.push({ selector: describe(f.el), side, distance: Math.round(dist) });
					continue textloop;   // one finding per text node is enough to flag the box
				}
			}
		}

		// ── 2. something above the title ──
		const title = root.querySelector("h1.page-title, h1.doc-title");
		if (title && !excluded(title) && !hidden(title)) {
			const floor = title.getBoundingClientRect().top;
			const ancestors = new Set();
			for (let a = title.parentElement; a; a = a.parentElement) ancestors.add(a);
			for (const el of root.querySelectorAll("*")) {
				if (el === title || ancestors.has(el) || el.contains(title) || excluded(el) || hidden(el)) continue;
				const text = (el.textContent || "").trim();
				if (!text) continue;
				const r = el.getBoundingClientRect();
				if (r.width === 0 && r.height === 0) continue;
				if (r.bottom >= floor) continue;
				// Only the outermost offending element — a span inside an offending div is the
				// same finding, not a second one.
				if (el.parentElement && !ancestors.has(el.parentElement)) {
					const pr = el.parentElement.getBoundingClientRect();
					if (pr.width > 0 || pr.height > 0) { if (pr.bottom < floor) continue; }
				}
				problems.push({ aboveTitle: true, selector: describe(el), text: text.slice(0, 60) });
			}
		}

		return problems;
	});
}

let loadedCount = 0;
for (let qi = 0; qi < queue.length && loadedCount < CAP; qi++) {
	const { url: p, follow, foundOn } = queue[qi];
	loadedCount++;
	const errors = [], warns = [], noise = [];
	const page = await context.newPage();
	let closing = false;
	page.on("console", m => {
		const t = m.text(), type = m.type();
		if (type === "error") return void (/Failed to load resource|blocked by CORS/.test(t) ? warns : errors).push(`console: ${t}  (${m.location().url || p})`);
		if (type === "warning" || type === "log") noise.push(t);
	});
	page.on("pageerror", e => errors.push(`pageerror: ${e.message}`));
	page.on("requestfailed", r => {
		const u = r.url();
		if (closing || u.endsWith("/favicon.ico") || /ERR_ABORTED/.test(r.failure()?.errorText || "")) return;
		(u.startsWith(base) ? errors : warns).push(`request failed: ${u}  (${r.failure()?.errorText})`);
	});
	page.on("response", r => {
		const u = r.url();
		if (u.endsWith("/favicon.ico") || r.status() < 400) return;
		// Same-origin (this worktree's own server) is always an error, any request kind —
		// a plain `fetch()` 404 used to slip through here because only script/stylesheet/
		// document were checked. Cross-origin (Servex on :8090, off in a worktree) stays a warn.
		(u.startsWith(base) ? errors : warns).push(`HTTP ${r.status()}: ${u}`);
	});
	let links = [];
	try {
		const res = await page.goto(base + p, { waitUntil: "load", timeout: 30000 });
		if (!res) errors.push("no response");
		await page.waitForTimeout(1500);
		// layout-gate (2026-10-03): text flush against its own box, or anything painted
		// above the page's title — see layout_edge_problems()'s own header above.
		const layoutProblems = await layout_edge_problems(page).catch(() => []);
		for (const prob of layoutProblems) {
			errors.push(prob.aboveTitle
				? `layout: element above the title — "${prob.selector}" ("${prob.text}")`
				: `layout: text touching its box — "${prob.selector}" ${prob.distance}px from ${prob.side}`);
		}
		// core/App's App.error() shape exactly: div.page.active-page > h1("Page Load Error") + pre.error
		const loadError = await page.evaluate(() => {
			const h1 = document.querySelector(".pages > .page.active-page > h1");
			return h1?.textContent?.trim() === "Page Load Error" && h1.nextElementSibling?.matches("pre.error") ? true : false;
		}).catch(() => false);
		if (loadError) errors.push("Page Load Error (core/App's error screen is showing)");
		if (follow) links = await links_on(page);
	} catch (e) {
		if (/ERR_CONNECTION_REFUSED/.test(e.message)) { console.error("no server answering at " + base); await browser.close(); process.exit(2); }
		errors.push("load failed: " + e.message.split("\n")[0]);
	}
	closing = true;
	await page.close();

	// Every warn/log line, deduped, split into what the allow-list already covers and what
	// it doesn't. Over budget on the uncovered ones fails the page, same as a real error.
	const uniq_noise = [...new Set(noise)];
	const covered = uniq_noise.filter(allowed);
	const uncovered = uniq_noise.filter(t => !allowed(t));
	let uniq = [...new Set(errors)];
	if (uncovered.length > CONSOLE_BUDGET)
		uniq.push(`console warn/log budget exceeded: ${uncovered.length} > ${CONSOLE_BUDGET} (not in console-allow.jsonl)`);

	const from = foundOn ? `  (link found on ${foundOn})` : "";
	if (uniq.length && uncommitted_in_main(p)) { console.log(`skip ${p}${from}  (skipped: exists uncommitted in the main tree)`); uniq = []; links = []; continue; }
	console.log(uniq.length ? `FAIL ${p}${from}  ${uniq.length} error${uniq.length > 1 ? "s" : ""}` : `ok   ${p}${from}`);
	for (const e of uniq) console.log("       " + e);
	for (const w of new Set(warns)) console.log("  warn " + w.split(String.fromCharCode(10))[0]);
	for (const n of uncovered) console.log("  noise " + n.split(String.fromCharCode(10))[0]);
	if (covered.length) console.log(`  (${covered.length} warn/log line${covered.length > 1 ? "s" : ""} allow-listed — console-allow.jsonl)`);
	bad += uniq.length;

	for (const link of links) {
		if (queue.length >= CAP) break;
		queue.push({ url: link, follow: false, foundOn: p });
	}
}
if (loadedCount >= CAP && queue.length > loadedCount) console.log(`  (stopped at the ${CAP}-page cap; ${queue.length - loadedCount} more link(s) unfollowed)`);
await browser.close();
process.exit(bad ? 1 : 0);
