import fs from "node:fs";
import path from "node:path";
import ReadmeSystem from "./ReadmeSystem.js";
import NavigationSystem from "./NavigationSystem.js";

// The manager: knows every System, runs their checks, appends one line each to results.jsonl
// (the page reads that file, so it streams). Add a system by adding it to `all`.
export default class Systems {
	static all = [ReadmeSystem, NavigationSystem];
	static file = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "results.jsonl");

	static run(){
		const reports = this.all.map(C => new C().report());
		fs.appendFileSync(this.file, reports.map(r => JSON.stringify({ ...r, findings: r.findings.slice(0, 10) })).join("\n") + "\n");
		return reports;
	}
}
