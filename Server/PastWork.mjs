#!/usr/bin/env node
// Server/PastWork.mjs — SEARCH PAST WORK before building. The script searches and counts; a model only judges.
// Doc: .claude/skills/past-work/SKILL.md
//   node Server/PastWork.mjs <topic words...> [--limit 12] [--json]   one-screen candidate list for the topic
//   node Server/PastWork.mjs --index                                   write public/framework/ai/past-work-index.md
// Sources: task.jsonl (title, request, outcome, group, landed_at), ai/asks.jsonl, doc/*.md + readme.md, git log --grep.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

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
		const out = [];
		for (const f of this.walk(AI)){
			if (path.basename(f) !== "task.jsonl") continue;
			const r = { dir: rel(path.dirname(f)), slug: path.basename(path.dirname(f)), title: "", request: "", outcome: "", group: "", landed: "", links: [], topics: [] };
			let text; try { text = fs.readFileSync(f, "utf8"); } catch { continue; }
			for (const l of text.split("\n")){
				if (!l.startsWith("{")) continue;
				let o; try { o = JSON.parse(l); } catch { continue; }
				const a = o.assign; if (!a) continue;
				if (a.title) r.title = a.title;
				if (a.request && !r.request) r.request = a.request;
				if (a.outcome) r.outcome = a.outcome;
				if (a.group) r.group = a.group;
				if (a.landed_at) r.landed = a.landed_at;
				if (Array.isArray(a.links)) r.links = a.links;
				if (Array.isArray(a.topics)) r.topics = a.topics;
				if (!r.request && a.brief) r.brief = a.brief;
			}
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

	static search(topic, limit = 12){
		const words = this.words(topic);
		const tasks = this.tasks().map(r => ({ r, s: this.score(words, r.title + " " + r.slug + " " + r.group + " " + r.topics.join(" "), r.request + " " + r.outcome) }))
			.filter(x => x.s).sort((a, b) => b.s - a.s || (b.r.date > a.r.date ? 1 : -1)).slice(0, limit * 2);
		// within similar strength, newest first
		tasks.sort((a, b) => (b.s - a.s > 2 || a.s - b.s > 2) ? b.s - a.s : (b.r.date > a.r.date ? 1 : -1));
		const asks = this.asks().map(a => ({ a, s: this.score(words, a.title || "", a.owner || "") })).filter(x => x.s).sort((a, b) => b.s - a.s).slice(0, 5);
		const docs = this.docs().map(d => ({ d, s: this.score(words, d.title + " " + d.file, d.text) })).filter(x => x.s).sort((a, b) => b.s - a.s).slice(0, 8);
		return { topic, words, tasks: tasks.slice(0, limit).map(x => ({ ...x.r, score: x.s, live: this.live(x.r) })), asks: asks.map(x => x.a), docs: docs.map(x => x.d), commits: this.git(words), modules: this.modules(words) };
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
		if (res.asks.length){ L.push("", "## Owner asks"); for (const a of res.asks) L.push(`- ${(a.at || "").slice(0, 10)} ${clip(a.title, 90)} (${a.owner || "?"}, ${a.status || "?"})`); }
		if (res.commits.length){ L.push("", "## Commits"); for (const c of res.commits) L.push(`- ${clip(c, 120)}`); }
		return L.join("\n");
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2);
	if (argv.includes("--index")) console.log(JSON.stringify(PastWork.index()));
	else {
		const li = argv.indexOf("--limit"), limit = li >= 0 ? +argv.splice(li, 2)[1] : 12;
		const json = argv.includes("--json"), topic = argv.filter(a => a !== "--json").join(" ");
		if (!topic){ console.error("usage: node Server/PastWork.mjs <topic words> | --index"); process.exit(1); }
		const res = PastWork.search(topic, limit);
		console.log(json ? JSON.stringify(res, null, 1) : PastWork.format(res));
	}
}
