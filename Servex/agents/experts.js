/* EXPERTS — an agent that has already read one module, ready to be asked.
 *
 * An expert is a Claude session started once with a module's RECIPE (its
 * `expert.json`: the readme chain, the key files in full, the rest named). Its
 * session id is kept as the module's BASE CHECKPOINT in `Servex/experts.json`.
 * A question FORKS that checkpoint: a new session with the whole reading
 * already in it, which reuses the prompt cache, answers once and stops. The
 * base is never written to, so every question starts from the same context.
 *
 *   recipe(module)              the module's expert.json (or a readme-only fallback)
 *   load_module(modules)        everything about one or several modules, as DATA
 *   readme(modules)             THE "read me" verb: load_module formatted as one prompt text
 *   build(host, module, opts)   run the recipe into a session, record the checkpoint
 *   fresh(module)               re-hash the recorded files: {fresh, changed}
 *   ask(host, module, q, opts)  fresh? else rebuild; then fork the checkpoint with the question
 *
 * Plain functions. The only SDK contact is `host.spawn` (Agents.js), so a
 * provider swap touches the host, never this file. `module` is a path under
 * public/framework/ (`core/Page`) or, failing that, under the repo (`Servex`).
 *
 * CLI:  node Servex/agents/experts.js readme core/Page Servex
 *       node Servex/agents/experts.js list
 *       node Servex/agents/experts.js fresh core/Page */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../..");
const FRAMEWORK = path.join(REPO, "public/framework");

/* Where the checkpoints are listed. A proof passes its own (`{index}`) or sets
 * SERVEX_EXPERTS, so it never writes the real one. */
export const INDEX = () => process.env.SERVEX_EXPERTS ?? path.join(REPO, "Servex/experts.json");

/* Tools a question's fork may actually USE (the rest stay listed but refused,
 * which keeps the cache): enough to open an on-demand file. */
const ASK_TOOLS = ["Read", "Grep", "Glob"];

/* The readme chain comes from the sibling task's readme-chain.js. Until that
 * file is on this branch, a small fallback does the same walk: every readme
 * from the repo root down to `dir`, each cut to its first 40 lines. */
const chain_mod = await import("./readme-chain.js").catch(() => null);
const readme_chain = chain_mod?.readme_chain ?? function fallback_chain(dir){
	const rel = path.relative(REPO, path.resolve(REPO, dir));
	if (rel.startsWith("..")) return [];
	const out = [];
	let cur = REPO;
	for (const seg of ["", ...rel.split(path.sep).filter(Boolean)]){
		cur = path.join(cur, seg);
		for (const name of ["readme.md", "README.md"]){
			const p = path.join(cur, name);
			if (!fs.existsSync(p)) continue;
			const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
			const more = lines.findIndex(l => /^##\s+More\b/i.test(l.trim()));
			const limit = more >= 0 ? Math.min(more, 40) : 40;
			out.push({ path: rel_path(p), text: lines.slice(0, limit).join("\n").trimEnd(), truncated: lines.length > limit });
			break;
		}
	}
	return out;
};

const rel_path = abs => path.relative(REPO, abs).split(path.sep).join("/");
const sha1 = text => crypto.createHash("sha1").update(text).digest("hex");
const read = abs => { try { return fs.readFileSync(abs, "utf8"); } catch { return null; } };

/* A module word → its directory: under public/framework/ first, else the repo.
 * Case must match exactly — Windows would happily find `Servex` at
 * public/framework/servex, a different module. */
const exact = d => { try { return fs.statSync(d).isDirectory() && fs.readdirSync(path.dirname(d)).includes(path.basename(d)); } catch { return false; } };
export function dir_of(module){
	for (const base of [FRAMEWORK, REPO]){
		const d = path.join(base, module);
		if (exact(d)) return d;
	}
	throw new Error(`No module "${module}": not a directory under public/framework/ or the repo.`);
}

/* RECIPE — the module's expert.json. A module without one gets the fallback:
 * its readme in full, and its doc/*.md named on demand. `file` is set only
 * when a real expert.json exists (it is hashed too: a recipe change is a change). */
export function recipe(module){
	const dir = dir_of(module);
	const file = path.join(dir, "expert.json");
	if (fs.existsSync(file)){
		const r = JSON.parse(fs.readFileSync(file, "utf8"));
		return { module, title: `${module} expert`, chain: true, load: [], also: [], on_demand: [], ...r, dir, file };
	}
	const docs = fs.existsSync(path.join(dir, "doc"))
		? fs.readdirSync(path.join(dir, "doc")).filter(f => f.endsWith(".md")).map(f => `doc/${f}`) : [];
	return { module, title: `${module} expert`, covers: `the ${module} module`, chain: true,
		load: ["readme.md"].filter(f => fs.existsSync(path.join(dir, f))), also: [], on_demand: docs,
		model: "claude-sonnet-5", deep_model: "claude-opus-5-5", dir, file: null };
}

/* One line saying what a file is: its first heading, else its first comment line. */
function purpose(abs){
	if (fs.existsSync(abs) && fs.statSync(abs).isDirectory())
		return `a folder of ${fs.readdirSync(abs).length} entries`;
	const text = read(abs);
	if (text == null) return "(missing)";
	const line = text.split(/\r?\n/).map(l => l.trim()).find(l => l && !/^[{[]$/.test(l)) ?? "";
	return line.replace(/^#+\s*|^\/\*+\s*|^\/\/\s*/g, "").slice(0, 120);
}

const fence = (rel, text) => {
	const lang = { ".js": "js", ".mjs": "js", ".css": "css", ".json": "json", ".jsonl": "json" }[path.extname(rel)];
	return lang ? "````" + lang + "\n" + text.trimEnd() + "\n````" : text.trimEnd();
};

/* LOAD_MODULE — everything to know about one or several modules, as DATA:
 *   chain      the readmes from the repo root down to each module, first screens,
 *              deduplicated across modules (a shared parent readme appears once)
 *   modules    per module: title, covers, and its recipe's `load` + `also` files IN FULL
 *   on_demand  the rest, by path and one-line purpose — not loaded
 *   files      the recipe's own `load` + `also` files (plus the recipe.json itself), each
 *              with its sha1 — what a checkpoint's freshness re-checks. Chain readmes are
 *              NOT in here: a parent readme changing should not make every module stale.
 *   tokens     a rough size: chars / 2.25 (measured 2026-09-29 on core/Page — code and markdown run ~2.25 chars a token, not 4)
 * Harness-agnostic on purpose: an SDK tool, an MCP tool and `readme()` are all
 * thin wrappers around this one function. `extra` adds files to the first module. */
export function load_module(modules, { extra = [] } = {}){
	modules = [].concat(modules);
	const recipes = modules.map(recipe);
	const hashes = new Map();                      // repo path → sha1
	const full = new Set();                        // loaded in full, so the chain skips its first screen
	for (const r of recipes) for (const f of [...r.load, ...r.also]) full.add(rel_path(path.join(r.dir, f)));

	// Chain readmes go into the PROMPT (chain, below) but stay OUT of the freshness
	// set: a checkpoint should not go stale just because a parent readme (the root,
	// framework/readme.md, …) changed — only the recipe's own `load`/`also` files do.
	const seen = new Set(), chain = [];
	for (const r of recipes) if (r.chain !== false)
		for (const lvl of readme_chain(r.dir)) if (!seen.has(lvl.path) && !full.has(lvl.path)){
			seen.add(lvl.path);
			chain.push({ path: lvl.path, text: lvl.text.trimEnd(), truncated: !!lvl.truncated });
		}

	const out = recipes.map((r, i) => {
		if (r.file) hashes.set(rel_path(r.file), sha1(read(r.file)));
		const names = [...r.load, ...r.also, ...(i === 0 ? extra : [])];
		const files = names.map(f => {
			const abs = path.isAbsolute(f) ? f : path.join(r.dir, f);
			const text = read(abs);
			if (text != null) hashes.set(rel_path(abs), sha1(text));
			return { path: rel_path(abs), text, missing: text == null };
		});
		const on_demand = r.on_demand.map(f => { const abs = path.join(r.dir, f); return { path: rel_path(abs), purpose: purpose(abs) }; });
		return { module: r.module, title: r.title, covers: r.covers, recipe: r.file ? rel_path(r.file) : null, files, on_demand };
	});

	const size = [...chain.map(c => c.text), ...out.flatMap(m => m.files.map(f => f.text ?? ""))].join("").length;
	return { modules: out, chain, files: [...hashes].map(([p, h]) => ({ path: p, sha1: h })), tokens: Math.round(size / 2.25) };
}

/* THE READ-ME VERB: `load_module()` formatted as one prompt text. */
export function format(bundle){
	const names = bundle.modules.map(m => m.module);
	const out = [`# Read me: ${names.join(", ")}`, "",
		"This is everything you need to know about " + (names.length > 1 ? "these modules" : "this module")
		+ ": first the readmes from the repo root down to it (where it sits), then its key files in full,"
		+ " then a list of files you can open yourself when a question needs them. Paths are relative to the repo root."];
	if (bundle.chain.length){
		out.push("", "## Where it sits — the readme chain");
		for (const c of bundle.chain) out.push("", `### ${c.path}${c.truncated ? " (first screen; open the file for the rest)" : ""}`, "", c.text);
	}
	for (const m of bundle.modules){
		out.push("", `## ${m.title} — ${m.module}`, "", `Covers: ${m.covers}.`);
		for (const f of m.files) out.push("", ...(f.missing
			? [`### ${f.path} — MISSING (named in the recipe, not found)`]
			: [`### ${f.path}`, "", fence(f.path, f.text)]));
		if (m.on_demand.length){
			out.push("", `### On demand — ${m.module}`, "", "Not loaded. Open one with the Read tool only when a question needs it:", "");
			for (const d of m.on_demand) out.push(`- \`${d.path}\` — ${d.purpose}`);
		}
	}
	return out.join("\n") + "\n";
}

export const readme = modules => format(load_module(modules));

/* ---- the index: Servex/experts.json, one row per checkpoint ---- */

export function rows({ index = INDEX() } = {}){
	try { return JSON.parse(fs.readFileSync(index, "utf8")).rows ?? []; } catch { return []; }
}
function save(list, { index = INDEX() } = {}){
	fs.mkdirSync(path.dirname(index), { recursive: true });
	fs.writeFileSync(index, JSON.stringify({ note: "Module expert checkpoints. Written by Servex/agents/experts.js; see Servex/agents/doc/experts.md.", rows: list }, null, "\t") + "\n");
}
function record(row, opts){
	const list = rows(opts).filter(r => !(r.module === row.module && r.kind === row.kind && r.model === row.model
		&& (row.kind === "base" || r.key === row.key)));
	save([...list, row], opts);
	return row;
}
const base_row = (module, model, opts) => rows(opts).find(r => r.module === module && r.kind === "base" && r.model === model);

/* FRESHNESS — every file the checkpoint read, re-hashed; plus any file the
 * recipe would load NOW that it did not (a recipe grew). */
export function row_fresh(row){
	const changed = [];
	for (const f of row.files){
		const text = read(path.join(REPO, f.path));
		if (text == null) changed.push(`${f.path} (gone)`);
		else if (sha1(text) !== f.sha1) changed.push(f.path);
	}
	if (row.kind === "base"){
		try {
			const had = new Set(row.files.map(f => f.path));
			for (const f of load_module([row.module]).files) if (!had.has(f.path)) changed.push(`${f.path} (new in the recipe)`);
		} catch (e){ changed.push(`recipe unreadable: ${e.message}`); }
	}
	return { fresh: changed.length === 0, changed };
}

export function fresh(module, opts = {}){
	const mine = rows(opts).filter(r => r.module === module);
	if (!mine.length) return { fresh: false, built: false, changed: [], rows: [] };
	const each = mine.map(r => ({ kind: r.kind, model: r.model, session_id: r.session_id, ...row_fresh(r) }));
	return { fresh: each.every(e => e.fresh), built: true, changed: [...new Set(each.flatMap(e => e.changed))], rows: each };
}

/* ---- building and asking ---- */

/* Everything that shapes the cached prefix. A fork must match it exactly, so
 * it is RECORDED on the row and copied onto every question. `setting_sources:
 * []` — no project hooks, no CLAUDE.md, no project MCP servers — keeps the
 * expert's context to exactly its recipe. */
const POSTURE = ["model", "effort", "cwd", "permission_mode", "setting_sources"];
const posture = row => Object.fromEntries(POSTURE.map(k => [k, row[k]]));

const slug = module => module.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const tokens_of = u => u ? (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) : null;

/* Run one turn and wait for it; stop the agent after (a checkpoint is a
 * session file, not a live process — holding one open costs ~250 MB). */
async function one_turn(host, spec, timeout_s = 900){
	const t0 = Date.now();
	const agent = host.spawn(spec);
	const r = await host.wait(agent.id, timeout_s);
	if (r.timed_out) { try { agent.stop(); } catch {} throw new Error(`${agent.id} did not finish in ${timeout_s}s.`); }
	if (agent.state !== "stopped") agent.stop();
	return { agent, words: r.words, ms: Date.now() - t0 };
}

/* BUILD — the base checkpoint (`{model}`), or a DERIVED one (`{extra, from}`):
 * the base resumed as a fork, fed more files, and kept as its own row. */
const building = new Map();
export function build(host, module, opts = {}){
	const key = `${module}|${opts.model ?? ""}|${(opts.extra ?? []).join(",")}|${opts.from ?? ""}`;
	if (!building.has(key)) building.set(key, _build(host, module, opts).finally(() => building.delete(key)));
	return building.get(key);
}

async function _build(host, module, { model, effort = "medium", extra = [], from, cwd = REPO, index, timeout_s } = {}){
	const r = recipe(module);
	const say = `You are the ${r.title}. Read nothing else now. Reply only: READY.`;

	if (extra.length){
		const base = rows({ index }).find(x => x.session_id === from) ?? base_row(module, model ?? r.model, { index });
		if (!base) throw new Error(`No base checkpoint for ${module} to derive from; build the base first.`);
		const more = load_module([module], { extra }).files.filter(f => !base.files.some(b => b.path === f.path));
		const text = extra.map(f => { const abs = path.isAbsolute(f) ? f : path.join(r.dir, f);
			return `### ${rel_path(abs)}\n\n${fence(abs, read(abs) ?? "(missing)")}`; }).join("\n\n");
		const { agent, ms } = await one_turn(host, { ...posture(base), role: "expert", name: `${slug(module)}-derived`,
			resume: base.session_id, fork: true, prompt: `More files for the ${r.title}:\n\n${text}\n\n${say}` }, timeout_s);
		return record({ module, kind: "derived", key: extra.join(","), base: base.session_id, session_id: agent.session_id,
			...posture(base), built_at: new Date().toISOString(), build_ms: ms, extra,
			files: [...base.files, ...more], tokens: agent.context ?? tokens_of(agent.usage), cost: agent.cost - (base.session_cost ?? base.cost ?? 0), session_cost: agent.cost }, { index });
	}

	const p = load_module([module]);
	const spec = { role: "expert", name: slug(module), model: model ?? r.model, effort, cwd,
		permission_mode: "bypassPermissions", setting_sources: [], prompt: `${format(p)}\n\n${say}` };
	const { agent, ms } = await one_turn(host, spec, timeout_s);
	return record({ module, kind: "base", session_id: agent.session_id, ...posture(spec),
		built_at: new Date().toISOString(), build_ms: ms, files: p.files, usage: agent.usage,
		tokens: agent.context ?? tokens_of(agent.usage), cost: agent.cost, session_cost: agent.cost }, { index });
}

/* ASK — the checkpoint for this model, rebuilt first if a recorded file
 * changed, then forked with the question. `deep` uses the recipe's
 * `deep_model`; the cache is per model, so a deep question has its own base. */
export async function ask(host, module, question, { model, deep = false, index, timeout_s = 600 } = {}){
	const r = recipe(module);
	const want = deep ? (r.deep_model ?? r.model) : (model ?? r.model);
	let row = base_row(module, want, { index }), stale_rebuilt = false, built = false, stale;
	if (!row){ row = await build(host, module, { model: want, index }); built = true; }
	else if (!(stale = row_fresh(row)).fresh){ row = await build(host, module, { model: want, index }); stale_rebuilt = true; }

	const prompt = `Question: ${question}\n\nAnswer as the ${r.title}, from what you have already read.`
		+ ` Open an on-demand file (Read, Grep, Glob) only if the question truly needs it.`
		+ ` Be concrete: name the method, file and line of reasoning. Plain sentences, no preamble.`;
	const { agent, words, ms } = await one_turn(host, { ...posture(row), role: "expert-ask", name: slug(module),
		resume: row.session_id, fork: true, one_shot: true, fork_tools: ASK_TOOLS, prompt }, timeout_s);
	const u = agent.usage ?? {};
	return { answer: words ?? "", id: agent.id, ms, cost: agent.cost - (row.session_cost ?? row.cost ?? 0), session_cost: agent.cost, model: row.model, session_id: agent.session_id,
		checkpoint: row.session_id, stale_rebuilt, built, changed: stale?.changed ?? [],
		cache_read: u.cache_read_input_tokens ?? 0, cache_write: u.cache_creation_input_tokens ?? 0 };
}

/* ---- MCP tools (wired by tools.js) ---- */

const tool = (name, description, properties, required, handler) => {
	const inputSchema = { type: "object", required, properties };
	return { name, description, inputSchema, schema: inputSchema, handler };
};

export function expert_tools(host){
	return [
		tool("ask_expert",
			"Ask a module's EXPERT one question: a session that has already read that module (its readme chain,"
			+ " its key files in full). The checkpoint is forked, so the answer comes from a clean, cached context"
			+ " in seconds; if a file it read has changed since, it is rebuilt first. `list_experts` shows which"
			+ " modules have one; a module without one is built on first ask from its readme and docs.",
			{
				module: { type: "string", description: "A path under public/framework/, e.g. `core/Page`." },
				question: { type: "string", description: "The question, in full." },
				deep: { type: "boolean", description: "Use the recipe's deep model (Opus) instead of the fast one. Slower and dearer; its first deep question builds its own checkpoint." }
			},
			["module", "question"],
			async ({ module, question, deep }) => {
				const a = await ask(host, module, question, { deep: !!deep });
				return `${a.answer}\n\n— ${module} expert · ${a.model} · ${(a.ms / 1000).toFixed(1)}s · $${(a.cost ?? 0).toFixed(4)}`
					+ ` · ${a.cache_read} cached tokens${a.stale_rebuilt ? " · rebuilt: stale" : a.built ? " · built: first ask" : ""}`;
			}),
		tool("list_experts",
			"Every module expert checkpoint: module, base or derived, model, session id, when built, what it cost,"
			+ " and whether it is still FRESH (every file it read unchanged) or STALE (it will rebuild on the next ask).",
			{}, [],
			() => JSON.stringify(rows().map(r => ({ module: r.module, kind: r.kind, model: r.model, session_id: r.session_id,
				built_at: r.built_at, tokens: r.tokens, cost: r.cost, files: r.files.length, ...row_fresh(r) })), null, 2)),
		...loader_tools()
	];
}

/* The read-me verb as a tool, under two names: `load_module` (what a session
 * calls to load modules into itself) and `readme_modules` (the same text, the
 * name a mastermind reaches for when briefing a cross-module agent). Both are
 * `load_module()` formatted by `format()`; the tool is only the adapter. */
export function loader_tools(){
	const modules = { type: "array", items: { type: "string" }, description: "Module paths, e.g. [\"core/Page\"] or [\"core/Page\", \"Servex\"]." };
	const run = ({ modules }) => readme(modules);
	return [
		tool("load_module",
			"Load one or several modules into your context in ONE call: the readmes from the repo root down to each"
			+ " module (each shared parent readme once), each module's key files in full, and the rest listed by path"
			+ " to open on demand. Call it first, before reading files one by one.",
			{ modules }, ["modules"], run),
		tool("readme_modules",
			"The READ-ME verb: everything to know about one or several modules as one text — the same bundle as"
			+ " `load_module`. Put it in a new mastermind's first prompt to make it a cross-module expert"
			+ " (\"the server and three of its plugins\").",
			{ modules }, ["modules"], run)
	];
}

/* ---- CLI ---- */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const [verb, ...args] = process.argv.slice(2);
	if (verb === "readme" && args.length) process.stdout.write(readme(args));
	else if (verb === "list") console.log(JSON.stringify(rows().map(r => ({ ...r, files: r.files.length, ...row_fresh(r) })), null, 2));
	else if (verb === "fresh" && args[0]) console.log(JSON.stringify(fresh(args[0]), null, 2));
	else if (verb === "tokens" && args.length){ const p = load_module(args); console.log(`${p.tokens} tokens (chars / 2.25), ${p.files.length} files`); }
	else console.log("usage: node Servex/agents/experts.js readme <module> [module…] | tokens <module…> | list | fresh <module>");
}
