/* The index of every task home: /tasks/task.jsonl holds one {"task": "<home>"} line per `tasks/` folder that keeps a task.jsonl.
 * Homes are found by walking the files.jsonl listings from public/ down (the same lines the item tool records), never by hand.
 * The item tool's make_child calls add() when it opens a new module list; run this file to backfill.
 *   node Server/TaskHomes.mjs          dry run: the homes found, and which ones the index lacks
 *   node Server/TaskHomes.mjs --write  append the missing references
 * Doc: public/framework/core/Task/readme.md ("TasksPage"). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AIIndex from "./AIIndex.mjs";

const NL = String.fromCharCode(10);

export default class TaskHomes {
	static PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
	static INDEX = path.join(this.PUBLIC, "tasks", "task.jsonl");   // a test points this at a scratch file

	static lines(file){
		if (!fs.existsSync(file)) return [];
		return fs.readFileSync(file, "utf8").split(NL).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	}

	// Every folder a files.jsonl names ("x/" or "x/page.js"), walked from public/; a `tasks/` folder with a task.jsonl is a home.
	static scan(dir = this.PUBLIC, found = [], seen = new Set()){
		if (seen.has(dir)) return found;
		seen.add(dir);
		const kids = new Set(this.lines(path.join(dir, "files.jsonl")).filter(o => typeof o.file === "string" && !o.gone && o.file.includes("/")).map(o => o.file.split("/")[0]));
		for (const name of kids){
			const sub = path.join(dir, name);
			if (!fs.existsSync(sub)) continue;
			if (name === "tasks" && dir !== this.PUBLIC && fs.existsSync(path.join(sub, "task.jsonl"))) found.push(this.app_path(sub));
			else this.scan(sub, found, seen);
		}
		return found;
	}

	static app_path(dir){ return "/" + path.relative(this.PUBLIC, dir).split(path.sep).join("/") + "/"; }

	static listed(){ return new Set(this.lines(this.INDEX).map(o => o.task).filter(Boolean)); }

	// One reference line for a home the index lacks; line 1 first when the index is new. Repeat-safe.
	static add(home, by = "TaskHomes"){
		if (this.listed().has(home)) return false;
		fs.mkdirSync(path.dirname(this.INDEX), { recursive: true });
		if (!fs.existsSync(this.INDEX)) fs.appendFileSync(this.INDEX, JSON.stringify({ id: "tasks", path: "/tasks/", title: "All tasks", mode: "parallel" }) + NL);
		fs.appendFileSync(this.INDEX, JSON.stringify({ task: home, by, ts: new Date().toISOString() }) + NL);
		return true;
	}

	// The homes come from AIIndex.homes() (a walk of the disk, the same one index.json counts from); scan() stays for TaskMigrate.
	static sync({ write = false } = {}){
		const homes = new AIIndex({ root: path.dirname(this.PUBLIC) }).homes(), have = this.listed(), missing = homes.filter(h => !have.has(h));
		if (write) missing.forEach(h => this.add(h));
		return { homes, missing, wrote: write };
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const r = TaskHomes.sync({ write: process.argv.includes("--write") });
	console.log(`${r.homes.length} task homes found:` + NL + r.homes.map(h => "  " + h).join(NL));
	console.log(r.missing.length ? `${r.wrote ? "added" : "missing (run with --write)"}: ${r.missing.join(", ")}` : "the index lists them all");
}
