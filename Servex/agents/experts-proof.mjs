/* node Servex/agents/experts-proof.mjs — the Page expert, measured four ways.
 *
 * On a PRIVATE host (its own registry dir and its own experts index, both in
 * the OS temp dir — the live Servex and Servex/experts.json are never touched)
 * it builds the core/Page checkpoint once, then asks five real page questions
 * four ways, all on the same model:
 *   a  fork    the checkpoint, forked (ask())
 *   b  tool    a fresh session told to call load_module(["core/Page"]) first
 *   c  preload a fresh session whose FIRST prompt already holds the bundle
 *   d  cold    the plain question; it reads the repo itself
 * Each run: seconds to the first answer token and to the full answer, input /
 * cache-read / cache-write / output tokens, cost. Then ONE blind judge (Opus)
 * scores every answer 0-3 against the source, and says which loaded files each
 * answer drew on. Then a freshness test: a changed hash reads stale, and ask()
 * rebuilds. Writes proof.json + proof.md into the task dir, and the curation
 * signal as lines of core/Page/doc/readme-log.jsonl.
 *
 * PROOF_ONLY=a,c (ways) and PROOF_Q=1,2 (questions) narrow a rerun; PROOF_DIR writes elsewhere;
 * PROOF_NO_JUDGE=1 and PROOF_NO_LOG=1 skip the judge and the readme-log lines. */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TMP = path.join(os.tmpdir(), "servex-experts-proof");
fs.mkdirSync(TMP, { recursive: true });
const INDEX = path.join(TMP, "experts.json");
process.env.SERVEX_EXPERTS = INDEX;
/* A load_module result is ~55k tokens; Claude Code refuses MCP output over 25k by default. */
process.env.MAX_MCP_OUTPUT_TOKENS ??= "150000";

const { Agents } = await import("./Agents.js");
const { server } = await import("./tools.js");
const X = await import("./experts.js");

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const TASK = process.env.PROOF_DIR ?? path.join(REPO, "public/framework/ai/2026-09-29/module-experts");
const RLOG = path.join(REPO, "public/framework/core/Page/doc/readme-log.jsonl");
const MODULE = "core/Page";
const SONNET = "claude-sonnet-5", OPUS = "claude-opus-5-5";
const ONLY = (process.env.PROOF_ONLY ?? "a,b,c,d").split(",");

const QUESTIONS = [
	"How does a page.jsonl page route its children?",
	"What does `display: contents` do in column pages?",
	"How does a url nobody declared get resolved (route() and child())?",
	"What makes a folder with a page.js exist as a page, and why does a declared child with no page.js 404?",
	"How does `swap_link` keep a doc routed?"
].map((q, i) => ({ n: i + 1, q })).filter(x => !process.env.PROOF_Q || process.env.PROOF_Q.split(",").includes(String(x.n)));

const STYLE = " Be concrete: name the method, file and line of reasoning. Plain sentences, no preamble.";
const WAYS = { a: "fork the checkpoint", b: "load_module tool", c: "preloaded prompt", d: "cold (reads the repo)" };

const host = new Agents({ registry_dir: path.join(TMP, "registry") });
const ev = {};   // agent id → [{t, type}]
host.watch = (e, agent) => {
	if (e.type === "delta" && !e.nested) (ev[agent.id] ??= []).push({ t: Date.now(), type: "delta" });
	if (e.type === "tool") (ev[agent.id] ??= []).push({ t: Date.now(), type: "tool", name: e.name });
	if (e.type === "result" && !e.stopped) (ev[agent.id] ??= []).push({ t: Date.now(), type: "result", usage: e.usage, cost: e.cost });
	if (e.type === "error") console.log(`! ${agent.id} ${e.where}: ${e.text}`);
};

/* The numbers for one finished agent: first answer token = the first text
 * delta after its last tool call (narration before a tool is not the answer). */
function numbers(id, t0){
	const list = (ev[id] ?? []).filter(e => e.t >= t0);
	const tools = list.filter(e => e.type === "tool");
	const last_tool = tools.length ? tools[tools.length - 1].t : 0;
	const first = list.find(e => e.type === "delta" && e.t > last_tool);
	const res = list.filter(e => e.type === "result").pop();
	const u = res?.usage ?? {};
	return { first_s: first ? +((first.t - t0) / 1000).toFixed(1) : null, full_s: res ? +((res.t - t0) / 1000).toFixed(1) : null,
		tools: tools.length, input: u.input_tokens ?? 0, cache_read: u.cache_read_input_tokens ?? 0,
		cache_write: u.cache_creation_input_tokens ?? 0, output: u.output_tokens ?? 0, cost: +(res?.cost ?? 0).toFixed(4) };
}

const POSTURE = { model: SONNET, effort: "medium", cwd: REPO, permission_mode: "bypassPermissions", setting_sources: [] };

async function fresh_run(way, prompt, extra = {}){
	const t0 = Date.now();
	const agent = host.spawn({ ...POSTURE, id: `proof-${way}`, role: "proof", name: way, prompt, ...extra });
	const r = await host.wait(agent.id, 900);
	if (agent.state !== "stopped") agent.stop();
	return { answer: r.words ?? "", ...numbers(agent.id, t0), timed_out: !!r.timed_out };
}

const way = {
	a: async q => { const t0 = Date.now(); const a = await X.ask(host, MODULE, q, { index: INDEX });
		return { answer: a.answer, ...numbers(a.id, t0), stale_rebuilt: a.stale_rebuilt }; },
	b: q => fresh_run("b", `Call the load_module tool with modules ["core/Page"] first, then answer this question from what it gives you`
		+ ` (open an on-demand file only if the question needs it).\n\nQuestion: ${q}\n\n${STYLE}`,
		{ mcp_servers: { servex: server(host, { caller: "proof-b" }, X.loader_tools()) } }),
	c: q => fresh_run("c", `${X.readme([MODULE])}\n\nYou are the Page expert, with the above already read.`
		+ ` Answer from it; open an on-demand file only if the question needs it.\n\nQuestion: ${q}\n\n${STYLE}`),
	d: q => fresh_run("d", `${q}\n\nAnswer from the repo; read what you need.${STYLE}`)
};

const out = { at: new Date().toISOString(), model: SONNET, module: MODULE, build: null, runs: [], judge: null, fresh_test: null };
fs.mkdirSync(TASK, { recursive: true });
const save = () => fs.writeFileSync(path.join(TASK, "proof.json"), JSON.stringify(out, null, "\t") + "\n");
const T0 = Date.now();
const log = s => console.log(`[${((Date.now() - T0) / 1000).toFixed(0)}s] ${s}`);

/* 1. The checkpoint, once. */
if (ONLY.includes("a")){
	/* Reused when a fresh one is already in this proof's own index: the build is a one-time cost, recorded on its row. */
	let row = X.rows({ index: INDEX }).find(r => r.module === MODULE && r.kind === "base" && r.model === SONNET);
	if (!row || !X.row_fresh(row).fresh) row = await X.build(host, MODULE, { index: INDEX });
	const u = row.usage ?? {};
	out.build = { session_id: row.session_id, built_at: row.built_at, full_s: +(row.build_ms / 1000).toFixed(1), tokens: row.tokens,
		files: row.files.length, cost: row.cost, input: u.input_tokens ?? 0, cache_read: u.cache_read_input_tokens ?? 0,
		cache_write: u.cache_creation_input_tokens ?? 0, output: u.output_tokens ?? 0 };
	log(`checkpoint built: ${row.session_id} · ${row.tokens} tokens · $${(row.cost ?? 0).toFixed(4)} · ${(row.build_ms / 1000).toFixed(1)}s`);
	save();
}

/* 2. Five questions × the ways; the ways of one question run side by side. */
for (const { n, q } of QUESTIONS){
	const got = await Promise.all(ONLY.map(w => way[w](q).then(r => ({ q: n, question: q, way: w, ...r }))
		.catch(e => ({ q: n, question: q, way: w, error: String(e.message || e) }))));
	for (const r of got){ out.runs.push(r); log(`Q${n} ${r.way}: ${r.error ?? `${r.first_s}s first · ${r.full_s}s full · $${r.cost} · cache ${r.cache_read}`}`); }
	save();
}

/* 3. One blind judge. Answers shuffled per question and labelled A-D. (PROOF_NO_JUDGE=1 skips it.) */
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(([, v]) => v);
const key = {};   // "q|label" → way
const blocks = QUESTIONS.map(({ n, q }) => {
	const answers = shuffle(out.runs.filter(r => r.q === n && !r.error));
	return `## Question ${n}: ${q}\n\n` + answers.map((r, i) => { const L = "ABCD"[i]; key[`${n}|${L}`] = r.way;
		return `### Answer ${n}${L}\n\n${r.answer.trim()}`; }).join("\n\n");
}).join("\n\n");
const loaded = X.load_module([MODULE]).modules[0].files.map(f => f.path);
const judge_prompt = `You are judging answers about this repo's Page system (public/framework/core/Page/). The source is here: read whatever you need`
	+ ` (Page.class.js, words.js, Log.js, Frame.js, Page.css, the doc/ files, ../Router/Router.js) to check each claim. Do not trust the answers.\n\n`
	+ `Score each answer 0-3: 3 = correct and complete for the question, 2 = correct but missing something that matters, 1 = partly wrong, 0 = wrong or no answer.`
	+ ` Give a one-line reason. Also list which of these files the answer's content actually drew on (by path, from this list only):\n`
	+ loaded.map(p => `- ${p}`).join("\n")
	+ `\n\nThen list facts that a good answer needed but that are NOT in any of the listed files (say where they live instead).\n\n${blocks}\n\n`
	+ "Reply with ONE fenced ```json block and nothing else: {\"scores\":[{\"id\":\"1A\",\"score\":3,\"reason\":\"…\",\"used\":[\"public/framework/core/Page/…\"]}],"
	+ "\"missing\":[{\"fact\":\"…\",\"lives_in\":\"path\"}]}";
if (!process.env.PROOF_NO_JUDGE){
	const t0 = Date.now();
	const j = host.spawn({ model: OPUS, effort: "medium", cwd: REPO, permission_mode: "bypassPermissions", setting_sources: [],
		allowed_tools: ["Read", "Grep", "Glob"], id: "proof-judge", role: "proof", name: "judge", prompt: judge_prompt });
	const r = await host.wait(j.id, 1800);
	if (j.state !== "stopped") j.stop();
	const text = r.words ?? "";
	let parsed = null;
	try { parsed = JSON.parse((text.match(/```json\s*([\s\S]*?)```/) ?? [, text])[1]); } catch (e){ log(`judge JSON did not parse: ${e.message}`); }
	out.judge = { ...numbers(j.id, t0), key, parsed, raw: parsed ? undefined : text };
	for (const s of parsed?.scores ?? []){
		const m = String(s.id).match(/^(\d+)([A-D])$/); if (!m) continue;
		const run = out.runs.find(r => r.q === +m[1] && r.way === key[`${m[1]}|${m[2]}`]);
		if (run) Object.assign(run, { score: s.score, reason: s.reason, used: s.used ?? [] });
	}
	log(`judge: $${out.judge.cost} · ${out.judge.full_s}s`);
	save();
}

/* 4. Freshness: a copy of the index with one hash changed reads stale, and ask() rebuilds. */
if (ONLY.includes("a")){
	const copy = path.join(TMP, "experts-stale.json");
	const idx = JSON.parse(fs.readFileSync(INDEX, "utf8"));
	const row = idx.rows.find(r => r.kind === "base");
	const f = row.files.find(x => x.path.endsWith("Page.class.js"));
	f.sha1 = "0".repeat(40);
	fs.writeFileSync(copy, JSON.stringify(idx));
	const before = X.fresh(MODULE, { index: copy });
	const t0 = Date.now();
	const a = await X.ask(host, MODULE, "In one sentence: what does Page.class.js export?", { index: copy });
	const after = X.fresh(MODULE, { index: copy });
	out.fresh_test = { changed: before.changed, fresh_before: before.fresh, stale_rebuilt: a.stale_rebuilt, fresh_after: after.fresh,
		ms: Date.now() - t0, answer: a.answer.slice(0, 300), new_checkpoint: X.rows({ index: copy }).find(r => r.kind === "base").session_id };
	log(`freshness: fresh before=${before.fresh} (${before.changed.join(", ")}) · rebuilt=${a.stale_rebuilt} · fresh after=${after.fresh}`);
	save();
}

/* 5. proof.md + the curation lines. */
const runs = out.runs.filter(r => !r.error);
const avg = (list, k) => list.length ? list.reduce((s, r) => s + (r[k] ?? 0), 0) / list.length : 0;
const sum = (list, k) => list.reduce((s, r) => s + (r[k] ?? 0), 0);
const by = w => runs.filter(r => r.way === w);
const used = new Set(runs.filter(r => r.way === "a" || r.way === "c").flatMap(r => r.used ?? []));
const unused = loaded.filter(p => !used.has(p));
const missing = out.judge?.parsed?.missing ?? [];
const $ = n => `$${(n ?? 0).toFixed(3)}`;

const md = [];
md.push("# Page expert — four ways to answer a page question, measured", "",
	`Five real questions about pages, each answered four ways on the same model (${SONNET}). A blind judge (${OPUS}) scored every answer 0–3 against the source.`, "",
	"| way | first answer (avg s) | full answer (avg s) | cost per question (avg) | score (avg of 3) | one-time cost |",
	"|---|---|---|---|---|---|");
for (const w of ONLY){ const l = by(w);
	md.push(`| **${w}** ${WAYS[w]} | ${avg(l, "first_s").toFixed(1)} | ${avg(l, "full_s").toFixed(1)} | ${$(avg(l, "cost"))} | ${avg(l, "score").toFixed(1)} | ${w === "a" && out.build ? `${$(out.build.cost)} build (${out.build.full_s}s)` : "—"} |`); }
md.push("", "**Recommendation:** _(written after reading the numbers — see below)_", "");
md.push("## Per question", "", "| # | way | first s | full s | input | cache read | cache write | output | cost | score | reason |", "|---|---|---|---|---|---|---|---|---|---|---|");
for (const r of out.runs) md.push(`| ${r.q} | ${r.way} | ${r.first_s ?? "—"} | ${r.full_s ?? "—"} | ${r.input ?? ""} | ${r.cache_read ?? ""} | ${r.cache_write ?? ""} | ${r.output ?? ""} | ${$(r.cost)} | ${r.score ?? "—"} | ${(r.error ?? r.reason ?? "").replace(/\|/g, "/")} |`);
if (out.build) md.push("", `**Checkpoint build (once):** ${out.build.full_s}s, ${$(out.build.cost)}, ${out.build.cache_write} tokens written to the cache, ${out.build.files} files. Session \`${out.build.session_id}\`.`);
if (out.fresh_test) md.push("", `**Freshness test:** with Page.class.js's recorded hash changed, \`fresh()\` said ${out.fresh_test.fresh_before ? "fresh (WRONG)" : "stale"} (changed: ${out.fresh_test.changed.join(", ")}); the next \`ask()\` ${out.fresh_test.stale_rebuilt ? "rebuilt the checkpoint first" : "did NOT rebuild (WRONG)"} and answered in ${(out.fresh_test.ms / 1000).toFixed(1)}s; afterwards \`fresh()\` said ${out.fresh_test.fresh_after ? "fresh" : "stale (WRONG)"}.`);
if (out.judge) md.push("", `**Judge:** ${out.judge.full_s}s, ${$(out.judge.cost)}.`);
md.push("", "## Curation signal for the recipe (advice, not applied)", "",
	`**Loaded but no fork or preload answer drew on it** (candidates for on_demand): ${unused.length ? unused.map(p => "`" + p.replace("public/framework/core/Page/", "") + "`").join(", ") : "none"}.`, "",
	`**Needed but not loaded** (candidates to add): ${missing.length ? missing.map(m => `${m.fact} (${m.lives_in})`).join("; ") : "none reported"}.`, "");
md.push("## The answers", "");
for (const { n, q } of QUESTIONS){
	md.push(`### ${n}. ${q}`, "");
	for (const r of out.runs.filter(r => r.q === n)) md.push(`**${r.way} — ${WAYS[r.way]}** (score ${r.score ?? "—"}; ${r.full_s ?? "—"}s, ${$(r.cost)})`, "", (r.error ?? r.answer).trim(), "");
}
fs.writeFileSync(path.join(TASK, "proof.md"), md.join("\n") + "\n");

const lines = [
	...[...used].map(p => ({ at: "NOW", task: "module-experts", kind: "helped", text: p })),
	...unused.map(p => ({ at: "NOW", task: "module-experts", kind: "too-much", text: `${p}: loaded, no answer in the proof drew on it` })),
	...missing.map(m => ({ at: "NOW", task: "module-experts", kind: "missing", text: `${m.fact} (lives in ${m.lives_in})` }))
];
if (lines.length && !process.env.PROOF_NO_LOG){
	const tmp = path.join(TMP, "readme-log-lines.json");
	fs.writeFileSync(tmp, JSON.stringify(lines));
	if (!fs.existsSync(RLOG)) fs.writeFileSync(RLOG, "");
	execFileSync(process.execPath, [path.join(REPO, ".claude/hooks/append.mjs"), RLOG, tmp], { stdio: "inherit", windowsHide: true });
}
log(`total cost: ${$(sum(out.runs, "cost") + (out.build?.cost ?? 0) + (out.judge?.cost ?? 0))} · wrote proof.json, proof.md${lines.length ? ", readme-log.jsonl" : ""}`);
setTimeout(() => process.exit(0), 1500);
