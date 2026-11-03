/* system-overhead.mjs — does OUR OWN system (CLAUDE.md, skills, the readme-chain injection, the
 * task.jsonl ritual) make Sonnet worse and costlier at a small coding task, or better?
 * (the owner, 2026-10-02/03, model-weights brief: "maybe going back to plain, no CLAUDE.md, no
 * nothing, is better.")
 *
 * Runs the SAME small task on claude-sonnet-5 in two setups, same model, same effort, same
 * fixture, same mechanical check — only the surrounding system differs:
 *   FULL — the normal spawn: project CLAUDE.md, skills and hooks all load as they would for any
 *          real task-mastermind or minion. Prompt is the plain rung prompt (no primer): the model
 *          is expected to lean on the system (the readme chain, the `new-page` skill, etc.) for
 *          framework knowledge, the way a real task would.
 *   BARE — `settingSources: []` (the SDK's own project/user/local settings are all skipped: no
 *          CLAUDE.md, no .claude/skills, no hooks fire). Prompt is the SAME rung text with a
 *          one-screen framework primer inlined instead — the one thing it needs, nothing else.
 * Neither setup uses Servex's own `task: {dir}` option, on purpose: that would tell the FULL run
 * to do extra bookkeeping (opening a task log) that isn't really "the system" under test here, it's
 * Servex's own spawn mechanics layered on top — this script measures CLAUDE.md/skills/hooks only.
 *
 * Measures, per run: mechanical pass/fail (the SAME checks library.mjs's own rungs use — never a
 * judge), API turns, tokens, real $ cost (billed on the Claude subscription, settles immediately —
 * no OpenRouter ledger involved), and wall time.
 *
 * usage: node Servex/ext/openrouter/evals/system-overhead.mjs [--only rung0|rung2] [--effort low]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mcp, appendJSON, nowLocal, waitForRealTurn, checksParse, checksLoadClean, checksLinked, checksH1, checksTreeMatch } from "./library.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const LOGS_DIR = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData/Local"), "lew42", "servex", "logs");

/* `wait_for_agent` only ever hands back `turns` (how many user/assistant exchanges the TOOL saw —
 * usually 1 for a single-prompt spawn) and `cost`. The owner's own measurement is about API TURNS
 * — the real driver of cost, per the readme: "a typical minion makes 85 API turns ($8.92 for
 * minion-echo)". That number lives only in the agent's own host log (`agent-<id>.jsonl`), on its
 * last `{"type":"result","api_turns":N,"usage":{...}}` line. Read it straight from disk — the same
 * file `agent-minion-lib-h1-page.jsonl` already proved readable this way earlier in this task. */
function readApiTurns(agentId){
	const file = path.join(LOGS_DIR, `agent-${agentId}.jsonl`);
	try {
		const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
		let last = null;
		for (const l of lines){ let o; try { o = JSON.parse(l); } catch { continue; } if (o.type === "result" && o.api_turns != null) last = o; }
		if (!last) return { api_turns: null, usage: null };
		const u = last.usage || {};
		return { api_turns: last.api_turns, usage: { input: u.input_tokens ?? null, output: u.output_tokens ?? null,
			cache_read: u.cache_read_input_tokens ?? null, cache_creation: u.cache_creation_input_tokens ?? null } };
	} catch { return { api_turns: null, usage: null }; }
}
const TASK_DIR = path.join(ROOT, "public/framework/ai/sessions/2026/10/03/model-weights/model-weights");
const RUNS_DIR = path.join(TASK_DIR, "overhead-runs");
const RESULTS_PATH = path.join(TASK_DIR, "system-overhead-results.jsonl");
const SITE_BASE = process.env.LIBRARY_SITE_BASE || "http://monorepo.localhost";
const MODEL = "claude-sonnet-5";

const slug = s => String(s).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

function copyDir(from, to){
	fs.mkdirSync(to, { recursive: true });
	for (const entry of fs.readdirSync(from, { withFileTypes: true })){
		const src = path.join(from, entry.name), name = entry.name === "page.fixture.js" ? "page.js" : entry.name;
		const dst = path.join(to, name);
		if (entry.isDirectory()) copyDir(src, dst); else fs.copyFileSync(src, dst);
	}
}

/* The two rungs this script compares, each with its mechanical check and the two prompt variants
 * already built as real AITest fixtures — FULL reads the plain prompt, BARE reads the primer one. */
const RUNGS = {
	rung0: {
		fixtureDir: path.join(ROOT, "public/framework/ai/tests/rung0-html-to-view/fixture"),
		plainPrompt: path.join(ROOT, "public/framework/ai/tests/rung0-html-to-view/prompt.md"),
		primerPrompt: path.join(ROOT, "public/framework/ai/tests/rung0-html-to-view-primer/prompt.md"),
		sourceHtml: path.join(ROOT, "public/framework/ai/tests/rung0-html-to-view/fixture/source.html"),
		container: ".rung0-output",
		async check(runDir, runUrl){
			const tree = await checksTreeMatch(runUrl, fs.readFileSync(this.sourceHtml, "utf8"), this.container);
			return { ok: tree.ok, detail: tree };
		},
	},
	rung2: {
		fixtureDir: path.join(ROOT, "public/framework/ai/tests/rung2-two-children/fixture"),
		plainPrompt: path.join(ROOT, "public/framework/ai/tests/rung2-two-children/prompt.md"),
		primerPrompt: path.join(ROOT, "public/framework/ai/tests/rung2-two-children-primer/prompt.md"),
		async check(runDir, runUrl){
			const linkedFirst = checksLinked(runDir, "first"), linkedSecond = checksLinked(runDir, "second");
			const h1First = await checksH1(`${runUrl}first/`, "First child");
			const h1Second = await checksH1(`${runUrl}second/`, "Second child");
			const ok = linkedFirst.ok && linkedSecond.ok && h1First.ok && h1Second.ok;
			return { ok, detail: { linkedFirst, linkedSecond, h1First, h1Second } };
		},
	},
};

async function runOne(rungId, rung, setup, effort){
	const runName = `overhead-${rungId}-${setup}-${Date.now()}`;
	const runDir = path.join(RUNS_DIR, runName);
	const runUrlPath = `/framework/ai/sessions/2026/10/03/model-weights/model-weights/overhead-runs/${runName}/`;
	copyDir(rung.fixtureDir, runDir);

	const promptFile = setup === "full" ? rung.plainPrompt : rung.primerPrompt;
	const prompt = `This folder is a real page on the live site: ${SITE_BASE}${runUrlPath} — it's already there, you're editing it in place.\n\n`
		+ fs.readFileSync(promptFile, "utf8");

	const spawnArgs = {
		role: "task-mastermind", name: `ov-${rungId[rungId.length - 1]}-${setup}`, // short id: well under Log.js's 64-char cap
		prompt, model: MODEL, effort, cwd: ROOT, permission_mode: "bypassPermissions",
	};
	if (setup === "bare") spawnArgs.setting_sources = [];

	const t0 = Date.now();
	let spawned, waited, note = "";
	try {
		spawned = await mcp("spawn_agent", spawnArgs);
		if (!spawned.id) throw new Error(spawned.raw || spawned.why || "spawn_agent did not return an id");
		waited = await waitForRealTurn(spawned, 300_000, 600_000);
	} catch (e) { note = `run failed: ${String(e?.message || e).slice(0, 300)}`; }
	finally { if (spawned?.id) try { await mcp("stop_agent", { id: spawned.id }, 20000); } catch {} }
	const ms = Date.now() - t0;
	const { api_turns, usage } = spawned?.id ? readApiTurns(spawned.id) : { api_turns: null, usage: null };

	const parse = checksParse(runDir);
	const load = await checksLoadClean(`${SITE_BASE}${runUrlPath}`);
	let check = { ok: false, detail: null };
	if (parse.ok && load.ok) try { check = await rung.check(runDir, `${SITE_BASE}${runUrlPath}`); } catch (e) { check = { ok: false, detail: String(e) }; }
	const pass = parse.ok && load.ok && check.ok ? 1 : 0;

	const row = {
		at: nowLocal(), run: runName, rung: rungId, setup, model: MODEL, effort,
		pass, cost_usd: waited?.cost ?? null, turns: waited?.turns ?? null, api_turns, usage, ms,
		dir: path.relative(ROOT, runDir).replaceAll("\\", "/"),
		mechanical: { parse: parse.ok, load_clean: load.ok, check: check.ok },
		note: note || (pass ? "mechanical PASS" : "mechanical FAIL"),
	};
	appendJSON(RESULTS_PATH, { overhead_run: row });
	try { fs.appendFileSync(path.join(runDir, "task.jsonl"), JSON.stringify({ landed_at: nowLocal(), outcome: `system-overhead probe: ${row.note}` }) + "\n"); } catch {}
	return row;
}

function parseArgs(argv){
	const flag = n => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
	return { only: flag("--only"), effort: flag("--effort") || "low" };
}

async function main(){
	const { only, effort } = parseArgs(process.argv.slice(2));
	const rungs = only ? { [only]: RUNGS[only] } : RUNGS;
	const rows = [];
	for (const [rungId, rung] of Object.entries(rungs)){
		for (const setup of ["full", "bare"]){
			process.stdout.write(`  ${rungId} / ${setup} ... `);
			const row = await runOne(rungId, rung, setup, effort);
			console.log(`${row.pass ? "PASS" : "FAIL"} api_turns=${row.api_turns} $${row.cost_usd} ${row.ms}ms`);
			rows.push(row);
		}
	}
	console.log("\nrung   setup  pass  api_turns  cost      ms      tokens(in/out)");
	for (const r of rows) console.log([r.rung.padEnd(6), r.setup.padEnd(6), (r.pass ? "PASS" : "FAIL").padEnd(5),
		String(r.api_turns).padEnd(10), String(r.cost_usd).padEnd(9), String(r.ms).padEnd(7),
		r.usage ? `${r.usage.input}/${r.usage.output}` : "n/a"].join(" "));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main()
	.catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; })
	.finally(async () => { try { (await import("../../../../Server/Browser.mjs")).close?.(); } catch {} });
