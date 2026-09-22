import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

/* THE SYNTAX GUARD (2026-09-19). Every page of the site is native ESM served as written,
 * so ONE unparseable shared module blanks every page for whoever is looking at it. It
 * happened twice in fifteen minutes: backticks in a comment inside a css() template in
 * ui/tree/tree.js, written by a minion while the owner was using the site.
 *
 * So after any Edit/Write of a .js/.mjs file, ledger.mjs calls this: `node --check` the
 * file, and if it does not parse, tell the agent that wrote it, at once, in the one
 * channel it cannot miss (a PostToolUse "block" is fed straight back to the agent).
 * The write has already happened — this is the alarm, not a lock. About 60 ms a write.
 *
 * It lives in its own file, imported inside a try, so a mistake HERE can never take the
 * ledger hook down with it. Never throws; prints at most one JSON line. */
export default function syntax_guard(file){
	try {
		if (!file || !/\.m?js$/.test(file) || !fs.existsSync(file)) return;
		// Only files inside this repo: its package.json says "type": "module", which is
		// what makes `node --check` read a .js file as the ESM it is. A scratch .js file
		// outside the repo is CommonJS to node, and `export default` there reads as broken.
		if (!path.resolve(file).toLowerCase().startsWith(root.toLowerCase() + path.sep)) return;
		const check = spawnSync(process.execPath, ["--check", file], { encoding: "utf8", timeout: 8000 });
		if (check.status === 0 || check.status === null) return;
		const said = String(check.stderr || "").split(/\r?\n/).slice(0, 6).join(" | ");
		console.log(JSON.stringify({
			decision: "block",
			reason: "YOU JUST BROKE THIS FILE: it does not parse, and on this no-build site that blanks every page that imports it, live, for the owner. Fix it NOW, before anything else, then run node --check on it. "
				+ said
				+ " (The usual cause: a backtick inside a comment inside a css() template ends the template. Take the backticks out of the comment.)",
		}));
	} catch {}
}
