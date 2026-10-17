#!/usr/bin/env node
/**
 * class UndoneVerify — a Haiku checks every "undone" ask against the repo and must show its evidence; code does the bookkeeping.
 * Reads public/framework/ai/asks/undone.json (Server/UndoneAsks.mjs --json), writes batches, merges the answers back.
 * Doc: public/framework/ai/doc/undone-asks-2026-10-17.md (section "Each undone ask, checked").
 *
 *   node Server/UndoneVerify.mjs --batches <dir>   write <dir>/NN-<module>/{brief.md,asks.json}, ~25 asks each; prints the manifest
 *   node Server/UndoneVerify.mjs --merge <dir>     read every <dir>/*\/results.json into undone.json; prints the two numbers that must agree
 *   --redo <verdict>   batches only: re-batch the asks already verified with that verdict (default: the asks with no verdict yet)
 *   --root <repo>      where the data lives (default: the repo this file is in)
 *   --by <label>       who verified (merge; default claude-haiku-5-5)
 *
 * A "done" verdict is accepted only if its evidence names a path:line that exists in the repo (checked here, not by the model);
 * otherwise it is kept as "unclear" with the reason. Nothing is written to undone.json except the verified_* fields of an ask.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FW = "public/framework";

export default class UndoneVerify {

	static DATA = "public/framework/ai/asks/undone.json";
	static BATCH = 25;                 // asks per Haiku run: the run stays under 60k tokens
	static README_LINES = 70;          // lines of the module's own readme inlined in a brief
	static VERDICTS = ["done", "undone", "unclear"];

	constructor({ root = HERE } = {}){ this.root = root; this.file = path.join(root, UndoneVerify.DATA); }

	load(){ return JSON.parse(fs.readFileSync(this.file, "utf8")); }
	save(d){ fs.writeFileSync(this.file, JSON.stringify(d, null, 1)); }
	static slug(m){ return m.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase(); }

	// ---- the module's folder and its readme chain -------------------------------------------------------

	/** `ext/Figma` → public/framework/ext/Figma; `servex` → Servex; null when no folder is found. */
	module_dir(label){
		const tries = [path.join(FW, label), label, path.join("public", label)];
		for (const t of tries) if (fs.existsSync(path.join(this.root, t)) && fs.statSync(path.join(this.root, t)).isDirectory()) return t.split(path.sep).join("/");
		const top = fs.readdirSync(this.root).find(n => n.toLowerCase() === label.toLowerCase() && fs.statSync(path.join(this.root, n)).isDirectory());
		return top ?? null;
	}
	/** Readmes root to leaf for a module dir (the ones that exist). */
	readme_chain(dir){
		const out = [];
		if (fs.existsSync(path.join(this.root, "readme.md"))) out.push("readme.md");
		const segs = (dir ?? "").split("/").filter(Boolean);
		for (let i = 1; i <= segs.length; i++){ const r = segs.slice(0, i).join("/") + "/readme.md"; if (fs.existsSync(path.join(this.root, r))) out.push(r); }
		return [...new Set(out)];
	}

	// ---- batches -----------------------------------------------------------------------------------

	static chunks(list, max = UndoneVerify.BATCH){
		const n = Math.ceil(list.length / max), size = Math.ceil(list.length / n), out = [];
		for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
		return out;
	}

	/** The asks to check: undone ones with no verdict (or, with `redo`, the ones whose verdict is `redo`). */
	pending(d, redo){
		return d.modules.flatMap(m => m.asks.filter(a => a.state === "undone" && (redo ? a.verified === redo : !a.verified)).map(a => ({ ...a, module: m.module })));
	}

	brief(module, dir, chain, asks, results_path){
		const readme = chain.length ? fs.readFileSync(path.join(this.root, chain.at(-1)), "utf8").split("\n").slice(0, UndoneVerify.README_LINES).join("\n") : "(no readme found)";
		return `# Check ${asks.length} asks against the repo: ${module}

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to \`${results_path}\` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = \`path:line\` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its \`doc/\`, a \`grep\` for two or three key words, \`git log --oneline -n 5 -S"<key word>" -- <dir>\`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: \`${module}\`, folder \`${dir ?? "(no folder: search the repo)"}\` (the site serves \`public/\` as \`/\`).
- Readme chain, root to leaf: ${chain.map(c => "`" + c + "`").join(", ") || "none"}. Also its \`doc/\`, \`tasks/\`, \`inbox.jsonl\`.
- \`public/framework/ai/handover.md\` and \`CLAUDE.md\` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use \`git log\` sparingly (always with \`-n 5\` and a path).

## The module's readme (first ${UndoneVerify.README_LINES} lines of \`${chain.at(-1) ?? "none"}\`)

${readme}

## Output: \`${results_path}\`

A JSON array, one object per ask below, same ids, nothing else in the file:

\`\`\`json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
\`\`\`

## The ${asks.length} asks

${asks.map((a, i) => `${i + 1}. \`${a.id}\` (${a.days ?? "?"} days old): ${a.text}`).join("\n")}
`;
	}

	write_batches(outdir, { redo = null } = {}){
		const d = this.load(), asks = this.pending(d, redo), by = new Map();
		for (const a of asks) (by.get(a.module) ?? by.set(a.module, []).get(a.module)).push(a);
		fs.mkdirSync(outdir, { recursive: true });
		const manifest = [];
		let n = 0;
		for (const [module, list] of [...by].sort((x, y) => y[1].length - x[1].length)){
			const dir = this.module_dir(module), chain = this.readme_chain(dir);
			for (const [i, chunk] of UndoneVerify.chunks(list).entries()){
				const name = `${String(++n).padStart(2, "0")}-${UndoneVerify.slug(module)}${by.get(module).length > UndoneVerify.BATCH ? "-" + (i + 1) : ""}`;
				const bdir = path.join(outdir, name);
				fs.mkdirSync(bdir, { recursive: true });
				const rel = path.relative(this.root, path.join(bdir, "results.json")).split(path.sep).join("/");
				fs.writeFileSync(path.join(bdir, "brief.md"), this.brief(module, dir, chain, chunk, rel));
				fs.writeFileSync(path.join(bdir, "asks.json"), JSON.stringify(chunk.map(a => a.id)));
				manifest.push({ batch: name, module, asks: chunk.length, brief: path.relative(this.root, path.join(bdir, "brief.md")).split(path.sep).join("/") });
			}
		}
		fs.writeFileSync(path.join(outdir, "manifest.json"), JSON.stringify(manifest, null, 1));
		return manifest;
	}

	// ---- merge -------------------------------------------------------------------------------------

	/** Every `path:line` token in `text` that is a file or folder in the repo. */
	paths_in(text){
		const toks = String(text ?? "").match(/[\w@./~-]+\.(?:js|mjs|md|json|jsonl|css|html|txt)(?::\d+)?|[\w./-]+\/(?=[\s,;)]|$)/g) ?? [];
		return toks.map(t => t.replace(/:\d+$/, "").replace(/^\/+/, "")).filter(t => [t, path.join("public", t)].some(c => fs.existsSync(path.join(this.root, c))));
	}

	/** One answer → the fields to store. A "done" with no path that exists is not believed. */
	judge(r){
		const verdict = UndoneVerify.VERDICTS.includes(r?.verdict) ? r.verdict : "unclear";
		let evidence = String(r?.evidence ?? "").trim().slice(0, 600);
		if (verdict === "done" && !this.paths_in(evidence).length)
			return { verified: "unclear", verified_evidence: "(claimed done, but no path in the evidence exists in the repo) " + evidence, verified_looked: r?.looked ?? [] };
		if (!evidence) return { verified: "unclear", verified_evidence: "(no evidence given)", verified_looked: [] };
		return { verified: verdict, verified_evidence: evidence, verified_looked: Array.isArray(r.looked) ? r.looked.slice(0, 8) : [] };
	}

	merge(dir, { by = "claude-haiku-5-5", at = new Date().toISOString() } = {}){
		const d = this.load(), asks = new Map(d.modules.flatMap(m => m.asks).map(a => [a.id, a]));
		const seen = new Set(), missing = [];
		for (const b of fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory())){
			const rf = path.join(dir, b.name, "results.json"), want = JSON.parse(fs.readFileSync(path.join(dir, b.name, "asks.json"), "utf8"));
			let got = []; try { got = JSON.parse(fs.readFileSync(rf, "utf8")); } catch { missing.push(b.name); continue; }
			for (const r of got){
				const a = asks.get(r.id);
				if (!a || !want.includes(r.id) || seen.has(r.id)) continue;
				Object.assign(a, this.judge(r), { verified_at: at, verified_by: by });
				seen.add(r.id);
			}
		}
		this.save(d);
		return { missing, ...this.counts(d) };
	}

	/** The two numbers that must agree: asks with a verdict, and done + undone + unclear. */
	counts(d = this.load()){
		const undone = d.modules.flatMap(m => m.asks).filter(a => a.state === "undone"), c = { done: 0, undone: 0, unclear: 0 };
		let verified = 0;
		for (const a of undone) if (a.verified){ verified++; c[a.verified]++; }
		return { undone_asks: undone.length, verified, ...c, sum: c.done + c.undone + c.unclear, agree: verified === c.done + c.undone + c.unclear };
	}

	static async main(argv){
		const val = f => argv.includes(f) ? argv[argv.indexOf(f) + 1] : null;
		const u = new UndoneVerify({ root: path.resolve(val("--root") ?? HERE) });
		if (argv.includes("--batches")){
			const m = u.write_batches(path.resolve(val("--batches")), { redo: val("--redo") });
			console.log(m.map(b => `${b.batch.padEnd(34)} ${String(b.asks).padStart(3)} asks`).join("\n"));
			console.log(`\n${m.length} batches, ${m.reduce((n, b) => n + b.asks, 0)} asks`);
		} else if (argv.includes("--merge")){
			const r = u.merge(path.resolve(val("--merge")), { by: val("--by") ?? undefined });
			console.log(`undone asks ${r.undone_asks}: verified ${r.verified} = done ${r.done} + undone ${r.undone} + unclear ${r.unclear} (${r.sum})`, r.agree ? "- the two numbers agree" : "- THEY DISAGREE");
			if (r.missing.length) console.log("no results yet: " + r.missing.join(", "));
			if (!r.agree) process.exitCode = 1;
		} else console.log("usage: node Server/UndoneVerify.mjs --batches <dir> | --merge <dir>");
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	UndoneVerify.main(process.argv.slice(2)).catch(e => { console.error(e.stack ?? e); process.exit(1); });
