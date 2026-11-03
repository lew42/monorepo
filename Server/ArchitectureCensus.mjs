#!/usr/bin/env node
// Server/ArchitectureCensus.mjs — read-only census of module docs: who has doc/architecture.md, who is imported most.
//   node Server/ArchitectureCensus.mjs [--json] [--top 12]
//   node Server/ArchitectureCensus.mjs --decisions core/View   the decision lines that mention a module (a writer's input)
// Importers = files outside the module (js/mjs under public/, Server/, Servex/) that name its path or <Name>.js (PastWork.mjs's method).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SessionRecord from "./SessionRecord.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FW = path.join(REPO, "public", "framework");
const slash = p => p.split(path.sep).join("/");
const SKIP = new Set(["node_modules", ".git", "sessions", "archive", "old"]);

export default class ArchitectureCensus {
	static TIERS = ["core", "ext", "ui", "ux", "web", "styles"];

	static *walk(dir){
		let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of ents){
			if (SKIP.has(e.name) || /^\d{4}-\d{2}-\d{2}$/.test(e.name)) continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()) yield* this.walk(p); else yield p;
		}
	}

	/** Module dirs: one per child of each tier that has a readme.md, plus Server and Servex. */
	static modules(){
		const out = [];
		for (const tier of this.TIERS){
			const base = tier === "web" ? path.join(REPO, "public", "web") : path.join(FW, tier);
			let ents = []; try { ents = fs.readdirSync(base, { withFileTypes: true }); } catch {}
			for (const e of ents) if (e.isDirectory() && fs.existsSync(path.join(base, e.name, "readme.md")))
				out.push({ name: e.name, key: `${tier}/${e.name}`, dir: path.join(base, e.name), needle: `/${tier}/${e.name}/` });
		}
		for (const n of ["Server", "Servex"]) out.push({ name: n, key: n, dir: path.join(REPO, n), needle: `/${n}/` });
		return out;
	}

	/** Decision lines in task logs that mention the module path. */
	static decisions(mods){
		const counts = new Map(mods.map(m => [m.key, 0]));
		for (const f of this.walkAll(path.join(FW, "ai"))){
			if (!SessionRecord.is_log_entry(path.dirname(f), path.basename(f))) continue;
			let t; try { t = fs.readFileSync(f, "utf8"); } catch { continue; }
			for (const l of t.split("\n")) if (l.startsWith('{"decision"')) for (const m of mods) if (l.includes(m.key + "/") || l.includes(m.key + "`") || l.includes(m.key + " ")) counts.set(m.key, counts.get(m.key) + 1);
		}
		return counts;
	}

	static *walkAll(dir){
		let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of ents){ const p = path.join(dir, e.name); if (e.isDirectory()) yield* this.walkAll(p); else yield p; }
	}

	/** The decision lines that mention a module, one per line with the task they came from: the writer's input, so it reads a page, not a log. */
	static extract(key){
		const out = [];
		for (const f of this.walkAll(path.join(FW, "ai"))){
			if (!SessionRecord.is_log_entry(path.dirname(f), path.basename(f))) continue;
			let t; try { t = fs.readFileSync(f, "utf8"); } catch { continue; }
			for (const l of t.split(String.fromCharCode(10))) if (l.startsWith('{"decision"') && (l.includes(key + "/") || l.includes(key + "`") || l.includes(key + " "))){
				let d; try { d = JSON.parse(l).decision; } catch { continue; }
				out.push("- " + String(typeof d === "string" ? d : JSON.stringify(d)).replace(/\s+/g, " ").slice(0, 600) + "  (" + slash(path.relative(REPO, path.dirname(f))) + ")");
			}
		}
		return out;
	}

	static run(){
		const mods = this.modules();
		const files = [...this.walk(path.join(REPO, "public")), ...this.walk(path.join(REPO, "Server")), ...this.walk(path.join(REPO, "Servex"))]
			.filter(f => /\.m?js$/.test(f)).map(f => { let t = ""; try { t = fs.readFileSync(f, "utf8"); } catch {} return [slash(f), t]; });
		const dec = this.decisions(mods);
		for (const m of mods){
			const own = slash(m.dir) + "/";
			m.importers = files.filter(([f, t]) => !f.startsWith(own) && (t.includes(m.needle) || t.includes(`/${m.name}.js`))).length;
			m.architecture = fs.existsSync(path.join(m.dir, "doc", "architecture.md"));
			m.decisionsMd = fs.existsSync(path.join(m.dir, "doc", "decisions.md"));
			m.decisionLines = dec.get(m.key);
		}
		return mods.sort((a, b) => b.importers - a.importers);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), ti = argv.indexOf("--top"), top = ti >= 0 ? +argv[ti + 1] : 12;
	const bi = argv.indexOf("--decisions");
	if (bi >= 0){ console.log(ArchitectureCensus.extract(argv[bi + 1]).join("\n")); process.exit(0); }
	const mods = ArchitectureCensus.run();
	if (argv.includes("--json")) console.log(JSON.stringify(mods.map(({ dir, needle, ...m }) => m), null, 1));
	else {
		const w = mods.filter(m => m.architecture).length;
		console.log(`${mods.length} modules with a readme; ${w} have doc/architecture.md, ${mods.filter(m => m.decisionsMd).length} have doc/decisions.md.\n`);
		console.log("rank importers arch decisions.md decisionLines module");
		mods.slice(0, top * 2).forEach((m, i) => console.log(`${String(i + 1).padStart(4)} ${String(m.importers).padStart(9)} ${m.architecture ? " yes" : "  no"} ${m.decisionsMd ? "      yes" : "       no"} ${String(m.decisionLines).padStart(13)} ${m.key}`));
	}
}
