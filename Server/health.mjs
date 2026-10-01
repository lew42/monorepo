/* `node Server/health.mjs` — a standalone "is it working" watcher: the monitor
 * on the main branch, which the owner browses live as production.
 *
 * WHAT IT DOES, in one sentence: every time a TEMPLATE file under public/
 * changes (.js, .css, .html — never a .jsonl/.json/.md, which is data), this
 * script loads the pages that file could have broken in a hidden browser and
 * writes down what went wrong — so whoever made the edit hears about it at
 * their very next write, through `.claude/hooks/health-guard.mjs`, and the
 * owner sees one line on that agent's task card (report_to_dashboard()).
 *
 * EACH CHECK (2026-09-30, proposal-flow/monitor): console errors, page errors,
 * failed requests, a blank page, a stall (any long task over 2 s, or a page
 * still busy 10 s after navigation), `JSONL: unknown verb` warnings counted,
 * and a 1920-wide screenshot at public/framework/ai/health/shots/<date>/<slug>.png.
 * How to run and read it: Server/doc/health.md.
 *
 * WHY ITS OWN PROCESS, not a server plugin: a watcher that could slow or crash
 * the dev server would be worse than no watcher. This script never imports
 * Server.js or run.js, opens no port, and can sit beside ANY server (the
 * owner's, the mastermind's, a private one) — kill THIS process any time and
 * nothing else even notices.
 *
 * WHY NO TOKENS, NO CPU WHILE NOTHING CHANGES: it is a plain Node script with
 * one fs.watch handle and one idle Chromium process — no LLM call anywhere in
 * it, and Chromium with no page open burns close to nothing. It only does
 * real work (a headless page load) when a file it cares about actually
 * changes, debounced 1.5s so a save-everything editor pass is one batch, not
 * twenty.
 *
 * THE THREE PIECES, each documented at its own function below:
 *   1. Watch public/ (reusing Server/MtimeFilter.js, the same fix the real
 *      dev server uses for "reading a file looks like writing it" on
 *      Windows) and turn a changed file into the URLs to check — pages_for().
 *   2. Load those URLs headless (check_batch()) and write findings to
 *      public/framework/ai/health/<date>.jsonl, with a small archiving sweep
 *      so the log never grows without bound (archive_sweep()).
 *   3. health-guard.mjs (a sibling file, not this one) reads that log at an
 *      agent's next write and tells them if they broke something — this
 *      script's only job is to make that log true and current.
 *
 * WHO KEEPS THIS PROCESS ITSELF ALIVE (health-revive, 2026-09-19): nothing,
 * if you just run the line above by hand — this file was found dead earlier
 * tonight for exactly that reason, with no one and nothing to restart it.
 * `node Server/health-supervisor.mjs` (a sibling file, beside this one) forks
 * this script as a child, restarts it the moment it dies, and writes a
 * heartbeat to public/framework/ai/health/heartbeat.json that a live page
 * reads — read THAT file's own header before running either by hand. Start
 * the supervisor, not this file directly, unless you are deliberately
 * debugging this file alone.
 *
 * Full story: Server/doc/health.md (how to run it, what it reports, the proofs);
 * the live log page is public/framework/ai/health/.
 */
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import MtimeFilter from "./MtimeFilter.js";
import * as Hold from "./hold.mjs";
import { check_page } from "./padding-check.mjs";
import { browser as launch } from "./browser.mjs";

/* The widths this watcher checks the padding law at. 1280 is the viewport it
   already loads every page in, so it costs one evaluate and no re-layout; 3440
   is the one that finds the ToC-rail case, and it is the width nothing on this
   machine was looking at before 2026-09-22. */
const PADDING_WIDTHS = [1280, 3440];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const HEALTH_DIR = path.join(PUBLIC, "framework", "ai", "health");
const ARCHIVE_DIR = path.join(HEALTH_DIR, "archive");
const SHOTS_DIR = path.join(HEALTH_DIR, "shots");   // shots/<date>/<slug>.png, 1920 wide, overwritten per page (gitignored)
const SHOT_WIDTH = 1920, SHOT_HEIGHT = 1080;
const STALL_MS = 2000;      // a long task over this is a stall finding (an error: the owner's tab "crashed" on a 13 s one)
const SETTLE_MS = 10_000;   // a page whose main thread is still busy this long after navigation starts "did not settle"
// Default changed 2026-09-19 (health-revive): the mastermind's :8123 is not always up, and
// checking a copy of the site proves nothing about the one the owner actually uses. The
// owner's own :80 is read-only here — a capped, debounced handful of GET page-loads per
// batch, the same kind of request any browser tab makes — never written to, never restarted.
// Decision + the rejected alternative (a private 809x server): this task's task.jsonl,
// decision id health-watch-target.
const HEALTH_BASE = (process.env.HEALTH_BASE || "http://monorepo.localhost").replace(/\/+$/, "");
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PAGES_PER_BATCH = 8;
const DEBOUNCE_MS = 1500;
const DAY_FILE_CAP_BYTES = 2 * 1024 * 1024;

/* ── one copy per tree — a pid file in the OS temp dir ──────────────────────
 * Keyed by this checkout's root (proposal-flow/monitor, 2026-09-30): one lock
 * for the whole machine meant a worktree's watcher exited the moment the main
 * tree's was running, so Servex/Pool.js had to fake a private TEMP dir per
 * slot to get one at all. Each tree now has its own lock; the main tree still
 * gets exactly one. Exit code 3 tells health-supervisor.mjs "someone else
 * already watches this tree", not "I crashed". */

const TREE_KEY = crypto.createHash("sha1").update(ROOT.toLowerCase()).digest("hex").slice(0, 8);
const LOCK_PATH = path.join(os.tmpdir(), `lew42-health-${TREE_KEY}.lock`);
const LOCKED_EXIT = 3;   // health-supervisor.mjs repeats this number; importing this file would start a watcher

function is_running(pid){
	try { process.kill(pid, 0); return true; } catch { return false; }
}

function acquire_lock(){
	try {
		const prev = Number(fs.readFileSync(LOCK_PATH, "utf8").trim());
		if (prev && prev !== process.pid && is_running(prev)){
			console.log(`health.mjs: already running as pid ${prev} (${LOCK_PATH}) — exiting.`);
			process.exit(LOCKED_EXIT);
		}
	} catch {}
	fs.writeFileSync(LOCK_PATH, String(process.pid));
}

function release_lock(){
	try {
		if (Number(fs.readFileSync(LOCK_PATH, "utf8").trim()) === process.pid) fs.unlinkSync(LOCK_PATH);
	} catch {}
}

/* ── which URLs a changed file could have broken ────────────────────────── */

// Shared modules: a change here can affect any page, so instead of every page
// (too slow, too much log) we check a fixed set of canaries plus the changed
// module's own demo page.
const SHARED_RE = [
	/^framework\/core\//,
	/^framework\/framework\.css$/,
	/^app\.js$/,
	/^framework\/ui\//,
	/^framework\/ux\//,
	/^framework\/ext\//,
];
const CANARIES = ["/", "/framework/", "/framework/ai/", "/framework/ai/v/3/", "/framework/core/Page/"];

const rel_to = (base, abs) => path.relative(base, abs).split(path.sep).join("/");
const is_shared = rel => SHARED_RE.some(re => re.test(rel));

/* A page's url IS the directory that holds its page.js (the no-build site has
   no other routing table) — walk up from the changed file until a directory
   with a page.js turns up. Stops at PUBLIC itself, which has its own page.js
   (the home page), so this always terminates. */
function nearest_page_url(abs_file){
	let dir = path.dirname(abs_file);
	while (dir === PUBLIC || dir.startsWith(PUBLIC + path.sep)){
		if (fs.existsSync(path.join(dir, "page.js"))){
			const rp = rel_to(PUBLIC, dir);
			return "/" + (rp && rp !== "." ? rp + "/" : "");
		}
		if (dir === PUBLIC) break;
		dir = path.dirname(dir);
	}
	return null;
}

/* The one rule this whole watcher runs on: a page.js → its own url; any other
   file under a page's dir → that page (same walk, since a page.js changed IS
   just the file-under-its-own-dir case); a shared module → the canary set
   plus its own page, own page first so a crowded batch keeps it over a
   generic canary when the 8-page cap bites. */
function pages_for(abs_file){
	if (!abs_file.startsWith(PUBLIC)) return [];
	const rp = rel_to(PUBLIC, abs_file);
	const own = nearest_page_url(abs_file);
	if (is_shared(rp)) return [...new Set([...(own ? [own] : []), ...CANARIES])];
	return own ? [own] : [];
}

/* Pages that error BY DESIGN — never a real finding, so they never reach the
   log. Two different shapes: a whole page tree (the five personal sandboxes,
   not built to framework standard — public/framework/core/Page/tools/links.mjs's
   own SKIP_TOP list) is skipped before it is even loaded; one known resource
   (the owner's own append-only verdicts file, absent until they press
   Approve/Improve once) is filtered out of an otherwise-real page's findings. */
const KNOWN_PAGES = [
	{ test: url => /^\/(alex|arya|castin|edric|michael)\//.test(url), reason: "personal sandbox tree — errors by design when crawled" },
];
const KNOWN_REQUESTS = [
	{ test: url => /\/layouts\/verdicts\.jsonl(\?.*)?$/.test(url), reason: "the owner's own append-only verdicts file — absent until they press Approve/Improve once" },
];
// Both patterns below are MECHANICAL CONSEQUENCES of blocking the dev socket
// (below) — never a real site bug, and never something a real browser tab
// would show (a real tab keeps the socket open). Without this filter, every
// single JSONL-consuming page in a batch carried 3-20+ of these as false
// "warning" findings, burying the real ones (2026-09-19 prove step, measured
// on /framework/ai/2026-09-19/page-health/scratch-throw/).
const KNOWN_CONSOLE = [
	{ test: text => /^Socket (closed, reconnecting|error\.)/.test(text), reason: "this watcher's own deliberate socket close, not a page bug" },
	{ test: text => /^JSONL\.live\(\): no answer from the dev server, fetching/.test(text), reason: "live() falls back to fetch() because the socket is deliberately closed — expected, not a bug" },
];

/* ── the reload hold (a sibling task, ai/2026-09-19/reload-hold/) ───────── */

// Read-only: `Hold.peek()` compares `until` against now without writing
// anything back — pruning the file is the dev server's job, not this
// script's. "half a batch of writes is not a broken page" — while ANY holder
// is present we queue instead of checking.
//
// ⚠ THIS is the real reason the 11:14 outage (safe-rollout, 2026-09-21)
// produced no finding — not a missing check (a thrown error and a blank page
// were ALREADY caught by check_one() below, and had been since health-quiet).
// A hold that stays continuously renewed blocks EVERY tick() for as long as
// it is held, with no ceiling — so a page that breaks and gets fixed entirely
// inside one hold window (here: ~3 minutes, well under the 5-minute default
// TTL) is never checked in either state. The two checks that DID run that
// morning (11:17:10, 11:17:12) are the first ones after the hold was
// released — by then the fix had already landed. Real visitors were never
// protected by the hold at all: it only pauses this repo's own LiveReload
// broadcast, not what the static file server actually returns, so the broken
// file was live to anyone who hit the url directly the whole time.
// MAX_HOLD_DEFER_MS (used in tick(), below) is the fix: after being held this
// long, check anyway. Decision + the reproduction: this task's task.jsonl.
function is_held(){
	try { return Hold.peek().some(h => !h.expired); } catch { return false; }
}

/* ── the log: public/framework/ai/health/<date>.jsonl ────────────────────── */

const pad2 = n => String(n).padStart(2, "0");
const local_date = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const now_iso = () => {
	const d = new Date(), off = -d.getTimezoneOffset();
	const sign = off < 0 ? "-" : "+", a = Math.abs(off);
	return `${local_date(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}${sign}${pad2(Math.floor(a / 60))}:${pad2(a % 60)}`;
};

const today_path = () => path.join(HEALTH_DIR, `${local_date()}.jsonl`);

const warned_over_cap = new Set();   // day-file paths already told once about the 2MB cutover

/* One append. `kind` here is the VERB ("error"/"warning"/"ok"), not the
   finding's own `kind` field — past 2MB a day file stops taking warnings
   (errors still land, so a real regression is never the thing silently
   dropped) and says so once, to this process's own console, never as an
   invented fourth verb in the jsonl. */
function append_line(day_file, verb, value){
	let size = 0;
	try { size = fs.statSync(day_file).size; } catch {}
	if (size > DAY_FILE_CAP_BYTES){
		if (verb === "warning") return;
		if (!warned_over_cap.has(day_file)){
			warned_over_cap.add(day_file);
			console.log(`health.mjs: ${path.basename(day_file)} passed 2MB — warnings stop recording today; errors keep recording.`);
		}
	}
	let lead = "";
	try { const b = fs.readFileSync(day_file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.mkdirSync(HEALTH_DIR, { recursive: true });
	fs.appendFileSync(day_file, lead + JSON.stringify({ [verb]: value }) + "\n");
}

/* Which urls are CURRENTLY failing, so a later pass that comes back clean can
   write the one `ok` line the brief asks for. Hydrated from today's own file
   at start (a restart mid-day must not re-announce every already-broken page
   as newly broken, and must still notice a fix); a process that has run all
   day just keeps this Map current as it goes. */
const failing = new Map();

function hydrate_failing(){
	let text; try { text = fs.readFileSync(today_path(), "utf8"); } catch { return; }
	const by_url = new Map();   // url -> {at, ok}
	for (const line of text.split("\n")){
		if (!line.trim()) continue;
		let e; try { e = JSON.parse(line); } catch { continue; }
		if (e.error) by_url.set(e.error.url, { at: e.error.at, ok: false });
		else if (e.ok) { const p = by_url.get(e.ok.url); if (!p || e.ok.at >= p.at) by_url.set(e.ok.url, { at: e.ok.at, ok: true }); }
	}
	for (const [url, v] of by_url) if (!v.ok) failing.set(url, true);
}

/* ── archiving — the owner's bloat worry ─────────────────────────────────── */

function archive_sweep(){
	let entries; try { entries = fs.readdirSync(HEALTH_DIR, { withFileTypes: true }); } catch { return; }
	const now = Date.now();
	for (const e of entries){
		const m = /^(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(e.name);
		if (!e.isFile() || !m) continue;
		if (m[1] === local_date()) continue;   // never touch today's own file
		const age_days = (now - new Date(m[1] + "T00:00:00").getTime()) / DAY_MS;
		const full = path.join(HEALTH_DIR, e.name);
		if (age_days > 30){ try { fs.unlinkSync(full); } catch {} continue; }
		if (age_days > 7){
			try {
				fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
				const gz = path.join(ARCHIVE_DIR, e.name + ".gz");
				if (!fs.existsSync(gz)) fs.writeFileSync(gz, zlib.gzipSync(fs.readFileSync(full)));
				fs.unlinkSync(full);
			} catch {}
		}
	}
	let archived; try { archived = fs.readdirSync(ARCHIVE_DIR); } catch { archived = []; }
	for (const name of archived){
		const m = /^(\d{4}-\d{2}-\d{2})\.jsonl\.gz$/.exec(name);
		if (!m) continue;
		if ((now - new Date(m[1] + "T00:00:00").getTime()) / DAY_MS > 30) try { fs.unlinkSync(path.join(ARCHIVE_DIR, name)); } catch {}
	}
	// Screenshots: one folder a day, each page's shot overwritten in place; a day's folder goes after 7 days.
	let shot_days; try { shot_days = fs.readdirSync(SHOTS_DIR); } catch { shot_days = []; }
	for (const name of shot_days){
		if (!/^\d{4}-\d{2}-\d{2}$/.test(name) || name === local_date()) continue;
		if ((now - new Date(name + "T00:00:00").getTime()) / DAY_MS > 7) try { fs.rmSync(path.join(SHOTS_DIR, name), { recursive: true, force: true }); } catch {}
	}
}

/* ── Chromium, via the one shared launcher (Server/browser.mjs) ──────────── */

let browser = null;
async function ensure_browser(){
	if (!browser) try { browser = await launch(); } catch (e) {
		console.log("health.mjs: " + e.message + " Exiting.");
		process.exit(0);
	}
	return browser;
}

/* ── two spacing lint checks, WARNINGS only, never errors ───────────────────
 *
 * Both come from the card-word task (2026-09-19,
 * public/framework/ai/2026-09-19/card-word/) and the padding audit before it
 * — the two concrete spacing mistakes that were actually caught by hand that
 * week: the dev bar's cards measured 5.12px of padding with a border and a
 * ground on them, and a sidebar list measured 46.5px between rows. A machine
 * can see both from one number each; this function is that machine.
 *
 * ONE page.evaluate() call does both (cheap: a live watcher runs this on
 * every save to a shared file), and the combined result is capped at ten
 * findings so one bad page can't bury a batch's real findings the way the
 * unfiltered console noise once did (KNOWN_CONSOLE, above).
 *
 * ⚠ Why this reads `getComputedStyle(el).paddingLeft` directly instead of
 * measuring geometrically (the padding audit's own method, and what the
 * card-word design-system demo does): a `%` inside `calc()` — `--pad` and
 * `--pad-card` both are — only fails to resolve through `getComputedStyle`
 * and reads back as the literal `clamp(...)` STRING when the element has NO
 * layout box yet (zero size — an inactive nested `.page` is the common
 * case). Every element this function inspects is filtered to
 * `getBoundingClientRect().width > 0 && height > 0` first — a real, painted
 * box — and on a real box `getComputedStyle` DOES return the resolved
 * pixel value (verified 2026-09-19: `parseFloat` gave a clean number on
 * every laid-out box tested, and only the symbolic string on a zero-size
 * one). `parseFloat` is still guarded for `NaN` and skipped rather than
 * flagged, in case a future value doesn't fit that pattern.
 */
function lint_findings(){
	const findings = [];
	const CAP = 10;

	const class_of = el => (typeof el.className === "string" ? el.className : el.getAttribute("class")) || "(no class)";
	const tag_of = el => "<" + el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "") + ">";
	const is_painted = r => r.width > 0 && r.height > 0;

	// (a) a framed box — a visible border, OR a background different from its
	// parent's — holding text directly, with under 8px of padding on any side.
	// "Holding text directly" (a direct text-node child, not just nested
	// elements) is the same shape the layout skill already names: "a fill
	// with text jammed against its edge is not a box, it is a stain."
	// ⚠ Excludes the framework's own CONTROL family (`.btn, button, summary,
	// select, textarea, input` — the exact selector framework.css's control
	// grammar uses) on purpose: the one-line rule's third case is "a control
	// keeps its own `em`", by design smaller than 8px is normal (a button
	// measured 2–5px of vertical padding on every real page tried, all of it
	// correct, none of it a bug) — flagging every button and field on the
	// site would have buried the real card-shaped findings under noise that
	// is not a mistake (measured 2026-09-19, `card-word`).
	// ⚠ Also excludes `code, th, td` (2026-09-19, `health-quiet`): a sitewide
	// inline-code chip (2–5px padding) and a table cell (~4px) are the same
	// deliberate compact style repeated on every page that uses them — the
	// same reasoning as a control keeping its own `em`, just for two more
	// tag names the rule had not been given yet.
	// ⚠ Also excludes `.ai-fold-bar` (2026-09-19, `health-quiet`): it is a
	// clickable disclosure toggle (`cursor: pointer`), not a plain text box —
	// `ext/AITask/ai.css` (lines 316-319) already documents this exact
	// element as a control that keeps its own em-sized padding on purpose,
	// and notes that an earlier automated tool (the spacing census) flagged
	// it as a mistake for the same reason this rule just did, and was wrong:
	// "the class is not named like a button; it was right all along." Not a
	// guess — the CSS file's own comment already settled this one.
	const IS_CONTROL = "a.btn, .btn, button, summary, select, textarea, input, code, th, td, .ai-fold-bar";
	for (const el of document.body.querySelectorAll("*")) {
		if (findings.length >= CAP) break;
		if (el.matches(IS_CONTROL)) continue;
		const has_text = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
		if (!has_text) continue;
		const rect = el.getBoundingClientRect();
		if (!is_painted(rect)) continue;

		const cs = getComputedStyle(el);
		const sides = ["Top", "Right", "Bottom", "Left"];
		const has_border = sides.some(s => cs["border" + s + "Style"] !== "none" && parseFloat(cs["border" + s + "Width"]) > 0);
		const bg = cs.backgroundColor;
		const parent_bg = el.parentElement ? getComputedStyle(el.parentElement).backgroundColor : "";
		const is_transparent = c => !c || c === "rgba(0, 0, 0, 0)" || c === "transparent";
		const has_own_bg = !is_transparent(bg) && bg !== parent_bg;
		if (!has_border && !has_own_bg) continue;   // not a framed box at all

		const pads = {
			top: parseFloat(cs.paddingTop), right: parseFloat(cs.paddingRight),
			bottom: parseFloat(cs.paddingBottom), left: parseFloat(cs.paddingLeft),
		};
		const thin = Object.entries(pads).filter(([, v]) => !Number.isNaN(v) && v < 8);
		if (!thin.length) continue;
		findings.push({
			kind: "padding-under-8px",
			text: tag_of(el) + " — " + thin.map(([side, v]) => side + ": " + v.toFixed(1) + "px").join(", ") + " (classes: " + class_of(el) + ")",
		});
	}

	// (b) a list of more than eight sibling rows pitched over 250px apart.
	// "Pitch" = the vertical distance from one row's top to the next row's
	// top, which already includes that row's own height AND the gap after it
	// — the same single number a reader's eye actually judges list density by.
	for (const parent of document.body.querySelectorAll("*")) {
		if (findings.length >= CAP) break;
		if (parent.children.length <= 8) continue;   // cheap filter before any geometry
		const rows = [...parent.children].filter(c => is_painted(c.getBoundingClientRect()));
		if (rows.length <= 8) continue;

		const tops = rows.map(c => c.getBoundingClientRect().top).sort((a, b) => a - b);
		const pitches = [];
		for (let i = 1; i < tops.length; i++) if (tops[i] - tops[i - 1] > 1) pitches.push(tops[i] - tops[i - 1]);
		// Fewer than 8 non-zero pitches means most children share a top (a
		// wrapped grid/wall, not a vertical list of rows) — not this check's shape.
		if (pitches.length <= 8) continue;

		const avg_pitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
		// Threshold raised 40 -> 250 (2026-09-19, `health-quiet`). The
		// original 40px caught a real bug (a plain list, 46.5px between
		// one-line rows). But an activity/task list's own "row" is often a
		// multi-line card (title + summary sentence + timestamp), sized
		// heterogeneously — a day heading next to a whole day's grid of
		// cards is a normal shape here, not a mistake — and measured live
		// on four such lists (.ai-needs, .ai-highlights, and a page's own
		// content list), correct pitches ran 44.8 to 229.3px, all reading
		// fine with nothing stretched. A per-row "is this multi-line"
		// geometry check was tried first and rejected: these lists mix
		// single-line headers with multi-row grid sections as siblings, so
		// no single per-row rule tells the two shapes apart cleanly. 250
		// sits comfortably above every real card list measured, while
		// still well below what a badly-spaced single-line list would show.
		if (avg_pitch > 250) {
			findings.push({
				kind: "row-pitch-over-250px",
				text: tag_of(parent) + " — " + rows.length + " rows, ~" + avg_pitch.toFixed(1) + "px pitch (classes: " + class_of(parent) + ")",
			});
		}
	}

	return findings.slice(0, CAP);
}

/* ── loading one page and reading back what went wrong ───────────────────── */

/* Stalls (proposal-flow/monitor, 2026-09-30): /framework/ai2/ blocked its main
   thread for ~13 s after load and the owner's tab "crashed", with this watcher
   running and saying nothing. Two measurements, both cheap:
   - every long task, recorded by a PerformanceObserver that context.addInitScript
     installs before any page script runs (`buffered` catches the earliest ones);
     any over STALL_MS is an error;
   - "did it settle": a one-frame probe (requestAnimationFrame) can only answer
     once the main thread is free, so no answer within SETTLE_MS of the start of
     navigation means the page was still busy — also an error. */
const LONGTASK_INIT = `(() => {
	window.__health_longtasks = [];
	try {
		new PerformanceObserver(list => {
			for (const e of list.getEntries()) window.__health_longtasks.push({ start: Math.round(e.startTime), ms: Math.round(e.duration) });
		}).observe({ type: "longtask", buffered: true });
	} catch {}
})();`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
// A page.evaluate() waits for a busy main thread; never let one hang a batch.
const within = (promise, ms, fallback) => Promise.race([promise.catch(() => fallback), sleep(ms).then(() => fallback)]);
const shot_slug = url => url.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase() || "home";

/* What the page looked like and how it behaved, beside the findings:
   { stall_ms, settled, settle_ms, shot (repo-relative path or null), unknown_verbs }. */
async function check_one(context, url){
	const page = await context.newPage();
	const findings = [];   // {verb, kind, text}
	const add = (verb, kind, text) => findings.push({ verb, kind, text: String(text ?? "") });
	const meta = { stall_ms: 0, settled: true, settle_ms: null, shot: null, unknown_verbs: 0 };
	const unknown = [];   // the text of every `JSONL: unknown verb` warning — counted as ONE finding, not one each

	page.on("console", msg => {
		const t = msg.type();
		if (t !== "error" && t !== "warning") return;
		const text = msg.text();
		if (KNOWN_CONSOLE.some(k => k.test(text))) return;
		if (/JSONL: unknown verb/.test(text)) { unknown.push(text); return; }
		add(t === "error" ? "error" : "warning", "console", text);
	});
	page.on("pageerror", err => add("error", "pageerror", err?.message || String(err)));
	page.on("requestfailed", req => {
		const u = req.url();
		if (KNOWN_REQUESTS.some(k => k.test(u))) return;
		add("error", "request", `${req.failure()?.errorText || "failed"} ${u}`);
	});
	page.on("response", res => {
		const status = res.status();
		if (status < 400) return;
		const u = res.url();
		if (KNOWN_REQUESTS.some(k => k.test(u))) return;
		add("error", "status", `${status} ${u}`);
	});

	const t0 = Date.now();
	try {
		let nav_error = null;
		await page.goto(HEALTH_BASE + url, { waitUntil: "networkidle", timeout: 15000 }).catch(e => { nav_error = e; });

		// Did it settle? One animation frame can only run on a free main thread.
		const probe = page.evaluate(() => new Promise(r => requestAnimationFrame(() => r(true))));
		let answered = await within(probe, Math.max(0, t0 + SETTLE_MS - Date.now()), false);
		meta.settle_ms = answered ? Date.now() - t0 : null;
		if (!answered){
			meta.settled = false;
			add("error", "unsettled", `the page was still busy ${SETTLE_MS / 1000} s after navigation started (its main thread never ran a frame)`);
			answered = await within(probe, 20_000, false);   // give it time to come back before measuring the rest
			if (!answered) throw new Error(`still busy ${Math.round((Date.now() - t0) / 1000)} s after navigation — gave up on the rest of this check`);
		}
		if (nav_error) throw nav_error;
		await page.waitForTimeout(1000);
		// ⚠ A routed page nests peer pages inside it (core/Page/doc/data-children.md
		// — "nested pages ARE peers via display: contents"), so a bare `.page`
		// can match several elements, including an ANCESTOR page that is idle
		// (0px, or briefly a stray size while its child routes) — that ancestor
		// matching before the real page rendered is what threw three false
		// "you broke /framework/core/Page/" alarms (2026-09-28, shared-browser).
		// `.page.active-page` — the same scope smoke.mjs's link-follower uses —
		// is the one leaf that IS the page on screen; measure only that.
		//
		// A page whose content streams in over the dev socket (JSONL.live, e.g.
		// core/Page's own Doc tab) needs longer than the 1s above once this same
		// check blocks that socket below — measured up to ~4s while it falls back
		// to a plain fetch (2026-09-28). Poll instead of a second fixed wait, so a
		// page that is already tall does not sit here.
		await page.waitForFunction(() => [...document.querySelectorAll(".page.active-page")]
			.some(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 50; }),
			{ timeout: 5000 }).catch(() => {});
		const tallest = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll(".page.active-page")]
			.map(el => el.getBoundingClientRect())
			.filter(r => r.width > 0 && r.height > 0)
			.map(r => r.height)));
		if (tallest < 50) add("error", "blank", "no .page.active-page element is drawing more than 50px tall");

		const lint = await page.evaluate(lint_findings);
		for (const f of lint) add("warning", f.kind, f.text);

		// The screenshot, at the width the owner works at; the same file is overwritten each check.
		const shot_abs = path.join(SHOTS_DIR, local_date(), shot_slug(url) + ".png");
		fs.mkdirSync(path.dirname(shot_abs), { recursive: true });
		await page.setViewportSize({ width: SHOT_WIDTH, height: SHOT_HEIGHT });
		await page.waitForTimeout(200);
		if (await within(page.screenshot({ path: shot_abs, timeout: 10_000 }).then(() => true), 12_000, false))
			meta.shot = rel_to(ROOT, shot_abs);

		// Long tasks so far — read BEFORE the padding sweep below, whose 3440 relayout is this watcher's work, not the page's.
		const tasks = await within(page.evaluate(() => window.__health_longtasks || []), 10_000, []);
		const worst = tasks.reduce((a, b) => (b.ms > (a?.ms ?? 0) ? b : a), null);
		meta.stall_ms = worst?.ms ?? 0;
		if (worst && worst.ms > STALL_MS)
			add("error", "stall", `the main thread was blocked for ${(worst.ms / 1000).toFixed(1)} s (a long task starting ${(worst.start / 1000).toFixed(1)} s after navigation; ${tasks.filter(t => t.ms > STALL_MS).length} over ${STALL_MS / 1000} s)`);

		// THE PADDING LAW, at the width that actually breaks it (padding-law,
		// 2026-09-22). This watcher's viewport is 1280 — just under the 82em
		// (1312px) breakpoint where `ext/toc`'s rail rule replaces the page
		// shell's grid and takes its two gutter tracks with it — which is why
		// the owner's own front pages sat flush against the sidebar for as long
		// as they did with this watcher running the whole time. One extra width
		// is the whole fix. The measurement itself lives in padding-check.mjs.
		for (const width of PADDING_WIDTHS){
			const pad = await check_page(page, width);
			for (const f of pad.worst)
				add("warning", "padding", `${f.gap}px from the ${f.side} of ${f.box} at ${width}px: "${f.text}"`);
		}
		await page.setViewportSize({ width: 1280, height: 900 });
	} catch (e) {
		add("error", "nav", e?.message || String(e));
	}

	// Lines that parse but fit no reader's schema (proposal-flow item 12): one finding, counted, so they can't creep back unseen.
	meta.unknown_verbs = unknown.length;
	if (unknown.length){
		const verbs = [...new Set(unknown.map(t => /unknown verb "([^"]*)" in (\S+)/.exec(t)).filter(Boolean).map(m => `"${m[1]}" in ${m[2]}`))];
		add("warning", "unknown-verb", `${unknown.length} \`JSONL: unknown verb\` warnings — ${verbs.slice(0, 5).join("; ")}${verbs.length > 5 ? "; …" : ""}`);
	}

	await page.close().catch(() => {});
	return { findings, meta };
}

/* Every changed file in this debounce window, mapped to the (at most 8) urls
   to check, each remembering which changed file(s) picked it. */
function build_batch(files){
	const map = new Map();   // url -> Set<relFile>
	for (const abs of files){
		const relFile = rel_to(ROOT, abs);
		for (const url of pages_for(abs)){
			if (!map.has(url)) map.set(url, new Set());
			map.get(url).add(relFile);
		}
	}
	return new Map([...map].slice(0, MAX_PAGES_PER_BATCH));
}

async function check_batch(files){
	const batch = build_batch(files);
	if (!batch.size) return;

	archive_sweep_if_new_day();   // a batch that lands right after midnight still sweeps once
	const day_file = today_path();
	const br = await ensure_browser();
	const context = await br.newContext({ viewport: { width: 1280, height: 900 } });
	// Block the dev socket so a checked page never keeps a live WebSocket open
	// after its context closes, and its reconnect-backoff noise never counts
	// as a console error — dev/Socket/Socket.js opens `ws://<same host>/`.
	try { await context.routeWebSocket(/.*/, ws => ws.close()); } catch {}
	await context.addInitScript(LONGTASK_INIT);

	for (const [url, triggers] of batch){
		if (KNOWN_PAGES.some(k => k.test(url))) continue;

		const was_failing = failing.get(url) === true;
		const { findings: raw, meta } = await check_one(context, url);
		const seen = new Set();   // collapse identical (kind, text) findings from this one page load
		let had_error = false;
		const error_findings = [];
		const files_arr = [...triggers];
		for (const f of raw){
			const key = f.verb + "|" + f.kind + "|" + f.text;
			if (seen.has(key)) continue;
			seen.add(key);
			if (f.verb === "error"){ had_error = true; error_findings.push(f); }
			append_line(day_file, f.verb, { at: now_iso(), url, kind: f.kind, text: f.text.slice(0, 300), file: files_arr[0], files: files_arr, shot: meta.shot });
		}
		if (had_error) {
			failing.set(url, true);
			if (!was_failing) notify_out_of_band(url, error_findings);
		} else if (failing.get(url)){
			failing.set(url, false);
			append_line(day_file, "ok", { at: now_iso(), url });
		}
		report_to_dashboard(day_file, url, files_arr, error_findings, meta);
	}

	await context.close();
}

/* ── the second report: the dashboard ────────────────────────────────────────
 * The editor already hears about a broken page through health-guard.mjs. The
 * owner reads task cards, not this log, so every check also leaves ONE line in
 * the task of the agent that made the edit — the same task.jsonl the ledger
 * hook (.claude/hooks/ledger.mjs) records that agent's edits in:
 *   {"log":{"at":…,"msg":"health: <page> — <N> console errors, stall <s> s, shot <path>"}}
 * written through .claude/hooks/append.mjs, the validated route, never a raw
 * append. When no task is known (a merge, a hand edit, a file no ledger saw),
 * the same line goes to today's health log alone, as a `log` line its reader
 * (log.js, a plain JSONL) already understands. */

const APPEND_SCRIPT = path.join(ROOT, ".claude", "hooks", "append.mjs");
const AI_DIR = path.join(PUBLIC, "framework", "ai");

const read_lines = file => {
	try { return fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } }); }
	catch { return []; }
};
// Landed the ledger's way (.claude/hooks/ledger.mjs state()): every assign line
// merged in order, so a later {"assign":{"landed_at":null}} reopens a task.
const landed = entries => !!Object.assign({}, ...entries.filter(e => e.assign).map(e => e.assign)).landed_at;

function* task_files(dir, max_depth = 3, depth = 0){
	let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const e of entries){
		if (e.isFile() && e.name === "task.jsonl") yield path.join(dir, e.name);
		else if (e.isDirectory() && depth < max_depth && e.name !== "shots" && e.name !== "node_modules" && e.name[0] !== ".") yield* task_files(path.join(dir, e.name), max_depth, depth + 1);
	}
}

/* One task.jsonl, read once per change: whether it is landed, and the newest
   ledger `action` time per file it lists. Keyed by path, re-read only when the
   file's mtime or size moves, so the full scan below costs a stat per task
   (about 900 of them, 13 MB) instead of a read. */
const task_cache = new Map();
function task_info(file){
	let st; try { st = fs.statSync(file); } catch { task_cache.delete(file); return null; }
	const hit = task_cache.get(file);
	if (hit && hit.mtime === st.mtimeMs && hit.size === st.size) return hit;
	const entries = read_lines(file);
	const files = new Map();
	for (const e of entries) for (const f of e.action?.files || []){
		const at = String(e.action.at || "");
		if (!files.has(f) || at >= files.get(f)) files.set(f, at);
	}
	const info = { mtime: st.mtimeMs, size: st.size, landed: landed(entries), files };
	task_cache.set(file, info);
	return info;
}

// The newest unlanded task among `tasks` whose action lines list rel_file.
function newest_task(tasks, rel_file){
	let best = null, best_at = "";
	for (const t of tasks){
		const info = task_info(t);
		if (!info || info.landed || !info.files.has(rel_file)) continue;
		const at = info.files.get(rel_file);
		if (!best || at >= best_at){ best = t; best_at = at; }
	}
	return best;
}

/* Which task made this edit? First the file's own folder (a file inside a task
   dir belongs to that task, the ledger's own first rule). Else the newest
   unlanded task whose ledger `action` lines list the file: today's and
   yesterday's day folders first (the quick, usual answer), then every task
   under ai/, so a task opened days ago (a foundational one runs for days) still
   gets its line. Null when nothing knows. */
function task_for(rel_file){
	let dir = path.dirname(path.join(ROOT, rel_file));
	while (dir.startsWith(AI_DIR + path.sep)){
		const t = path.join(dir, "task.jsonl");
		if (fs.existsSync(t)){ const info = task_info(t); return info && !info.landed ? t : null; }
		dir = path.dirname(dir);
	}
	const days = [local_date(), local_date(new Date(Date.now() - DAY_MS))];
	return newest_task(days.flatMap(day => [...task_files(path.join(AI_DIR, day))]), rel_file)
		?? newest_task(task_files(AI_DIR, 4), rel_file);
}

function summary(url, error_findings, meta){
	const count = kinds => error_findings.filter(f => kinds.includes(f.kind)).length;
	const parts = [`${count(["console", "pageerror"])} console errors`, `stall ${(meta.stall_ms / 1000).toFixed(1)} s`];
	if (!meta.settled) parts.push(`did not settle in ${SETTLE_MS / 1000} s`);
	const other = error_findings.filter(f => !["console", "pageerror", "stall", "unsettled"].includes(f.kind));
	if (other.length) parts.push(`${other.length} other errors (${[...new Set(other.map(f => f.kind))].join(", ")})`);
	if (meta.unknown_verbs) parts.push(`${meta.unknown_verbs} unknown-verb warnings`);
	parts.push(`shot ${meta.shot ? "/" + meta.shot.replace(/^public\//, "") : "none"}`);
	const first = error_findings[0];
	return `health: ${url} — ${parts.join(", ")}` + (first ? ` — first: ${first.kind}: ${first.text.replace(/\s+/g, " ").slice(0, 160)}` : "");
}

let lines_seq = 0;
function report_to_dashboard(day_file, url, files, error_findings, meta){
	const msg = summary(url, error_findings, meta);
	const tasks = [...new Set(files.map(task_for).filter(Boolean))];
	for (const task of tasks){
		const tmp = path.join(os.tmpdir(), `lew42-health-line-${process.pid}-${++lines_seq}.json`);
		try {
			fs.writeFileSync(tmp, JSON.stringify([{ log: { at: "NOW", msg } }]));
			execFileSync(process.execPath, [APPEND_SCRIPT, task, tmp], { cwd: ROOT, stdio: "ignore", windowsHide: true });
			console.log(`health.mjs: ${msg} → ${rel_to(ROOT, task)}`);
		} catch (e) {
			console.error(`health.mjs: append.mjs refused the line for ${rel_to(ROOT, task)} — ${e?.message || e}`);
		} finally { try { fs.unlinkSync(tmp); } catch {} }
	}
	if (!tasks.length){
		append_line(day_file, "log", { at: now_iso(), msg, url, files, shot: meta.shot });
		console.log(`health.mjs: ${msg} (no task knows ${files[0]} — health log only)`);
	}
}

/* ── out of band: a dead page must reach the owner somewhere that isn't the
   dead page ─────────────────────────────────────────────────────────────
 * The mastermind skill's own warning, quoted in this task's brief: "a warning
 * that rides the failing system is not a warning." Before this, an `error`
 * finding only ever reached the day's jsonl — real, but silent until someone
 * goes and reads it. This calls the same say.mjs the assistant tab already
 * polls, so a dead page becomes a `needs-you` card on the owner's own screen,
 * not one more line in a file nobody is looking at yet.
 *
 * Called once per url, on the transition INTO failing (see check_batch) —
 * not on every batch while still broken, so a page stuck down for an hour
 * posts one card, not one every debounce window. The steady `--id` means a
 * SECOND unrelated outage on the same url still shows up (a fresh call after
 * the `ok` transition clears the old card's failing state) while re-posting
 * the same still-broken url just evolves the same card in place.
 *
 * argv array, not a shell string — say.mjs's own doc warns that quotes,
 * dollar signs and backticks in a shell argument break; spawnSync with an
 * argv array never goes through a shell at all, so none of that applies. */
const SAY_SCRIPT = path.join(ROOT, ".claude", "skills", "every-prompt", "say.mjs");

function notify_out_of_band(url, error_findings){
	if (!fs.existsSync(SAY_SCRIPT)) return;   // this checkout predates the skill, or it moved — never throw for it
	const first = error_findings[0];
	const title = `${url} is not loading`;
	const text = first ? `${first.kind}: ${first.text}`.slice(0, 300) : "";
	const id = "health-" + url.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	try {
		execFileSync(process.execPath, [SAY_SCRIPT, "say", title, text, "--as", "health-watch", "--id", id, "--status", "needs-you", "--icon", "bug_report"], { cwd: ROOT, stdio: "ignore", windowsHide: true });
	} catch (e) {
		console.error("health.mjs: could not post the out-of-band notice —", e?.message || e);
	}
}

let last_swept_day = null;
function archive_sweep_if_new_day(){
	const d = local_date();
	if (d === last_swept_day) return;
	last_swept_day = d;
	archive_sweep();
}

/* ── watch public/ — the same fix the real dev server uses ──────────────── */

const filter = new MtimeFilter();

// A directory is never a page a browser loaded, only padding — LiveReload.js's
// own is_dir() makes the same call. ⚠ Load-bearing here, not just tidiness:
// without it, fs.watch reporting the bare PARENT DIRECTORY alongside a rename
// inside it (Windows' habit, per Server/watch.js's own doc comment) walked
// `nearest_page_url()` up from that bare dir path and matched a real page —
// `public/framework/ai/health` (this watcher's OWN log directory, appearing
// with no filename the moment health.mjs creates its first day file) mapped
// straight to `/framework/ai/`, which is exactly the self-feedback loop this
// file's own top comment promises can't happen. Measured 2026-09-19: one
// health.mjs write produced a spurious `/framework/ai/` check two batches
// later. A file that no longer exists (a genuine delete) still passes, same
// as LiveReload.js.
const is_dir = file => { try { return fs.statSync(file).isDirectory(); } catch { return false; } };

/* TEMPLATE, NOT DATA (the owner, 2026-09-30: "for log updates, that's not what
   I'm talking about. Those are just templated… It's more the template change").
   Only a file that changes how a page is BUILT triggers a check: .js/.mjs
   (page.js included), .css, .html. A .jsonl/.json/.md is data, drawn by
   templates already tested, so it never loads a page — the console says
   "data only, no check" instead, once per batch. */
const TEMPLATE_RE = /\.(m?js|css|html)$/i;
const is_template = file => TEMPLATE_RE.test(file);

const HEALTH_PREFIX = HEALTH_DIR + path.sep;
const ignored = file =>
	file.startsWith(HEALTH_PREFIX) && !is_template(file)   // this watcher's own output: day logs, archive, shots, heartbeat
	|| file.includes(path.sep + ".git" + path.sep) || file.includes("node_modules")
	|| is_dir(file);

let skipped = new Set(), skipped_timer = null;
function note_skipped(file){
	skipped.add(rel_to(ROOT, file));
	if (skipped_timer) return; // one line per window from the FIRST skip, so a steady stream of appends still prints
	skipped_timer = setTimeout(() => {
		skipped_timer = null;
		const list = [...skipped];
		skipped = new Set();
		console.log(`health.mjs: data only, no check — ${list.length} file${list.length > 1 ? "s" : ""} (${list.slice(0, 3).join(", ")}${list.length > 3 ? ", …" : ""})`);
	}, DEBOUNCE_MS);
}

// A hold longer than this stops being "mid-batch-write" and starts being
// "however this page looks right now, it's been looking that way a while" —
// so past this cap a check runs even while still held. 60s, not the hold's
// own 5-minute TTL: real edits settle in seconds, and a page that's still
// broken a full minute later is worth a finding, hold or not (safe-rollout,
// 2026-09-21 — see is_held()'s own comment for the outage this fixes).
const MAX_HOLD_DEFER_MS = 60_000;

let pending = new Set();
let timer = null;
let held_since = null;   // when the CURRENT pending batch first found itself held; null once it checks

function queue(file){
	pending.add(file);
	clearTimeout(timer);
	timer = setTimeout(tick, DEBOUNCE_MS);
}

async function tick(){
	if (!pending.size) return;
	// The hold: a sibling is mid-batch-write. Queue quietly and try again in
	// one more debounce window rather than checking a half-written page —
	// but only up to MAX_HOLD_DEFER_MS. Past that, check anyway.
	if (is_held()){
		held_since ??= Date.now();
		if (Date.now() - held_since < MAX_HOLD_DEFER_MS){
			timer = setTimeout(tick, DEBOUNCE_MS);
			return;
		}
		console.log(`health.mjs: held for over ${MAX_HOLD_DEFER_MS}ms — checking anyway.`);
	}
	held_since = null;
	const files = [...pending];
	pending.clear();
	try { await check_batch(files); }
	catch (e) { console.error("health.mjs: batch failed —", e?.message || e); }
}

function start_watch(){
	const watcher = fs.watch(PUBLIC, { recursive: true, persistent: true }, (event, name) => {
		if (!name) return;
		const file = path.join(PUBLIC, name);
		if (ignored(file)) return;
		const go = () => is_template(file) ? queue(file) : note_skipped(file);
		if (event === "rename"){ filter.remember(file); go(); }
		else filter.passes(file, ok => { if (ok) go(); });
	});
	watcher.on("error", err => console.error("health.mjs: watch error —", err?.message || err));
}

/* ── boot ─────────────────────────────────────────────────────────────── */

acquire_lock();
fs.mkdirSync(HEALTH_DIR, { recursive: true });
hydrate_failing();
archive_sweep();
last_swept_day = local_date();
setInterval(archive_sweep_if_new_day, 60 * 60 * 1000).unref();

async function shutdown(){
	try { if (browser) await browser.close(); } catch {}
	release_lock();
	process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", release_lock);

console.log(`health.mjs: watching ${PUBLIC}, checking against ${HEALTH_BASE}, log at ${rel_to(ROOT, HEALTH_DIR)}/${local_date()}.jsonl`);
start_watch();
