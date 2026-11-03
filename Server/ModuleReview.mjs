#!/usr/bin/env node
// Server/ModuleReview.mjs — which modules have unread inbox lines, and what a fresh mastermind for each would read. Doc: Servex/doc/module-inbox.md
//   node Server/ModuleReview.mjs --plan [--json]    list modules with unread lines, the depth + model it would pick, the chain's token estimate
// Plan only: nothing is spawned and nothing is written (spawning is the next slice).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ModuleInbox from "../Servex/agents/ModuleInbox.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HAIKU_CAP = 80_000;                       // Haiku jobs stay well under 100k (CLAUDE.md: a request over 100k costs ~5x per token)
const DEEP_WORDS = /\b(architect\w*|class(es)?|hierarch\w*|restructur\w*|extends?|move[ds]?|rename[ds]?|one system|nest\w*)\b/i;

export default class ModuleReview {
	constructor({ repo = REPO } = {}){ this.repo = repo; }

	tokens(text){ return Math.ceil(text.length / 4); }          // chars/4, the repo's rule of thumb
	read(file){ try { return fs.readFileSync(file, "utf8"); } catch { return ""; } }

	/** Readmes root to leaf for a repo-relative dir, whole files (not first screen): the cached chain a fresh mastermind starts from. */
	chain(dir){
		const files = [];
		let cur = this.repo;
		for (const seg of ["", ...dir.split("/").filter(Boolean)]){
			cur = seg ? path.join(cur, seg) : cur;
			for (const n of ["readme.md", "README.md"]) if (fs.existsSync(path.join(cur, n))){ files.push(path.join(cur, n)); break; }
		}
		return files;
	}

	/** Deep reading: the module's architecture-ish docs and its child readmes, one level down. */
	deep_extras(dir){
		const abs = path.join(this.repo, dir), out = [];
		const doc = path.join(abs, "doc");
		try { for (const f of fs.readdirSync(doc)) if (/architecture|decisions/i.test(f) && f.endsWith(".md")) out.push(path.join(doc, f)); } catch {}
		try { for (const e of fs.readdirSync(abs, { withFileTypes: true })) if (e.isDirectory()) for (const n of ["readme.md", "README.md"]) if (fs.existsSync(path.join(abs, e.name, n))) out.push(path.join(abs, e.name, n)); } catch {}
		return out;
	}

	/** Depth follows the ask: architecture words, an `architecture` size tag, or a long essence => deep. */
	depth(lines){ return lines.some(l => l.size === "architecture" || DEEP_WORDS.test(l.essence) || l.essence.length > 600) ? "deep" : "shallow"; }

	plan(){
		const rows = [];
		for (const dir of ModuleInbox.modules(this.repo)){
			const inbox = new ModuleInbox(dir, { repo: this.repo });
			const unread = inbox.unread();
			if (!unread.length) continue;
			const depth = this.depth(unread);
			const files = [...this.chain(dir), ...(depth === "deep" ? this.deep_extras(dir) : [])];
			const chain_tokens = files.reduce((n, f) => n + this.tokens(this.read(f)), 0);
			const ask_tokens = unread.reduce((n, l) => n + this.tokens(l.essence), 0);
			const total = chain_tokens + ask_tokens;
			// Sonnet reads more; Haiku only while the whole read fits well under 100k.
			const model = depth === "shallow" && total <= HAIKU_CAP ? "haiku" : "sonnet";
			rows.push({ module: dir, unread: unread.length, depth, model, files: files.length, chain_tokens, total_tokens: total, ids: unread.map(l => l.id) });
		}
		return rows.sort((a, b) => b.unread - a.unread || a.module.localeCompare(b.module));
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2);
	if (!args.includes("--plan")){ console.log("usage: node Server/ModuleReview.mjs --plan [--json]"); process.exit(args.length ? 1 : 0); }
	const rows = new ModuleReview().plan();
	if (args.includes("--json")) console.log(JSON.stringify(rows, null, 2));
	else if (!rows.length) console.log("no module has unread inbox lines");
	else for (const r of rows) console.log(`${r.module}  ${r.unread} unread  ${r.depth}  ${r.model}  ${r.files} readmes/docs  ~${r.total_tokens} tokens`);
}
