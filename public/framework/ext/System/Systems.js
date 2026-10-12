import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ReadmeSystem from "./ReadmeSystem.js";
import NavigationSystem from "./NavigationSystem.js";

// The manager: knows every System instance, runs their checks, appends one line each to results.jsonl
// (the page reads that file, so it streams). Two ways to be known:
//  - `shared`: whole-site systems, built here;
//  - `modules`: a module declares its own `system.js` beside its page.js (default export = the instance).
// To add a system, add its module's system.js path to `modules`.
export default class Systems {
	static repo = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
	static file = path.join(path.dirname(fileURLToPath(import.meta.url)), "results.jsonl");
	static shared = [
		() => new ReadmeSystem({ name: "Readmes", icon: "menu_book" }),
		() => new NavigationSystem({ name: "Navigation", icon: "route" }),
	];
	static modules = [
		"public/framework/ai/sessions/system.js",
		"public/framework/servex/system.js",
		"public/framework/audio/Transcriber/system.js",
		"public/framework/ext/Refine/system.js",
	];

	static async all(){
		const mine = this.shared.map(make => make());
		for (const m of this.modules) mine.push((await import(pathToFileURL(path.join(this.repo, m)).href)).default);
		return mine;
	}

	static async run(){
		const reports = (await this.all()).map(s => s.report());
		fs.appendFileSync(this.file, reports.map(r => JSON.stringify({ ...r, findings: r.findings.slice(0, 10) })).join("\n") + "\n");
		return reports;
	}
}
