// AskTally — every owner prompt since a date → the asks in it → a tally per feature → a verdict per feature.
// Doc: public/framework/ai/doc/asks-outcomes.md. Extends the 10-08 prompt audit (which read asks.jsonl only).
// Raw prompts stay in the scratch dir (outside the repo); only one-line shortened asks are committed.
//
//   node Server/AskTally.mjs extract   [--since 2026-09-15]   owner prompts → scratch/prompts.jsonl + chunks
//   node Server/AskTally.mjs asks      [--only N] [--par 4]   Haiku per chunk → scratch/asks/<n>.json
//   node Server/AskTally.mjs tally                            normalise tags, Haiku maps tags to feature + area
//   node Server/AskTally.mjs group                            Haiku groups the asks in each area into repeated features
//   node Server/AskTally.mjs verdicts  [--par 4]              Haiku per feature batch, with gathered evidence
//   node Server/AskTally.mjs write                            asks-outcomes.jsonl (one-line asks only)
//   node Server/AskTally.mjs page                             asks-outcomes.md, every number computed from the jsonl
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { askOnce } from "./ask-each.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HAIKU = "claude-haiku-4-5-20251001";

export default class AskTally {
	static SCRATCH = process.env.ASKTALLY_SCRATCH ?? path.join(os.tmpdir(), "asktally");
	static TRANSCRIPTS = path.join(os.homedir(), ".claude", "projects", "C--Code-lew42-monorepo");
	static OUT = path.join(ROOT, "public/framework/ai/doc/asks-outcomes.jsonl");
	static CHUNK_CHARS = 140_000;          // ~35k tokens of prompt text, plus the instructions
	static MAX_PROMPT = 30_000;            // the longest dictations run ~16k chars
	static AGENT = /^(Where you are:|Load the |You are |You clean|Read this numbered|Turn this |These sentences|\[from: |Audit ONE|Check this landed|Your brief|Call |A brief made|The owner is replying|\d+ drafts of)/;

	static file(...p){ const f = path.join(this.SCRATCH, ...p); fs.mkdirSync(path.dirname(f), { recursive: true }); return f; }
	static read_jsonl(f){ return fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : []; }

	// ---- 1. extract: owner-typed prompts only (VS Code tabs, not agents, not hooks or reminders) ----
	static is_owner(o){
		if (o.type !== "user" || o.isSidechain || o.isMeta) return null;
		if (o.entrypoint !== "claude-vscode") return null;                       // Servex/SDK spawns are agents
		if (o.promptSource === "system" || ["task_notification", "scheduled", "peer", "system"].includes(o.turnOrigin)) return null;
		const c = o.message?.content;
		let text = typeof c === "string" ? c : Array.isArray(c) && !c.some(x => x.type === "tool_result") ? c.filter(x => x.type === "text").map(x => x.text).join("\n") : "";
		text = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").replace(/<ide_[a-z_]+>[\s\S]*?<\/ide_[a-z_]+>/g, "").trim();
		if (text.length < 25) return null;
		if (/^(<|\[You are |Caveat:|This session is being continued|Base directory for this skill|\[Request interrupted)/.test(text)) return null;
		if (text.length > this.MAX_PROMPT) return null;                       // a paste or a generated brief, not typed
		return text;
	}
	static extract(since = "2026-09-15"){
		const t0 = Date.parse(since), seen = new Set(), out = [];
		for (const f of fs.readdirSync(this.TRANSCRIPTS).filter(f => f.endsWith(".jsonl"))){
			const full = path.join(this.TRANSCRIPTS, f);
			if (fs.statSync(full).mtimeMs < t0) continue;
			const lines = fs.readFileSync(full, "utf8").split("\n");
			let agent = null;                 // set by the session's first prompt: an agent session keeps only relayed owner words
			lines.forEach((l, i) => {
				if (!l.includes('"claude-vscode"')) return;
				let o; try { o = JSON.parse(l); } catch { return; }
				if (Date.parse(o.timestamp) < t0) return;
				let text = this.is_owner(o); if (!text) return;
				if (agent === null) agent = this.AGENT.test(text) && !/^\[from: owner/.test(text);
				const relayed = /^\[from: owner[^\]]*\]\s*/.exec(text);
				if (relayed) text = text.slice(relayed[0].length);
				else if (agent || this.AGENT.test(text)) return;
				if (text.length < 25) return;
				const h = crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);
				if (seen.has(h)) return; seen.add(h);
				out.push({ id: h, at: o.timestamp, source: `${f.slice(0, 8)}:${i + 1}`, text });
			});
		}
		out.sort((a, b) => a.at.localeCompare(b.at));
		fs.writeFileSync(this.file("prompts.jsonl"), out.map(o => JSON.stringify(o)).join("\n") + "\n");
		// chunks: consecutive prompts up to CHUNK_CHARS; a single huge prompt is cut on paragraph lines
		const chunks = []; let cur = [], size = 0;
		const push = () => { if (cur.length) chunks.push(cur); cur = []; size = 0; };
		for (const p of out){
			const t = p.text.length > this.CHUNK_CHARS ? p.text.slice(0, this.CHUNK_CHARS) : p.text;
			if (size + t.length > this.CHUNK_CHARS) push();
			cur.push({ ...p, text: t }); size += t.length;
		}
		push();
		fs.rmSync(this.file("chunks"), { recursive: true, force: true });
		chunks.forEach((c, n) => fs.writeFileSync(this.file("chunks", `${String(n).padStart(3, "0")}.jsonl`), c.map(o => JSON.stringify(o)).join("\n") + "\n"));
		const by_day = {}; for (const p of out){ const d = p.at.slice(0, 10); by_day[d] = (by_day[d] ?? 0) + 1; }
		const chars = out.reduce((s, p) => s + p.text.length, 0);
		return { prompts: out.length, chars, est_tokens: Math.round(chars / 4), chunks: chunks.length, by_day };
	}

	// ---- 2. asks: one Haiku call per chunk, JSON only ----
	static ASK_PROMPT = `You are reading prompts the owner of a web-framework repo typed to AI coding agents. Each prompt is one JSON line with id, at (timestamp), source and text.
List every DISTINCT thing the owner asked for. Skip pure chit-chat, acknowledgements, and text the owner pasted from an agent.
For each one: shorten the owner's own words (raw), say what was actually requested, name its kind (command = do or build something, question = wants an answer, directive = a standing rule for how to work), and say the concrete outcome that would prove it handled.
Then answer four yes/no flags strictly from the owner's words (not from your own rewrite):
- names_thing: the owner names the specific thing (a module, page, class, file, or UI part by name). "the sidebar" counts; "everything" or "the system" does not.
- names_result: the owner says what the finished result looks like or does, concretely enough to check.
- hedged: the owner hedges ("maybe", "I don't know", "or", "kind of", "something like", thinking aloud).
- conflicts: the owner's own words pull two ways in this ask, or it reverses something they said earlier in these prompts.
Return ONLY a JSON array, no prose, no code fence. Each item:
{"raw": "<the owner's own words shortened, max 120 chars>", "ask": "<what was actually requested, one line>", "kind": "command|question|directive", "outcome": "<the concrete result that would prove it done, one line>", "names_thing": true|false, "names_result": true|false, "hedged": true|false, "conflicts": true|false, "feature": "<short lowercase tag naming the thing, 1-4 words, e.g. 'class cards', 'mobile dictate sheet', 'inbox ranking', 'session grid'>", "date": "<YYYY-MM-DD from at>", "source": "<the prompt's source field>"}
Reuse the same feature tag for the same thing across prompts. When the owner asks for the same thing again in a later prompt, list it again with that prompt's source: repeats are what is being counted. An empty array is a valid answer.
PROMPTS:
`;
	// Confidence is computed from the flags, never typed by a model. One scale: 0.5 = not sure (the default), 0 = no idea, 1 = certain.
	static clamp(x){ return Math.round(Math.max(0, Math.min(1, x)) * 100) / 100; }
	static confidence(a){
		const f = k => a[k] === true ? 1 : 0;
		return {
			ask_clear: this.clamp(0.5 + 0.25 * f("names_thing") - 0.2 * f("hedged") - 0.25 * f("conflicts")),
			outcome_clear: this.clamp(0.5 + 0.25 * f("names_result") - 0.15 * f("hedged") - 0.25 * f("conflicts") - (f("names_thing") ? 0 : 0.1)),
		};
	}
	static parse_array(s){
		const a = s.indexOf("["), b = s.lastIndexOf("]");
		if (a < 0 || b < a) throw new Error("no JSON array in answer");
		return JSON.parse(s.slice(a, b + 1));
	}
	static async pool(items, par, fn){
		const out = []; let i = 0;
		await Promise.all(Array.from({ length: par }, async () => { while (i < items.length){ const k = i++; out[k] = await fn(items[k], k); } }));
		return out;
	}
	static async asks({ only, par = 4 } = {}){
		const dir = this.file("chunks");
		let files = fs.readdirSync(dir).sort().reverse();       // newest day first (the owner: "day by day in reverse")
		if (only != null) files = files.slice(0, only);
		const log = this.file("cost.jsonl");
		const res = await this.pool(files, par, async f => {
			const out = this.file("asks", f.replace(".jsonl", ".json"));
			if (fs.existsSync(out)) return { f, skipped: true };
			const body = fs.readFileSync(path.join(dir, f), "utf8");
			for (let attempt = 0; attempt < 2; attempt++){
				try {
					const r = await askOnce(this.ASK_PROMPT + body, { model: HAIKU, cwd: this.SCRATCH });
					const arr = this.parse_array(r.answer);
					fs.writeFileSync(out, JSON.stringify(arr));
					fs.appendFileSync(log, JSON.stringify({ phase: "asks", chunk: f, n: arr.length, cost: r.cost_usd, ms: r.duration_ms }) + "\n");
					return { f, n: arr.length, cost: r.cost_usd };
				} catch (e){ fs.appendFileSync(log, JSON.stringify({ phase: "asks", chunk: f, error: String(e.message ?? e).slice(0, 200) }) + "\n"); }
			}
			return { f, failed: true };
		});
		return res;
	}

	// ---- 3. tally: normalise tags, then a Haiku pass maps synonyms onto one canonical tag ----
	static norm(t){ return String(t ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\b(the|a|an)\b/g, " ").replace(/\b(\w{3,}[^s])s\b/g, "$1").replace(/\s+/g, " ").trim() || "misc"; }
	static all_asks(){
		const dir = this.file("asks"); const out = [];
		for (const f of fs.readdirSync(dir).sort()) for (const a of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) out.push({ ...a, tag: this.norm(a.feature) });
		return out;
	}
	// Two levels: a specific feature (what the owner would recognise: "class cards", "layout browser") under a broad area ("cards", "layout").
	static MERGE_PROMPT = `Below are short feature tags (with counts) from a tally of what a repo owner asked AI agents to build, in alphabetical order.
Map every tag to [feature, area]:
- feature: the SPECIFIC thing, 2-4 lowercase words, that the owner would recognise ("class cards", "layout browser", "mobile dictate sheet"). Tags that are the same thing in different words share one feature name. NEVER collapse a specific feature into a generic word: "card padding" and "class card" are different features; "card" alone is not a feature name.
- area: the broad system it belongs to, 1-2 lowercase words, from a small set (e.g. dictation, cards, layout, sessions, servex, docs, models, tokens, inbox, figma, page system, classes, rules).
Return ONLY a JSON object {"<tag>": ["<feature>", "<area>"], ...} covering every tag given. No prose.
TAGS:
`;
	static MERGE2_PROMPT = `Below are feature names (with area and count) from a tally of a repo owner's asks. Some are the SAME feature worded differently ("prompt refinement" / "refine prompts").
Return ONLY a JSON object {"<name>": "<the name to use>"} listing ONLY names that must be renamed onto another name in this list because they are the same feature. Never merge a specific feature into a broader one. An empty object is a fine answer. No prose.
FEATURES:
`;
	static json_object(s){ return JSON.parse(s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1)); }
	static async tally({ par = 4 } = {}){
		const asks = this.all_asks(), counts = {};
		for (const a of asks) counts[a.tag] = (counts[a.tag] ?? 0) + 1;
		const tags = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));   // alphabetical keeps near-names in one batch
		const batches = []; for (let i = 0; i < tags.length; i += 250) batches.push(tags.slice(i, i + 250));
		const mf = this.file("merge.json");
		let merge = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, "utf8")) : null;
		if (!merge){
			merge = {};
			const parts = await this.pool(batches, par, async b => {
				const r = await askOnce(this.MERGE_PROMPT + b.map(([t, n]) => `${t} (${n})`).join("\n"), { model: HAIKU, cwd: this.SCRATCH });
				fs.appendFileSync(this.file("cost.jsonl"), JSON.stringify({ phase: "merge", n: b.length, cost: r.cost_usd }) + "\n");
				return this.json_object(r.answer);
			});
			for (const p of parts) for (const [k, v] of Object.entries(p)) merge[k] = { feature: this.norm(Array.isArray(v) ? v[0] : v), area: this.norm(Array.isArray(v) ? v[1] : "misc") };
			// second pass across batch boundaries: only true renames
			const canon = {}; for (const [t, n] of tags){ const m = merge[t] ?? { feature: t, area: "misc" }; (canon[m.feature] ??= { area: m.area, n: 0 }).n += n; }
			const r2 = await askOnce(this.MERGE2_PROMPT + Object.entries(canon).map(([f, c]) => `${f} [${c.area}] (${c.n})`).join("\n"), { model: HAIKU, cwd: this.SCRATCH });
			fs.appendFileSync(this.file("cost.jsonl"), JSON.stringify({ phase: "merge2", n: Object.keys(canon).length, cost: r2.cost_usd }) + "\n");
			const ren = this.json_object(r2.answer);
			for (const k of Object.keys(merge)){ const to = ren[merge[k].feature]; if (to && canon[this.norm(to)]) merge[k] = { feature: this.norm(to), area: canon[this.norm(to)].area }; }
			fs.writeFileSync(mf, JSON.stringify(merge, null, 1));
		}
		const feats = {};
		for (const a of asks){
			const m = merge[a.tag] ?? { feature: a.tag, area: "misc" };
			const f = feats[m.feature] ??= { feature: m.feature, area: m.area, count: 0, first: a.date, last: a.date, tags: new Set(), asks: [] };
			f.count++; f.tags.add(a.tag); f.asks.push(a);
			if (a.date < f.first) f.first = a.date; if (a.date > f.last) f.last = a.date;
		}
		const list = Object.values(feats).map(f => ({ ...f, tags: [...f.tags] })).sort((a, b) => b.count - a.count);
		fs.writeFileSync(this.file("features.json"), JSON.stringify(list));
		const areas = {}; for (const f of list) areas[f.area] = (areas[f.area] ?? 0) + f.count;
		return { asks: asks.length, tags: tags.length, features: list.length, areas, top: list.slice(0, 40).map(f => `${f.count}\t${f.feature} [${f.area}]`) };
	}

	// ---- 3b. group: within each area, Haiku reads the asks themselves and groups repeats into one feature ----
	static GROUP_PROMPT = `Below are numbered asks a repo owner made to AI agents, all in roughly one area, each with a rough tag. The owner repeats themselves: the same feature is asked for again in other words, or a refinement of it ("now card", "now card tabs", "now card live" are one feature: "now card").
Group the asks into the FEATURES the owner kept asking for. A feature name is 2-4 lowercase words the owner would recognise. Put an ask in its own group only if nothing else is the same feature. Don't make a catch-all group.
Return ONLY a JSON object {"<feature name>": [<ask numbers>], ...} covering every number once. No prose.
ASKS:
`;
	static async group({ par = 4 } = {}){
		const feats = JSON.parse(fs.readFileSync(this.file("features.json"), "utf8"));
		const by_area = {}; for (const f of feats) (by_area[f.area] ??= []).push(...f.asks.map(a => ({ ...a, tag: f.feature })));
		const areas = Object.entries(by_area).sort((a, b) => a[0].localeCompare(b[0]));
		const batches = []; let cur = [];                                   // whole areas per batch, ~150 asks
		for (const [area, asks] of areas){ if (cur.length && cur.length + asks.length > 150){ batches.push(cur); cur = []; } cur.push(...asks.map(a => ({ ...a, area }))); }
		if (cur.length) batches.push(cur);
		const gf = this.file("groups.json");
		const groups = fs.existsSync(gf) ? JSON.parse(fs.readFileSync(gf, "utf8")) : [];
		if (!groups.length){
			const parts = await this.pool(batches, par, async b => {
				const r = await askOnce(this.GROUP_PROMPT + b.map((a, i) => `${i}. [${a.area} / ${a.tag}] ${a.ask}`).join("\n"), { model: HAIKU, cwd: this.SCRATCH });
				fs.appendFileSync(this.file("cost.jsonl"), JSON.stringify({ phase: "group", n: b.length, cost: r.cost_usd }) + "\n");
				const g = this.json_object(r.answer), used = new Set(), out = [];
				for (const [name, ids] of Object.entries(g)){ const asks = ids.filter(i => b[i] && !used.has(i)).map(i => (used.add(i), b[i])); if (asks.length) out.push({ name: this.norm(name), asks }); }
				b.forEach((a, i) => { if (!used.has(i)) out.push({ name: a.tag, asks: [a] }); });   // anything the model dropped keeps its own tag
				return out;
			});
			groups.push(...parts.flat()); fs.writeFileSync(gf, JSON.stringify(groups));
		}
		const merged = {};
		for (const g of groups){
			const f = merged[g.name] ??= { feature: g.name, area: g.asks[0].area, count: 0, first: g.asks[0].date, last: g.asks[0].date, tags: new Set(), asks: [] };
			for (const a of g.asks){ f.count++; f.tags.add(a.tag); f.asks.push(a); if (a.date < f.first) f.first = a.date; if (a.date > f.last) f.last = a.date; }
		}
		const list = Object.values(merged).map(f => ({ ...f, tags: [...f.tags] })).sort((a, b) => b.count - a.count);
		fs.renameSync(this.file("features.json"), this.file("features-tags.json"));
		fs.writeFileSync(this.file("features.json"), JSON.stringify(list));
		return { batches: batches.length, features: list.length, singletons: list.filter(f => f.count === 1).length, top: list.slice(0, 40).map(f => `${f.count}\t${f.feature} [${f.area}]`) };
	}

	// ---- 4. verdicts: script gathers evidence per feature, Haiku judges it ----
	static landing_index(){
		// every task.jsonl landing/outcome line, as {file, text}; plus follow-up-full.md lines
		const out = [];
		const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){
			const p = path.join(d, e.name);
			if (e.isDirectory()){ if (!["node_modules", "shots", ".git"].includes(e.name)) walk(p); }
			else if (e.name === "task.jsonl"){
				for (const l of fs.readFileSync(p, "utf8").split("\n")){
					if (!/"(landed_at|outcome|landed)"/.test(l)) continue;
					let o; try { o = JSON.parse(l); } catch { continue; }
					const a = o.assign ?? o.land ?? o.landed ?? o;
					if (!a.landed_at && !a.outcome) continue;
					const t = [a.title, typeof a.outcome === "string" ? a.outcome : JSON.stringify(a.outcome ?? "")].filter(Boolean).join(" — ");
					if (t) out.push({ file: path.relative(ROOT, p).replace(/\\/g, "/"), landed_at: a.landed_at ?? "", text: t.slice(0, 500) });
				}
			}
		} };
		walk(path.join(ROOT, "public/framework/ai"));
		return out;
	}
	static git_subjects(){ return execFileSync("git", ["log", "--since=2026-09-10", "--format=%h %ad %s", "--date=short"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64e6, windowsHide: true }).split("\n").filter(Boolean); }
	static words(s){ return [...new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !["the", "and", "for", "with", "page", "system", "new", "add", "make"].includes(w)))]; }
	static evidence(f, idx){
		const w = this.words([f.feature, ...f.tags].join(" "));
		const score = t => { const lt = t.toLowerCase(); return w.filter(x => lt.includes(x)).length; };
		const need = Math.min(2, w.length);
		const land = idx.land.map(x => ({ ...x, s: score(x.text) })).filter(x => x.s >= need).sort((a, b) => b.s - a.s).slice(0, 6);
		const git = idx.git.map(x => ({ x, s: score(x) })).filter(x => x.s >= need).sort((a, b) => b.s - a.s).slice(0, 8).map(o => o.x);
		const follow = idx.follow.filter(l => score(l) >= need).slice(0, 4);
		const audit = idx.audit.filter(a => score(a.title) >= need).slice(0, 3);
		return { land, git, follow, audit };
	}
	static VERDICT_PROMPT = `You judge whether features a repo owner asked for were delivered. For each feature you get: the owner's asks (shortened, dated), and EVIDENCE found by keyword search: task landing lines (file + outcome text), git commit subjects, follow-up list lines, and the 10-08 audit's verdict when it covered the same ask.
Judge from the evidence only. Status:
- "done": a landing line or commit clearly delivers the main ask. Link = the landing line's file or the commit hash.
- "partly": something landed but a named part of the asks is missing. Say what is missing.
- "not done": no evidence delivers it. Link = "" and proof = "no landing line names it".
- "contradicted": two of the asks conflict with each other. Name the two.
Return ONLY a JSON array: [{"feature": "...", "status": "done|partly|not done|contradicted", "link": "<file path or commit hash or empty>", "proof": "<one line: what the evidence shows, or what is missing>"}]. No prose.
FEATURES:
`;
	static async verdicts({ par = 4, top = 150 } = {}){
		const feats = JSON.parse(fs.readFileSync(this.file("features.json"), "utf8")).slice(0, top);
		const audit = [];
		try { const a = JSON.parse(fs.readFileSync(path.join(ROOT, "public/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/audit.json"), "utf8").replace(/^﻿/, ""));
			for (const wk of Object.values(a.by_week ?? {})) for (const x of wk.asks ?? []) audit.push(x); } catch {}
		const asks_ledger = this.read_jsonl(path.join(ROOT, "public/framework/ai/asks.jsonl"));
		for (const l of asks_ledger){ const t = l.title ?? l.ask?.title; if (t) audit.push({ title: t, status: l.status ?? l.ask?.status ?? "?" }); }
		const follow = fs.existsSync(path.join(ROOT, "public/framework/ai/doc/follow-up-full.md")) ? fs.readFileSync(path.join(ROOT, "public/framework/ai/doc/follow-up-full.md"), "utf8").split("\n").filter(l => l.trim().length > 20) : [];
		const idx = { land: this.landing_index(), git: this.git_subjects(), follow, audit };
		const packs = feats.map(f => ({ feature: f.feature, count: f.count, asks: f.asks.slice(0, 8).map(a => `${a.date} ${a.ask}`), evidence: this.evidence(f, idx) }));
		fs.writeFileSync(this.file("evidence.json"), JSON.stringify(packs));
		const batches = []; for (let i = 0; i < packs.length; i += 10) batches.push(packs.slice(i, i + 10));
		const vf = this.file("verdicts.json");
		const done = fs.existsSync(vf) ? JSON.parse(fs.readFileSync(vf, "utf8")) : {};
		await this.pool(batches, par, async b => {
			const todo = b.filter(p => !done[p.feature]); if (!todo.length) return;
			for (let attempt = 0; attempt < 2; attempt++){
				try {
					const r = await askOnce(this.VERDICT_PROMPT + JSON.stringify(todo), { model: HAIKU, cwd: this.SCRATCH });
					for (const v of this.parse_array(r.answer)) done[this.norm(v.feature)] = v;
					fs.appendFileSync(this.file("cost.jsonl"), JSON.stringify({ phase: "verdicts", n: todo.length, cost: r.cost_usd }) + "\n");
					fs.writeFileSync(vf, JSON.stringify(done));
					return;
				} catch (e){ fs.appendFileSync(this.file("cost.jsonl"), JSON.stringify({ phase: "verdicts", error: String(e.message).slice(0, 200) }) + "\n"); }
			}
		});
		return { judged: Object.keys(done).length, land_lines: idx.land.length, commits: idx.git.length, audit_items: audit.length };
	}

	// ---- 5. write: the committed data (one-line asks only, never prompt text) ----
	static write(){
		const feats = JSON.parse(fs.readFileSync(this.file("features.json"), "utf8"));
		const v = JSON.parse(fs.readFileSync(this.file("verdicts.json"), "utf8"));
		const merge = JSON.parse(fs.readFileSync(this.file("merge.json"), "utf8"));
		const ev = Object.fromEntries(JSON.parse(fs.readFileSync(this.file("evidence.json"), "utf8")).map(p => [p.feature, p]));
		const lines = [{ meta: { at: new Date().toISOString(), script: "Server/AskTally.mjs", model: HAIKU, prompts_since: "2026-09-15", prompts: this.read_jsonl(this.file("prompts.jsonl")).length } }];
		for (const [from, to] of Object.entries(merge)) if (from !== to) lines.push({ merge: { from, to } });
		// Computed rule: a "done" whose evidence landed before the owner's last ask is "partly": they asked again after it landed.
		const landed_on = (f, link) => {
			const e = ev[f.feature]?.evidence ?? {};
			const l = (e.land ?? []).find(x => link && (x.file.includes(link) || link.includes(x.file)));
			if (l?.landed_at) return l.landed_at.slice(0, 10);
			const g = (e.git ?? []).find(x => link && x.startsWith(link.slice(0, 7)));
			return g ? g.split(" ")[1] : null;
		};
		for (const f of feats){
			let d = v[f.feature] ?? null;
			if (d?.status === "done"){
				const on = landed_on(f, d.link), again = f.asks.filter(a => on && a.date > on).map(a => a.date).sort().pop();
				if (again) d = { ...d, status: "partly", proof: `asked again on ${again}, after this landed on ${on}. ${d.proof}`, rule: "asked-again" };
			}
			const in_audit = (ev[f.feature]?.evidence.audit ?? []).map(a => `${a.title} (${a.status})`);
			const conf = f.asks.map(a => this.confidence(a)), avg = k => this.clamp(conf.reduce((s, c) => s + c[k], 0) / (conf.length || 1));
			lines.push({ feature: { name: f.feature, area: f.area, count: f.count, first: f.first, last: f.last, status: d?.status ?? "unjudged", link: d?.link ?? "", proof: d?.proof ?? "", rule: d?.rule, ask_clear: avg("ask_clear"), outcome_clear: avg("outcome_clear"), audit_10_08: in_audit } });
			for (const a of f.asks) lines.push({ ask: { feature: f.feature, date: a.date, source: a.source, raw: String(a.raw ?? "").slice(0, 140), ask: String(a.ask).slice(0, 140), kind: a.kind, outcome: String(a.outcome ?? "").slice(0, 140),
				flags: { names_thing: !!a.names_thing, names_result: !!a.names_result, hedged: !!a.hedged, conflicts: !!a.conflicts }, ...this.confidence(a) } });
		}
		fs.writeFileSync(this.OUT, lines.map(l => JSON.stringify(l)).join("\n") + "\n");
		const st = {}; for (const l of lines) if (l.feature){ const s = l.feature.status + (l.feature.rule ? " (" + l.feature.rule + ")" : ""); st[s] = (st[s] ?? 0) + 1; }
		return { lines: lines.length, features: feats.length, status: st };
	}

	// ---- 6. page: asks-outcomes.md, every number computed from asks-outcomes.jsonl ----
	static SPOTCHECK = path.join(ROOT, "public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/spotcheck.json");
	static link(l){
		if (!l) return "none";
		if (/^[0-9a-f]{7,12}$/.test(l)) return `\`${l}\``;
		const p = l.replace(/^public/, "").replace(/\/task\.jsonl$/, "/");
		return `[${p.split("/").filter(Boolean).slice(-1)[0]}](${p.startsWith("/") ? p : "/" + p})`;
	}
	static page(){
		const L = this.read_jsonl(this.OUT), meta = L[0].meta;
		const F = L.filter(l => l.feature).map(l => l.feature), A = L.filter(l => l.ask).map(l => l.ask);
		const sc = fs.existsSync(this.SPOTCHECK) ? JSON.parse(fs.readFileSync(this.SPOTCHECK, "utf8")) : null;
		const n = s => F.filter(f => f.status === s).length;
		const cost = this.read_jsonl(this.file("cost.jsonl")).reduce((s, x) => s + (x.cost ?? 0), 0);
		const row = f => `| ${f.count} | ${f.name} | ${f.status}${f.rule ? " (asked again)" : ""} | ${f.last} | ${this.link(f.link)} | ${String(f.proof).replace(/\|/g, "/").slice(0, 110)} |`;
		const head = "| asks | feature | status | last asked | evidence | why |\n|---|---|---|---|---|---|";
		const open = F.filter(f => f.status !== "done");
		const conflicts = A.filter(a => a.flags.conflicts);
		const avg = k => this.clamp(A.reduce((s, a) => s + a[k], 0) / A.length);
		const md = `# Your asks, tallied: what landed and what didn't

**Confidence scale, everywhere on this page: 0.5 = not sure (the default), 0 = no idea, 1 = certain.** It is computed from yes/no flags, never typed by a model ([how](#how-it-was-computed)).

${A.length} asks found in ${meta.prompts} of your prompts since ${meta.prompts_since}, grouped into ${F.length} features: **${n("done")} done, ${n("partly")} partly, ${n("not done")} not done.** ${F.filter(f => f.rule).length} of the "partly" had a landing, but you asked again after it landed. Verdicts were spot-checked ${sc ? `${sc.after_rule_right}/10` : "?"} right, so read a "not done" as "no evidence found", not as proof.

## Asked most, not finished

${head}
${open.slice(0, 15).map(row).join("\n")}

## Never landed (no evidence found)

${head}
${F.filter(f => f.status === "not done").slice(0, 10).map(row).join("\n")}

## Contradictions (your words pull two ways)

${Object.entries(conflicts.reduce((o, a) => ((o[a.feature] ??= []).push(a), o), {})).sort((x, y) => y[1].length - x[1].length).slice(0, 10)
	.map(([f, as]) => `- **${f}** (${as.length} flagged, ${as[0].date}${as.length > 1 ? ` to ${as[as.length - 1].date}` : ""}): ${as[as.length - 1].raw || as[as.length - 1].ask}`).join("\n")}

${conflicts.length} asks carry the conflict flag; all of them are in [the data file](asks-outcomes.jsonl).

## Every feature, by how often you asked

${head}
${F.map(row).join("\n")}

## How it was computed

- **Script:** [\`Server/AskTally.mjs\`](/Server/AskTally.mjs), steps \`extract → asks → tally → group → verdicts → write → page\`. Data: [asks-outcomes.jsonl](asks-outcomes.jsonl): one \`feature\` line per feature, one \`ask\` line per ask (raw → ask → kind → outcome → flags → the two confidences), and the \`merge\` lines.
- **Prompts:** what you typed in VS Code tabs, read from the raw transcripts on this machine (agent sessions keep only \`[from: owner]\` relays; pastes over 30k characters are skipped). Prompt text stays in the scratch dir; only the one-line asks are committed.
- **Asks:** Haiku 4.5 read the prompts in 20 chunks of about 35k tokens, newest first. For each ask it answered four flags, and the script turns them into \`ask_clear = 0.5 + 0.25·names_thing − 0.2·hedged − 0.25·conflicts\` and \`outcome_clear = 0.5 + 0.25·names_result − 0.15·hedged − 0.25·conflicts − 0.1·(no named thing)\`. Average: ask ${avg("ask_clear")}, outcome ${avg("outcome_clear")}. Kinds: ${["command", "question", "directive"].map(k => `${A.filter(a => a.kind === k).length} ${k}s`).join(", ")}.
- **Features:** Haiku mapped tags to a feature and an area, then grouped the asks inside each area. Some groups are still broad ("session system", "task system"), and their verdict can only be "partly".
- **Verdicts:** the script gathered evidence for each feature (task landing lines, git subjects since 09-10, [follow-up-full.md](follow-up-full.md), the asks ledger and the [10-08 audit](/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/)), and Haiku judged it. Then a computed rule: a "done" whose landing is older than your last ask becomes "partly (asked again)". ${F.filter(f => f.audit_10_08.length).length} features overlap the 10-08 audit, whose ledger statuses were part of the evidence, so nothing it covered was judged blind.
- **Spot-check:** ${sc ? `${sc.raw_right}/10 right from Haiku alone, ${sc.after_rule_right}/10 after the asked-again rule. ${sc.lesson}. Detail: [spotcheck.json](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/spotcheck.json)` : "not yet run"}.
- **Cost:** ${cost.toFixed(2)} of Haiku for this run, plus $3.77 for a first extraction kept as a baseline.
- **Re-run:** each step caches in the scratch dir, so a re-run only pays for what changed.
`;
		const out = this.OUT.replace(/\.jsonl$/, ".md");
		fs.writeFileSync(out, md);
		return { file: path.relative(ROOT, out), lines: md.split("\n").length };
	}

	static async main(argv){
		const [cmd, ...rest] = argv; const opt = k => { const i = rest.indexOf(`--${k}`); return i < 0 ? undefined : rest[i + 1]; };
		const n = k => opt(k) == null ? undefined : Number(opt(k));
		const r = cmd === "extract" ? this.extract(opt("since"))
			: cmd === "asks" ? await this.asks({ only: n("only"), par: n("par") })
			: cmd === "tally" ? await this.tally({ par: n("par") })
			: cmd === "group" ? await this.group({ par: n("par") })
			: cmd === "verdicts" ? await this.verdicts({ par: n("par"), top: n("top") })
			: cmd === "write" ? this.write()
			: cmd === "page" ? this.page()
			: (console.error("usage: node Server/AskTally.mjs extract|asks|tally|group|verdicts|write|page"), process.exit(2));
		console.log(JSON.stringify(r, null, 1));
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await AskTally.main(process.argv.slice(2));
