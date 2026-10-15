#!/usr/bin/env node
// Decide.mjs — walks ONE decision into being, step by step, so no part can be forgotten.
//
// A decision is drafted in `<dir>/decide-drafts.json` (next to the target log) and appended to
// the log as one `{"decision":{…}}` line only once every part is there and valid. Every call
// answers `{ok, id, next, missing}`: what is still missing, in the order to give it. A call with a
// missing or bad part is refused with the reason and a non-zero exit.
//
// Decided by default: a finished decision is written `status: "decided"`, `decided_by: "system"` —
// the recommended option, with the alternatives it passed over right beside it. Pass
// `--owner-only "<reason>"` (create or recommend) only for the rare decision that is truly the
// owner's alone — a key, money, something destructive — and it stays `status: "open"` until a real
// `chose` line picks an option.
//
//   node Server/Decide.mjs create    --file <page.jsonl> --question "…?" --rank 1 [--id d-x] [--depends-on d-parent:option-id] [--owner-only "reason"]
//   node Server/Decide.mjs options   --file … --id d-x --option "text" --option "text"
//   node Server/Decide.mjs caveats   --file … --id d-x --option a --caveat "…" [--caveat "…"]
//   node Server/Decide.mjs then      --file … --id d-x --option a [--child d-y]…   (no --child = nothing follows)
//   node Server/Decide.mjs recommend --file … --id d-x --option a --confidence 0.7 --why "…" --source id [--source id]
//   node Server/Decide.mjs status|show <id> --file …   ·   list --file …   ·   drop <id> --file …
//
// Several parts in one call: `--json '<object or array>'`. An object uses the flags' names; an array
// is the verb's list —
//   options  --json '[{"id"?, "text", "caveats"?:[…], "then"?:[…]}, …]'   (or --options '<same>')
//   caveats  --json '[{"option":"a","caveats":[…]}, …]'   or --caveats '{"a":[…],"b":[…]}'
//   then     --json '[{"option":"a","then":[…]}, …]'      or --then '{"a":[],"b":["d-y"]}'
// An unknown flag, or text that looks like JSON where plain text belongs, is refused.
// Import it as a module: `import Decide from "./Decide.mjs"` (or `import * as decide`, the named aliases at the bottom) — every verb is a static method
// `(file, args) → {ok, …}` (the verb `then` is the function `follow`) that throws a DecideError when refused. Detail: Server/doc/decide.md.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export class DecideError extends Error {}
export default class Decide {
	static refuse = msg => { throw new DecideError(msg); };

	static pad = n => String(n).padStart(2, "0");
	static now(){
		const d = new Date(), off = -d.getTimezoneOffset(), a = Math.abs(off);
		return `${d.getFullYear()}-${Decide.pad(d.getMonth() + 1)}-${Decide.pad(d.getDate())}T${Decide.pad(d.getHours())}:${Decide.pad(d.getMinutes())}:${Decide.pad(d.getSeconds())}${off < 0 ? "-" : "+"}${Decide.pad(Math.floor(a / 60))}:${Decide.pad(a % 60)}`;
	}

	/* Something that looks like JSON is never turned into text or an id: stripping it to letters
	 * made `[{"id":"a",…}]` into one option called "idatextaidbtextb" (2026-09-29). */
	static looks_json = s => typeof s === "string" && /^\s*[\[{]/.test(s);
	static plain = (s, what) => { if (Decide.looks_json(s)) Decide.refuse(`${what} looks like JSON (${String(s).slice(0, 40)}…): pass JSON through --options/--caveats/--then/--json, which parse it, not as plain text`); return s; };

	static slug = (s, words = 5) => String(s).toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().split(/[\s-]+/).filter(Boolean).slice(0, words).join("-");

	/* ── storage: the drafts file, and the log's appended decisions ── */

	static drafts_path = file => path.join(path.dirname(path.resolve(file)), "decide-drafts.json");

	static read_drafts(file){
		try { return JSON.parse(fs.readFileSync(Decide.drafts_path(file), "utf8").replace(/^﻿/, "")); } catch { return {}; }
	}
	static write_drafts(file, drafts){
		const p = Decide.drafts_path(file);
		if (!Object.keys(drafts).length) { try { fs.unlinkSync(p); } catch {} return; }
		fs.writeFileSync(p, JSON.stringify(drafts, null, "\t") + "\n");
	}

	/** Every `decision` line already in the log, by id (a later line wins). */
	static logged(file){
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
	static append(file, obj){
		let out = JSON.stringify(obj) + "\n";
		if (fs.existsSync(file) && fs.statSync(file).size > 0) {
			const fd = fs.openSync(file, "r"), buf = Buffer.alloc(1);
			fs.readSync(fd, buf, 0, 1, fs.statSync(file).size - 1); fs.closeSync(fd);
			if (buf[0] !== 0x0a) out = "\n" + out;
		}
		fs.appendFileSync(file, out, "utf8");
		const bad = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(l => l.trim()).filter(l => { try { JSON.parse(l); return false; } catch { return true; } });
		if (bad.length) Decide.refuse(`appended, but ${file} now has ${bad.length} unparseable line(s) — first: ${bad[0].slice(0, 100)}`);
	}

	/* ── rules: what makes each part valid ── */

	static one_sentence(q){
		q = String(q ?? "").trim();
		if (!q) Decide.refuse("question is empty: give one plain sentence, ending in a question mark");
		if (q.length > 160) Decide.refuse(`question is ${q.length} characters: one plain sentence, 160 at most`);
		if (/[.?!]\s+\S/.test(q)) Decide.refuse("question is more than one sentence: keep only the question itself; the detail goes in caveats or why");
		if (!/\?$/.test(q)) Decide.refuse("question must end with a question mark");
		return q;
	}
	static positive_int(n, what){
		const v = Number(n);
		if (!Number.isInteger(v) || v < 1) Decide.refuse(`${what} must be a whole number of 1 or more (1 = most foundational); got ${JSON.stringify(n)}`);
		return v;
	}
	static known_ids(file){ return new Set([...Decide.logged(file).keys(), ...Object.keys(Decide.read_drafts(file))]); }

	static get_draft(drafts, file, id){
		if (!id) Decide.refuse("no --id: name the decision (list --file shows the drafts)");
		if (drafts[id]) return drafts[id];
		if (Decide.logged(file).has(id)) Decide.refuse(`${id} is already appended to the log; a decision is written once`);
		Decide.refuse(`no draft called ${id}: start it with create`);
	}
	static get_option(d, oid){
		const o = d.options.find(o => o.id === oid);
		if (!o) Decide.refuse(`${d.id} has no option ${JSON.stringify(oid)}; its options are ${d.options.map(o => o.id).join(", ") || "(none yet)"}`);
		return o;
	}

	/* Caveats or children for several options at once. Accepts {"<option>": [...]},
	 * [{"option": "<id>", "<key>": [...]}, ...], or a plain list for the one --option. */
	static per_option(v, option, key){
		if (v && !Array.isArray(v) && typeof v === "object") return v;
		const list = [v ?? []].flat();
		if (list.length && list.every(x => x && typeof x === "object" && !Array.isArray(x))) {
			const map = {};
			for (const x of list) {
				if (!x.option) Decide.refuse(`each item of the ${key} list names its option: {"option": "<id>", "${key}": [...]}`);
				map[x.option] = [...(map[x.option] ?? []), ...[x[key] ?? []].flat()];
			}
			return map;
		}
		if (option == null) Decide.refuse(`which option? give --option <id>, or a JSON object keyed by option id`);
		return { [option]: list };
	}

	/* ── what is still missing, in walk order ── */

	static missing(d){
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

	static NEXT = [
		[/^options/, id => `options --id ${id} --option "<text>" --option "<text>"`],
		[/^caveats for (\S+)/, (id, o) => `caveats --id ${id} --option ${o} --caveat "<what it costs or risks>"`],
		[/^then for (\S+)/, (id, o) => `then --id ${id} --option ${o} [--child <decision id>]… (no --child = nothing follows)`],
		[/^(recommended|confidence|why|sources)/, id => `recommend --id ${id} --option <id> --confidence <0-1> --why "<one or two sentences>" --source <id>`],
	];
	static next_step(d, m){
		if (!m.length) return null;
		for (const [re, f] of Decide.NEXT) { const hit = m[0].match(re); if (hit) return f(d.id, hit[1]); }
		return m[0];
	}

	/* ── the record written to the log: the new fields AND the old view's (`ask`, `say`, `caveat`) ── */

	/* Decided by default (the owner, 2026-09-29): nothing waits on the owner unless the decision is
	 * truly theirs — a key, money, something destructive. That kind is flagged `owner_only` (e.g.
	 * `owner_only: "key"`) and stays `status: "open"` until a real `chose` line picks an option. Every
	 * other decision is written already `status: "decided"`, `decided_by: "system"` — the recommended
	 * option is the one the system chose, the rest are the alternatives it considered, right there in
	 * the same record. A `chose` line still overrides it at any time (the card decides, and its latest
	 * `chose` line always wins — see Decision.js): the owner can click a different option, and that
	 * becomes `decided_by: "owner"`. */
	static record(d, by){
		const owner_only = d.owner_only ? String(d.owner_only) : null;
		return { decision: {
			id: d.id, question: d.question, ask: d.question, rank: d.rank,
			options: d.options.map(o => ({ id: o.id, text: o.text, say: o.text, caveats: o.caveats, caveat: o.caveats.join(" "), then: o.then })),
			recommended: d.recommended, confidence: d.confidence, why: d.why, sources: d.sources,
			depends_on: d.depends_on ?? null,
			status: owner_only ? "open" : "decided", decided_by: owner_only ? null : "system", owner_only,
			by: by ?? d.by ?? null, at: Decide.now(),
		} };
	}

	/* After every step: complete → validated and appended, draft removed; else saved, next named. */
	static settle(file, drafts, d, by){
		const m = Decide.missing(d);
		if (m.length) {
			Decide.write_drafts(file, drafts);
			return { ok: true, id: d.id, appended: false, next: Decide.next_step(d, m), missing: m };
		}
		// Last checks that need the whole thing.
		Decide.get_option(d, d.recommended);
		const known = Decide.known_ids(file);
		for (const o of d.options) for (const c of o.then) if (!known.has(c)) Decide.refuse(`${d.id}: option ${o.id} leads to ${c}, which is neither drafted nor logged`);
		Decide.append(file, Decide.record(d, by));
		delete drafts[d.id];
		Decide.write_drafts(file, drafts);
		return { ok: true, id: d.id, appended: true, next: null, missing: [] };
	}

	/* ── the verbs ── */

	static create(file, a){
		const drafts = Decide.read_drafts(file);
		const question = Decide.one_sentence(a.question);
		const rank = Decide.positive_int(a.rank, "rank");
		const id = a.id ? String(a.id) : "d-" + Decide.slug(question);
		if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) Decide.refuse(`id ${JSON.stringify(id)}: letters, digits and dashes only`);
		if (Decide.known_ids(file).has(id)) Decide.refuse(`${id} already exists (drafted or logged); pick another --id`);

		let depends_on = null;
		if (a.depends_on) {
			const [decision, option] = typeof a.depends_on === "string" ? a.depends_on.split(":") : [a.depends_on.decision, a.depends_on.option];
			const parent = drafts[decision];
			// depends_on is the truth for nesting, and a parent's `then` must agree with it — so a child
			// is created while its parent is still a draft (a logged line is never rewritten).
			if (!parent && Decide.logged(file).has(decision)) Decide.refuse(`${decision} is already logged, so its then can no longer list a new child: create children while the parent is a draft, or drop and redo`);
			if (!parent) Decide.refuse(`depends_on names ${decision}, which is neither drafted nor logged`);
			const o = (parent.options ?? []).find(o => o.id === option);
			if (!o) Decide.refuse(`depends_on names option ${JSON.stringify(option)} of ${decision}; its options are ${(parent.options ?? []).map(o => o.id).join(", ") || "(none yet)"}`);
			depends_on = { decision, option };
			// A drafted parent learns its child at once, so its `then` can't forget it.
			if (drafts[decision]) { o.then = [...new Set([...(o.then ?? []), id])]; }
		}

		const owner_only = a.owner_only ? String(a.owner_only) : null;
		const d = drafts[id] = { id, question, rank, depends_on, options: [], by: a.by, owner_only };
		const res = Decide.settle(file, drafts, d, a.by);
		return a.options ? Decide.options(file, { id, options: a.options, by: a.by }) : res;
	}

	static options(file, a){
		const drafts = Decide.read_drafts(file), d = Decide.get_draft(drafts, file, a.id);
		const list = [a.options ?? a.option ?? []].flat();
		if (!list.length) Decide.refuse("no options given: --option \"<text>\" (repeat it), or --options '[{\"id\":\"a\",\"text\":\"…\"}]'");
		// All checked before any is added, so a refused call changes nothing.
		const add = [];
		for (const raw of list) {
			const o = typeof raw === "string" ? { text: raw } : raw;
			if (!o || typeof o !== "object") Decide.refuse(`an option must be text or {id?, text, caveats?, then?}; got ${JSON.stringify(raw)}`);
			const text = Decide.plain(String(o.text ?? o.say ?? "").trim(), "option text");
			if (!text) Decide.refuse("an option has no text");
			const oid = o.id != null ? String(o.id) : Decide.slug(text, 3);
			if (!/^[a-z0-9][a-z0-9-]*$/i.test(oid)) Decide.refuse(`option id ${JSON.stringify(oid)}: letters, digits and dashes only`);
			if ([...d.options, ...add].some(x => x.id === oid)) Decide.refuse(`${d.id} already has an option ${oid}; give this one another id`);
			const opt = { id: oid, text };
			if (o.caveats || o.caveat) opt.caveats = [o.caveats ?? o.caveat].flat().map(String).map(c => Decide.plain(c.trim(), "a caveat")).filter(Boolean);
			if (o.then) opt.then = [o.then].flat().map(String);
			add.push(opt);
		}
		d.options.push(...add);
		return Decide.settle(file, drafts, d, a.by);
	}

	static caveats(file, a){
		const drafts = Decide.read_drafts(file), d = Decide.get_draft(drafts, file, a.id);
		const map = Decide.per_option(a.caveats ?? a.caveat, a.option, "caveats");
		for (const [oid, list] of Object.entries(map)) {
			const o = Decide.get_option(d, oid);
			const add = [list].flat().filter(x => x != null).map(String).map(s => Decide.plain(s.trim(), "a caveat")).filter(Boolean);
			if (!add.length) Decide.refuse(`no caveat given for ${oid}: every option costs or risks something — say what`);
			o.caveats = [...(o.caveats ?? []), ...add];
		}
		return Decide.settle(file, drafts, d, a.by);
	}

	/* Named `follow`, not `then`: a module exporting `then` is a thenable, and import() calls it. */
	static follow(file, a){
		const drafts = Decide.read_drafts(file), d = Decide.get_draft(drafts, file, a.id);
		const map = Decide.per_option(a.then ?? a.child ?? [], a.option, "then");
		const known = Decide.known_ids(file);
		for (const [oid, list] of Object.entries(map)) {
			const o = Decide.get_option(d, oid);
			const ids = [list].flat().filter(x => x != null && x !== "").map(String);
			for (const c of ids) {
				if (c === d.id) Decide.refuse(`${d.id} cannot follow from itself`);
				if (!known.has(c)) Decide.refuse(`then names ${c}, which is neither drafted nor logged: create it first with --depends-on ${d.id}:${oid}`);
				// depends_on is the truth; `then` may only repeat it, never disagree with it.
				const up = (drafts[c] ?? Decide.logged(file).get(c))?.depends_on;
				if (up?.decision !== d.id || up?.option !== oid) Decide.refuse(`${c} does not depend on ${d.id}:${oid} (its depends_on is ${up ? up.decision + ":" + up.option : "none"}); a child is linked by creating it with --depends-on ${d.id}:${oid}`);
			}
			o.then = [...new Set([...(o.then ?? []), ...ids])];
		}
		return Decide.settle(file, drafts, d, a.by);
	}

	static recommend(file, a){
		const drafts = Decide.read_drafts(file), d = Decide.get_draft(drafts, file, a.id);
		if (a.owner_only != null) d.owner_only = String(a.owner_only) || null;
		if (a.option ?? a.recommended) { Decide.get_option(d, a.option ?? a.recommended); d.recommended = a.option ?? a.recommended; }
		if (a.confidence != null) {
			const c = Number(a.confidence);
			if (!Number.isFinite(c) || c < 0 || c > 1) Decide.refuse(`confidence must be a number from 0 to 1; got ${JSON.stringify(a.confidence)}`);
			d.confidence = c;
		}
		if (a.why != null) { if (!String(a.why).trim()) Decide.refuse("why is empty"); d.why = Decide.plain(String(a.why).trim(), "why"); }
		const src = [a.sources ?? a.source ?? []].flat().map(String).map(s => s.trim()).filter(Boolean);
		if (src.length) d.sources = [...new Set([...(d.sources ?? []), ...src])];
		return Decide.settle(file, drafts, d, a.by);
	}

	static status(file, a){
		const drafts = Decide.read_drafts(file), id = a.id;
		if (drafts[id]) { const m = Decide.missing(drafts[id]); return { ok: true, id, appended: false, next: Decide.next_step(drafts[id], m), missing: m }; }
		if (Decide.logged(file).has(id)) return { ok: true, id, appended: true, next: null, missing: [] };
		Decide.refuse(`no decision ${id}`);
	}

	static show(file, a){
		const d = Decide.read_drafts(file)[a.id] ?? Decide.logged(file).get(a.id);
		if (!d) Decide.refuse(`no decision ${a.id}`);
		return { ok: true, draft: !Decide.logged(file).has(a.id), decision: d };
	}

	static drop(file, a){
		const drafts = Decide.read_drafts(file);
		if (!drafts[a.id]) Decide.refuse(`no draft ${a.id} (a logged decision is never removed)`);
		delete drafts[a.id];
		Decide.write_drafts(file, drafts);
		return { ok: true, id: a.id, dropped: true };
	}

	/** Ranked and nested: roots by rank, each option's children under it. Drafts marked. */
	static list(file){
		const all = new Map(Decide.logged(file));
		const drafts = Decide.read_drafts(file);
		for (const [id, d] of Object.entries(drafts)) all.set(id, { ...d, draft: true });
		const kids = (pid, oid) => [...all.values()].filter(d => d.depends_on?.decision === pid && d.depends_on?.option === oid).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
		const node = d => ({
			id: d.id, rank: d.rank, question: d.question ?? d.ask, confidence: d.confidence, recommended: d.recommended, draft: !!d.draft,
			options: (d.options ?? []).map(o => ({ id: o.id, text: o.text ?? o.say, then: kids(d.id, o.id).map(node) })),
		});
		const roots = [...all.values()].filter(d => !d.depends_on || !all.has(d.depends_on.decision)).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
		return { ok: true, decisions: roots.map(node) };
	}

	static verbs = { create: Decide.create, options: Decide.options, caveats: Decide.caveats, then: Decide.follow, recommend: Decide.recommend, status: Decide.status, show: Decide.show, list: Decide.list, drop: Decide.drop };

	/* ── the command line ── */

	/* The flags each verb knows; anything else is refused with this list, never silently kept. */
	static FLAGS = {
		create:    ["file", "json", "by", "id", "question", "rank", "depends-on", "owner-only"],
		options:   ["file", "json", "by", "id", "option", "options"],
		caveats:   ["file", "json", "by", "id", "option", "caveat", "caveats"],
		then:      ["file", "json", "by", "id", "option", "child", "then"],
		recommend: ["file", "json", "by", "id", "option", "confidence", "why", "source", "sources", "owner-only"],
		status: ["file", "id"], show: ["file", "id"], drop: ["file", "id"], list: ["file"],
	};
	static JSON_FLAGS = new Set(["json", "options", "caveats", "then", "sources"]);	// parsed when the value starts with [ or {
	static ARRAY_OF = { options: "options", caveats: "caveats", then: "then" };	// what a bare --json array means, per verb

	static parse(verb, argv){
		const a = {}, pos = [];
		const known = Decide.FLAGS[verb] ?? [];
		const many = new Set(["option", "caveat", "child", "source"]);
		for (let i = 0; i < argv.length; i++) {
			const t = argv[i];
			if (!t.startsWith("--")) { pos.push(t); continue; }
			const flag = t.slice(2);
			if (!known.includes(flag)) Decide.refuse(`unknown flag --${flag} for ${verb}; known: ${known.map(f => "--" + f).join(" ")}`);
			const k = flag.replace(/-/g, "_");
			if (i + 1 >= argv.length || argv[i + 1].startsWith("--")) Decide.refuse(`--${flag} needs a value`);
			let v = argv[++i];
			if (Decide.JSON_FLAGS.has(k) && /^\s*[\[{]/.test(v)) {
				try { v = JSON.parse(v); } catch (e) { Decide.refuse(`--${flag} is not valid JSON: ${e.message}`); }
			}
			if (k === "json") {
				if (Array.isArray(v)) { if (!Decide.ARRAY_OF[verb]) Decide.refuse("--json as an array only fits options, caveats or then"); a[Decide.ARRAY_OF[verb]] = v; }
				else if (v && typeof v === "object") Object.assign(a, v);
				else Decide.refuse("--json takes a JSON object or array");
			}
			else if (many.has(k)) (a[k] ??= []).push(v);
			else a[k] = v;
		}
		if (a.child) a.then = [...[a.then ?? []].flat(), ...a.child];
		if (a.source) a.sources = [...[a.sources ?? []].flat(), ...a.source];
		return { a, pos };
	}

	static async main(){
		const [verb, ...rest] = process.argv.slice(2);
		if (!Decide.verbs[verb]) { console.log(JSON.stringify({ ok: false, error: `verbs: ${Object.keys(Decide.verbs).join(" ")}` })); process.exit(2); }
		try {
			const { a, pos } = Decide.parse(verb, rest);
			if (!a.file) Decide.refuse("--file <page.jsonl> is required");
			if (pos[0] && !a.id) a.id = pos[0];
			if (verb === "options" && a.option) a.options = [...[a.options ?? []].flat(), ...a.option];
			else if (Array.isArray(a.option)) { if (a.option.length > 1) Decide.refuse(`${verb} takes one --option; for several, give --${verb} a JSON object keyed by option id`); a.option = a.option[0]; }
			if (verb === "caveats" && a.caveat) a.caveats = [...[a.caveats ?? []].flat(), ...a.caveat];
			console.log(JSON.stringify(Decide.verbs[verb](a.file, a), null, verb === "list" || verb === "show" ? 2 : 0));
		} catch (e) {
			if (!(e instanceof DecideError)) throw e;
			console.log(JSON.stringify({ ok: false, refused: e.message }));
			process.exit(1);
		}
	}

}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) Decide.main();

// Named aliases: existing callers do `import * as decide` and call decide.logged(), decide.create() ...
export const { now, drafts_path, logged, missing, create, options, caveats, follow, recommend, status, show, drop, list, verbs, FLAGS, parse } = Decide;


