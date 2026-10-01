/* probes.mjs — runs one probe (a tiny, rough, open-ended job) on one model in a throwaway
 * worktree, scores the result on six fixed checks, and appends one line to results.jsonl.
 *
 * Design: public/framework/ai/2026-09-30/probe-tasks/probes.md (read that first — it owns the
 * six checks and the a/b/c labels; this file only implements them). probes.json is the same
 * design, machine-readable (topics, the probe set, the control model).
 *
 * usage: node Servex/ext/openrouter/evals/probes.mjs --models a,b --probes page-blog,log-line
 *        [--effort low] [--topic owls] [--dry-run]
 *
 * ONE RUN = one (model, probe) pair:
 *   1. take_worktree() (fresh off michael/dev) — or worktree-up.mjs if the pool is empty.
 *   2. public/framework/sandbox/probe/<run>/ inside it: a readme.md and a PARENT page.js that
 *      declares no children yet — "make a new page here" means a child of this directory.
 *   3. spawn_agent (role minion, the probe's own prompt, bypassPermissions, the given model) —
 *      no `task:` option, on purpose: proving the agent opens its OWN task is half the point.
 *   4. wait_for_agent, stop_agent, read its real cost off the card.
 *   5. Score the six checks (scoreRun, below) — each one a command or a file read, no judgment.
 *   6. Append one line to results.jsonl with pass/notes but NO label yet (THIS repo's copy, never
 *      the throwaway worktree's) — labelFailures only runs at PRINT time (main()'s own matrix),
 *      reading every row in the file fresh, never at append time. Labelling at append time would
 *      stamp a run (b) forever just because it happened to run before the control did (review
 *      finding 2026-09-30, #3) — the control's own row for that probe+check has to exist first,
 *      and which model runs first is just argv order, not a fact about the model.
 *   7. Always return (or tear down) the worktree, even on error.
 *
 * `--dry-run` prints the prompt, model, probe and scratch dir for every (model, probe) pair and
 * spawns nothing.
 *
 * `--selftest` is a separate, smaller proof: takes a real worktree (acquireWorktree — same pool
 * the real runs use), writes one deliberately broken page (a template literal that never closes —
 * a real SyntaxError) into it, runs checks 1 and 2 against THAT worktree's own server, prints what
 * they found, and tears the worktree down again. It exists only to show the checks can fail, as
 * the runner's requirements.md §Proof asks — and it fails LOUDLY (a thrown error, not a false
 * check-2 failure) if the worktree's own server never answers, rather than silently blaming the
 * page for what is really a connection problem (review finding 2026-09-30, #9). */
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
// Shared with the sibling rule-tests runner rather than kept as a second copy (CLAUDE.md law 6;
// review finding 2026-09-30, #1/#7): mcp() (the MCP POST), appendJSON() (append.mjs wrapper),
// nowLocal() (the ISO-with-offset stamp), readJsonl() and slug().
import { mcp, appendJSON as append, nowLocal as now, readJsonl, slug } from "./rules.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..", "..");   // evals -> openrouter -> ext -> Servex -> repo root
const SPEC_PATH = path.join(ROOT, "public/framework/ai/2026-09-30/probe-tasks/probes.json");
const RESULTS_PATH = path.join(HERE, "results.jsonl");
const sleep = ms => new Promise(r => setTimeout(r, ms));

function readSpec() {
	const spec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));
	const byId = new Map(spec.probes.map(p => [p.id, p]));
	return { spec, byId };
}

function readResults() {
	return readJsonl(RESULTS_PATH).flatMap(l => l.probe ? [l.probe] : []);
}

/* ---------- the six checks ---------- */

// 1. Parses: node --check on every .js/.mjs the run wrote (git status, scoped to `dir`); a .css
// file gets a cheap brace-balance + stray-backtick check instead (the real one guards css(`…`)).
// `seeded` (relDir/readme.md and relDir/page.js — written by THIS script before the agent ever
// runs) is excluded: counting them meant "no files changed" could never fire, because the seed is
// always there (review finding 2026-09-30, #8).
function checkParses(wtPath, relDir, seeded = []) {
	// -uall: an untracked DIRECTORY collapses to one line otherwise, and nothing inside it ever
	// gets checked — the exact bug this line fixes (found live, selftest 2026-09-30).
	let status;
	try { status = execFileSync("git", ["-C", wtPath, "status", "--porcelain", "-uall", "--", relDir], { encoding: "utf8", windowsHide: true }); }
	catch (e) { return { pass: 0, note: `git status failed: ${e.message}` }; }
	const seededSet = new Set(seeded);
	const files = status.split("\n").map(l => l.trim()).filter(Boolean)
		.map(l => (l.includes(" -> ") ? l.split(" -> ")[1] : l.slice(3)).replace(/^"|"$/g, ""))
		.filter(f => !seededSet.has(f));
	if (!files.length) return { pass: 0, note: "no files changed — nothing to parse" };
	const bad = [];
	for (const f of files) {
		const full = path.join(wtPath, f);
		if (/\.(js|mjs)$/.test(f)) {
			const r = spawnSync(process.execPath, ["--check", full], { encoding: "utf8", windowsHide: true });
			if (r.status !== 0) bad.push(`${f}: ${(r.stderr || "").split("\n")[0]}`);
		} else if (/\.css$/.test(f) && fs.existsSync(full)) {
			const text = fs.readFileSync(full, "utf8");
			const opens = (text.match(/\{/g) || []).length, closes = (text.match(/\}/g) || []).length;
			if (opens !== closes) bad.push(`${f}: ${opens} '{' vs ${closes} '}'`);
			// probes.md's own table: a .css file should carry no backtick at all — one usually means
			// a css(`…`) template got copy-pasted in raw (review finding 2026-09-30, #8).
			if (text.includes("`")) bad.push(`${f}: stray backtick in a .css file`);
		}
	}
	return bad.length ? { pass: 0, note: bad.join("; ").slice(0, 300) } : { pass: 1, note: `${files.length} file(s) checked` };
}

// 2. Loads clean: Server/smoke.mjs against the run's own worktree server, at the new page's url.
function checkLoadsClean(wtPath, port, urlPath) {
	if (!urlPath) return { pass: 0, note: "no page.js found to load" };
	const r = spawnSync(process.execPath, [path.join(ROOT, "Server/smoke.mjs"), wtPath, urlPath, "--port", String(port)],
		{ encoding: "utf8", windowsHide: true, timeout: 60000 });
	return { pass: r.status === 0 ? 1 : 0, note: (r.stdout || r.stderr || "").trim().split("\n").slice(0, 6).join(" / ").slice(0, 300) };
}

// 3. Followed the prompt: the page.js exists where asked, and the topic's words show up in it.
function checkFollowedPrompt(pagePath, topic) {
	if (!pagePath || !fs.existsSync(pagePath)) return { pass: 0, note: "no page.js at the expected place" };
	const text = fs.readFileSync(pagePath, "utf8").toLowerCase();
	const words = String(topic).toLowerCase().split(/\s+/).filter(w => w.length > 3);
	const hit = words.some(w => text.includes(w));
	return { pass: hit ? 1 : 0, note: hit ? "topic word found in the page" : `none of [${words.join(", ")}] found in the page text` };
}

// 4. Used the right skills: the Skill hook's own `{"log":{"msg":"skill: <name>"}}` lines.
function checkUsedSkills(taskLines, expected) {
	if (!taskLines) return { pass: 0, note: "no task.jsonl found — can't tell what it loaded" };
	const used = new Set(taskLines.flatMap(e => e.log?.msg?.match(/^skill: (.+)$/)?.[1] ? [e.log.msg.slice(7)] : []));
	const missing = expected.filter(s => !used.has(s));
	return { pass: missing.length ? 0 : 1, note: missing.length ? `missing: ${missing.join(", ")}` : `used: ${[...used].join(", ")}` };
}

// 5. Opened, logged, landed a task: line 1 is an assign, at least one log line exists, and some
// assign line carries landed_at (the new-task -> finish-task lifecycle, read straight off the file).
function checkTaskLifecycle(taskLines) {
	if (!taskLines || !taskLines.length) return { pass: 0, note: "no task.jsonl found" };
	const opened = !!taskLines[0]?.assign;
	const logged = taskLines.some(e => e.log);
	const landed = taskLines.some(e => e.assign?.landed_at);
	const missing = [!opened && "no assign on line 1", !logged && "no log line", !landed && "no landed_at"].filter(Boolean);
	return { pass: missing.length ? 0 : 1, note: missing.length ? missing.join("; ") : "opened, logged, landed" };
}

// 6. Linked from its parent: the scratch dir's own (seeded) page.js now names the new page's
// folder INSIDE its `children: [...]` array — not just anywhere in the file. A plain
// `text.includes(childSlug)` would pass on the seeded title alone (it already contains the run
// name, e.g. `probe scratch — page-blog-owls-259zv`), scoring 1 with `children: []` still empty
// if the agent happened to name its new folder a word from that title (review finding
// 2026-09-30, #2). n/a (null) for a probe that makes no page.
function checkLinkedFromParent(parentPagePath, childSlug) {
	if (!fs.existsSync(parentPagePath)) return { pass: 0, note: "parent page.js is gone" };
	const text = fs.readFileSync(parentPagePath, "utf8");
	const m = /children\s*:\s*\[([^\]]*)\]/s.exec(text);
	const arr = m ? m[1] : "";
	const hit = !!(childSlug && arr.includes(childSlug));
	const note = hit ? `children: names "${childSlug}"`
		: !childSlug ? "no child page"   // review finding 2026-09-30, #10: say this, not `does not name "undefined"`
		: !m ? "no children: array found in parent page.js"
		: `children: array does not name "${childSlug}"`;
	return { pass: hit ? 1 : 0, note };
}

/* ---------- finding what the agent actually wrote ---------- */

// Every untracked/added path under the worktree (not scoped to the scratch dir — a probe's
// task.jsonl lives under public/framework/ai/<date>/, not under the scratch dir it edited).
function changedPaths(wtPath) {
	let status;
	try { status = execFileSync("git", ["-C", wtPath, "status", "--porcelain", "-uall"], { encoding: "utf8", windowsHide: true }); }
	catch { return []; }
	return status.split("\n").map(l => l.trim()).filter(Boolean)
		.map(l => (l.includes(" -> ") ? l.split(" -> ")[1] : l.slice(3)).replace(/^"|"$/g, ""));
}

function findNewTaskJsonl(wtPath, startedAfterMs) {
	const candidates = changedPaths(wtPath).filter(p => /^public\/framework\/ai\/\d{4}-\d{2}-\d{2}\/[^/]+\/task\.jsonl$/.test(p));
	if (!candidates.length) return null;
	// newest mtime wins — only matters if a probe somehow touched more than one, which it shouldn't
	candidates.sort((a, b) => fs.statSync(path.join(wtPath, b)).mtimeMs - fs.statSync(path.join(wtPath, a)).mtimeMs);
	const full = path.join(wtPath, candidates[0]);
	const lines = fs.readFileSync(full, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } });
	return { path: candidates[0], lines };
}

// FIX (2026-10-01, task-mastermind-openrouter's own diagnosis, confirmed): a probe agent's cwd is
// the throwaway worktree's scratch dir, but `new-task` goes through Servex, and Servex opens every
// task dir against the ONE project it knows (the main tree's own public/framework/ai/<date>/), not
// the agent's own cwd. findNewTaskJsonl() above only ever looked inside the worktree — the task.jsonl
// a probe opens is never there, so check 5 (and check 4, which reads the same file for `skill:`
// lines) misread "the hook never fired" when the real story is "wrong tree". This searches the
// orchestrator's own tree (the main checkout probes.mjs itself runs from — `ROOT`, below) for a
// task.jsonl whose first `assign` names this exact agent id, newest-modified match wins. Only
// today's and yesterday's date dirs, one level deep (a probe always opens a fresh top-level task,
// never a nested one) — cheap, and right for what a probe actually does.
function findNewTaskJsonlInRoot(root, agentId, startedAfterMs) {
	const aiDir = path.join(root, "public/framework/ai");
	let dateDirs;
	try { dateDirs = fs.readdirSync(aiDir, { withFileTypes: true }).filter(e => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name)); }
	catch { return null; }
	dateDirs.sort((a, b) => b.name.localeCompare(a.name));
	for (const d of dateDirs.slice(0, 2)) {
		const dayPath = path.join(aiDir, d.name);
		let slugs;
		try { slugs = fs.readdirSync(dayPath, { withFileTypes: true }).filter(e => e.isDirectory()); }
		catch { continue; }
		const candidates = slugs
			.map(s => path.join(dayPath, s.name, "task.jsonl"))
			.map(full => { let mtime = 0; try { mtime = fs.statSync(full).mtimeMs; } catch {} return { full, mtime }; })
			.filter(c => c.mtime > 0 && c.mtime >= startedAfterMs)
			.sort((a, b) => b.mtime - a.mtime);
		for (const c of candidates) {
			let lines;
			try { lines = fs.readFileSync(c.full, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } }); }
			catch { continue; }
			if (lines.some(e => e.assign?.agent === agentId)) return { path: path.relative(root, c.full).replaceAll("\\", "/"), lines };
		}
	}
	return null;
}

// The new page.js the agent wrote under the scratch dir, if any — one level down, never the
// seeded parent itself.
function findChildPage(scratchDir) {
	let entries;
	try { entries = fs.readdirSync(scratchDir, { withFileTypes: true }); } catch { return null; }
	for (const e of entries) {
		if (!e.isDirectory()) continue;
		const p = path.join(scratchDir, e.name, "page.js");
		if (fs.existsSync(p)) return { slug: e.name, path: p };
	}
	return null;
}

/* Pool first (take_worktree — fast, already current); if all 3 are taken, make a private one
 * the same way the minion skill says to (Server/worktree-up.mjs), which this function also tears
 * down by name instead of return_worktree. Returns {kind, id, path, port}. */
async function acquireWorktree() {
	try {
		const taken = await mcp("take_worktree", {});
		if (taken?.path) return { kind: "pool", id: taken.id, path: taken.path, port: taken.url ? new URL(taken.url).port : null };
		console.error(`probes: take_worktree answered without a path (${JSON.stringify(taken).slice(0, 200)}) — falling back to worktree-up.mjs`);
	} catch (e) { console.error(`probes: take_worktree failed (${e.message}) — falling back to worktree-up.mjs`); }

	const name = `probe-${Date.now().toString(36).slice(-6)}`;
	const r = spawnSync(process.execPath, [path.join(ROOT, "Server/worktree-up.mjs"), name], { encoding: "utf8", windowsHide: true, timeout: 180000 });
	const out = (r.stdout || "") + (r.stderr || "");
	console.log(out.trim());
	if (r.status !== 0) throw new Error(`worktree-up.mjs ${name} failed (exit ${r.status})`);
	const portM = /url\s+http:\/\/localhost:(\d+)\//.exec(out);
	const pathM = /edit\s+(.+)/.exec(out);
	if (!portM || !pathM) throw new Error(`worktree-up.mjs ${name} gave no url/edit line to parse:\n${out}`);
	return { kind: "private", id: name, path: pathM[1].trim(), port: portM[1] };
}

async function releaseWorktree(taken) {
	if (taken.kind === "pool") {
		try { await mcp("return_worktree", { id: taken.id }, 60000); return; }
		catch (e) { console.error(`probes: return_worktree(${taken.id}) failed (${e.message}) — tearing down by hand`); }
		spawnSync(process.execPath, [path.join(ROOT, "Server/worktree-down.mjs"), taken.id], { stdio: "inherit", windowsHide: true });
	} else {
		spawnSync(process.execPath, [path.join(ROOT, "Server/worktree-down.mjs"), taken.id], { stdio: "inherit", windowsHide: true });
	}
}

/* ---------- one run ---------- */

async function runOne({ model, probeId, byId, spec, effort, topicOpt, dryRun }) {
	const probe = byId.get(probeId);
	if (!probe) throw new Error(`no such probe "${probeId}" in probes.json`);
	const topic = topicOpt || spec.topics[Math.floor(Math.random() * spec.topics.length)];
	const prompt = probe.prompt.replace("{topic}", topic).replace("{thing}", topic);
	const run = `${probeId}-${slug(topic)}-${Date.now().toString(36).slice(-5)}`;
	const relDir = `public/framework/sandbox/probe/${run}`;

	if (dryRun) {
		console.log(`DRY RUN  model=${model}  probe=${probeId}  topic="${topic}"  dir=${relDir}/`);
		console.log(`  prompt: ${prompt}`);
		console.log(`  expects skills: ${probe.skills.join(", ")}  checks: ${(probe.checks || []).join(",")}`);
		return { probe: { at: now(), run, probe: probeId, model, effort: effort ?? null, dir: relDir, pass: null, dry_run: true } };
	}

	const taken = await acquireWorktree();
	const wtPath = taken.path, port = taken.port;
	console.log(`probes: took worktree ${taken.id} (${taken.kind}) at ${wtPath} (port ${port}) for ${model} / ${probeId}`);

	try {
		const scratchDir = path.join(wtPath, relDir);
		fs.mkdirSync(scratchDir, { recursive: true });
		fs.writeFileSync(path.join(scratchDir, "readme.md"),
			`# probe scratch — ${run}\n\nA throwaway run directory for the probe-tasks tool (` +
			`\`Servex/ext/openrouter/evals/probes.mjs\`). Safe to delete.\n`);
		fs.writeFileSync(path.join(scratchDir, "page.js"),
			`import { Page } from "/app.js";\n\n` +
			`export default new Page({\n\tmeta: import.meta,\n\ttitle: "probe scratch — ${run}",\n` +
			`\tdescription: "A throwaway run of the probe-tasks tool. Safe to delete.",\n\ticon: "science",\n\tchildren: [],\n});\n`);

		const runStartMs = Date.now();
		let spawned;
		try {
			spawned = await mcp("spawn_agent", { role: "minion", name: run.slice(0, 30), prompt, model, effort, permission_mode: "bypassPermissions", cwd: scratchDir });
		} catch (e) { return scoreAndAppend({ reached: false, note: `spawn_agent threw: ${e.message}` }); }
		if (!spawned?.id) return scoreAndAppend({ reached: false, note: `spawn_agent gave no id: ${JSON.stringify(spawned).slice(0, 200)}` });

		let waited;
		try { waited = await mcp("wait_for_agent", { id: spawned.id, timeout_s: 600 }, 610000); }
		catch (e) { waited = { timed_out: true, note: e.message }; }
		await mcp("stop_agent", { id: spawned.id }, 20000).catch(() => {});
		const cost = waited?.cost ?? 0, turns = waited?.turns ?? null;

		return scoreAndAppend({ reached: true, cost, turns });

		async function scoreAndAppend({ reached, cost = null, turns = null, note = null }) {
			const checksWanted = probe.checks || [];
			const want = n => checksWanted.includes(n);
			const parentPage = path.join(scratchDir, "page.js");
			const child = findChildPage(scratchDir);
			// Servex opens the agent's task dir against the MAIN tree, not this throwaway worktree
			// (see the FIX comment on findNewTaskJsonlInRoot, above) — try the worktree first (in
			// case that ever changes), then where it actually lands today.
			const task = findNewTaskJsonl(wtPath) || (spawned?.id ? findNewTaskJsonlInRoot(ROOT, spawned.id, runStartMs) : null);

			const relScratch = path.relative(wtPath, scratchDir).replaceAll("\\", "/");
			const c1 = want(1) ? checkParses(wtPath, relScratch, [`${relScratch}/readme.md`, `${relScratch}/page.js`]) : null;
			const c2 = want(2) ? checkLoadsClean(wtPath, port, child ? `/${path.relative(path.join(wtPath, "public"), path.join(scratchDir, child.slug)).replaceAll("\\", "/")}/` : null) : null;
			const c3 = want(3) ? checkFollowedPrompt(child?.path, topic) : null;
			const c4 = want(4) ? checkUsedSkills(task?.lines, probe.skills) : null;
			const c5 = want(5) ? checkTaskLifecycle(task?.lines) : null;
			const c6 = want(6) ? checkLinkedFromParent(parentPage, child?.slug) : null;

			const results = [c1, c2, c3, c4, c5, c6];
			const pass = results.map(r => (r ? r.pass : null));
			const notes = results.map((r, i) => r && r.note ? `${i + 1}:${r.note}` : null).filter(Boolean);
			if (!reached) notes.unshift(note);

			// No task.jsonl found at all means no `skill:` line either (the Skill hook only ever
			// writes into the agent's own task.jsonl) — this run may never have reached the hook
			// path, which is a (c) config/parity question, not a fact about the model (review
			// finding 2026-09-30, #4/#6). Recorded as a plain fact on the row; the (a)/(b)/(c) label
			// itself is only ever computed later, at print time (see labelFailures, below).
			const hookMissing = !task;

			const row = {
				probe: { at: now(), run, probe: probeId, model, effort: effort ?? null, dir: relDir,
					pass, label: {}, reached, hook_missing: hookMissing,
					cost_usd: cost, turns, note: notes.join(" | ").slice(0, 400) || null }
			};
			append(RESULTS_PATH, row);
			console.log(`probes: scored ${model} / ${probeId} — pass=[${pass.map(v => v === null ? "." : v).join("")}] (label computed at print time) cost=$${cost ?? "?"}`);
			return row;
		}
	} finally {
		await releaseWorktree(taken);
	}
}

/* a/b/c, probes.md's own rule — computed only at PRINT time (never when a row is appended, see
 * the comment at step 6 up top and review finding 2026-09-30, #3): (c) the run never reached the
 * work, OR no task.jsonl turned up at all so there's no `skill:` line either — a sign the Skill
 * hook itself may never have reached this agent, not that the model skipped a step (#4/#6); (a)
 * the control model fails this SAME cell too (the system, not this model — one (a) is a hint,
 * never a unanimous verdict, since it only ever checks one other model's row); (b) otherwise (just
 * this model). The control's own row never labels itself — it IS the baseline every other row
 * reads. `allRows` should be every row for this probe, freshest control row wins on a tie. */
function labelFailures({ allRows, probeId, model, control, pass, reached, hookMissing }) {
	if (model === control) return {};
	const labels = {};
	const controlRow = allRows.filter(r => r.probe === probeId && r.model === control).sort((a, b) => (a.at < b.at ? 1 : -1))[0];
	pass.forEach((v, i) => {
		if (v !== 0) return;   // only label real failures, never a pass or an n/a
		const n = i + 1;
		if (!reached || (hookMissing && (n === 4 || n === 5))) { labels[n] = "c"; return; }
		if (controlRow && controlRow.pass[i] === 0) labels[n] = "a";
		else labels[n] = "b";
	});
	return labels;
}

/* ---------- --selftest: prove checks 1 and 2 can fail ---------- */

async function selftest() {
	const taken = await acquireWorktree();
	const wtPath = taken.path, port = taken.port;
	console.log(`selftest: took worktree ${taken.id} (${taken.kind}) at ${wtPath} (port ${port})`);
	try {
		// Fail LOUDLY if the worktree's own server never answers, rather than letting check 2 score
		// a false 0 that looks like "the page is broken" when the real problem is "nothing is
		// listening" (review finding 2026-09-30, #9).
		const ping = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(10000) }).catch(e => { throw new Error(`selftest: worktree server at :${port} never answered (${e.message}) — can't prove check 2 against it`); });
		if (!ping.ok && ping.status >= 500) throw new Error(`selftest: worktree server at :${port} answered ${ping.status} — not healthy enough to trust check 2 against it`);

		const relDir = "public/framework/sandbox/probe/selftest-broken";
		const dir = path.join(wtPath, relDir);
		fs.mkdirSync(dir, { recursive: true });
		const pagePath = path.join(dir, "page.js");
		// A template literal that never closes: a real SyntaxError, the exact trap CLAUDE.md's own
		// "Traps that never throw" warns about (one backtick inside css() kills every page).
		fs.writeFileSync(pagePath,
			`import { Page } from "/app.js";\n\nexport default new Page({\n\tmeta: import.meta,\n\ttitle: "broken",\n` +
			`\tcontent(){ return \`this backtick is never closed, so the file cannot parse\n\t}\n});\n`);
		console.log("selftest: wrote a deliberately broken page.js at " + relDir + "/page.js (in the worktree, not this tree)");

		const c1 = checkParses(wtPath, relDir);
		console.log(`selftest: check 1 (parses)      -> pass=${c1.pass}  ${c1.note}`);

		// smoke.mjs against THIS worktree's own server — not a guessed port in this tree.
		const c2 = checkLoadsClean(wtPath, port, `/${relDir.replace(/^public\//, "")}/`);
		console.log(`selftest: check 2 (loads clean) -> pass=${c2.pass}  ${c2.note}`);

		fs.rmSync(dir, { recursive: true, force: true });
		console.log("selftest: cleaned up (the broken page was never meant to stay).");
		if (c1.pass !== 0 || c2.pass !== 0) { console.error("selftest: FAILED — a broken page should have scored 0 on both checks."); process.exitCode = 1; return; }
		console.log("selftest: PASSED — both checks caught the breakage, as designed.");
	} finally {
		await releaseWorktree(taken);
	}
}

/* ---------- CLI ---------- */

function parseArgs(argv) {
	const opt = name => { const i = argv.indexOf("--" + name); if (i < 0) return undefined; const v = argv[i + 1]; return v; };
	return {
		models: (opt("models") || "").split(",").map(s => s.trim()).filter(Boolean),
		probes: (opt("probes") || "").split(",").map(s => s.trim()).filter(Boolean),
		effort: opt("effort"),
		topic: opt("topic"),
		dryRun: argv.includes("--dry-run"),
	};
}

async function main() {
	const argv = process.argv.slice(2);
	if (argv.includes("--selftest")) return selftest();

	const { models, probes, effort, topic, dryRun } = parseArgs(argv);
	if (!models.length || !probes.length) {
		console.error("usage: node Servex/ext/openrouter/evals/probes.mjs --models a,b --probes page-blog,log-line [--effort low] [--topic owls] [--dry-run]");
		console.error("       node Servex/ext/openrouter/evals/probes.mjs --selftest");
		process.exit(2);
	}
	const { spec, byId } = readSpec();
	const rows = [];
	const matrix = [];
	for (const model of models) {
		for (const probeId of probes) {
			const row = await runOne({ model, probeId, byId, spec, effort, topicOpt: topic, dryRun });
			rows.push(row);
			if (Array.isArray(row.probe.pass)) matrix.push(row.probe);
		}
	}
	if (matrix.length) {
		// Labelled HERE, fresh, from every row results.jsonl now holds — never from a label stamped
		// when the row was appended (step 6's own comment; review finding 2026-09-30, #3). This
		// means a cell this run left unlabelled (no control row existed yet) picks up its real
		// label automatically the next time anyone prints the matrix, once the control has run.
		const allRows = readResults();
		console.log("\nmatrix (model × probe, six checks: parses / loads / prompt / skills / lifecycle / linked):");
		for (const r of matrix) {
			const label = labelFailures({ allRows, probeId: r.probe, model: r.model, control: spec.control_model, pass: r.pass, reached: r.reached, hookMissing: r.hook_missing });
			const cells = r.pass.map((v, i) => {
				const mark = v === null ? "." : v ? "1" : "0";
				const lab = label[i + 1] ? label[i + 1] : "";
				return mark + lab;
			}).join("  ");
			console.log(`  ${r.model.padEnd(28)} ${r.probe.padEnd(12)} ${cells}`);
		}
	}
}

main().catch(e => { console.error("probes.mjs: " + (e?.stack || e)); process.exit(1); });
