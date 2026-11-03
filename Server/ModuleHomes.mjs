#!/usr/bin/env node
// Server/ModuleHomes.mjs — read-only census: every module dir under public/framework/{ext,ui,ux,ai,core} and public/web,
// with its readme's one line, its size, how many files elsewhere import or mention it, and whether its readme says its scope.
// The AI judgment (strictly AI / uses AI / not AI) is NOT computed here: it is read from a judgments file a mastermind wrote
// (--judgments <file.json>, {"ai/AITask": {"ai": "strict", "why": "..."}}), so code keeps the record and AI only judges.
// Rule and decisions: public/framework/ai/readme.md (top) and the task that built this,
// public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/.
//
//   node Server/ModuleHomes.mjs [--judgments <file>] [--out <dir>] [--repo <path>]
//   writes <out>/module-homes.json (every row) and <out>/module-homes.md (the table); prints the counts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

class ModuleHomes {
	static TIERS = ["public/framework/ext", "public/framework/ui", "public/framework/ux", "public/framework/ai", "public/framework/core", "public/web"];
	static SCAN = ["public", "Server", "Servex", ".claude"];
	static EXT = /\.(m?js|md|html|css|json)$/;
	static SKIP = /(^|\/)(node_modules|\.git|screenshots|recordings|shots)(\/|$)/;
	static RECORD = /^(\d{4}(-\d{2}-\d{2})?|archive|audits|errors|health|log|recordings|screenshots|asks)$/;
	static SCOPE = /\b(scope|what goes here|belongs (here|next door|in)|not here|goes next door|what lives here)\b/i;

	constructor(repo){
		this.repo = repo;
		this.judgments = {};
	}

	rel(p){ return path.relative(this.repo, p).split(path.sep).join("/"); }

	// Every text file the census greps for mentions, read once.
	corpus(){
		const files = [];
		const walk = dir => {
			let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of list){
				const p = path.join(dir, e.name), r = this.rel(p);
				if (ModuleHomes.SKIP.test(r)) continue;
				if (e.isDirectory()) walk(p);
				else if (ModuleHomes.EXT.test(e.name) && !/files\.jsonl|\.jsonl$/.test(e.name)){
					try { const st = fs.statSync(p); if (st.size < 2_000_000) files.push({ r, text: fs.readFileSync(p, "utf8") }); } catch {}
				}
			}
		};
		for (const s of ModuleHomes.SCAN) walk(path.join(this.repo, s));
		return files;
	}

	size(dir){
		let bytes = 0, files = 0;
		const walk = d => {
			for (const e of fs.readdirSync(d, { withFileTypes: true })){
				const p = path.join(d, e.name);
				if (e.isDirectory()) walk(p); else { files++; try { bytes += fs.statSync(p).size; } catch {} }
			}
		};
		walk(dir);
		return { bytes, files };
	}

	readme(dir){
		const f = path.join(dir, "readme.md");
		if (!fs.existsSync(f)) return { line: "", scope: false, has: false };
		const text = fs.readFileSync(f, "utf8");
		const head = (text.split("\n").find(l => l.trim()) || "").replace(/^#+\s*/, "").trim();
		return { line: head.slice(0, 140), scope: ModuleHomes.SCOPE.test(text.split("\n").slice(0, 25).join("\n")), has: true };
	}

	// A dir is a module when it carries code or a page; a record dir (dates, logs, screenshots) is listed as such.
	kind(dir, name){
		if (ModuleHomes.RECORD.test(name)) return "records";
		const top = fs.readdirSync(dir);
		if (top.some(f => /\.m?js$/.test(f))) return "module";
		if (top.includes("readme.md")) return "docs";
		return "data";
	}

	rows(){
		const corpus = this.corpus();
		const rows = [];
		for (const t of ModuleHomes.TIERS){
			const abs = path.join(this.repo, t);
			if (!fs.existsSync(abs)) continue;
			for (const e of fs.readdirSync(abs, { withFileTypes: true })){
				if (!e.isDirectory()) continue;
				const dir = path.join(abs, e.name), id = `${t.replace("public/framework/", "").replace("public/", "")}/${e.name}`;
				const key = `${t}/${e.name}/`, url = key.replace(/^public/, ""), short = `${id}/`;
				const importers = new Set(), mentions = new Set();
				for (const f of corpus){
					if (f.r.startsWith(key)) continue;
					const imp = f.text.includes(`${url}`) || new RegExp(`["'\`][./]*${short.replace(/[/]/g, "\\/")}`).test(f.text);
					if (!imp && !f.text.includes(short)) continue;
					mentions.add(f.r);
					if (/\.m?js$/.test(f.r) && new RegExp(`(import|from)\\s*\\(?\\s*["'\`][^"'\`]*${short.replace(/[/]/g, "\\/")}`).test(f.text)) importers.add(f.r);
				}
				const j = this.judgments[id] || {};
				rows.push({ id, kind: this.kind(dir, e.name), ...this.readme(dir), ...this.size(dir),
					importers: importers.size, mentions: mentions.size, importer_files: [...importers].sort(),
					ai: j.ai || "", why: j.why || "", decision: j.decision || "" });
			}
		}
		return rows;
	}

	static kb(b){ return b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`; }

	table(rows){
		const mods = rows.filter(r => r.kind === "module" || r.kind === "docs");
		const head = "| module | AI? | importers | mentions | size | scope line | readme says |\n|---|---|---|---|---|---|---|";
		const line = r => `| \`${r.id}\` | ${r.ai || "?"} | ${r.importers} | ${r.mentions} | ${ModuleHomes.kb(r.bytes)} | ${r.scope ? "yes" : "no"} | ${r.line.replace(/\|/g, "/")} |`;
		const ai = mods.filter(r => r.ai === "strict" || r.ai === "uses");
		return `# Module homes — census (computed by \`Server/ModuleHomes.mjs\`)\n\n` +
			`${mods.length} modules, ${rows.length - mods.length} record/data dirs. ` +
			`Strictly AI: ${mods.filter(r => r.ai === "strict").length} · uses AI: ${mods.filter(r => r.ai === "uses").length} · not AI: ${mods.filter(r => r.ai === "no").length} · not a candidate (not in judgments.json, so not AI): ${mods.filter(r => !r.ai).length}.\n\n` +
			`## The AI candidates\n\n${head}\n${ai.map(line).join("\n")}\n\n## Every module\n\n${head}\n${mods.map(line).join("\n")}\n`;
	}

	static main(argv){
		const val = n => argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined;
		const repo = path.resolve(val("--repo") || path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
		const census = new ModuleHomes(repo);
		if (val("--judgments")) census.judgments = JSON.parse(fs.readFileSync(val("--judgments"), "utf8"));
		const rows = census.rows();
		const out = val("--out");
		if (out){
			fs.mkdirSync(out, { recursive: true });
			fs.writeFileSync(path.join(out, "module-homes.json"), JSON.stringify(rows, null, "\t") + "\n");
			fs.writeFileSync(path.join(out, "module-homes.md"), census.table(rows));
		}
		const mods = rows.filter(r => r.kind === "module" || r.kind === "docs");
		console.log(`${mods.length} modules, ${rows.length - mods.length} record/data dirs; scope line in ${mods.filter(r => r.scope).length}; no readme ${mods.filter(r => !r.has).length}`);
		for (const r of mods.filter(r => r.ai)) console.log(`${r.ai.padEnd(6)} ${r.id.padEnd(22)} importers ${String(r.importers).padStart(3)} mentions ${String(r.mentions).padStart(4)} ${ModuleHomes.kb(r.bytes)}`);
		return rows;
	}
}

export default ModuleHomes;
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) ModuleHomes.main(process.argv.slice(2));
