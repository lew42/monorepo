// SessionScopes: backfill the scope lists of the sessions store. Doc: public/framework/ai/sessions/readme.md ("One index.jsonl per scope").
//   node Server/SessionScopes.mjs [--root <sessions dir>] [--apply]
// A day with a non-empty YYYY/MM/DD/index.jsonl is listed in YYYY/MM/index.jsonl as {"day":"YYYY/MM/DD"}, its month in YYYY/index.jsonl as {"month":"YYYY/MM"},
// its year in index.jsonl as {"year":"YYYY"}. Dry run by default: prints every line it would append. Only appends, never rewrites a line; a line already there is skipped.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AIIndexStream from "./AIIndexStream.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const numbered = (dir, n) => { try { return fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory() && new RegExp(`^\\d{${n}}$`).test(e.name)).map(e => e.name).sort(); } catch { return []; } };
const filled = file => { try { return fs.statSync(file).size > 0; } catch { return false; } };

export default class SessionScopes {
	/** The lines a backfill would append: [{file, key, value}], oldest first, those already in their file left out. */
	static plan(root){
		const out = [], add = (file, key, value) => { if (!AIIndexStream.scope_has(file, key, value)) out.push({ file, key, value }); };
		for (const y of numbered(root, 4)){
			let year_has = false;
			for (const m of numbered(path.join(root, y), 2)){
				let month_has = false;
				for (const d of numbered(path.join(root, y, m), 2)){
					if (!filled(path.join(root, y, m, d, "index.jsonl"))) continue;
					month_has = true; add(path.join(root, y, m, "index.jsonl"), "day", `${y}/${m}/${d}`);
				}
				if (month_has){ year_has = true; add(path.join(root, y, "index.jsonl"), "month", `${y}/${m}`); }
			}
			if (year_has) add(path.join(root, "index.jsonl"), "year", y);
		}
		return out;
	}

	/** Appends the planned lines; returns how many. */
	static apply(plan){
		for (const { file, key, value } of plan) fs.appendFileSync(file, JSON.stringify({ [key]: value }) + "\n");
		return plan.length;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2), at = args.indexOf("--root");
	const root = path.resolve(at >= 0 ? args[at + 1] : path.join(HERE, "..", "public", "framework", "ai", "sessions")), apply = args.includes("--apply");
	const plan = SessionScopes.plan(root);
	for (const { file, key, value } of plan) console.log(`${path.relative(root, file).replaceAll("\\", "/")}\t${JSON.stringify({ [key]: value })}`);
	const by = k => plan.filter(p => p.key === k).length;
	console.log(`${apply ? "APPLY" : "DRY RUN"}: ${plan.length} lines (${by("day")} day, ${by("month")} month, ${by("year")} year)`);
	if (apply) console.log(`wrote ${SessionScopes.apply(plan)} lines`);
}
