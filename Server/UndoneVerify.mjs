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
 * Second pass over the asks the first pass left "unclear" (doc: ai/doc/undone-asks-2026-10-17.md, "The 151 unclear asks"):
 *   --groups                     print how the unclear asks fall into groups, by the reason in their evidence (UndoneVerify.group)
 *   --batches <dir> --only unclear --question <kind>   ~20 asks per batch, each with ONE question: path | work | concrete | look
 *   --batches <dir> --only work-yes --question look    the asks the "work" question called work, asked "is it built?"
 *   --merge <dir>                reads the kind from <dir>/manifest.json; first-pass fields move to verified_first, retired/needs-owner appear
 *   --route                      every ask still unclear after its second pass becomes needs-owner (nothing is deleted)
 *   --counts2                    the second-pass numbers that must agree: unclear-before = done + undone + retired + needs-owner (+ pending)
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
	static BATCH2 = 20;                // second pass: one question per ask, ~20 per run
	// Why the first pass could not tell: the first regex that matches the evidence names the group. The question for each group is in QUESTIONS.
	static GROUPS = [
		["no-path", /claimed done, but no path|no evidence given/i],
		["gone",    /no longer|does not exist|removed|retired|deleted|renamed|superseded|obsolete|moved to/i],
		["vague",   /vague|too broad|ambiguous|unclear what|too general|cannot (be )?test|can't test|no concrete|not specific|underspecified|no single testable|no testable outcome/i],
		["not-work", /opinion|a decision|decide|preference|rule|how to work|working|naming|advice|principle|not a work|question|explain|request|not testable|not a testable|analysis|discussion|suggestion|guidance|statement|report|instruction|consider|investigat|one-off|an action|lookup|judgment|a measurement|operating|process step|read-first|deliverable|not a build|not a buildable|idea to weigh|alternative to weigh|architecture choice|choice/i],
	];
	/** question kind -> the groups it is asked of. */
	static KIND_GROUPS = { path: ["no-path"], work: ["not-work"], concrete: ["vague"], look: ["ran-out", "gone"] };
	static KINDS = Object.keys(UndoneVerify.KIND_GROUPS);
	static group(a){ const e = a.verified_evidence ?? ""; for (const [k, r] of UndoneVerify.GROUPS) if (r.test(e)) return k; return "ran-out"; }

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

	// ---- the second pass: the asks the first pass left unclear, one question each -------------------------

	static QUESTIONS = {
		path: "The first pass said this is built, but the path it cited does not exist. Find the real file. Does the thing exist and do what the ask says? done (the real path:line you opened and the quoted line), undone (the three places you looked) or unclear.",
		work: "Is this a work item at all? Answer work: \"yes\" if finishing it would change a file, page or setting in this repo (build, fix, write, check-and-record). Answer work: \"no\" if it is an opinion, a question, a request for a chat answer or report, a rule about how to work, or a decision only the owner can make; then say in one line what it is.",
		concrete: "The first pass found the ask too vague to test. Say in one sentence what a finished version would be and name the one file or page where it would show. Open that place. Is it there? done (path:line and quote), undone (what is missing), or unclear (it still cannot be tested: say what is missing from the ask).",
		look: "The first pass ran out of places to look. Look further: grep the whole repo (not only the module) for two or three key words from the ask, read the module's doc/ and tasks/, and run git log --oneline -n 5 -S\"<key word>\". Is it built? done (path:line and quote), undone (the places you looked), or unclear.",
	};

	/** The asks for a second pass. only "unclear": first-pass unclear with no second pass yet; "work-yes": asks the work question called work. */
	pending2(d, { only = "unclear", kind = null } = {}){
		const all = d.modules.flatMap(m => m.asks.map(a => ({ ...a, module: m.module })));
		let list = only === "work-yes" ? all.filter(a => a.verified_kind === "work-yes" && a.verified === "unclear")
		         : all.filter(a => a.verified === "unclear" && !a.verified_pass);
		if (only !== "work-yes" && kind) list = list.filter(a => UndoneVerify.KIND_GROUPS[kind].includes(UndoneVerify.group(a)));
		return list;
	}

	brief2(kind, asks, results_path){
		const shape = kind === "work"
			? '[{"id":"abc1234567","work":"yes|no","reason":"one line: what it is, or what file it would change"}]'
			: '[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command"],"owner_question":"only when unclear: one short yes/no question the owner can answer by voice"}]';
		const lines = asks.map((a, i) => (i + 1) + ". `" + a.id + "` [" + a.module + "] " + a.text.replace(/\s+/g, " ") + "\n   first pass said: " + (a.verified_evidence ?? "").replace(/\s+/g, " ").slice(0, 400));
		return [
			"# One question about " + asks.length + " asks (" + kind + ")",
			"",
			"You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `" + results_path + "` and stop.",
			"",
			"A first pass could not tell whether each ask below is done. For each ask answer ONE question:",
			"",
			"> " + UndoneVerify.QUESTIONS[kind],
			"",
			'Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.',
			"",
			"## Output: `" + results_path + "`",
			"",
			"A JSON array, one object per ask, same ids, nothing else in the file:",
			"",
			"```json",
			shape,
			"```",
			"",
			"## The " + asks.length + " asks",
			"",
			lines.join("\n"),
			"",
		].join("\n");
	}

	write_batches2(outdir, { only = "unclear", kind }){
		if (!UndoneVerify.KINDS.includes(kind)) throw new Error("--question must be one of " + UndoneVerify.KINDS.join(", "));
		const asks = this.pending2(this.load(), { only, kind }).sort((a, b) => a.module.localeCompare(b.module));
		fs.mkdirSync(outdir, { recursive: true });
		const mf = path.join(outdir, "manifest.json"), manifest = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, "utf8")) : [];
		const mine = [];
		for (const chunk of UndoneVerify.chunks(asks, UndoneVerify.BATCH2)){
			const name = String(manifest.length + 1).padStart(2, "0") + "-" + kind, bdir = path.join(outdir, name);
			fs.mkdirSync(bdir, { recursive: true });
			const rel = path.relative(this.root, path.join(bdir, "results.json")).split(path.sep).join("/");
			fs.writeFileSync(path.join(bdir, "brief.md"), this.brief2(kind, chunk, rel));
			fs.writeFileSync(path.join(bdir, "asks.json"), JSON.stringify(chunk.map(a => a.id)));
			const row = { batch: name, kind, asks: chunk.length, brief: path.relative(this.root, path.join(bdir, "brief.md")).split(path.sep).join("/") };
			manifest.push(row); mine.push(row);
		}
		fs.writeFileSync(mf, JSON.stringify(manifest, null, 1));
		return mine;
	}

	/** One second-pass answer -> the fields to store. The first-pass verdict is kept in verified_first, never lost. */
	judge2(kind, r, a){
		const first = a.verified_first ?? { verified: a.verified, verified_evidence: a.verified_evidence, verified_at: a.verified_at, verified_by: a.verified_by };
		const keep = { verified_first: first, verified_pass: 2, verified_kind: kind };
		if (kind === "work"){
			const why = String(r?.reason ?? "").trim().slice(0, 300) || "(no reason given)";
			if (r?.work === "no") return { ...keep, verified: "retired", verified_evidence: "Not a work item: " + why };
			return { ...keep, verified_kind: "work-yes", verified: "unclear", verified_evidence: "Work item (" + why + "); built-or-not still to check" };
		}
		const out = { ...keep, ...this.judge(r) };
		if (out.verified === "unclear" && r?.owner_question) out.owner_question = String(r.owner_question).trim().slice(0, 200);
		return out;
	}

	merge2(dir, { by = "claude-haiku-5-5", at = new Date().toISOString() } = {}){
		const d = this.load(), asks = new Map(d.modules.flatMap(m => m.asks).map(a => [a.id, a]));
		const kinds = new Map(JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8")).map(m => [m.batch, m.kind]));
		const seen = new Set(), missing = [], per = {};
		for (const [batch, kind] of kinds){
			let got; try { got = JSON.parse(fs.readFileSync(path.join(dir, batch, "results.json"), "utf8")); } catch { missing.push(batch); continue; }
			const want = JSON.parse(fs.readFileSync(path.join(dir, batch, "asks.json"), "utf8"));
			for (const r of got){
				const a = asks.get(r.id);
				if (!a || !want.includes(r.id) || seen.has(r.id) || (a.verified_pass && a.verified_kind !== "work-yes")) continue;   // a finished ask is not re-judged
				Object.assign(a, this.judge2(kind, r, a), { verified_at: at, verified_by: by });
				seen.add(r.id); per[kind] = (per[kind] ?? 0) + 1;
			}
		}
		this.save(d);
		return { missing, merged: per, ...this.counts2(d) };
	}

	/** Every ask still unclear after its second pass (and not waiting on the built-or-not question) becomes needs-owner, with a one-line question. */
	route(){
		const d = this.load(); let n = 0;
		for (const m of d.modules) for (const a of m.asks)
			if (a.verified === "unclear" && a.verified_pass && a.verified_kind !== "work-yes"){
				a.verified = "needs-owner";
				a.owner_question ||= "Is this still wanted, and what should it become? “" + a.text.replace(/\s+/g, " ").slice(0, 110) + "”";
				n++;
			}
		this.save(d);
		return { routed: n, ...this.counts2(d) };
	}

	/** The numbers that must agree: the asks the first pass left unclear = done + undone + retired + needs-owner (+ still pending). */
	counts2(d = this.load()){
		const mine = d.modules.flatMap(m => m.asks).filter(a => a.verified_first || (a.verified === "unclear" && !a.verified_pass));
		const c = { done: 0, undone: 0, retired: 0, "needs-owner": 0, unclear: 0 };
		for (const a of mine) c[a.verified] = (c[a.verified] ?? 0) + 1;
		const sum = c.done + c.undone + c.retired + c["needs-owner"] + c.unclear;
		return { unclear_before: mine.length, ...c, sum, agree: sum === mine.length, final: c.unclear === 0 };
	}

	/** { group -> count } for the asks the first pass left unclear. */
	groups(d = this.load()){
		const g = {};
		for (const a of d.modules.flatMap(m => m.asks)) if (a.verified === "unclear" && !a.verified_pass){ const k = UndoneVerify.group(a); g[k] = (g[k] ?? 0) + 1; }
		return g;
	}

	/** True when a batches dir was written by a second-pass --question run (its manifest rows carry a kind). */
	static has_kinds(dir){ try { return !!JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"))[0]?.kind; } catch { return false; } }

	static async main(argv){
		const val = f => argv.includes(f) ? argv[argv.indexOf(f) + 1] : null;
		const u = new UndoneVerify({ root: path.resolve(val("--root") ?? HERE) });
		if (argv.includes("--groups")){
			const g = u.groups(); console.log(Object.entries(g).map(([k, n]) => k.padEnd(10) + " " + n).join("\n") + "\ntotal " + Object.values(g).reduce((x, y) => x + y, 0));
		} else if (argv.includes("--counts2")){
			console.log(u.counts2());
		} else if (argv.includes("--route")){
			const r = u.route(); console.log("routed " + r.routed + " to needs-owner;", r);
			if (!r.agree) process.exitCode = 1;
		} else if (argv.includes("--batches") && val("--only")){
			const m = u.write_batches2(path.resolve(val("--batches")), { only: val("--only"), kind: val("--question") });
			console.log(m.map(b => b.batch.padEnd(16) + " " + String(b.asks).padStart(3) + " asks").join("\n") + "\n\n" + m.length + " batches, " + m.reduce((n, b) => n + b.asks, 0) + " asks");
		} else if (argv.includes("--merge") && UndoneVerify.has_kinds(path.resolve(val("--merge")))){
			const r = u.merge2(path.resolve(val("--merge")), { by: val("--by") ?? undefined });
			console.log("merged", r.merged, r.missing.length ? "no results yet: " + r.missing.join(", ") : "");
			console.log(r);
			if (!r.agree) process.exitCode = 1;
		} else if (argv.includes("--batches")){

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
