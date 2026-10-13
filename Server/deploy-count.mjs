#!/usr/bin/env node
// Read-only: how many files Cloudflare would upload from public/, before and after public/.assetsignore.
// Counts git-tracked files (a Cloudflare build deploys a checkout). Plan: public/framework/ai/doc/repo-size.md
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const CAP = 20000;
const root = process.argv[2] || process.cwd();
const out = execFileSync("git", ["ls-files", "-z", "public"], { cwd: root, maxBuffer: 1 << 28 }).toString();
const files = out.split("\0").filter(Boolean).map(f => f.slice("public/".length));

// One .assetsignore line (gitignore syntax: # comments, !negate, trailing / = directory, ** and *).
class Rule {
	constructor(line) {
		this.neg = line.startsWith("!");
		let p = this.neg ? line.slice(1) : line;
		this.dirOnly = p.endsWith("/");
		if (this.dirOnly) p = p.slice(0, -1);
		const anchored = p.includes("/");
		p = p.replace(/^\//, "");
		let re = "";
		for (let i = 0; i < p.length; i++) {
			const c = p[i];
			if (c === "*" && p[i + 1] === "*") { re += ".*"; i++; if (p[i + 1] === "/") i++; }
			else if (c === "*") re += "[^/]*";
			else if (c === "?") re += "[^/]";
			else re += /[.+^${}()|[\]\\]/.test(c) ? "\\" + c : c;
		}
		this.re = new RegExp((anchored ? "^" : "^(?:.*/)?") + re + "$");
	}
	// the path itself, or any directory above it, matches
	hits(path) {
		const parts = path.split("/");
		for (let n = 1; n <= parts.length; n++) {
			if (this.dirOnly && n === parts.length) continue;
			if (this.re.test(parts.slice(0, n).join("/"))) return true;
		}
		return false;
	}
}

const text = readFileSync(root + "/public/.assetsignore", "utf8");
const rules = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#")).map(l => new Rule(l));
const ignored = f => { let r = false; for (const rule of rules) if (rule.hits(f)) r = !rule.neg; return r; };

const kept = files.filter(f => !ignored(f));
console.log(`files before : ${files.length}   (git ls-files public; a build deploys the checkout)`);
console.log(`files after  : ${kept.length}`);
console.log(`cap          : ${CAP}   margin: ${CAP - kept.length}`);
for (const r of rules) console.log(`  ${files.filter(f => r.hits(f)).length}\t${r.neg ? "!" : ""}${r.re.source}`);
process.exit(kept.length < CAP ? 0 : 1);
