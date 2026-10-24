// ReadmeAudit — pass 1 of the readme audit: how far each readme is from the documentation rule
// (.claude/skills/documentation, "The documentation rule"; plan: public/framework/ai/doc/readme-system.md).
// A script computes everything it can; Haiku judges only what needs reading (shape, history, one note).
//   node Server/ReadmeAudit.mjs --computed                free checks on every readme
//   node Server/ReadmeAudit.mjs --haiku [--limit N]       + Haiku on the N worst (all, with no limit) that have none yet
//   node Server/ReadmeAudit.mjs --path <readme> [--haiku] one readme
// Writes public/framework/ai/readmes/audit.jsonl (append-only; the latest line per path wins; read by ReadmesView.js).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import ReadmeChains from "./ReadmeChains.mjs";
import ReadmeOrphans from "./ReadmeOrphans.mjs";
import RefineQueue from "./RefineQueue.mjs";
import { dead_links } from "./doc-check.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export class ReadmeAudit {
	static V = 1;
	static MODEL = "claude-haiku-5-5";
	static OUT = path.join(REPO, "public/framework/ai/readmes/audit.jsonl");
	static MAX_CHARS = 30000;   // readme text sent to Haiku
	// Entries the "unnamed" check ignores: records, logs, shots, generated json, images, the readme itself.
	static IGNORE = /^(readme\.md|page\.js|page\.jsonl|files\.jsonl|node_modules|shots|logs?|\d{4}(-\d{2}-\d{2})?)$|\.(jsonl|json|log|png|jpe?g|gif|webp|svg|mp3|wav|txt)$|^\./i;

	static BRIEF = `You audit one readme against this rule: readme.md is the folder's INDEX (what the folder is, one line and a link per part, current decisions, no dated logs); an often-read topic goes in a sibling <topic>.md; everything else in doc/. You get the readme text and the file names of its folder. Reply with ONLY a JSON object:
{"shape": "index"|"essay"|"log"|"mixed", "history": [up to 3 lines quoted verbatim from the readme that record HOW or WHEN something was decided rather than what is true now; [] if none], "note": "ONE sentence: the single change that would most improve this readme under the rule"}
index = short list of parts with links; essay = prose explaining things that belongs in doc/; log = dated entries or changelog; mixed = index plus substantial prose or history.`;

	constructor(repo = REPO){ this.repo = repo; this.spent = 0; }

	rel(p){ return path.relative(this.repo, p).split(path.sep).join("/"); }

	/* Every readme the Readmes page lists: the same walk and skip as ReadmeChains.rows(). */
	readmes(){
		const out = [], skip = ReadmeChains.SKIP;
		const walk = (d, depth) => {
			if (skip.test(d) || depth > 8) return;
			let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
			const r = ents.find(e => e.isFile() && /^readme\.md$/i.test(e.name));
			if (r) out.push(path.join(d, r.name));
			for (const e of ents) if (e.isDirectory() && !e.name.startsWith(".")) walk(path.join(d, e.name), depth + 1);
		};
		walk(this.repo, 0);
		return out.sort();
	}

	/* The set of readme folders (repo-relative) that the readme above them never names. */
	orphans(){ return new Set(new ReadmeOrphans(this.repo).run().map(r => r.dir)); }

	/* Does the readme text mention this entry by name? */
	static mentions(text, name){ return text.toLowerCase().includes(name.toLowerCase()); }

	/* doc-check only knows `/x` = public/x. The site also serves repo-root folders (/Servex/…), /framework/servex/ = Servex/,
	 * and `/<module>/md/<path>/` = <module>/<path>.md; a link that lands on one of those is not dead. */
	site_route(t){
		const u = t.split(/[#?]/)[0].replace(/\/+$/, ""), r = this.repo;
		if (!u.startsWith("/")) return false;
		const tries = [u, u.replace(/^\/framework\/servex(?=\/|$)/, "/Servex"), u.replace(/\/md\/(.*)$/, "/$1.md")];
		return tries.some(x => [path.join(r, x), path.join(r, "public", x)].some(f => fs.existsSync(f)));
	}

	/* The free checks for one readme file → the `readme_audit` fields (no Haiku). */
	computed(file, orphans = new Set()){
		const dir = path.dirname(file), text = fs.readFileSync(file, "utf8");
		const ents = fs.readdirSync(dir, { withFileTypes: true }).filter(e => !e.name.startsWith("."));
		const names = ents.map(e => e.name).sort();
		const sha = crypto.createHash("sha1").update(text + "\0" + names.join("\n")).digest("hex").slice(0, 12);
		const unnamed = ents.filter(e => !ReadmeAudit.IGNORE.test(e.name) && !ReadmeAudit.mentions(text, e.name)).map(e => e.name + (e.isDirectory() ? "/" : ""));
		const dated_lines = text.split("\n").filter(l => /\b20\d\d-\d\d-\d\d\b/.test(l.replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, ""))).length;
		const files = ents.filter(e => e.isFile()).length, dirs = ents.filter(e => e.isDirectory()).length;
		return {
			v: ReadmeAudit.V, path: this.rel(file), sha,
			words: (text.match(/\S+/g) || []).length, files: ents.length,
			unnamed, dead_links: dead_links(this.repo, dir, text).filter(t => !this.site_route(t)),
			orphan: orphans.has(this.rel(dir)),
			docs_folder: ents.some(e => e.isDirectory() && e.name === "docs"),
			dated_lines, crowded: files > 15 && dirs === 0,
		};
	}

	/* One simple score, higher = further from the rule. */
	static score(a){
		return Math.round(a.words / 100 + 3 * a.dead_links.length + Math.min(a.unnamed.length, 20) + a.dated_lines + (a.docs_folder ? 5 : 0) + (a.crowded ? 5 : 0) + (a.orphan ? 5 : 0) + (a.shape === "log" ? 8 : a.shape === "essay" ? 6 : a.shape === "mixed" ? 3 : 0));
	}

	/* Latest line per path. */
	latest(){
		const m = new Map();
		let raw = ""; try { raw = fs.readFileSync(ReadmeAudit.OUT, "utf8"); } catch {}
		for (const l of raw.split("\n")) { if (!l.trim()) continue; try { const j = JSON.parse(l).readme_audit; if (j) m.set(j.path, j); } catch {} }
		return m;
	}

	append(a){ fs.mkdirSync(path.dirname(ReadmeAudit.OUT), { recursive: true }); fs.appendFileSync(ReadmeAudit.OUT, JSON.stringify({ readme_audit: a }) + "\n"); }

	/* Haiku, one call: shape, history, note. Retries once on unusable JSON. */
	async judge(file, a){
		const RefineCall = (await import(pathToFileURL(path.join(RefineQueue.main_root(), "Servex/ext/refine/RefineCall.js")).href)).default;
		const text = fs.readFileSync(file, "utf8").slice(0, ReadmeAudit.MAX_CHARS);
		const names = fs.readdirSync(path.dirname(file)).filter(n => !n.startsWith(".")).slice(0, 80);
		const prompt = `README (${a.path}):\n${text}\n\nFILES IN ITS FOLDER: ${names.join(", ")}`;
		let usd = 0, o = null, err = null;
		for (let k = 0; k < 2 && !o; k++){
			const r = await RefineCall.run(prompt, { model: ReadmeAudit.MODEL, system: ReadmeAudit.BRIEF, stage: "readme-audit", cwd: os.tmpdir() });
			usd += r.cost_usd;
			try { const m = r.answer.match(/\{[\s\S]*\}/); o = JSON.parse(m[0]); if (!["index", "essay", "log", "mixed"].includes(o.shape)) throw new Error("bad shape"); } catch (e){ o = null; err = e.message; }
		}
		this.spent += usd;
		if (!o) return { usd, error: err };
		return { usd, shape: o.shape, history: (o.history || []).slice(0, 3).map(String), note: String(o.note || "") };
	}

	/* Computed pass over `files`; appends a line only when the sha changed. Returns {current: Map path→line, written}. */
	run_computed(files){
		const orphans = this.orphans(), have = this.latest(), current = new Map();
		let written = 0;
		for (const f of files){
			const a = this.computed(f, orphans), old = have.get(a.path);
			if (old && old.sha === a.sha){
				const same = ["unnamed", "dead_links", "orphan", "docs_folder", "dated_lines", "crowded", "words", "files"].every(k => JSON.stringify(old[k]) === JSON.stringify(a[k]));
				if (same){ current.set(a.path, old); continue; }
				const kept = { ...a, ...(old.shape ? { shape: old.shape, history: old.history, note: old.note, usd: old.usd } : {}) };   // the checks changed, the readme did not: keep the Haiku answer
				this.append(kept); current.set(a.path, kept); written++; continue;
			}
			this.append(a); current.set(a.path, a); written++;
		}
		return { current, written };
	}

	async run_haiku(files, { limit = Infinity, budget = 6, concurrency = 4 } = {}){
		const { current, written } = this.run_computed(files);
		const todo = [...current.values()].filter(a => !a.shape).sort((x, y) => ReadmeAudit.score(y) - ReadmeAudit.score(x)).slice(0, limit);
		let done = 0, failed = 0, i = 0;
		const worker = async () => {
			while (i < todo.length && this.spent < budget){
				const a = todo[i++], r = await this.judge(path.join(this.repo, a.path), a);
				if (r.error){ failed++; console.log(`✗ ${a.path}: ${r.error}`); continue; }
				this.append({ ...a, shape: r.shape, history: r.history, note: r.note, usd: +r.usd.toFixed(5) });
				done++; console.log(`✓ ${a.path} ${r.shape}  $${r.usd.toFixed(4)} (spent $${this.spent.toFixed(3)})`);
			}
		};
		await Promise.all(Array.from({ length: concurrency }, worker));
		return { written, done, failed, spent: +this.spent.toFixed(4), left: todo.length - i };
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), arg = n => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
	const au = new ReadmeAudit(), one = arg("--path");
	const files = one ? [path.resolve(one)] : au.readmes();
	if (argv.includes("--haiku")){
		const limit = arg("--limit") ? +arg("--limit") : Infinity;
		console.log(await au.run_haiku(files, { limit, budget: arg("--budget") ? +arg("--budget") : 6 }));
	} else {
		const { current, written } = au.run_computed(files);
		console.log(`readmes found ${files.length}  paths in audit ${current.size}  new lines ${written}`);
	}
}

export default ReadmeAudit;
