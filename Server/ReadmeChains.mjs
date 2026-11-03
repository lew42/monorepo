// node Server/ReadmeChains.mjs — the size of the readme chain (tokens ≈ chars/4) for every folder that has a readme,
// from the same readme_chain() an agent is given. Writes public/framework/ai/readmes/chains.json (read by the Readmes page).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readme_chain, REPO } from "../Servex/agents/readme-chain.js";

const here = path.dirname(fileURLToPath(import.meta.url));

export default class ReadmeChains {
	static OUT = path.join(REPO, "public/framework/ai/readmes/chains.json");
	static SKIP = /node_modules|\.git$|\.claude[\\/]worktrees|[\\/]Temp|[\\/]sessions[\\/]\d{4}([\\/]|$)/;
	static tokens(text){ return Math.round(text.length / 4); }

	/** One row per folder with a readme: {dir, levels, tokens, own, chain:[{path, tokens}]}, biggest chain first. */
	/** Every readme under `root` (absolute paths, sorted): the one walk the Readmes page and ReadmeAudit share, so their lists agree. */
	static readmes(root = REPO){
		const out = [];
		const walk = (d, depth) => {
			if (this.SKIP.test(d) || depth > 8) return;
			let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
			const r = ents.find(e => e.isFile() && /^readme\.md$/i.test(e.name));
			if (r) out.push(path.join(d, r.name));
			for (const e of ents) if (e.isDirectory() && !e.name.startsWith(".")) walk(path.join(d, e.name), depth + 1);
		};
		walk(root, 0);
		return out.sort();
	}

	static rows(){
		const rows = this.readmes().map(f => path.dirname(f)).map(d => {
			const chain = readme_chain(d).map(r => ({ path: r.path, tokens: this.tokens(r.text) }));
			return {
				dir: path.relative(REPO, d).split(path.sep).join("/") || ".",
				levels: chain.length,
				tokens: chain.reduce((n, r) => n + r.tokens, 0),
				own: chain.at(-1)?.tokens ?? 0,
				chain,
			};
		});
		return rows.sort((a, b) => b.tokens - a.tokens || a.dir.localeCompare(b.dir));
	}

	static write(){
		const rows = this.rows();
		fs.mkdirSync(path.dirname(this.OUT), { recursive: true });
		fs.writeFileSync(this.OUT, JSON.stringify(rows));
		return rows;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const rows = ReadmeChains.write();
	const t = rows.map(r => r.tokens).sort((a, b) => a - b);
	console.log(`folders ${rows.length}  median ${t[Math.floor(.5 * (t.length - 1))]}  max ${t.at(-1)}  over 12000: ${rows.filter(r => r.tokens > 12000).length}`);
	for (const d of ["Servex", "public/framework/core/Page"]) console.log(" ", rows.find(r => r.dir === d)?.tokens, d);
}
