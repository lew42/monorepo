#!/usr/bin/env node
// decide.mjs — walks ONE decision into being, step by step, so no part can be forgotten.
//
// A decision is drafted in `<dir>/decide-drafts.json` (next to the target log) and appended to
// the log as one `{"decision":{…}}` line only once every part is there and valid. Every call
// answers `{ok, id, next, missing}`: what is still missing, in the order to give it. A call with a
// missing or bad part is refused with the reason and a non-zero exit.
//
//   node Server/decide.mjs create    --file <page.jsonl> --question "…?" --rank 1 [--id d-x] [--depends-on d-parent:option-id]
//   node Server/decide.mjs options   --file … --id d-x --option "text" --option "text"
//   node Server/decide.mjs caveats   --file … --id d-x --option a --caveat "…" [--caveat "…"]
//   node Server/decide.mjs then      --file … --id d-x --option a [--child d-y]…   (no --child = nothing follows)
//   node Server/decide.mjs recommend --file … --id d-x --option a --confidence 0.7 --why "…" --source id [--source id]
//   node Server/decide.mjs status|show <id> --file …   ·   list --file …   ·   drop <id> --file …
//
// Several parts in one call: `--json '<object or array>'`. An object uses the flags' names; an array
// is the verb's list —
//   options  --json '[{"id"?, "text", "caveats"?:[…], "then"?:[…]}, …]'   (or --options '<same>')
//   caveats  --json '[{"option":"a","caveats":[…]}, …]'   or --caveats '{"a":[…],"b":[…]}'
//   then     --json '[{"option":"a","then":[…]}, …]'      or --then '{"a":[],"b":["d-y"]}'
// An unknown flag, or text that looks like JSON where plain text belongs, is refused.
// Import it as a module: `import * as decide from "./decide.mjs"` — every verb is a function
// `(file, args) → {ok, …}` (the verb `then` is the function `follow`) that throws a DecideError when refused. Detail: Server/doc/decide.md.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export class DecideError extends Error {}
const refuse = msg => { throw new DecideError(msg); };

const pad = n => String(n).padStart(2, "0");
export function now(){
	const d = new Date(), off = -d.getTimezoneOffset(), a = Math.abs(off);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off < 0 ? "-" : "+"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

/* Something that looks like JSON is never turned into text or an id: stripping it to letters
 * made `[{"id":"a",…}]` into one option called "idatextaidbtextb" (2026-09-29). */
const looks_json = s => typeof s === "string" && /^\s*[\[{]/.test(s);
const plain = (s, what) => { if (looks_json(s)) refuse(`${what} looks like JSON (${String(s).slice(0, 40)}…): pass JSON through --options/--caveats/--then/--json, which parse it, not as plain text`); return s; };

const slug = (s, words = 5) => String(s).toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().split(/[\s-]+/).filter(Boolean).slice(0, words).join("-");

/* ── storage: the drafts file, and the log's appended decisions ── */

export const drafts_path = file => path.join(path.dirname(path.resolve(file)), "decide-drafts.json");

function read_drafts(file){
	try { return JSON.parse(fs.readFileSync(drafts_path(file), "utf8").replace(/^﻿/, "")); } catch { return {}; }
}
function write_drafts(file, drafts){
	const p = drafts_path(file);
	if (!Object.keys(drafts).length) { try { fs.unlinkSync(p); } catch {} return; }
	fs.writeFileSync(p, JSON.stringify(drafts, null, "\t") + "\n");
}

/** Every `decision` line already in the log, by id (a later line wins). */
export function logged(file){
	const out = new Map();
	let text = "";
	try { text = fs.readFileSync(file, "utf8"); } catch { return out; }
	for (const l of text.split(/\r?\n/)) {
		if (!l.trim()) continue;
		try { const o = JSON.parse(l); if (o.decision?.id) out.set(o.decision.id, o.decision); } catch {}
	}
	return out;
}

/* One line, newline sniffed, then the whole file re-parsed (.claude/hooks/append.mjs's rule). */
function append(file, obj){
	let out = JSON.stringify(obj) + "\n";
	if (fs.existsSync(file) && fs.statSync(file).size > 0) {
		const fd = fs.openSync(file, "r"), buf = Buffer.alloc(1);
		fs.readSync(fd, buf, 0, 1, fs.statSync(file).size - 1); fs.closeSync(fd);
		if (buf[0] !== 0x0a) out = "\n" + out;
	}
	fs.appendFileSync(file, out, "utf8");
	const bad = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(l => l.trim()).filter(l => { try { JSON.parse(l); return false; } catch { return true; } });
	if (bad.length) refuse(`appended, but ${file} now has ${bad.length} unparseable line(s) — first: ${bad[0].slice(0, 100)}`);
}

/* ── rules: what makes each part valid ── */

function one_sentence(q){
	q = String(q ?? "").trim();
	if (!q) refuse("question is empty: give one plain sentence, ending in a question mark");
	if (q.length > 160) refuse(`question is ${q.length} characters: one plain sentence, 160 at most`);
	if (/[.?!]\s+\S/.test(q)) refuse("question is more than one sentence: keep only the question itself; the detail goes in caveats or why");
	if (!/\?$/.test(q)) refuse("question must end with a question mark");
	return q;
}
function positive_int(n, what){
	const v = Number(n);
	if (!Number.isInteger(v) || v < 1) refuse(`${what} must be a whole number of 1 or more (1 = most foundational); got ${JSON.stringify(n)}`);
	return v;
}
function known_ids(file){ return new Set([...logged(file).keys(), ...Object.keys(read_drafts(file))]); }

function get_draft(drafts, file, id){
	if (!id) refuse("no --id: name the decision (list --file shows the drafts)");
	if (drafts[id]) return drafts[id];
	if (logged(file).has(id)) refuse(`${id} is already appended to the log; a decision is written once`);
	refuse(`no draft called ${id}: start it with create`);
}
function get_option(d, oid){
	const o = d.options.find(o => o.id === oid);
	if (!o) refuse(`${d.id} has no option ${JSON.stringify(oid)}; its options are ${d.options.map(o => o.id).join(", ") || "(none yet)"}`);
	return o;
}

/* Caveats or children for several options at once. Accepts {"<option>": [...]},
 * [{"option": "<id>", "<key>": [...]}, ...], or a plain list for the one --option. */
function per_option(v, option, key){
	if (v && !Array.isArray(v) && typeof v === "object") return v;
	const list = [v ?? []].flat();
	if (list.length && list.every(x => x && typeof x === "object" && !Array.isArray(x))) {
		const map = {};
		for (const x of list) {
			if (!x.option) refuse(`each item of the ${key} list names its option: {"option": "<id>", "${key}": [...]}`);
			map[x.option] = [...(map[x.option] ?? []), ...[x[key] ?? []].flat()];
		}
		return map;
	}
	if (option == null) refuse(`which option? give --option <id>, or a JSON object keyed by option id`);
	return { [option]: list };
}

/* ── what is still missing, in walk order ── */

export function missing(d){
	const m = [];
	if (!d.question) m.push("question");
	if (!d.rank) m.push("rank");
	if (d.options.length < 2) m.push("options (at least two)");
	for (const o of d.options) if (!o.caveats?.length) m.push(`caveats for ${o.id}`);
	for (const o of d.options) if (!Array.isArray(o.then)) m.push(`then for ${o.id} (the decisions that follow it, or none)`);
	if (!d.recommended) m.push("recommended");
	if (d.confidence == null) m.push("confidence");
	if (!d.why) m.push("why");
	if (!d.sources?.length) m.push("sources");
	return m;
}

const NEXT = [
	[/^options/, id => `options --id ${id} --option "<text>" --option "<text>"`],
	[/^caveats for (\S+)/, (id, o) => `caveats --id ${id} --option ${o} --caveat "<what it costs or risks>"`],
	[/^then for (\S+)/, (id, o) => `then --id ${id} --option ${o} [--child <decision id>]… (no --child = nothing follows)`],
	[/^(recommended|confidence|why|sources)/, id => `recommend --id ${id} --option <id> --confidence <0-1> --why "<one or two sentences>" --source <id>`],
];
function next_step(d, m){
	if (!m.length) return null;
	for (const [re, f] of NEXT) { const hit = m[0].match(re); if (hit) return f(d.id, hit[1]); }
	return m[0];
}

/* ── the record written to the log: the new fields AND the old view's (`ask`, `say`, `caveat`) ── */

function record(d, by){
	return { decision: {
		id: d.id, question: d.question, ask: d.question, rank: d.rank,
		options: d.options.map(o => ({ id: o.id, text: o.text, say: o.text, caveats: o.caveats, caveat: o.caveats.join(" "), then: o.then })),
		recommended: d.recommended, confidence: d.confidence, why: d.why, sources: d.sources,
		depends_on: d.depends_on ?? null, status: d.status ?? "open", decided_by: d.decided_by ?? null,
		by: by ?? d.by ?? null, at: now(),
	} };
}

/* After every step: complete → validated and appended, draft removed; else saved, next named. */
function settle(file, drafts, d, by){
	const m = missing(d);
	if (m.length) {
		write_drafts(file, drafts);
		return { ok: true, id: d.id, appended: false, next: next_step(d, m), missing: m };
	}
	// Last checks that need the whole thing.
	get_option(d, d.recommended);
	const known = known_ids(file);
	for (const o of d.options) for (const c of o.then) if (!known.has(c)) refuse(`${d.id}: option ${o.id} leads to ${c}, which is neither drafted nor logged`);
	append(file, record(d, by));
	delete drafts[d.id];
	write_drafts(file, drafts);
	return { ok: true, id: d.id, appended: true, next: null, missing: [] };
}

/* ── the verbs ── */

export function create(file, a){
	const drafts = read_drafts(file);
	const question = one_sentence(a.question);
	const rank = positive_int(a.rank, "rank");
	const id = a.id ? String(a.id) : "d-" + slug(question);
	if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) refuse(`id ${JSON.stringify(id)}: letters, digits and dashes only`);
	if (known_ids(file).has(id)) refuse(`${id} already exists (drafted or logged); pick another --id`);

	let depends_on = null;
	if (a.depends_on) {
		const [decision, option] = typeof a.depends_on === "string" ? a.depends_on.split(":") : [a.depends_on.decision, a.depends_on.option];
		const parent = drafts[decision] ?? logged(file).get(decision);
		if (!parent) refuse(`depends_on names ${decision}, which is neither drafted nor logged`);
		const o = (parent.options ?? []).find(o => o.id === option);
		if (!o) refuse(`depends_on names option ${JSON.stringify(option)} of ${decision}; its options are ${(parent.options ?? []).map(o => o.id).join(", ") || "(none yet)"}`);
		depends_on = { decision, option };
		// A drafted parent learns its child at once, so its `then` can't forget it.
		if (drafts[decision]) { o.then = [...new Set([...(o.then ?? []), id])]; }
	}

	const d = drafts[id] = { id, question, rank, depends_on, options: [], by: a.by };
	const res = settle(file, drafts, d, a.by);
	return a.options ? options(file, { id, options: a.options, by: a.by }) : res;
}

export function options(file, a){
	const drafts = read_drafts(file), d = get_draft(drafts, file, a.id);
	const list = [a.options ?? a.option ?? []].flat();
	if (!list.length) refuse("no options given: --option \"<text>\" (repeat it), or --options '[{\"id\":\"a\",\"text\":\"…\"}]'");
	// All checked before any is added, so a refused call changes nothing.
	const add = [];
	for (const raw of list) {
		const o = typeof raw === "string" ? { text: raw } : raw;
		if (!o || typeof o !== "object") refuse(`an option must be text or {id?, text, caveats?, then?}; got ${JSON.stringify(raw)}`);
		const text = plain(String(o.text ?? o.say ?? "").trim(), "option text");
		if (!text) refuse("an option has no text");
		const oid = o.id != null ? String(o.id) : slug(text, 3);
		if (!/^[a-z0-9][a-z0-9-]*$/i.test(oid)) refuse(`option id ${JSON.stringify(oid)}: letters, digits and dashes only`);
		if ([...d.options, ...add].some(x => x.id === oid)) refuse(`${d.id} already has an option ${oid}; give this one another id`);
		const opt = { id: oid, text };
		if (o.caveats || o.caveat) opt.caveats = [o.caveats ?? o.caveat].flat().map(String).map(c => plain(c.trim(), "a caveat")).filter(Boolean);
		if (o.then) opt.then = [o.then].flat().map(String);
		add.push(opt);
	}
	d.options.push(...add);
	return settle(file, drafts, d, a.by);
}

export function caveats(file, a){
	const drafts = read_drafts(file), d = get_draft(drafts, file, a.id);
	const map = per_option(a.caveats ?? a.caveat, a.option, "caveats");
	for (const [oid, list] of Object.entries(map)) {
		const o = get_option(d, oid);
		const add = [list].flat().filter(x => x != null).map(String).map(s => plain(s.trim(), "a caveat")).filter(Boolean);
		if (!add.length) refuse(`no caveat given for ${oid}: every option costs or risks something — say what`);
		o.caveats = [...(o.caveats ?? []), ...add];
	}
	return settle(file, drafts, d, a.by);
}

/* Named `follow`, not `then`: a module exporting `then` is a thenable, and import() calls it. */
export function follow(file, a){
	const drafts = read_drafts(file), d = get_draft(drafts, file, a.id);
	const map = per_option(a.then ?? a.child ?? [], a.option, "then");
	const known = known_ids(file);
	for (const [oid, list] of Object.entries(map)) {
		const o = get_option(d, oid);
		const ids = [list].flat().filter(x => x != null && x !== "").map(String);
		for (const c of ids) {
			if (c === d.id) refuse(`${d.id} cannot follow from itself`);
			if (!known.has(c)) refuse(`then names ${c}, which is neither drafted nor logged: create it first with --depends-on ${d.id}:${oid}`);
		}
		o.then = [...new Set([...(o.then ?? []), ...ids])];
	}
	return settle(file, drafts, d, a.by);
}

export function recommend(file, a){
	const drafts = read_drafts(file), d = get_draft(drafts, file, a.id);
	if (a.option ?? a.recommended) { get_option(d, a.option ?? a.recommended); d.recommended = a.option ?? a.recommended; }
	if (a.confidence != null) {
		const c = Number(a.confidence);
		if (!Number.isFinite(c) || c < 0 || c > 1) refuse(`confidence must be a number from 0 to 1; got ${JSON.stringify(a.confidence)}`);
		d.confidence = c;
	}
	if (a.why != null) { if (!String(a.why).trim()) refuse("why is empty"); d.why = plain(String(a.why).trim(), "why"); }
	const src = [a.sources ?? a.source ?? []].flat().map(String).map(s => s.trim()).filter(Boolean);
	if (src.length) d.sources = [...new Set([...(d.sources ?? []), ...src])];
	if (a.status) { if (!["open", "decided"].includes(a.status)) refuse("status is open or decided"); d.status = a.status; }
	if (a.decided_by) d.decided_by = String(a.decided_by);
	if (d.status === "decided" && !d.decided_by) refuse("a decided decision names who decided it: --decided-by");
	return settle(file, drafts, d, a.by);
}

export function status(file, a){
	const drafts = read_drafts(file), id = a.id;
	if (drafts[id]) { const m = missing(drafts[id]); return { ok: true, id, appended: false, next: next_step(drafts[id], m), missing: m }; }
	if (logged(file).has(id)) return { ok: true, id, appended: true, next: null, missing: [] };
	refuse(`no decision ${id}`);
}

export function show(file, a){
	const d = read_drafts(file)[a.id] ?? logged(file).get(a.id);
	if (!d) refuse(`no decision ${a.id}`);
	return { ok: true, draft: !logged(file).has(a.id), decision: d };
}

export function drop(file, a){
	const drafts = read_drafts(file);
	if (!drafts[a.id]) refuse(`no draft ${a.id} (a logged decision is never removed)`);
	delete drafts[a.id];
	write_drafts(file, drafts);
	return { ok: true, id: a.id, dropped: true };
}

/** Ranked and nested: roots by rank, each option's children under it. Drafts marked. */
export function list(file){
	const all = new Map(logged(file));
	const drafts = read_drafts(file);
	for (const [id, d] of Object.entries(drafts)) all.set(id, { ...d, draft: true });
	const kids = (pid, oid) => [...all.values()].filter(d => d.depends_on?.decision === pid && d.depends_on?.option === oid).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
	const node = d => ({
		id: d.id, rank: d.rank, question: d.question ?? d.ask, confidence: d.confidence, recommended: d.recommended, draft: !!d.draft,
		options: (d.options ?? []).map(o => ({ id: o.id, text: o.text ?? o.say, then: kids(d.id, o.id).map(node) })),
	});
	const roots = [...all.values()].filter(d => !d.depends_on || !all.has(d.depends_on.decision)).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
	return { ok: true, decisions: roots.map(node) };
}

export const verbs = { create, options, caveats, then: follow, recommend, status, show, list, drop };

/* ── the command line ── */

/* The flags each verb knows; anything else is refused with this list, never silently kept. */
export const FLAGS = {
	create:    ["file", "json", "by", "id", "question", "rank", "depends-on"],
	options:   ["file", "json", "by", "id", "option", "options"],
	caveats:   ["file", "json", "by", "id", "option", "caveat", "caveats"],
	then:      ["file", "json", "by", "id", "option", "child", "then"],
	recommend: ["file", "json", "by", "id", "option", "confidence", "why", "source", "sources", "status", "decided-by"],
	status: ["file", "id"], show: ["file", "id"], drop: ["file", "id"], list: ["file"],
};
const JSON_FLAGS = new Set(["json", "options", "caveats", "then", "sources"]);	// parsed when the value starts with [ or {
const ARRAY_OF = { options: "options", caveats: "caveats", then: "then" };	// what a bare --json array means, per verb

export function parse(verb, argv){
	const a = {}, pos = [];
	const known = FLAGS[verb] ?? [];
	const many = new Set(["option", "caveat", "child", "source"]);
	for (let i = 0; i < argv.length; i++) {
		const t = argv[i];
		if (!t.startsWith("--")) { pos.push(t); continue; }
		const flag = t.slice(2);
		if (!known.includes(flag)) refuse(`unknown flag --${flag} for ${verb}; known: ${known.map(f => "--" + f).join(" ")}`);
		const k = flag.replace(/-/g, "_");
		if (i + 1 >= argv.length || argv[i + 1].startsWith("--")) refuse(`--${flag} needs a value`);
		let v = argv[++i];
		if (JSON_FLAGS.has(k) && /^\s*[\[{]/.test(v)) {
			try { v = JSON.parse(v); } catch (e) { refuse(`--${flag} is not valid JSON: ${e.message}`); }
		}
		if (k === "json") {
			if (Array.isArray(v)) { if (!ARRAY_OF[verb]) refuse("--json as an array only fits options, caveats or then"); a[ARRAY_OF[verb]] = v; }
			else if (v && typeof v === "object") Object.assign(a, v);
			else refuse("--json takes a JSON object or array");
		}
		else if (many.has(k)) (a[k] ??= []).push(v);
		else a[k] = v;
	}
	if (a.child) a.then = [...[a.then ?? []].flat(), ...a.child];
	if (a.source) a.sources = [...[a.sources ?? []].flat(), ...a.source];
	return { a, pos };
}

async function main(){
	const [verb, ...rest] = process.argv.slice(2);
	if (!verbs[verb]) { console.log(JSON.stringify({ ok: false, error: `verbs: ${Object.keys(verbs).join(" ")}` })); process.exit(2); }
	try {
		const { a, pos } = parse(verb, rest);
		if (!a.file) refuse("--file <page.jsonl> is required");
		if (pos[0] && !a.id) a.id = pos[0];
		if (verb === "options" && a.option) a.options = [...[a.options ?? []].flat(), ...a.option];
		else if (Array.isArray(a.option)) { if (a.option.length > 1) refuse(`${verb} takes one --option; for several, give --${verb} a JSON object keyed by option id`); a.option = a.option[0]; }
		if (verb === "caveats" && a.caveat) a.caveats = [...[a.caveats ?? []].flat(), ...a.caveat];
		console.log(JSON.stringify(verbs[verb](a.file, a), null, verb === "list" || verb === "show" ? 2 : 0));
	} catch (e) {
		if (!(e instanceof DecideError)) throw e;
		console.log(JSON.stringify({ ok: false, refused: e.message }));
		process.exit(1);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
