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
 *   --doc                        print the dated markdown section for the verdict doc (counts, table, owner questions)
 *   --counts2                    the second-pass numbers that must agree: unclear-before = done + undone + retired + needs-owner (+ pending)
 *
 * Third pass, the sort (crack 2: every ask still open becomes a task, a close or a note; doc: ai/doc/undone-asks-2026-10-17.md):
 *   --batches <dir> --question sort   25 open asks per batch (no task, not found built, not retired, no note), with the module list
 *   --run <dir> [--parallel 4] [--limit n]     each batch with no results.json goes to Haiku through PromptRecords.ask; cost in <dir>/runs.jsonl
 *   --merge <dir>                    task -> verified undone + verified_module; done (path checked) -> done; obsolete -> retired; note -> note
 *   --counts3                        sorted = task + done + obsolete + note, and how many are still open
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
		if (kind === "sort") return { verified_first: a.verified_first ?? { verified: a.verified ?? null, verified_evidence: a.verified_evidence ?? null }, ...this.judge3(r) };
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
		const d = this.load(), asks = new Map(), twins = new Map();   // the same ask can sit in two rows (same id): the answer goes to both
		for (const a of d.modules.flatMap(m => m.asks)){ if (asks.has(a.id)) (twins.get(a.id) ?? twins.set(a.id, []).get(a.id)).push(a); else asks.set(a.id, a); }
		const kinds = new Map(JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8")).map(m => [m.batch, m.kind]));
		const seen = new Set(), missing = [], per = {};
		for (const [batch, kind] of kinds){
			let got; try { got = JSON.parse(fs.readFileSync(path.join(dir, batch, "results.json"), "utf8")); } catch { missing.push(batch); continue; }
			const want = JSON.parse(fs.readFileSync(path.join(dir, batch, "asks.json"), "utf8"));
			for (const r of got){
				const a = asks.get(r.id);
				if (!a || !want.includes(r.id) || seen.has(r.id) || (kind !== "sort" && a.verified_pass && a.verified_kind !== "work-yes") || a.verified_kind === "sort") continue;   // a finished ask is not re-judged
				const j = { ...this.judge2(kind, r, a), verified_at: at, verified_by: by };
				for (const x of [a, ...(twins.get(r.id) ?? [])]) Object.assign(x, structuredClone(j));
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
		const mine = d.modules.flatMap(m => m.asks).filter(a => a.verified_kind !== "sort" && (a.verified_first || (a.verified === "unclear" && !a.verified_pass)));
		const c = { done: 0, undone: 0, retired: 0, "needs-owner": 0, unclear: 0 };
		for (const a of mine) c[a.verified] = (c[a.verified] ?? 0) + 1;
		const sum = c.done + c.undone + c.retired + c["needs-owner"] + c.unclear;
		return { unclear_before: mine.length, ...c, sum, agree: sum === mine.length, final: c.unclear === 0 };
	}

	/** The markdown section for the verdict doc: how the 151 split, what each question produced, and the owner questions grouped by module. Computed, never typed. */
	doc_section(d = this.load(), { date = new Date().toISOString().slice(0, 10) } = {}){
		const mine = d.modules.flatMap(m => m.asks.map(a => ({ ...a, module: m.module }))).filter(a => a.verified_first);
		const c = this.counts2(d), by = {};
		for (const a of mine){ const k = UndoneVerify.group({ verified_evidence: a.verified_first.verified_evidence }); (by[k] ??= { n: 0, done: 0, undone: 0, retired: 0, "needs-owner": 0 }).n++; by[k][a.verified]++; }
		const rows = Object.entries(by).map(([k, r]) => "| " + k + " | " + r.n + " | " + r.done + " | " + r.undone + " | " + r.retired + " | " + r["needs-owner"] + " |");
		const owners = {};
		for (const a of mine.filter(x => x.verified === "needs-owner")) (owners[a.module] ??= []).push(a);
		return [
			"### The 151 unclear asks, a second look (" + date + ")",
			"",
			"The first pass could not tell whether " + c.unclear_before + " asks were done. Each was grouped by the reason in its evidence (`node Server/UndoneVerify.mjs --groups`), and a Haiku answered ONE question per group (`--only unclear --question path|work|concrete|look`). Asks that turned out to be work were then asked one more question, \"is it built?\" (`--only work-yes --question look`). The first-pass verdict is kept on each ask as `verified_first`.",
			"",
			"**" + c.unclear_before + " = " + c.done + " done + " + c.undone + " undone + " + c.retired + " not work (retired) + " + c["needs-owner"] + " need you** (sum " + c.sum + ", " + (c.agree ? "the numbers agree" : "THEY DISAGREE") + ").",
			"",
			"| Why it was unclear | Asks | Now done | Now undone | Retired (not work) | Needs you |",
			"|---|---|---|---|---|---|",
			...rows,
			"",
			"- The " + c.undone + " undone asks became idle tasks in their module homes (`node Server/UndoneToTasks.mjs --apply`). Retired asks stay on [Undone asks](/framework/ai/asks/undone/) under the \"not work\" chip; nothing was deleted.",
			"",
			"#### Questions for you (" + c["needs-owner"] + ", answer ten at a time by voice)",
			"",
			...Object.entries(owners).flatMap(([m, l]) => ["**" + m + "**", "", ...l.map(a => "- `" + a.id + "` " + a.owner_question), ""]),
		].join("\n");
	}

	/** { group -> count } for the asks the first pass left unclear. */
	groups(d = this.load()){
		const g = {};
		for (const a of d.modules.flatMap(m => m.asks)) if (a.verified === "unclear" && !a.verified_pass){ const k = UndoneVerify.group(a); g[k] = (g[k] ?? 0) + 1; }
		return g;
	}

	// ---- the sort pass (crack 2, core/Task/doc/cracks.md): every ask still open becomes a task, a close or a note -------------------
	// Open = not done, no task, not found built, not retired, no note: the unroutable ones (no module), the needs-you ones and any never checked.

	static BATCH3 = 25;
	static SORTS = ["task", "done", "obsolete", "note"];

	/** The asks the sort pass takes, grouped by source so a batch shares context. */
	pending3(d){
		return d.modules.flatMap(m => m.asks.map(a => ({ ...a, module: m.module })))
			.filter(a => a.state !== "done" && !a.task && !a.note && !["done", "retired"].includes(a.verified) && a.verified_kind !== "sort")
			.sort((a, b) => String(a.source).localeCompare(String(b.source)) || String(a.at).localeCompare(String(b.at)));
	}

	/** Every module a task could live in: a folder under public/framework with a readme.md (not a session, task or old folder), plus Servex and Server. */
	modules(){
		if (this._mods) return this._mods;
		const out = [], fw = path.join(this.root, FW), skip = new Set(["sessions", "tasks", "old", "sandbox", "node_modules", "doc", "test", "data", "legacy"]);
		const walk = (d, rel, depth) => {
			let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
			for (const e of es){
				if (!e.isDirectory() || skip.has(e.name) || e.name.startsWith(".") || /^\d{4}/.test(e.name)) continue;
				const r = rel ? rel + "/" + e.name : e.name, p = path.join(d, e.name), rm = path.join(p, "readme.md");
				if (fs.existsSync(rm)){
					const h = (fs.readFileSync(rm, "utf8").split("\n").find(l => /^#\s/.test(l)) ?? "").replace(/^#\s*/, "").slice(0, 70);
					out.push({ module: r, about: h });
				}
				if (depth < 2) walk(p, r, depth + 1);
			}
		};
		walk(fw, "", 0);
		for (const top of ["Servex", "Server"]) if (fs.existsSync(path.join(this.root, top, "readme.md"))) out.push({ module: top, about: top === "Servex" ? "the agent system: roles, spawning, the heartbeat, merge and review" : "the dev server and its node scripts" });
		return this._mods = out;
	}
	is_module(m){ return !!m && this.modules().some(x => x.module === m); }

	brief3(asks){
		const lines = asks.map((a, i) => (i + 1) + ". `" + a.id + "` (" + (a.days ?? "?") + " days old, " + a.kind + (a.module.startsWith("(") ? "" : ", filed under " + a.module) + "): " + a.text.replace(/\s+/g, " ")
			+ (a.verified_evidence ? "\n   an earlier check said: " + a.verified_evidence.replace(/\s+/g, " ").slice(0, 300) : ""));
		return [
			"# Sort " + asks.length + " of the owner's asks",
			"",
			"You are a sorter, not a builder. Do NOT edit any file. Read the repo only as much as you need (Grep/Glob first; `git log` always with `-n 5` and a path). The site serves `public/` as `/`; modules live in `public/framework/<module>/`; rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`.",
			"",
			"Each ask below is something the owner said that nothing has tracked yet. Sort each into exactly one of four:",
			"",
			"- **task**: still wanted and not built. Give `module` (from the list below), a `title` (an imperative, under 80 characters, plain words), and `evidence`: what is missing, and where you looked.",
			"- **done**: it exists now. `evidence` = `path:line - the quoted line` of a file you opened. A related thing is not the thing.",
			"- **obsolete**: no longer applies (superseded, the thing it was about is gone, a one-time question about a moment that has passed, a status check). `evidence` = one line why.",
			"- **note**: not work but worth keeping: a rule, a preference, an idea, an observation about how something should be. Give `module` and `note`: one plain sentence that a reader of that module's readme would understand on its own.",
			"",
			"Decide every ask; never answer \"ask the owner\". When unsure between task and note: if finishing it would change a file, page or setting, it is a task. Always give `module` for a task or a note: the one from the list that the ask is about; if none fits, use `ai`.",
			"",
			"## Modules (folder under public/framework, or a top-level folder): what each is",
			"",
			this.modules().map(m => "- `" + m.module + "`" + (m.about ? ": " + m.about : "")).join("\n"),
			"",
			"## Answer",
			"",
			"Your final message is ONLY a JSON array, one object per ask, same ids, nothing else:",
			"",
			"```json",
			'[{"id":"abc1234567","sort":"task|done|obsolete|note","module":"ext/Refine","title":"for a task","note":"for a note","evidence":"see above"}]',
			"```",
			"",
			"## The " + asks.length + " asks",
			"",
			lines.join("\n"),
			"",
		].join("\n");
	}

	write_batches3(outdir){
		const asks = this.pending3(this.load());
		fs.mkdirSync(outdir, { recursive: true });
		const mf = path.join(outdir, "manifest.json"), manifest = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, "utf8")) : [];
		const mine = [];
		for (const chunk of UndoneVerify.chunks(asks, UndoneVerify.BATCH3)){
			const name = String(manifest.length + 1).padStart(2, "0") + "-sort", bdir = path.join(outdir, name);
			fs.mkdirSync(bdir, { recursive: true });
			fs.writeFileSync(path.join(bdir, "brief.md"), this.brief3(chunk));
			fs.writeFileSync(path.join(bdir, "asks.json"), JSON.stringify(chunk.map(a => a.id)));
			const row = { batch: name, kind: "sort", asks: chunk.length, brief: path.relative(this.root, path.join(bdir, "brief.md")).split(path.sep).join("/") };
			manifest.push(row); mine.push(row);
		}
		fs.writeFileSync(mf, JSON.stringify(manifest, null, 1));
		return mine;
	}

	/** One sort answer -> the fields to store. A "done" whose path does not exist, or an answer with no sort, becomes a task: never lost. */
	judge3(r){
		let sort = UndoneVerify.SORTS.includes(r?.sort) ? r.sort : "task";
		const ev = String(r?.evidence ?? "").trim().slice(0, 600), mod = this.is_module(r?.module) ? r.module : null;
		if (sort === "done" && !this.paths_in(ev).length) sort = "task";
		if (sort === "note" && !String(r?.note ?? "").trim()) sort = "task";
		const keep = { verified_pass: 3, verified_kind: "sort", verified_sort: sort };
		if (sort === "done") return { ...keep, verified: "done", verified_evidence: ev, verified_looked: [] };
		if (sort === "obsolete") return { ...keep, verified: "retired", verified_evidence: "Obsolete: " + (ev || "(no reason given)") };
		if (sort === "note") return { ...keep, verified: "note", verified_module: mod ?? "ai", note: { module: mod ?? "ai", text: String(r.note).trim().replace(/\s+/g, " ").slice(0, 300), file: null }, verified_evidence: ev };
		return { ...keep, verified: "undone", verified_module: mod, verified_title: String(r?.title ?? "").trim().slice(0, 100) || null, verified_evidence: ev || "(sorted as still wanted)" };
	}

	/** --run <dir>: every batch in the manifest with no results.json yet goes to Haiku (PromptRecords.ask: Read/Grep/Glob, writes nothing),
	 * `parallel` at a time; the answer is written to results.json and the cost to the runs log beside the manifest. */
	async run(dir, { parallel = 4, model = "claude-haiku-5-5", max_turns = 24, limit = Infinity } = {}){
		const { default: PromptRecords } = await import("./PromptRecords.mjs");
		const todo = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8")).filter(m => !fs.existsSync(path.join(dir, m.batch, "results.json"))).slice(0, limit);
		const runs = path.join(dir, "runs" + ".jsonl"), out = [], log = row => fs.appendFileSync(runs, JSON.stringify(row) + "\n");
		const one = async m => {
			const brief = fs.readFileSync(path.join(dir, m.batch, "brief.md"), "utf8"), t0 = Date.now();
			let r; try { r = await PromptRecords.ask(brief, { model, system: "You sort a list of asks and answer with one JSON array. You never edit files.", tools: ["Read", "Grep", "Glob", "Bash"], max_turns }); }
			catch (e){ log({ batch: m.batch, error: String(e.message ?? e), at: new Date().toISOString() }); return; }
			fs.writeFileSync(path.join(dir, m.batch, "answer.txt"), r.text ?? "");   // the raw answer, kept so a parse failure costs nothing
			const got = UndoneVerify.array(r.text), ok = Array.isArray(got);
			if (ok) fs.writeFileSync(path.join(dir, m.batch, "results.json"), JSON.stringify(got, null, 1));
			const row = { batch: m.batch, asks: m.asks, answered: ok ? got.length : 0, usd: +r.usd.toFixed(4), s: Math.round((Date.now() - t0) / 1000), at: new Date().toISOString(), ...(ok ? {} : { error: "no JSON array in the answer", tail: r.text.slice(-300) }) };
			log(row); out.push(row); console.log(JSON.stringify(row));
		};
		for (let i = 0; i < todo.length; i += parallel) await Promise.all(todo.slice(i, i + parallel).map(one));
		return out;
	}

	/** The JSON array in a model's answer (fenced or not), or null. */
	static array(text){ const t = String(text ?? ""), a = t.indexOf("["), b = t.lastIndexOf("]"); if (a < 0 || b < a) return null; try { return JSON.parse(t.slice(a, b + 1)); } catch { return null; } }

	/** The numbers that must agree for the sort pass: asks sorted = task + done + obsolete + note. */
	counts3(d = this.load()){
		const mine = d.modules.flatMap(m => m.asks).filter(a => a.verified_kind === "sort"), c = { task: 0, done: 0, obsolete: 0, note: 0 };
		for (const a of mine) c[a.verified_sort]++;
		return { sorted: mine.length, ...c, open: this.pending3(d).length, agree: c.task + c.done + c.obsolete + c.note === mine.length };
	}

	/** True when a batches dir was written by a second-pass --question run (its manifest rows carry a kind). */
	static has_kinds(dir){ try { return !!JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"))[0]?.kind; } catch { return false; } }

	static async main(argv){
		const val = f => argv.includes(f) ? argv[argv.indexOf(f) + 1] : null;
		const u = new UndoneVerify({ root: path.resolve(val("--root") ?? HERE) });
		if (argv.includes("--doc")){
			console.log(u.doc_section());
		} else if (argv.includes("--groups")){
			const g = u.groups(); console.log(Object.entries(g).map(([k, n]) => k.padEnd(10) + " " + n).join("\n") + "\ntotal " + Object.values(g).reduce((x, y) => x + y, 0));
		} else if (argv.includes("--counts2")){
			console.log(u.counts2());
		} else if (argv.includes("--route")){
			const r = u.route(); console.log("routed " + r.routed + " to needs-owner;", r);
			if (!r.agree) process.exitCode = 1;
		} else if (argv.includes("--batches") && val("--question") === "sort"){
			const m = u.write_batches3(path.resolve(val("--batches")));
			console.log(m.map(b => b.batch.padEnd(10) + " " + String(b.asks).padStart(3) + " asks").join("\n") + "\n\n" + m.length + " batches, " + m.reduce((n, b) => n + b.asks, 0) + " asks");
		} else if (argv.includes("--run")){
			const r = await u.run(path.resolve(val("--run")), { parallel: +(val("--parallel") ?? 4), limit: +(val("--limit") ?? Infinity) });
			console.log(r.length + " batches run, $" + r.reduce((n, x) => n + x.usd, 0).toFixed(2));
		} else if (argv.includes("--counts3")){
			console.log(u.counts3());
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
