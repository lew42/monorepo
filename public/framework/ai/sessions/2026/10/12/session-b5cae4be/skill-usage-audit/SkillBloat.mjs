// SkillBloat: what an agent pays at start (words) and which sentences repeat between CLAUDE.md and skills.
import fs from "node:fs";
import path from "node:path";

export default class SkillBloat {
	constructor(repo = path.resolve("../../../../..")) {
		this.repo = repo;
		this.skills_dir = path.join(repo, ".claude/skills");
	}
	words(t) { return (t.match(/\S+/g) || []).length; }
	read(f) { try { return fs.readFileSync(f, "utf8"); } catch { return ""; } }
	sentences(t) {
		return t.replace(/```[\s\S]*?```/g, " ").split(/(?<=[.!?])\s+|\n+/).map(s => s.replace(/[*_`#>-]/g, "").trim().toLowerCase().replace(/\s+/g, " ")).filter(s => s.split(" ").length >= 9);
	}
	skill_sizes() {
		const out = {};
		for (const s of fs.readdirSync(this.skills_dir)) {
			const f = path.join(this.skills_dir, s, "SKILL.md");
			const t = this.read(f); if (!t) continue;
			const d = /description:\s*(.*)/.exec(t)?.[1] || "";
			out[s] = { words: this.words(t), description_words: this.words(d), tokens_est: Math.round(this.words(t) * 1.4) };
		}
		return out;
	}
	jaccard(a, b) { const A = new Set(a.split(" ")), B = new Set(b.split(" ")); let i = 0; for (const w of A) if (B.has(w)) i++; return i / (A.size + B.size - i); }
	duplicates() {
		const claude = this.sentences(this.read(path.join(this.repo, "CLAUDE.md")));
		const hits = [];
		for (const s of fs.readdirSync(this.skills_dir)) {
			const sents = this.sentences(this.read(path.join(this.skills_dir, s, "SKILL.md")));
			for (const x of sents) for (const c of claude) if (this.jaccard(x, c) >= 0.5) { hits.push({ skill: s, skill_sentence: x.slice(0, 140), claude_sentence: c.slice(0, 140) }); break; }
		}
		return hits;
	}
	retired(terms = ["council", "ai2/", "mastermind-servex", "AI 2", "Pager", "persona", "ai/v/3", "classdoc"]) {
		const out = {};
		const files = [path.join(this.repo, "CLAUDE.md"), ...fs.readdirSync(this.skills_dir).map(s => path.join(this.skills_dir, s, "SKILL.md"))];
		for (const f of files) { const t = this.read(f); for (const term of terms) { const n = t.split(term).length - 1; if (n) (out[term] ||= {})[path.basename(path.dirname(f)) || "CLAUDE.md"] = n; } }
		return out;
	}
	report() {
		const sizes = this.skill_sizes();
		const claude_words = this.words(this.read(path.join(this.repo, "CLAUDE.md")));
		const descr = Object.values(sizes).reduce((n, s) => n + s.description_words, 0);
		const chain = ["readme.md", "public/framework/readme.md", "public/framework/ai/readme.md"].map(f => this.words(this.read(path.join(this.repo, f))));
		const total_skill_words = Object.values(sizes).reduce((n, s) => n + s.words, 0);
		return { claude_md_words: claude_words, claude_md_tokens_est: Math.round(claude_words * 1.4), skill_descriptions_words_every_session: descr, readme_chain_words: chain, skills_count: Object.keys(sizes).length, total_skill_words, skills: sizes, duplicates: this.duplicates(), retired_mentions: this.retired() };
	}
}
if (process.argv[1]?.endsWith("SkillBloat.mjs")) {
	const r = new SkillBloat().report();
	fs.writeFileSync("data/bloat.json", JSON.stringify(r, null, 1));
	const { skills, duplicates, ...s } = r; console.log(JSON.stringify(s, null, 1)); console.log("duplicates:", duplicates.length);
	console.log(Object.entries(skills).sort((a, b) => b[1].words - a[1].words).slice(0, 8).map(([k, v]) => k + " " + v.words).join(", "));
	console.log(duplicates.slice(0, 6).map(d => d.skill + ": " + d.skill_sentence).join("\n"));
}
