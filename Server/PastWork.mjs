#!/usr/bin/env node
// Server/PastWork.mjs — SEARCH PAST WORK before building. The script searches and counts; a model only judges.
// Doc: .claude/skills/past-work/SKILL.md
//   node Server/PastWork.mjs <topic words...> [--limit 12] [--json]   one-screen candidate list for the topic
//   node Server/PastWork.mjs --index                                   write public/framework/ai/past-work-index.md
//   node Server/PastWork.mjs --brief "<question>" [--dir <path>]       print the Haiku searcher's brief: the question, the readme chain with its size, the answer shape
//   node Server/PastWork.mjs --task <task dir>                          search on the dir's requirements.md title and write <dir>/past-work.md (computed, so every brief starts from it)
// Sources: task.jsonl (title, request, outcome, group, landed_at), ai/asks.jsonl, doc/*.md + readme.md, git log --grep.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import SessionIndex from "./SessionIndex.mjs";
import SessionRecord from "./SessionRecord.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const FW = path.join(REPO, "public", "framework"), AI = path.join(FW, "ai");
const slash = p => p.split(path.sep).join("/");
const rel = p => slash(path.relative(REPO, p));
const STOP = new Set("the a an of for to and in on with is are be as at by it its this that from new add make use how what why page pages".split(" "));
const clip = (s, n) => { s = String(s || "").replace(/\*\*|`|- \[[ x]\] /g, "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

export default class PastWork {
	/** Search words of a topic: lowercase, no stop words, a crude stem so "templates" finds "template". */
	static words(topic){
		return [...new Set(String(topic).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w)).map(w => w.replace(/colour/, "color").replace(/(ing|es|s)$/, "")))];
	}

	static *walk(dir, skip = () => false){
		let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of ents){
			if (e.name === "node_modules" || e.name === ".git") continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()){ if (!skip(p, e.name)) yield* this.walk(p, skip); }
			else yield p;
		}
	}

	/** Every task.jsonl under ai/, reduced to one record. */
	static tasks(){
		const out = [], seen = this.cache ??= new Map();   // path -> { key: "mtime:size", x } | { x: null }: a long-lived Servex re-reads only what changed (3 s cold, ~0.3 s warm)
		for (const f of this.walk(AI)){
			let c = seen.get(f);
			if (c?.x === null) continue;
			if (!c && !SessionRecord.is_log_entry(path.dirname(f), path.basename(f))){ seen.set(f, { x: null }); continue; }
			let st; try { st = fs.statSync(f); } catch { continue; }
			const key = st.mtimeMs + ":" + st.size;
			if (c?.key !== key){
				let text; try { text = fs.readFileSync(f, "utf8"); } catch { continue; }
				c = { key, x: SessionIndex.reduce(rel(path.dirname(f)), text) };   // the one task.jsonl reader: Server/SessionIndex.mjs
				seen.set(f, c);
			}
			const x = c.x;
			const r = { dir: x.dir, slug: x.slug, title: x.title, request: x.request, outcome: x.outcome, group: x.group, landed: x.assign_landed, links: x.links, topics: x.topics };
			if (!r.request && x.brief) r.brief = x.brief;
			const m = r.dir.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
			r.date = (r.landed || "").slice(0, 10) || (m ? `${m[1]}-${m[2]}-${m[3]}` : "");
			r.url = "/" + r.dir.replace(/^public\//, "") + "/";
			out.push(r);
		}
		return out;
	}

	static asks(){
		try { return fs.readFileSync(path.join(AI, "asks.jsonl"), "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l).ask; } catch {} }).filter(Boolean); }
		catch { return []; }
	}

	/** doc/*.md and readme.md files anywhere under framework/ (not task dirs); title = first heading. */
	static docs(){
		const dated = (p, n) => /^\d{4}-\d{2}-\d{2}$/.test(n) || n === "sessions" || n === "archive";
		const out = [];
		for (const f of this.walk(FW, dated)){
			const b = path.basename(f), inDoc = path.basename(path.dirname(f)) === "doc";
			if (!(b === "readme.md" || (inDoc && b.endsWith(".md")))) continue;
			let head = ""; try { head = fs.readFileSync(f, "utf8").slice(0, 1500); } catch { continue; }
			const h = (head.match(/^#\s+(.+)$/m) || [])[1] || b;
			const body = head.replace(/^---[\s\S]*?---/, "").replace(/^#.*$/m, "").replace(/\s+/g, " ").trim();
			out.push({ file: rel(f), title: h, text: body.slice(0, 400), url: "/" + rel(f).replace(/^public\//, "") });
		}
		return out;
	}

	/** Modules (core/ext/ui/ux/<Name>) whose name matches a word, with how many files mention them: "stable and used everywhere", counted. */
	static modules(words){
		const found = [];
		for (const tier of ["core", "ext", "ui", "ux"]){
			let ents = []; try { ents = fs.readdirSync(path.join(FW, tier), { withFileTypes: true }); } catch {}
			for (const e of ents) if (e.isDirectory() && words.some(w => e.name.toLowerCase().includes(w))) found.push({ name: e.name, dir: tier + "/" + e.name, readme: fs.existsSync(path.join(FW, tier, e.name, "readme.md")) });
		}
		if (!found.length) return found;
		const skip = (p, n) => /^\d{4}-\d{2}-\d{2}$/.test(n) || n === "sessions" || n === "archive" || n === "old";
		const files = [...this.walk(path.join(REPO, "public"), skip)].filter(f => f.endsWith(".js"));
		const texts = files.map(f => { try { return [f, fs.readFileSync(f, "utf8")]; } catch { return [f, ""]; } });
		for (const m of found){
			const own = "/framework/" + m.dir + "/", needle = "/" + m.dir + "/", needle2 = "/" + m.name + ".js";
			m.users = texts.filter(([f, t]) => !slash(f).includes(own) && (t.includes(needle) || t.includes(needle2))).length;
			m.url = "/framework/" + m.dir + "/";
		}
		return found.slice(0, 6);
	}

	static git(words, limit = 8){
		const args = ["log", "--oneline", "-i", "--all-match", "-n", String(limit)];
		for (const w of words.slice(0, 3)) args.push("--grep", w);
		try { return execFileSync("git", args, { cwd: REPO, encoding: "utf8", timeout: 20000, windowsHide: true }).split("\n").filter(Boolean); } catch { return []; }
	}

	static score(words, title, text){
		const t = title.toLowerCase(), x = text.toLowerCase(); let s = 0, hit = 0;
		for (const w of words){ const a = t.includes(w), b = x.includes(w); if (a) s += 3; if (b) s += 1; if (a || b) hit++; }
		return hit ? s + (hit === words.length ? 4 : 0) : 0;
	}

	/** Paths (public/...) named in the text or links that still exist vs not: the "is it live" evidence, computed. */
	static live(r){
		const named = new Set();
		for (const m of (r.outcome + " " + r.links.map(l => l.url || "").join(" ")).matchAll(/(?:public\/)?(?:framework|web)\/[\w./-]+/g)) { const n = m[0].replace(/[.,;:)]+$/, ""); if (!/ai\/(20\d\d|sessions)/.test(n) && !/\.(png|md|jsonl?)$/.test(n)) named.add(n); }
		let ok = 0, gone = [];
		for (const n of [...named].slice(0, 12)){
			const cand = [path.join(REPO, n), path.join(REPO, "public", n)];
			if (cand.some(c => fs.existsSync(c))) ok++; else gone.push(n);
		}
		return { checked: ok + gone.length, exist: ok, missing: gone.slice(0, 3) };
	}

	/** Sessions whose saved tags (session.jsonl, mirrored into each day's index.json) contain a search word, best first; the tags are filled by the digest pipeline (ai/AISession/AISessionDigest.mjs). */
	static sessions(words, limit = 6){
		const root = path.join(AI, "sessions"), out = [];
		const dirs = n => { try { return fs.readdirSync(n, { withFileTypes: true }).filter(e => e.isDirectory() && /^\d+$/.test(e.name)).map(e => path.join(n, e.name)); } catch { return []; } };
		for (const y of dirs(root)) for (const m of dirs(y)) for (const d of dirs(m)){
			let snaps; try { snaps = JSON.parse(fs.readFileSync(path.join(d, "index.json"), "utf8")).snapshots; } catch { continue; }
			const day = slash(path.relative(root, d));
			for (const sn of Array.isArray(snaps) ? snaps : Object.values(snaps ?? {})){
				const tags = (sn.tags ?? []).join(" ").toLowerCase(), hit = words.filter(w => tags.includes(w)).length;
				if (hit) out.push({ id: sn.id, day, title: sn.title || sn.agent || sn.folder, tags: sn.tags.slice(0, 6), usd: sn.usd ?? 0, hit, url: "/framework/ai/sessions/" + day + "/" + (sn.folder ?? sn.id) + "/" });
			}
		}
		return out.sort((a, b) => b.hit - a.hit || (b.day > a.day ? 1 : -1)).slice(0, limit);
	}

	/** The brief for a throwaway Haiku searcher: the question, the readme chain (root to the directory) with its measured size, the answer shape. A script lists the files so nobody retypes them. */
	static brief(question, dir = "public/framework"){
		const chain = ["CLAUDE.md", "readme.md"];
		let cur = "";
		for (const part of slash(dir).split("/").filter(Boolean)){ cur += part + "/"; chain.push(cur + "readme.md"); }
		const files = [...new Set([...chain, "public/framework/ai/readme.md", "public/framework/ai/past-work-index.md"])].filter(f => fs.existsSync(path.join(REPO, f)));
		const bytes = files.reduce((n, f) => n + fs.statSync(path.join(REPO, f)).size, 0), tokens = Math.round(bytes / 3);
		return [`Brief for a throwaway Haiku searcher (about ${tokens.toLocaleString()} tokens of reading${tokens > 60000 ? ", TOO BIG: narrow --dir" : ", under the 100k limit"}).`, "",
			`Question: ${question}`, "",
			"Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):", ...files.map(f => "- " + f), "",
			`Also run: node Server/PastWork.mjs ${JSON.stringify(question)}`, "",
			"Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:",
			"- EXISTS at <path or url> (what it does, in one line; who uses it)",
			"- PARTLY at <path or url> (what is there, what is missing)",
			"- NEW (nothing found; the readmes you read, so the next searcher skips them)"].join("\n");
	}

	static search(topic, limit = 12){
		const words = this.words(topic);
		const tasks = this.tasks().map(r => ({ r, s: this.score(words, r.title + " " + r.slug + " " + r.group + " " + r.topics.join(" "), r.request + " " + r.outcome) }))
			.filter(x => x.s).sort((a, b) => b.s - a.s || (b.r.date > a.r.date ? 1 : -1)).slice(0, limit * 2);
		// within similar strength, newest first
		tasks.sort((a, b) => (b.s - a.s > 2 || a.s - b.s > 2) ? b.s - a.s : (b.r.date > a.r.date ? 1 : -1));
		const asks = this.asks().map(a => ({ a, s: this.score(words, a.title || "", a.owner || "") })).filter(x => x.s).sort((a, b) => b.s - a.s).slice(0, 5);
		const docs = this.docs().map(d => ({ d, s: this.score(words, d.title + " " + d.file, d.text) })).filter(x => x.s).sort((a, b) => b.s - a.s).slice(0, 8);
		return { topic, words, tasks: tasks.slice(0, limit).map(x => ({ ...x.r, score: x.s, live: this.live(x.r) })), asks: asks.map(x => x.a), docs: docs.map(x => x.d), commits: this.git(words), modules: this.modules(words), sessions: this.sessions(words) };
	}

	static format(res){
		const L = [`# Past work: "${res.topic}" (words: ${res.words.join(", ")})`, "", `## Tasks (${res.tasks.length}, best first)`];
		for (const t of res.tasks){
			const lv = t.live.checked ? ` · paths ${t.live.exist}/${t.live.checked} exist${t.live.missing.length ? ", gone: " + t.live.missing.join(" ") : ""}` : "";
			L.push(`- ${t.date || "?"} [${clip(t.title || t.slug, 70)}](${t.url}) — ${clip(t.outcome || t.request || t.brief || "(no outcome logged)", 260)}${lv}`);
		}
		if (res.modules.length){ L.push("", "## Modules that exist now (files outside the module that import it)"); for (const m of res.modules) L.push(`- [${m.dir}](${m.url}) — used by ${m.users} files${m.readme ? "" : ", no readme"}`); }
		L.push("", "## Docs and readmes");
		for (const d of res.docs) L.push(`- [${clip(d.title, 60)}](${d.url}) — ${clip(d.text, 140)}`);
		if (res.sessions?.length){ L.push("", "## Sessions tagged with these words"); for (const x of res.sessions) L.push(`- ${x.day} [${clip(x.title, 50)}](${x.url}) — ${x.tags.join(" ")} · $${x.usd.toFixed(2)}`); }
		if (res.asks.length){ L.push("", "## Owner asks"); for (const a of res.asks) L.push(`- ${(a.at || "").slice(0, 10)} ${clip(a.title, 90)} (${a.owner || "?"}, ${a.status || "?"})`); }
		if (res.commits.length){ L.push("", "## Commits"); for (const c of res.commits) L.push(`- ${clip(c, 120)}`); }
		return L.join("\n");
	}

	/** Write <dir>/past-work.md from a title: `opts.title`, else the first heading of `opts.brief` (a file) or of <dir>/requirements.md, else the dir name. `opts.skip_unnamed` returns null instead of the dir-name fallback. Spawn calls this: Servex/agents/Agents.js. */
	static task(dir, opts = {}){
		const t0 = Date.now(), abs = path.resolve(REPO, dir), out = path.join(abs, "past-work.md");
		let title = opts.title;
		if (!title) for (const f of [opts.brief && path.resolve(REPO, opts.brief), path.join(abs, "requirements.md")]){
			try { if (f && fs.statSync(f).isFile()){ title = (fs.readFileSync(f, "utf8").match(/^#\s+(.+)$/m) || [])[1]; if (title) break; } } catch {}
		}
		if (!title){ if (opts.skip_unnamed) return null; title = path.basename(abs); }
		const res = this.search(title.replace(/[^\w ]+/g, " "), 8);
		const note = "<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->";
		const none = res.tasks.length || res.modules.length || res.docs.length ? [] : ["**Nothing found: no past work matches this title.**", ""];
		fs.mkdirSync(abs, { recursive: true });
		fs.writeFileSync(out, [note, ...none, this.format(res), "", "## If the title is not the thing's name", "", "```", this.brief(title), "```", ""].join("\n"));
		return { file: rel(out), title, tasks: res.tasks.length, modules: res.modules.length, sessions: (res.sessions || []).length, ms: Date.now() - t0 };
	}

	/** Topic tag: the effort (group), else the "module:" prefix of the title, else the first word of the slug. */
	static tag(t){
		if (t.group) return t.group;
		const m = String(t.title).match(/^([\w/. -]{2,28}):/);
		return m ? m[1].trim() : (t.slug.split("-")[0] || "loose");
	}

	/** The topic index: landed tasks grouped by `group` (the effort), newest first, one line each. */
	static index(){
		const by = new Map();
		for (const t of this.tasks()){
			if (!t.outcome) continue;
			const g = this.tag(t);
			if (!by.has(g)) by.set(g, []);
			by.get(g).push(t);
		}
		const groups = [...by].sort((a, b) => b[1].length - a[1].length);
		const L = ["# Past-work index — what was built, by topic", "",
			"Generated by `node Server/PastWork.mjs --index` from the `outcome` line of every landed task (never edit by hand). Looking for something specific? Run `node Server/PastWork.mjs <topic>`, or the [`past-work` skill](/.claude/skills/past-work/SKILL.md), before you build.", "",
			`${groups.length} topics, ${groups.reduce((n, g) => n + g[1].length, 0)} landed tasks.`, ""];
		for (const [g, ts] of groups){
			ts.sort((a, b) => (b.date > a.date ? 1 : -1));
			L.push(`## ${g} (${ts.length})`, "");
			for (const t of ts.slice(0, 3)) L.push(`- ${t.date || "?"} [${clip(t.title || t.slug, 60)}](${t.url}) — ${clip(t.outcome, 100)}`);
			if (ts.length > 3) L.push(`- …${ts.length - 3} older`);
			L.push("");
		}
		const f = path.join(AI, "past-work-index.md");
		fs.writeFileSync(f, L.join("\n"));
		return { file: rel(f), topics: groups.length, bytes: L.join("\n").length };
	}

	static SYSTEMS = { dictation: /dictat|whisper|transcri|microphone|\bmic\b/i, voice: /\bvoice\b|speech|recite/i, chat: /\bchat\b|drawer|composer/i, session: /\bsession/i };

	/** Landed tasks since a date in the dictation, voice, chat and session systems: title, module, last commit touching the task dir, doc link. Written to ai/doc/built-index.md. */
	static built(since = "2026-10-20"){
		const last = new Map();   // task dir -> newest commit that touched it (one git pass)
		const log = execFileSync("git", ["log", `--since=${since}`, "--name-only", "--format=@@%h", "--", "public/framework/ai/"], { cwd: REPO, maxBuffer: 1 << 28, encoding: "utf8", windowsHide: true });
		let h = "";
		for (const line of log.split("\n")){
			if (line.startsWith("@@")){ h = line.slice(2); continue; }
			const m = line.match(/^(.*)\/(task|session)\.jsonl$/);
			if (m && !last.has(m[1])) last.set(m[1], h);
		}
		const rows = [], seen = new Set();
		for (const t of this.tasks()){
			if (!t.outcome || (t.date || "") < since || seen.has(t.dir)) continue;
			seen.add(t.dir);
			const hay = `${t.title} ${t.dir} ${t.request || ""} ${(t.topics || []).join(" ")}`;
			const sys = Object.keys(this.SYSTEMS).filter(k => this.SYSTEMS[k].test(hay));
			if (!sys.length) continue;
			const doc = (t.links || []).map(l => typeof l === "string" ? l : l?.url || l?.href).find(l => /\.md$/.test(l || "")) || "";
			rows.push({ date: t.date, sys, title: clip(t.title || t.slug, 70), module: this.tag(t), commit: last.get(t.dir) || "", url: t.url, doc });
		}
		rows.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
		const L = ["# Built index — dictation, voice, chat and session work since " + since, "",
			"Generated by `node Server/PastWork.mjs --built [since]` from the landed task logs and `git log` (never edit by hand). Commit = the newest commit that touched the task's log, a pointer not a proof of merge. A task is listed under every system whose words appear in its title, dir, request or topics, so a row can repeat. Search by topic: `node Server/PastWork.mjs <words>`; the topic index: [past-work-index.md](/framework/ai/past-work-index.md).", "",
			`${rows.length} landed tasks.`, ""];
		for (const s of Object.keys(this.SYSTEMS)){
			const rs = rows.filter(r => r.sys.includes(s));
			L.push(`## ${s} (${rs.length})`, "", "| Date | Task | Module | Commit | Doc |", "|---|---|---|---|---|");
			for (const r of rs) L.push(`| ${r.date} | [${r.title.replace(/\|/g, "/")}](${r.url}) | ${r.module} | ${r.commit ? "`" + r.commit + "`" : ""} | ${r.doc ? `[doc](${r.doc})` : ""} |`);
			L.push("");
		}
		const f = path.join(AI, "doc", "built-index.md");
		fs.writeFileSync(f, L.join("\n"));
		return { file: rel(f), rows: rows.length };
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2);
	if (argv.includes("--built")) console.log(JSON.stringify(PastWork.built(argv[argv.indexOf("--built") + 1] || undefined)));
	else if (argv.includes("--index")) console.log(JSON.stringify(PastWork.index()));
	else if (argv.includes("--task")){
			const r = PastWork.task(argv[argv.indexOf("--task") + 1]);
			console.log(r.file, r.tasks + " tasks,", r.modules + " modules,", r.sessions + " sessions,", r.ms + " ms");
	}
	else if (argv.includes("--brief")){ const i = argv.indexOf("--brief"), di = argv.indexOf("--dir"); console.log(PastWork.brief(argv[i + 1], di >= 0 ? argv[di + 1] : undefined)); }
	else {
		const li = argv.indexOf("--limit"), limit = li >= 0 ? +argv.splice(li, 2)[1] : 12;
		const json = argv.includes("--json"), topic = argv.filter(a => a !== "--json").join(" ");
		if (!topic){ console.error("usage: node Server/PastWork.mjs <topic words> | --index"); process.exit(1); }
		const res = PastWork.search(topic, limit);
		console.log(json ? JSON.stringify(res, null, 1) : PastWork.format(res));
	}
}
