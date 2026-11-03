// ClaudeMd — the sentence ledger for the 2026-10-12 CLAUDE.md consolidation.
// It splits the OLD CLAUDE.md (a git revision) into sentences with ids, decides what happened
// to each one by READING the new file (never by memory), writes the destinations, and proves
// that no sentence was dropped. Run through run.mjs: manifest | apply | check | report.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../..");

export default class ClaudeMd {
	static BASE = "87afbdd55"; // the commit whose CLAUDE.md is "old"
	static ARCHIVE = "public/framework/ai/doc/claude-md-archive.md";
	static HERE = HERE;
	static ROOT = ROOT;

	// Where a reworded or cut sentence goes when it has a better home than the archive.
	// First matching pattern wins. Everything unmatched and not kept goes to the archive.
	static MOVES = [
		[/Markdown renders at/, "public/framework/core/Page/doc/markdown.md"],
		[/Idea to evaluate/, "public/framework/ext/Mention/doc/ideas.md"],
		[/Haiku 5\.5 task costs about 1\/20th/, "Servex/doc/budget.md"],
		[/Claude Haiku 5\.5 is by far the cheapest/, "Servex/doc/budget.md"],
		[/Streams \(the chat log/, "Server/doc/watch.md"],
		[/searching or indexing agent reads one readme/, "public/framework/ai/doc/readmes.md"],
		[/A session worth tracking gets a short readme/, "public/framework/ai/doc/readmes.md"],
		[/Sub-readmes load on demand/, "public/framework/ai/doc/readmes.md"],
		[/So readmes are read on demand/, "public/framework/ai/doc/readmes.md"],
		[/Keep the `readme\.md` minimal/, "public/framework/ai/doc/readmes.md"],
		[/An index page is a wall of previews/, "public/framework/ai/doc/writing.md"],
		[/Demonstration and report pages are held/, "public/framework/ai/doc/writing.md"],
		[/Give me something I can chew/, "public/framework/ai/doc/writing.md"],
		[/Under it, only as many items as it takes/, "public/framework/ai/doc/writing.md"],
		[/Each item sits beneath the right parent/, "public/framework/ai/doc/writing.md"],
		[/A familiar concept needs no explanation/, "public/framework/ai/doc/writing.md"],
		[/Put what everyone must see at the top/, "public/framework/ai/doc/writing.md"],
		[/Document a thing as its class/, "public/framework/ai/doc/classes.md"],
		[/A reader should see the structure, not paragraphs/, "public/framework/ai/doc/classes.md"],
		[/When extending `Page`, mind its large API/, "public/framework/ai/doc/classes.md"],
		[/A reader should see how the pieces fit/, "public/framework/ai/doc/classes.md"],
		[/A default renderer that walks/, "public/framework/ai/doc/classes.md"],
		[/Tags that point at code use the familiar repo path/, "public/framework/ai/doc/classes.md"],
		[/Choose names with care/, "public/framework/ai/doc/classes.md"],
	];

	// Sentences cut because they contradict a later owner rule. They go to the archive and
	// are listed on the review page as "conflicts found".
	static CONFLICTS = [
		[/Superceded docs can be deleted cleanly/, "contradicts 'Never destructive' (2026-10-08) — kept 'Files are what survive' only"],
	];

	constructor({ base = ClaudeMd.BASE } = {}) {
		this.base = base;
		this.old_text = execFileSync("git", ["show", `${base}:CLAUDE.md`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 });
		this.new_text = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
	}

	static norm(s) { return s.replace(/\s+/g, " ").trim(); }
	static words(s) { return (s.match(/\S+/g) || []).length; }

	// text -> [{ id, line, n, kind, text, block_title }]
	static split(text) {
		const rows = [];
		let heading = "";
		text.split("\n").forEach((raw, i) => {
			const line = i + 1;
			if (!raw.trim()) return;
			if (/^#{1,6}\s/.test(raw)) { heading = ClaudeMd.norm(raw).replace(/^#+\s*/, ""); rows.push({ id: `L${line}.1`, line, n: 1, kind: "heading", text: ClaudeMd.norm(raw), title: ClaudeMd.norm(raw).replace(/^#+\s*/, "") }); return; }
			const body = ClaudeMd.norm(raw.replace(/^\s*([-*]|\d+\.)\s+/, ""));
			const parts = body.split(/(?<=[.!?]|[.!?]\*\*)\s+(?=[A-Z"“*`(\[<])/);
			const merged = [];
			for (const p of parts) {
				if (merged.length && /^\((the owner|updated)[^)]*\)\.?$/.test(p)) merged[merged.length - 1] += " " + p;
				else merged.push(p);
			}
			const title = (body.match(/^\*\*([^*]+)\*\*/) || [])[1] || `(${heading})`;
			merged.forEach((p, k) => rows.push({ id: `L${line}.${k + 1}`, line, n: k + 1, kind: "sentence", text: p, title: title.replace(/[.:]$/, "") }));
		});
		return rows;
	}

	// The manifest: one row per old sentence, action decided by reading the new file.
	manifest() {
		const newN = ClaudeMd.norm(this.new_text);
		return ClaudeMd.split(this.old_text).map((r) => {
			if (newN.includes(r.text)) return { ...r, action: "keep", to: "CLAUDE.md" };
			const mv = ClaudeMd.MOVES.find(([re]) => re.test(r.text));
			if (mv) return { ...r, action: "move", to: mv[1] };
			const cf = ClaudeMd.CONFLICTS.find(([re]) => re.test(r.text));
			if (cf) return { ...r, action: "merge", to: ClaudeMd.ARCHIVE, note: cf[1] };
			return { ...r, action: "merge", to: ClaudeMd.ARCHIVE };
		});
	}

	// Sentences in the NEW file that are not verbatim from the old one: the reviewer's worklist.
	reworded() {
		const oldN = ClaudeMd.norm(this.old_text);
		return ClaudeMd.split(this.new_text).filter((r) => !oldN.includes(r.text));
	}

	static group(rows) {
		const m = new Map();
		for (const r of rows) { if (!m.has(r.line)) m.set(r.line, { line: r.line, title: r.title, rows: [] }); m.get(r.line).rows.push(r); }
		return [...m.values()];
	}

	// Append moved sentences to their destinations and write the archive. Idempotent by marker.
	apply(rows) {
		const marker = (line) => `<!-- claude-md:L${line} -->`;
		const todo = new Map();
		for (const r of rows.filter((x) => x.action === "move" || x.action === "merge")) {
			if (!todo.has(r.to)) todo.set(r.to, []);
			todo.get(r.to).push(r);
		}
		const log = [];
		for (const [dest, list] of todo) {
			const abs = path.join(ROOT, dest);
			let cur = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
			const archive = dest === ClaudeMd.ARCHIVE;
			if (!cur) cur = archive ? ClaudeMd.archive_head(this.base) : `# ${path.basename(dest, ".md")}\n\n`;
			if (!archive && !cur.includes("## Moved from CLAUDE.md (2026-10-12)")) {
				cur = cur.replace(/\s*$/, "\n\n") + `## Moved from CLAUDE.md (2026-10-12)\n\nThese sentences were cut from the root \`CLAUDE.md\` because they belong here. The wording is the owner's, unchanged; the id is the sentence's place in \`CLAUDE.md\` at \`${this.base}\`. The map is \`public/framework/ai/sessions/2026/10/12/session-3b391f22/claude-md-consolidate/manifest.md\`.\n\n`;
			}
			for (const g of ClaudeMd.group(list)) {
				if (cur.includes(marker(g.line))) continue;
				const ids = g.rows.map((r) => r.id).join(", ");
				const body = g.rows.map((r) => r.text).join(" ");
				const note = g.rows.find((r) => r.note)?.note;
				cur = cur.replace(/\s*$/, "\n\n") + `${marker(g.line)}\n**${g.title}** — ${ids}${note ? ` — conflict: ${note}` : ""}\n\n${body}\n`;
			}
			fs.mkdirSync(path.dirname(abs), { recursive: true });
			fs.writeFileSync(abs, cur);
			log.push(`${dest}: ${list.length} sentences`);
		}
		return log;
	}

	static archive_head(base) {
		return `# CLAUDE.md archive — original wording

On 2026-10-12 the root \`CLAUDE.md\` was consolidated. Where a rule was **reworded or shortened**, the sentences it no longer contains verbatim are kept here, unchanged, so nothing is lost. Sentences that moved to a topic doc are in that doc, not here; the full map is \`public/framework/ai/sessions/2026/10/12/session-3b391f22/claude-md-consolidate/manifest.md\`. The old file is also in git: \`git show ${base}:CLAUDE.md\`.

Each entry is the old line (\`L<n>\`), its title, and the old sentences that were dropped or folded into a shorter rule.

`;
	}

	// The zero-loss proof. Returns { ok, problems[], counts }.
	check(rows = this.manifest()) {
		const problems = [];
		const old_rows = ClaudeMd.split(this.old_text);
		const ids = new Set(rows.map((r) => r.id));
		if (rows.length !== old_rows.length) problems.push(`manifest has ${rows.length} rows, old file has ${old_rows.length}`);
		for (const r of old_rows) if (!ids.has(r.id)) problems.push(`missing row ${r.id}`);
		if (ids.size !== rows.length) problems.push("duplicate ids in manifest");
		const cache = new Map();
		const read = (rel) => { if (!cache.has(rel)) { const p = path.join(ROOT, rel); cache.set(rel, fs.existsSync(p) ? ClaudeMd.norm(fs.readFileSync(p, "utf8")) : null); } return cache.get(rel); };
		for (const r of rows) {
			const where = r.action === "keep" ? "CLAUDE.md" : r.to;
			const txt = read(where);
			if (txt === null) problems.push(`${r.id}: destination ${where} does not exist`);
			else if (!txt.includes(r.text)) problems.push(`${r.id}: not found in ${where}: ${r.text.slice(0, 70)}`);
		}
		const counts = {};
		for (const r of rows) counts[r.action] = (counts[r.action] || 0) + 1;
		return { ok: problems.length === 0, problems, counts, total: rows.length };
	}

	// Strength words in a text: the owner's strength must not grow while moving.
	static STRONG = /\b(never|always|must|do not|don't|no [a-z]+ without|refuses?)\b/gi;
	strength() {
		const count = (t) => (t.match(ClaudeMd.STRONG) || []).length;
		return { old: count(this.old_text), new: count(this.new_text) };
	}
}
