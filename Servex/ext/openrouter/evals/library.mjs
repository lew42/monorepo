/* library.mjs — the test library: five small tasks, each with a known good outcome, run across
 * models to find which one is cheapest and good enough for each kind of work.
 *
 * WHY (public/framework/ai/2026-09-30/openrouter-harness/test-library/requirements.md): a test
 * with ONE right answer (rules.mjs) proves a model can follow our rules; this library goes one
 * step further and asks whether a model does REAL work well — fixing a broken page, writing a new
 * one, planning before coding. There is no single right answer here, so a script alone can't grade
 * it: a script runs the test and checks what it CAN check mechanically (does the result parse,
 * does it load with no console error, did the untouched files stay untouched); a judge model reads
 * the rest and gives a rough score.
 *
 * ONE TEST = one PAGE: public/framework/ai/tests/<id>/, whose page.jsonl line 1 names
 * public/framework/ai/tests/AITest.js as its class (the same shape AI 2's card uses) and carries
 * {kind, rung, skills, prompt: "prompt.md", criteria, expected, judge, confidence}, plus a sibling
 * `fixture/` folder (Amendment 5, Phase 10 — this used to be a plain folder under evals/library/,
 * read only by this script; now anyone can open the test's own url and see its prompt, criteria
 * and every run it has had). A RUN copies that fixture/ into a fresh folder under this task's own
 * `runs/<run-name>/` and spawns one real Servex agent there (the same one-at-a-time pattern as
 * rules.mjs, for the same reason: OpenRouter's cost figure is per key, not per agent, so two
 * agents spending at once can't be told apart). For the tests that are a real page (broken-
 * overflow, broken-import, h1-page, fix-label), the run folder IS the page: `test-library/page.js`
 * has no custom `route()`, so `runs/<run>/` resolves through the ordinary `Page.child()`
 * filesystem probe the moment it has a `page.js` in it — no parent edit needed per run
 * (doc/declaring.md: "forgetting to declare costs the menu entry, not the url").
 *
 * Results: one `{"run":{...}}` line per run, appended to THAT TEST's OWN page.jsonl (not the
 * shared `evals/results.jsonl`, which rules.mjs and mastermind-servex-9's probe runner keep for
 * the rule tests and the probes only — Amendment 5 split them apart on purpose: a test's runs are
 * now part of the page that test lives on). A row carries `model`, `effort`, `pass`, `score`
 * (null until a judge scores it), `reasoning` (only when the run wrote a real decision record —
 * see checksDecision() below), `cost_usd`, `turns`, `ms`, `dir`, `mechanical`, `note`, keyed by its
 * own `run` name — a later judge-written line with the SAME `run` name merges onto it rather than
 * appearing as a second row (testRuns() below does the merge; AITest.js's browser-side `run()`
 * does the identical merge for the live page).
 *
 * usage:
 *   node Servex/ext/openrouter/evals/library.mjs --models a,b [--effort medium] [--only id] [--judge]
 *   node Servex/ext/openrouter/evals/library.mjs --route
 *   --models  comma list of model ids (required to run tests; not needed for --judge or --route).
 *   --effort  low|medium|high|xhigh|max. Default: medium (Amendment 4, Phase 9).
 *   --only    run a single test id (its folder name under public/framework/ai/tests/).
 *   --judge   instead of running tests, spawn one judge agent (claude-opus-5-5, medium effort)
 *             per test that has unscored runs. The judge reads that test's `reference.md` (writing
 *             it first, from the strong-set runs, if it doesn't exist yet — see judgeTest() below)
 *             and every unscored run, then appends one `run` line per run (merging onto the
 *             existing row) with `score` ("terrible"|"ok"|"great"), a one-line `note`, and — only
 *             for a run that wrote a real decision record — a second `reasoning` score for the
 *             THINKING, separate from the outcome (a sound decision record with a missed outcome
 *             is worth flagging).
 *   --route   recompute evals/routing.json from every test's own page.jsonl: for each test KIND,
 *             the cheapest model + effort whose runs score at least "ok", with its price
 *             multiplier (vs claude-sonnet-5) and the evidence. Nothing reads this file yet — it
 *             is the model + task matrix the owner asked for, falling out of the results as they
 *             arrive.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { provider_for, read_key } from "../provider.js";
// NOT public/framework/ai/tests/AITest.js — that class imports from "/app.js" (a browser-only
// path App.js resolves at runtime), so node can never load it. This script only ever needs the
// PLAIN DATA a test's page.jsonl line 1 carries, read directly below (loadTests()) — the class
// itself is what draws the test as a page, a job this script never does.

const MCP = "http://127.0.0.1:8090/mcp";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../.."); // Servex/ext/openrouter/evals -> repo root
const PAGES_DIR = path.join(ROOT, "public/framework/ai/tests"); // Amendment 5: an AITest is a page
const TASK_DIR = path.join(ROOT, "public/framework/ai/2026-09-30/openrouter-harness/test-library");
const RUNS_DIR = path.join(TASK_DIR, "runs");
const RESULTS_PATH = path.join(ROOT, "Servex/ext/openrouter/evals/results.jsonl");
const ROUTING_PATH = path.join(HERE, "routing.json");
const APPEND_HOOK = path.join(ROOT, ".claude/hooks/append.mjs");
// The live proxy, normally — but that proxy serves the MAIN tree (C:/Code/.../monorepo), never a
// worktree. Run this from inside a worktree (unmerged) and monorepo.localhost 404s on every run,
// because the files this script just wrote aren't there yet — only in the worktree's OWN dev
// server. `--site <url>` (or LIBRARY_SITE_BASE) points this at that server instead, e.g. the
// worktree's watcher on its own port; the default is right once this code is merged and the real
// strong/cheap-set runs happen against the live site, which is the only time it matters.
const SITE_BASE = (() => {
	const i = process.argv.indexOf("--site");
	return (i >= 0 && process.argv[i + 1]) || process.env.LIBRARY_SITE_BASE || "http://monorepo.localhost";
})();
// requirements.md's Cost rule: an OpenRouter turn's real price settles into this ledger a few
// seconds after the turn ends (provider.js's own real_turn_cost() polls the same way); a Claude
// agent's cost is real the moment wait_for_agent returns, because it is billed on the subscription.
const OR_LOG_PATH = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "lew42", "servex", "logs", "openrouter.jsonl");

const pad = n => String(n).padStart(2, "0");
export function nowLocal(){
	const d = new Date(), off = -d.getTimezoneOffset(), a = Math.abs(off);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off < 0 ? "-" : "+"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}
const slug = s => String(s).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
const sleep = ms => new Promise(r => setTimeout(r, ms));

export function appendJSON(file, obj){
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const scratch = path.join(os.tmpdir(), `library-append-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
	fs.writeFileSync(scratch, JSON.stringify([obj]));
	try {
		const r = spawnSync("node", [APPEND_HOOK, file, scratch], { cwd: ROOT, encoding: "utf8", windowsHide: true });
		if (r.status !== 0) throw new Error(`append.mjs exited ${r.status}: ${r.stderr || r.stdout}`);
	} finally { try { fs.unlinkSync(scratch); } catch {} }
}
export function readJsonl(file){
	try { return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
	catch { return []; }
}
/* A spawn past Servex's own concurrency limit (5 working agents at once, seen directly: "working
 * 5/5") comes back `queued: true` — a real id, not an error, so the old code's `if (!spawned.id)
 * throw` never caught it. `wait_for_agent` then treats a QUEUED agent as already idle (it has no
 * active turn to wait ON yet) and returns almost instantly with an empty result — `turns` unset,
 * no cost, no error — which silently recorded as a real completed run in 5-24ms (library.mjs run
 * 2026-10-01: three h1-page "failures" that were never actually run at all). The fix: when a spawn
 * reports `queued`, or a wait comes back with no `turns` at all, ask again — the real turn hasn't
 * happened yet — until either a turn actually completes or this run's own overall budget (7 min,
 * matching the old single timeout) runs out. */
export async function waitForRealTurn(spawned, budgetMs = 420_000, queueBudgetMs = 1_200_000){
	// 2026-10-01 (cheap ladder, free batch): the fix above (queued -> ask again) stopped a QUEUED
	// spawn being mistaken for an instant idle completion, but the 7-minute response budget still
	// started ticking the moment we spawned — including however long Servex's own global cap
	// (5 working agents AT ONCE, across every task on the machine, not just this batch) left the
	// run sitting in line behind unrelated agents. A run queued for 6 of its 7 minutes behind other
	// tasks' agents then got judged on 1 real minute of model response time and skipped — same
	// "never reached the model" shape as the name-collision bug, different cause (capacity, not a
	// collision). Fix: wait out the QUEUE on its own, more generous budget (20 min — this machine's
	// cap clears as other tasks finish turns, not instantly, but it does clear) before the model's
	// own 7-minute response clock starts counting at all.
	const queueDeadline = Date.now() + queueBudgetMs;
	while (spawned?.id && Date.now() < queueDeadline && await isQueued(spawned.id)) await sleep(5000);

	const deadline = Date.now() + budgetMs;
	let waited = spawned.queued ? null : await mcp("wait_for_agent", { id: spawned.id, timeout_s: 420 }, 430000);
	while ((!waited || waited.turns == null) && Date.now() < deadline){
		await sleep(3000);
		waited = await mcp("wait_for_agent", { id: spawned.id, timeout_s: 60 }, 65000);
	}
	return waited;
}

async function isQueued(id){
	try {
		// system_health's own text is "<one-line verdict>\n\n<the real JSON>" — NOT pure JSON, so
		// mcp()'s generic `JSON.parse(whole text)` always fails and falls back to `{raw: text}`,
		// which silently made the very first version of this check always return false (no queue
		// grace at all, every time) without ever throwing. Parse the JSON object out of the raw
		// text ourselves rather than trusting mcp()'s generic parse for this one tool.
		const r = await fetch("http://127.0.0.1:8090/mcp", { method: "POST",
			headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
			body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "system_health", arguments: {} } }),
			signal: AbortSignal.timeout(20000) });
		const j = await r.json();
		const text = j.result?.content?.[0]?.text ?? "";
		const brace = text.indexOf("{");
		const h = brace >= 0 ? JSON.parse(text.slice(brace)) : null;
		return !!(h?.queue || []).some(row => row.id === id);
	} catch { return false; } // can't tell -> assume it already started, fall through to the normal response wait
}

export async function mcp(name, args, ms = 30000){
	const r = await fetch(MCP, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }), signal: AbortSignal.timeout(ms) });
	const j = await r.json();
	const text = j.result?.content?.[0]?.text ?? j.error?.message ?? "";
	try { return JSON.parse(text); } catch { return { raw: text }; }
}

/* ── the tests, read from disk so adding another is just a new folder ──
 *
 * Amendment 5 (Phase 10): an AITest is a real PAGE — public/framework/ai/tests/<id>/page.jsonl,
 * line 1 naming public/framework/ai/tests/AITest.js as its class, the same shape AI 2's card
 * (`{"class": "/framework/ai2/card.js", …}`) already uses. Line 1 (minus "class") is the test's
 * data — the same fields test.json used to carry — and every later `{"run": {...}}` line is one
 * run (testRuns() below). The prompt itself lives in a sibling prompt.md, never inline in the
 * JSON, so a long prompt is easy to read and diff on its own; this is the one place that reads it
 * and hands it to the rest of the script as `test.prompt`, same as before the move. */
export function loadTests(only){
	const ids = fs.readdirSync(PAGES_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
	return ids.filter(id => !only || id === only).map(id => {
		const dir = path.join(PAGES_DIR, id);
		const lines = readJsonl(path.join(dir, "page.jsonl"));
		const { class: _class, ...line1 } = lines[0] ?? {};
		const prompt = fs.readFileSync(path.join(dir, line1.prompt || "prompt.md"), "utf8").trim();
		return { ...line1, id, kind: line1.kind, rung: line1.rung ?? null, requirements: line1.criteria ?? [],
			prompt, dir, fixtureDir: path.join(dir, "fixture") };
	});
}

/* Every `{"run": {...}}` line already on a test's own page.jsonl, latest-wins merged by its own
 * `run` name — the SAME merge AITest.js's `run()` method does in the browser (its own comment has
 * the "why"), reimplemented here in plain node because that class imports from "/app.js" and
 * can't be loaded outside a browser. Kept in sync by hand; if one changes, so does the other. */
export function testRuns(test){
	const lines = readJsonl(path.join(test.dir, "page.jsonl")).slice(1).filter(l => l.run);
	const merged = new Map();
	for (const { run } of lines){
		const key = run?.run ?? `#${merged.size}`;
		merged.set(key, { ...merged.get(key), ...run });
	}
	return [...merged.values()];
}

/* Recursive copy, fixture/ -> a fresh run dir. A plain loop, not fs.cpSync, so a future node
 * without it (or an older one) still runs this — the library is small, never thousands of files. */
/* A fixture keeps its page as page.fixture.js, so the site never loads it as a page (some are
 * broken on purpose). The copy names it page.js, which makes the run dir a real page. */
const as_run = name => name === "page.fixture.js" ? "page.js" : name;
function copyDir(from, to){
	fs.mkdirSync(to, { recursive: true });
	for (const entry of fs.readdirSync(from, { withFileTypes: true })){
		const src = path.join(from, entry.name), dst = path.join(to, as_run(entry.name));
		if (entry.isDirectory()) copyDir(src, dst);
		else fs.copyFileSync(src, dst);
	}
}
function allFiles(dir){
	const out = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })){
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...allFiles(p));
		else out.push(p);
	}
	return out;
}
function sha256(file){ try { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); } catch { return null; } }

/* ── mechanical checks: everything a script CAN tell, never a judgment call ── */

/* Every .js file in the run dir parses — `node --check`, the same first line every edit in this
 * repo gets (CLAUDE.md's "Never" list). One failure is enough to fail the whole run: a page that
 * doesn't parse doesn't load, whatever else it got right. */
export function checksParse(runDir){
	const bad = [];
	for (const f of allFiles(runDir).filter(f => f.endsWith(".js"))){
		const r = spawnSync("node", ["--check", f], { encoding: "utf8", windowsHide: true });
		if (r.status !== 0) bad.push(path.relative(runDir, f) + ": " + (r.stderr || "").split("\n")[0]);
	}
	return { ok: bad.length === 0, bad };
}

/* The run's own page, loaded headless, with no console error — the smoke test every page on this
 * site gets (probe-tasks.md's own checklist, item 2). `browser.mjs` is the one way this repo opens
 * Chromium (never a second one — CLAUDE.md law 6), imported by its real file:// url because it is
 * resolved relative to THIS module, not the run dir. Runs only if the run dir (still) has a
 * page.js — plan-counter never does, and that's fine: there's nothing to load. */
export async function checksLoadClean(runUrl){
	const { browser } = await import(pathToFileURL(path.join(ROOT, "Server/browser.mjs")).href);
	const b = await browser();
	const page = await (await b.newContext()).newPage();
	const errors = [];
	page.on("pageerror", e => errors.push(e.message));
	page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
	try {
		await page.goto(runUrl, { waitUntil: "load", timeout: 20000 });
		await page.waitForTimeout(1200);
		const text = await page.evaluate(() => document.querySelector(".page.active-page")?.innerText ?? null);
		await page.close();
		return { ok: errors.length === 0 && text != null, errors, text: text?.slice(0, 2000) ?? null };
	} catch (e) {
		try { await page.close(); } catch {}
		return { ok: false, errors: [...errors, String(e?.message || e)], text: null };
	}
}

/* Which files in the run dir differ from the fixture it started as — the mechanical half of "did
 * it touch only what it was supposed to". A file the run ADDED (not in the fixture at all) is
 * listed separately: expected for new-page-glossary, a red flag for fix-label. task.jsonl is the
 * run's own log, never part of the fixture, so it is always excluded from this diff. */
export function diffFromFixture(fixtureDir, runDir){
	const before = new Map(allFiles(fixtureDir).map(f => [path.join(path.dirname(path.relative(fixtureDir, f)), as_run(path.basename(f))), sha256(f)]));
	const after = new Map(allFiles(runDir).filter(f => path.basename(f) !== "task.jsonl").map(f => [path.relative(runDir, f), sha256(f)]));
	const changed = [], added = [], removed = [];
	for (const [rel, hash] of before) { if (!after.has(rel)) removed.push(rel); else if (after.get(rel) !== hash) changed.push(rel); }
	for (const rel of after.keys()) if (!before.has(rel)) added.push(rel);
	return { changed, added, removed };
}

/* A real decision record, written through Server/decide.mjs — checked for EVERY run, not just
 * plan-views: Phase 4's `reasoning` score (item 3) applies to any run that wrote one, and a model
 * asked to fix a page is free to think out loud with a decision record too. `decide.logged()`
 * reads a log the same way the decide CLI does, so this is the exact same truth a `decide show`
 * call would print — never a parallel reader of the file.
 *
 * Checks EVERY `.jsonl` in the run dir, not just task.jsonl: decide.mjs's own `--file` usage
 * example targets `<page.jsonl>`, not a fixed name, so there is no single canonical target —
 * a run is free to log its decision into task.jsonl, page.jsonl, or its own decisions.jsonl.
 * (Found the hard way: plan-views's first real runs wrote valid decisions into page.jsonl and
 * decisions.jsonl respectively, and a task.jsonl-only check scored both as FAIL.) */
export async function checksDecision(runDir){
	const decide = await import(pathToFileURL(path.join(ROOT, "Server/decide.mjs")).href);
	const logs = fs.readdirSync(runDir).filter(n => n.endsWith(".jsonl"));
	const decisions = logs.flatMap(name => [...decide.logged(path.join(runDir, name)).values()]);
	const d = decisions.find(d => (d.options?.length ?? 0) >= 2 && d.recommended);
	return { ok: !!d, decisions_found: decisions.length, options: d?.options?.length ?? 0, recommended: d?.recommended ?? null };
}

/* A new-page test's (h1-page, and any future one) extra check: is the new child actually LINKED
 * from its parent — either by hand (`child` added to `children:`) or through `create_page` (which
 * does the same thing for you, per the new-page skill). Plain text search, not a parse: good
 * enough for one word in one small file, and avoids importing the parent as a live module just to
 * ask this. */
export function checksLinked(runDir, child){
	const parent = path.join(runDir, "page.js");
	if (!fs.existsSync(parent)) return { ok: false, why: "fixture's own page.js is gone" };
	const text = fs.readFileSync(parent, "utf8");
	const re = new RegExp(`children\\s*:[^,}]*\\b${child}\\b`);
	const ok = re.test(text);
	return { ok, why: ok ? `${child} is in children:` : `${child} not found in parent's children:` };
}

/* The other half of a new-page test: does the CHILD page itself render the exact H1 text the test
 * asked for? Loaded headless at the child's own url (not the parent's — the parent is checked
 * separately by checksLinked above, and by the generic checksLoadClean on the run dir's own page). */
export async function checksH1(childUrl, expectedText){
	const { browser } = await import(pathToFileURL(path.join(ROOT, "Server/browser.mjs")).href);
	const b = await browser();
	const page = await (await b.newContext()).newPage();
	const errors = [];
	page.on("pageerror", e => errors.push(e.message));
	try {
		await page.goto(childUrl, { waitUntil: "load", timeout: 20000 });
		await page.waitForTimeout(1200);
		// ANY h1 (or the core page-title, which core renders AS an h1) on the page matching
		// exactly — not just the first one. A page can have more than one (core's own title from
		// `title:`, plus a model's own explicit `h1(...)` call), and the first in document order
		// is often core's title, not the one the test actually asked for.
		const { found, all } = await page.evaluate(expected => {
			const texts = [...document.querySelectorAll(".page.active-page h1, .page.active-page .page-title")].map(e => e.textContent?.trim() ?? "");
			return { found: texts.includes(expected), all: texts };
		}, expectedText);
		await page.close();
		return { ok: found, found: all, errors, why: found ? "an H1 matched exactly" : `H1s on the page were ${JSON.stringify(all)}, wanted ${JSON.stringify(expectedText)} among them` };
	} catch (e) {
		try { await page.close(); } catch {}
		return { ok: false, found: null, errors: [...errors, String(e?.message || e)], why: "the child page did not load" };
	}
}

/* requirements.md's Cost rule: never read `wait_for_agent`'s own `cost` for an OpenRouter model —
 * it is 0 until billing settles a few seconds after the turn ends (provider.js, real_turn_cost()).
 * The honest number is the ledger `Agents.js` writes once it DOES settle: one line per turn, keyed
 * by agent id, in `openrouter.jsonl`. Polled up to 40s, same as provider.js's own poll. A Claude
 * model (`provider_for(model) === "anthropic"`) skips all of this — its cost is real immediately,
 * because it is billed on the subscription, not through this ledger at all. */
export async function resolveCost(model, agentId, waitedCost){
	if (provider_for(model) !== "openrouter") return waitedCost ?? null;
	for (let i = 0; i < 20; i++){
		const lines = readJsonl(OR_LOG_PATH).filter(l => l.agent === agentId);
		if (lines.length) return +lines.reduce((s, l) => s + (Number(l.cost_usd) || 0), 0).toFixed(6);
		await sleep(2000);
	}
	return null; // never settled in 40s — recorded as unknown, not zero (a silent zero would look free)
}

/* OpenRouter's own daily free-request counter (GET /key, `data.free_model_daily_requests.used`) —
 * read fresh each call, never cached, since it's only ever used as a before/after delta around one
 * run. A failed read (no key, network hiccup) returns null rather than throwing: this is a diagnostic
 * extra, never something a run's pass/fail should hinge on. */
async function freeRequestsUsed(){
	try {
		const res = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${read_key()}` } });
		if (!res.ok) return null;
		const used = (await res.json())?.data?.free_model_daily_requests?.used;
		return typeof used === "number" ? used : null;
	} catch { return null; }
}

/* ── one test, one model, one run ── */

async function runOne(test, model, effort){
	const runName = `${test.id}-${slug(model)}-${effort}-${Date.now()}`;
	const runDir = path.join(RUNS_DIR, runName);
	const runUrlPath = `/framework/ai/2026-09-30/openrouter-harness/test-library/runs/${runName}/`;
	copyDir(test.fixtureDir, runDir);

	const isPage = fs.existsSync(path.join(runDir, "page.js"));
	const orient = isPage
		? `This folder is a real page on the live site: ${SITE_BASE}${runUrlPath} — open it (your site tools, or just read the files) before you answer. `
		: "";
	const prompt = orient + test.prompt;

	const t0 = Date.now();
	const freeBefore = await freeRequestsUsed();
	let spawned, waited, note = "", firstTurnMs = null;
	try {
		spawned = await mcp("spawn_agent", {
			// 2026-10-01 (the cheap ladder): the name used to be plain `lib-${test.id}`, reused by
			// EVERY model that ran this same test. Running three models back to back under that one
			// name did not give each a fresh agent — Servex found the earlier, not-yet-dead agent
			// under that same name and fed it the new prompt as a continuation, instead of a clean
			// spawn. The result: two of three runs recorded as a confident "mechanical FAIL" with
			// turns:null, cost:null (they never reached a model at all — OpenRouter's own /key
			// free_model_daily_requests was unchanged), while the third model's real work landed late,
			// under the WRONG run's id, well after that run had already given up and been scored.
			// A name unique per run (model + timestamp, same shape runName already has) means every
			// run gets its own agent, every time — no two runs can ever collide under one id again.
			role: "minion", name: `lib-${test.id}-${slug(model)}-${Date.now()}`, prompt, model, effort, cwd: ROOT,
			permission_mode: "bypassPermissions",
			task: { dir: path.relative(ROOT, runDir).replaceAll("\\", "/") }
		});
		if (!spawned.id) {
			const why = String(spawned.raw || spawned.why || "spawn_agent did not return an id");
			// The spend cap refusing a spawn is not a model attempt at anything — it never ran, so
			// it must never become a `{"run": {...}}` row (the owner, 2026-10-01: a refused h1-page
			// spawn showed up on the test page as a real "FAIL", which is a lie about what happened).
			// No page.jsonl line, no mechanical checks; just the empty run dir cleaned up and a
			// `skipped` result the caller logs and leaves out of every table.
			if (/spend|cap/i.test(why) && /refused/i.test(why)) {
				fs.rmSync(runDir, { recursive: true, force: true });
				return { skipped: true, test: test.id, model, effort, reason: why };
			}
			throw new Error(why);
		}
		const t1 = Date.now();
		waited = await waitForRealTurn(spawned);
		if (waited?.turns != null) firstTurnMs = Date.now() - t1;
	} catch (e) {
		note = `run failed: ${String(e?.message || e).slice(0, 300)}`;
	} finally {
		if (spawned?.id) try { await mcp("stop_agent", { id: spawned.id }, 20000); } catch {}
	}
	// SAME RULE AS THE SPEND-CAP REFUSAL ABOVE: `waitForRealTurn`'s own budget ran out with the
	// agent never once producing a turn (not "it tried and failed" — it never got a turn at all,
	// same Servex-queueing gap the comment on the spawn above explains). Recording that as a model
	// "FAIL" is the exact lie the owner flagged on 2026-10-01 — delete the run dir, skip it.
	if (spawned?.id && waited?.turns == null && !note) {
		fs.rmSync(runDir, { recursive: true, force: true });
		return { skipped: true, test: test.id, model, effort, reason: "spawned but never produced a real turn within its budget (Servex queue, not a model failure)" };
	}
	const ms = Date.now() - t0;
	const cost_usd = spawned?.id ? await resolveCost(model, spawned.id, waited?.cost) : null;
	// Phase 19 (phases.md line 213): per-run timing + OpenRouter rate-limit signal. `firstTurnMs` is
	// the closest this layer can get to "time to first token" — this script only ever sees Servex's
	// own wait_for_agent polling, never the raw HTTP exchange the `claude` child process has with
	// OpenRouter (that happens inside the Claude Agent SDK's own process, with no hook this repo owns
	// to read its request/response log) — so a real per-request HTTP status / retry-after is NOT
	// something this script can honestly report; this is said here instead of guessing a number.
	// What IS real and checkable: OpenRouter's own `/key` free-model counter, read before and after —
	// a free run that used zero of its own quota is exactly the "never reached the model" case above,
	// caught a second, independent way.
	const freeAfter = provider_for(model) === "openrouter" ? await freeRequestsUsed() : null;
	const rate = {
		ms_total: ms, ms_to_first_turn: firstTurnMs,
		free_requests_used_delta: (freeBefore != null && freeAfter != null) ? freeAfter - freeBefore : null,
	};

	// Mechanical checks — what a script can tell, kind by kind (requirements.md deliverable 2).
	const parse = checksParse(runDir);
	const load = isPage ? await checksLoadClean(`${SITE_BASE}${runUrlPath}`) : { ok: true, errors: [], text: null };
	const diff = diffFromFixture(test.fixtureDir, runDir);
	const decision = await checksDecision(runDir); // every kind — Phase 4's `reasoning` score reads this
	const linked = test.kind === "new-page" ? checksLinked(runDir, test.new_child) : null;
	const h1 = (test.kind === "new-page" && test.new_child && test.h1_text)
		? await checksH1(`${SITE_BASE}${runUrlPath}${test.new_child}/`, test.h1_text) : null;

	const mechanicalOk = parse.ok && load.ok
		&& (test.kind !== "planning" || decision.ok)
		&& (test.kind !== "new-page" || (linked.ok && (!h1 || h1.ok)));
	const pass = mechanicalOk ? 1 : 0;
	if (!note) note = mechanicalOk ? "mechanical checks passed; awaiting judge" : [
		!parse.ok && `parse failed: ${parse.bad.join("; ")}`,
		!load.ok && `load not clean: ${load.errors.slice(0, 2).join("; ") || "no active-page rendered"}`,
		test.kind === "planning" && !decision.ok && "no valid decision found (need >=2 options and a recommendation)",
		test.kind === "new-page" && linked && !linked.ok && linked.why,
		test.kind === "new-page" && h1 && !h1.ok && h1.why,
	].filter(Boolean).join(" | ");

	const row = {
		at: nowLocal(), run: runName, probe: test.id, test: test.id, kind: test.kind, rung: test.rung ?? null,
		model, effort, dir: path.relative(ROOT, runDir).replaceAll("\\", "/"),
		pass, label: {}, score: null, reasoning: null, cost_usd, turns: waited?.turns ?? null, ms,
		mechanical: { parse: parse.ok, load_clean: load.ok, diff, decision, linked, h1 },
		rate, note
	};
	// Amendment 5: a run lands on the TEST's own page.jsonl now, not the shared results.jsonl —
	// results.jsonl keeps only the rule tests and the probes (a different harness, rules.mjs's own
	// fence). `run` doubles as the merge key AITest.js's browser-side run() uses, so a later
	// {"run": {"run": "<same name>", "score": …}} line from --judge updates this same row instead
	// of appearing as a second one.
	appendJSON(path.join(test.dir, "page.jsonl"), { run: row });
	return row;
}

/* ── --judge: one opus pass per test, scoring every run that has none yet ── */

const JUDGE_MODEL = "claude-opus-5-5", JUDGE_EFFORT = "medium";
const STRONG_SET = ["claude-opus-5-5", "claude-sonnet-5", "openai/gpt-6-sol", "google/gemini-3.1-pro-preview"];

function unscored(test){
	return testRuns(test).filter(p => p && !p.judge_score && (p.score === null || p.score === undefined));
}

async function judgeTest(test){
	const runs = unscored(test);
	if (!runs.length) return null;
	const referencePath = path.join(test.dir, "reference.md");
	const haveReference = fs.existsSync(referencePath);
	const strongRuns = testRuns(test).filter(p => STRONG_SET.includes(p.model));
	const needReference = !haveReference && strongRuns.length >= 3;

	const runList = runs.map(r =>
		`- run "${r.run}" — model ${r.model}, dir ${r.dir}/ (task.jsonl is its own log; wrote a decision record: ${r.mechanical?.decision?.ok ? "yes — also give it a \"reasoning\" score" : "no"})`
	).join("\n");

	const prompt = [
		`You are judging one test from the openrouter test library: "${test.id}" (kind: ${test.kind}).`,
		`The test's prompt was: ${JSON.stringify(test.prompt)}`,
		`Its requirements (what a GOOD answer covers):\n${test.requirements.map(r => "- " + r).join("\n")}`,
		needReference
			? `No reference exists yet. First read all ${strongRuns.length} strong-model runs for this test (${strongRuns.map(r => `${r.model}: ${r.dir}/`).join(", ")}) and write ${path.relative(ROOT, referencePath).replaceAll("\\", "/")}: the key elements at least 3 of the 4 agree on (most important first), what they disagree on, and the agreement rate (e.g. "3/4 agreed"). If fewer than 3 agree on enough to call it a reference, write that in the file instead of inventing one, and say why.`
			: haveReference ? `Read the existing reference at ${path.relative(ROOT, referencePath).replaceAll("\\", "/")} and score against it.`
				: `No reference exists and not enough strong-model runs are in yet to build one — score each run directly against the requirements above instead.`,
		`Then, for EACH of these runs, read what it actually produced (its folder's files, and its task.jsonl log) and score it "terrible", "ok" or "great" against ${needReference || haveReference ? "the reference" : "the requirements"}. A run that missed the key elements is terrible or ok, never great.`,
		`ALSO score each of the test's own criteria separately, 0 to 1 (0 = not done at all, 1 = fully done), as "criteria_scores": one entry per criterion listed above, in the same order, each {"criterion": "<the criterion text, verbatim>", "score": 0..1}. "credit" is the mean of those scores (Amendment 6, Phase 11, item 1 — partial credit, so a run that got 4 of 5 criteria right outscores one that got 1 of 5, even if both ended up "ok" overall).`,
		`A run marked above as having written a decision record ALSO gets a second, separate score: "reasoning" — terrible/ok/great for the THINKING in that decision record (real options, real pros and cons, a reasoned pick), independent of whether the outcome itself worked. A sound decision record attached to a run whose outcome still missed is worth flagging, not averaged away.`,
		runList,
		`Write your scores by appending, for EACH run, one line to ${path.relative(ROOT, path.join(test.dir, "page.jsonl")).replaceAll("\\", "/")} (THIS test's own page, not results.jsonl — Amendment 5 moved it) through the house method — write a JSON array in a scratch file and run \`node .claude/hooks/append.mjs ${path.relative(ROOT, path.join(test.dir, "page.jsonl")).replaceAll("\\", "/")} <scratch file>\` from the repo root, never a shell redirect or the Write/Edit tool on the .jsonl itself. Each line is exactly, with the SAME "run" name the run already has (it merges onto that run's existing row — omit "reasoning"/"reasoning_note" entirely for a run with no decision record):`,
		`{"run":{"at":"NOW","run":"<the run name above>","model":"<that run's model>","judge_score":true,"score":"terrible"|"ok"|"great","note":"<one sentence why>","credit":0.0,"criteria_scores":[{"criterion":"<text>","score":0.0}],"reasoning":"terrible"|"ok"|"great","reasoning_note":"<one sentence why>"}}`,
		`Append one line per run, nothing else. Then reply with just "done".`,
	].join("\n\n");

	const spawned = await mcp("spawn_agent", {
		role: "minion", name: `judge-${test.id}`, prompt, model: JUDGE_MODEL, effort: JUDGE_EFFORT, cwd: ROOT,
		permission_mode: "bypassPermissions",
		task: { dir: path.relative(ROOT, path.join(RUNS_DIR, `judge-${test.id}-${Date.now()}`)).replaceAll("\\", "/") }
	});
	if (!spawned.id) throw new Error(spawned.raw || spawned.why || "judge spawn_agent did not return an id");
	const waited = await waitForRealTurn(spawned, 300_000);
	try { await mcp("stop_agent", { id: spawned.id }, 20000); } catch {}
	return { test: test.id, runs_judged: runs.length, judge_cost: waited?.cost ?? null, wrote_reference: needReference };
}

/* ── price as a multiple of claude-sonnet-5 (Phase 4 item 1) ── */

let pricesCache = null;
/* OpenRouter's public catalog, `GET /v1/models` — no key needed, so this never risks the OpenRouter
 * spend guard. Cached once per process. A model this repo calls WITHOUT a `/` (a Claude id, billed
 * on the subscription) is still looked up here under `anthropic/<id>`, because OpenRouter lists
 * Anthropic's own models too — this is only ever used for the PRICE comparison, never to route
 * Claude traffic through OpenRouter (CLAUDE.md: Claude stays on the subscription). */
async function fetchPrices(){
	if (pricesCache) return pricesCache;
	const map = new Map();
	try {
		const res = await fetch("https://openrouter.ai/api/v1/models");
		if (res.ok){
			const body = await res.json();
			for (const m of body?.data ?? []){
				const p = Number(m?.pricing?.prompt);
				if (m?.id && Number.isFinite(p)) map.set(m.id, p);
			}
		}
	} catch {} // offline, or OpenRouter down — multipliers just read "n/a" below, nothing fails
	pricesCache = map;
	return map;
}
const orCatalogId = model => model.includes("/") ? model : `anthropic/${model}`;
function multiplierFor(model, prices, sonnetPrice){
	const p = prices.get(orCatalogId(model));
	if (p == null || !sonnetPrice) return null;
	return +(p / sonnetPrice).toFixed(3);
}

/* ── --route: the model + task matrix, recomputed from every test's own page.jsonl (Amendment 5
 *    moved the runs off results.jsonl; Phase 4 item 2 is otherwise unchanged) ── */

async function buildRoutingTable(){
	const tests = loadTests();
	// Each test's testRuns() already merges by run name within that test; a run name is unique to
	// its own test (library.mjs builds it from the test id), so flattening across tests next to
	// each other is still one row per real run, never a collision.
	const rows = tests.flatMap(test => testRuns(test).map(r => ({ ...r, test: test.id })));

	// Newest line per model x effort x test wins — a later run (or a later judge pass scoring an
	// older run) is always the truth, never averaged with a stale one.
	const latest = new Map();
	for (const r of rows){
		if (!r.test || !r.model || !r.effort) continue;
		const key = `${r.test}|${r.model}|${r.effort}`;
		const prev = latest.get(key);
		if (!prev || String(r.at) > String(prev.at)) latest.set(key, r);
	}

	const prices = await fetchPrices();
	const sonnetPrice = prices.get(orCatalogId("claude-sonnet-5")) ?? null;

	const byKind = {};
	for (const r of latest.values()){
		const test = tests.find(t => t.id === r.test);
		if (test) (byKind[test.kind] ??= []).push(r);
	}

	const routing = {};
	for (const [kind, runs] of Object.entries(byKind)){
		const okRuns = runs.filter(r => r.score === "ok" || r.score === "great");
		if (!okRuns.length){ routing[kind] = { model: null, effort: null, why: "no run has scored ok or great yet" }; continue; }
		const groups = new Map();
		for (const r of okRuns){
			const key = `${r.model}|${r.effort}`;
			(groups.get(key) ?? groups.set(key, []).get(key)).push(r);
		}
		let best = null;
		for (const [key, evidence] of groups){
			const [model, effort] = key.split("|");
			const multiplier = multiplierFor(model, prices, sonnetPrice);
			const avgCost = evidence.reduce((s, r) => s + (r.cost_usd || 0), 0) / evidence.length;
			// Rank by the real price multiplier when the catalog knows it; fall back to this
			// library's own measured average cost (still real money, just less precise than the
			// catalog's per-token figure) when the model isn't in the public catalog yet.
			const rank = multiplier ?? avgCost;
			const candidate = { model, effort, multiplier, avg_cost_usd: +avgCost.toFixed(4), evidence: evidence.map(r => ({ run: r.run, score: r.score })) };
			if (!best || rank < best._rank) best = { ...candidate, _rank: rank };
		}
		delete best._rank;
		routing[kind] = best;
	}

	fs.writeFileSync(ROUTING_PATH, JSON.stringify({ at: nowLocal(), sonnet_price_known: sonnetPrice != null, routing }, null, "\t") + "\n");
	return routing;
}

/* ── Amendment 6 (Phase 11): is the test a good test? Computed from runs already in, no reruns ── */

/* Spearman rank correlation, -1 to 1: ranks both lists, then runs Pearson on the ranks (the
 * standard trick — Spearman IS Pearson-on-ranks). Tied values share the average of their ranks.
 * null with fewer than 2 pairs (nothing to correlate) or zero variance in either list (every
 * model scored the same — "does X track Y" has no answer when X never moves). */
function spearman(pairs){
	if (pairs.length < 2) return null;
	const rank = values => {
		const sorted = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
		const ranks = new Array(values.length);
		for (let i = 0; i < sorted.length; ){
			let j = i;
			while (j < sorted.length && sorted[j][0] === sorted[i][0]) j++;
			const avgRank = (i + j - 1) / 2 + 1; // 1-based, averaged across the tied run
			for (let k = i; k < j; k++) ranks[sorted[k][1]] = avgRank;
			i = j;
		}
		return ranks;
	};
	const rx = rank(pairs.map(p => p[0])), ry = rank(pairs.map(p => p[1]));
	const n = pairs.length;
	const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
	const mx = mean(rx), my = mean(ry);
	let cov = 0, vx = 0, vy = 0;
	for (let i = 0; i < n; i++){ cov += (rx[i] - mx) * (ry[i] - my); vx += (rx[i] - mx) ** 2; vy += (ry[i] - my) ** 2; }
	if (!vx || !vy) return null; // one list never varies — no correlation to report
	return +(cov / Math.sqrt(vx * vy)).toFixed(3);
}

/* Amendment 6 item 2: does a test's credit track each model's OVERALL strength (its mean credit
 * on every OTHER test)? One pair per model that ran this test AND at least one other test — a
 * model that only ever ran this one test has no "strength elsewhere" to compare against, so it's
 * dropped before the fewer-than-4 check, not counted toward it. */
function computeDiscrimination(test, allTests){
	const here = testRuns(test).filter(r => r.credit != null);
	const byModelHere = new Map();
	for (const r of here) (byModelHere.get(r.model) ?? byModelHere.set(r.model, []).get(r.model)).push(r.credit);

	const pairs = [];
	for (const [model, credits] of byModelHere){
		const elsewhere = allTests.filter(t => t.id !== test.id).flatMap(t => testRuns(t).filter(r => r.model === model && r.credit != null).map(r => r.credit));
		if (!elsewhere.length) continue;
		const hereCredit = credits.reduce((s, c) => s + c, 0) / credits.length;
		const strength = elsewhere.reduce((s, c) => s + c, 0) / elsewhere.length;
		pairs.push([hereCredit, strength]);
	}
	if (pairs.length < 4) return null; // "fewer than 4 models means null — not enough runs"
	return spearman(pairs);
}

/* Phase 16 (the owner, 2026-10-01): differentiation — how widely THIS test's scores spread
 * across the models that ran it (the standard deviation of each model's own mean credit on this
 * test), scaled by max(0, discrimination) once discrimination is known. The scaling matters: a
 * test that spreads models out but the WRONG way round (weak models scoring higher than strong
 * ones) shouldn't be rewarded for that spread — differentiation is the strongest reason to run a
 * test on MORE models (wide spread = this test tells models apart), but only once discrimination
 * has confirmed the spread points the right direction. null until discrimination is (same >=4-
 * model floor), and also null with fewer than 2 models' worth of credit to spread across. */
function computeDifferentiation(test, discrimination){
	if (discrimination == null) return null;
	const byModel = new Map();
	for (const r of testRuns(test).filter(r => r.credit != null))
		(byModel.get(r.model) ?? byModel.set(r.model, []).get(r.model)).push(r.credit);
	const means = [...byModel.values()].map(cs => cs.reduce((s, c) => s + c, 0) / cs.length);
	if (means.length < 2) return null;
	const mean = means.reduce((s, v) => s + v, 0) / means.length;
	const stddev = Math.sqrt(means.reduce((s, v) => s + (v - mean) ** 2, 0) / means.length);
	return +(stddev * Math.max(0, discrimination)).toFixed(3);
}

/* weight = differentiation × confidence (Phase 16 — replaces Amendment 6's max(0, discrimination)
 * × confidence; differentiation already folds discrimination in, floored the same way, so this
 * subsumes it rather than sitting beside it). null differentiation (not enough models yet) means
 * weight stays 0, not unknown — "not enough signal yet" and "zero weight" read the same to a
 * reader deciding whether to trust this test, and 0 is the safer default. Also the pass rate,
 * labelled per Amendment 6: ~100% is "floor" (every model should pass this easily — rung 1
 * territory), ~0% is "review the test" (maybe nobody could pass it, which points at the TEST). */
function passRateLabel(rate){
	if (rate >= 0.9) return "floor";
	if (rate <= 0.1) return "review the test";
	return null;
}
function computeMeta(test, allTests){
	const runs = testRuns(test);
	const passRuns = runs.filter(r => r.pass != null);
	const pass_rate = passRuns.length ? passRuns.filter(r => r.pass === 1 || r.pass === true).length / passRuns.length : null;
	const discrimination = computeDiscrimination(test, allTests);
	const differentiation = computeDifferentiation(test, discrimination);
	const confidence = test.confidence ?? 0;
	const weight = differentiation != null ? +(differentiation * confidence).toFixed(3) : 0;
	return { pass_rate, pass_rate_label: pass_rate != null ? passRateLabel(pass_rate) : null, discrimination, differentiation, weight };
}

/* Recomputes every test's meta and writes it as one `{"meta": {...}}` line per test — a NEW verb
 * on AITest.js, same shape as `run`, latest-wins (no history needed, just the current numbers).
 * Called from --route (the natural "recompute from whatever's landed" trigger) and after --judge,
 * since a judge pass is exactly when new `credit` values arrive for this to chew on. */
async function recomputeAllMeta(){
	const tests = loadTests();
	const results = [];
	for (const test of tests){
		const meta = computeMeta(test, tests);
		appendJSON(path.join(test.dir, "page.jsonl"), { meta });
		results.push({ test: test.id, ...meta });
	}
	return results;
}

/* Amendment 6 item 3: `--review <slug>` — up to 3 FAILED runs, re-read by a judge, asked "was
 * this actually mostly right?" Two or more "yes" means the criteria are too strict: the judge
 * lowers confidence itself (a plain `{"confidence": <lower number>}` line — Log.js's set() just
 * assigns a key with no method of that name, so this is a normal data update, latest-wins) and
 * says which criterion to loosen, as a `{"review": {...}}` line per run read. */
async function reviewTest(slug){
	const [test] = loadTests(slug);
	if (!test) throw new Error(`no test "${slug}" under ${PAGES_DIR}`);
	const failed = testRuns(test).filter(r => r.pass === 0 || r.pass === false).slice(0, 3);
	if (!failed.length) return { test: slug, reviewed: 0, note: "no failed runs to review" };

	const prompt = [
		`You are doing a NEAR-MISS REVIEW of the test "${test.id}" (kind: ${test.kind}) from the openrouter test library — not scoring a new run, checking whether the TEST ITSELF is too strict.`,
		`Its criteria:\n${test.requirements.map(r => "- " + r).join("\n")}`,
		`These ${failed.length} runs were marked FAILED by the mechanical checks. For EACH one, read what it actually produced (its folder's files, dir: ${failed.map(r => r.dir).join(", ")}) and judge: was this run ACTUALLY mostly right, just tripped up by one strict or ambiguous criterion? Or was it a real miss?`,
		`Append one line per run to ${path.relative(ROOT, path.join(test.dir, "page.jsonl")).replaceAll("\\", "/")} through \`node .claude/hooks/append.mjs <that file> <scratch file>\`, never a direct write:`,
		`{"review":{"at":"NOW","run":"<run name>","mostly_right":true|false,"which_criterion":"<the criterion text that tripped it up, or null>","note":"<one sentence why>"}}`,
		`Then, if 2 OR MORE of the ${failed.length} runs got mostly_right:true, the test is too strict: append ONE more line lowering confidence (pick a number clearly below its current value, ${test.confidence ?? 0}) and saying why:`,
		`{"confidence": <new lower number, 0 to 1>}`,
		`{"log":"lowered confidence: <which criterion to loosen, and why>"}`,
		`If fewer than 2 got mostly_right:true, write nothing else — the failures are real. Then reply with just "done".`,
	].join("\n\n");

	const spawned = await mcp("spawn_agent", {
		role: "minion", name: `review-${test.id}`, prompt, model: JUDGE_MODEL, effort: JUDGE_EFFORT, cwd: ROOT,
		permission_mode: "bypassPermissions",
		task: { dir: path.relative(ROOT, path.join(RUNS_DIR, `review-${test.id}-${Date.now()}`)).replaceAll("\\", "/") }
	});
	if (!spawned.id) throw new Error(spawned.raw || spawned.why || "review spawn_agent did not return an id");
	const waited = await waitForRealTurn(spawned, 300_000);
	try { await mcp("stop_agent", { id: spawned.id }, 20000); } catch {}
	return { test: slug, reviewed: failed.length, review_cost: waited?.cost ?? null };
}

/* ── cli ── */

function parseArgs(argv){
	const flag = name => { const i = argv.indexOf(name); return i < 0 ? null : argv[i + 1]; };
	const models = (flag("--models") || "").split(",").map(s => s.trim()).filter(Boolean);
	const effort = flag("--effort") || "medium"; // Amendment 4 (Phase 9): medium is the default now;
	// low/high/min/max are for proving a borderline test discriminates, never a sweep.
	const only = flag("--only");
	const judge = argv.includes("--judge");
	const route = argv.includes("--route");
	const review = flag("--review"); // Amendment 6 item 3: a test slug, or null if not given
	return { models, effort, only, judge, route, review };
}

async function printTable(rows){
	const prices = await fetchPrices();
	const sonnetPrice = prices.get(orCatalogId("claude-sonnet-5")) ?? null;
	console.log("\ntest                 model                          effort  pass  price×sonnet  $          ms      note");
	for (const r of rows){
		const mult = multiplierFor(r.model, prices, sonnetPrice);
		console.log([
			r.test.padEnd(20), r.model.padEnd(30), r.effort.padEnd(6),
			(r.pass ? "PASS" : "FAIL").padEnd(5), (mult != null ? mult + "×" : "n/a").padEnd(13),
			String(r.cost_usd ?? "?").padEnd(10), String(r.ms).padEnd(7), r.note
		].join(" "));
	}
}

async function main(){
	const { models, effort, only, judge, route, review } = parseArgs(process.argv.slice(2));

	if (review){
		const r = await reviewTest(review);
		console.log(JSON.stringify(r, null, "\t"));
		return;
	}

	if (route){
		const routing = await buildRoutingTable();
		const meta = await recomputeAllMeta(); // Amendment 6: weight/discrimination, recomputed every --route
		console.log(JSON.stringify(routing, null, "\t"));
		console.log(`\nwritten to ${path.relative(ROOT, ROUTING_PATH).replaceAll("\\", "/")}`);
		console.log("\ntest                 pass_rate  discrimination  differentiation  weight  label");
		for (const m of meta) console.log([m.test.padEnd(20), m.pass_rate != null ? (m.pass_rate * 100).toFixed(0) + "%" : "n/a",
			String(m.discrimination ?? "null").padEnd(15), String(m.differentiation ?? "null").padEnd(16), String(m.weight), m.pass_rate_label ?? ""].join("  "));
		return;
	}

	const tests = loadTests(only);
	if (!tests.length) throw new Error(only ? `no test "${only}" under ${PAGES_DIR}` : `no tests found under ${PAGES_DIR}`);

	if (judge){
		for (const test of tests){
			process.stdout.write(`judging ${test.id} ... `);
			const r = await judgeTest(test);
			console.log(r ? `${r.runs_judged} run(s) judged${r.wrote_reference ? " (wrote reference.md)" : ""}, $${r.judge_cost ?? "?"}` : "nothing unscored");
		}
		await recomputeAllMeta(); // new `credit` values just landed — recompute weight/discrimination
		return;
	}

	if (!models.length) throw new Error("--models a,b is required to run tests (or pass --judge to score existing runs, --route to rebuild the routing table, or --review <slug> for a near-miss pass)");
	console.log(`library.mjs: ${tests.length} test(s) x ${models.length} model(s), one agent at a time`);
	const rows = [];
	for (const test of tests){
		for (const model of models){
			process.stdout.write(`  ${test.id} / ${model} ... `);
			const row = await runOne(test, model, effort);
			if (row.skipped){
				console.log(`SKIPPED, not recorded as a run (${row.reason})`);
				continue; // not a run: no page.jsonl line was written, so it stays out of this table too
			}
			console.log(row.pass ? "mechanical PASS" : `mechanical FAIL (${row.note})`);
			rows.push(row);
		}
	}
	await printTable(rows);
	console.log("\nNext: node Servex/ext/openrouter/evals/library.mjs --judge   (scores these runs; needs 3+ strong-set runs per test to also write reference.md)");
	console.log("Then: node Servex/ext/openrouter/evals/library.mjs --route   (rebuilds the model + task matrix from every scored run so far)");
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main()
	.catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; })
	// checksLoadClean() opens Chromium through browser.mjs's ONE shared instance and never closes
	// it (right — a long-lived caller, like a running Servex process, should keep reusing it). This
	// CLI is one-shot, so it closes that shared browser itself at the very end; without this the
	// node process never exits on its own (Playwright's open connection keeps the event loop alive)
	// — confirmed the hard way: two runs sat as live "working" Servex agents and two live node.exe
	// processes for 10+ minutes after printing their own final table, because nothing ever called
	// close(). Importing lazily, so a run with no page.js test (plan-views only) never pays for it.
	.finally(async () => { try { (await import("../../../../Server/browser.mjs")).close?.(); } catch {} });
