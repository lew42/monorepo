// Appends the lines recover.mjs found missing back to their record files. APPEND ONLY (appendFileSync), idempotent: a line already in the file is skipped.
//   node recover-apply.mjs <lost.json> [--dry] [--skip-verbs=assign,agent,file]   (run from the repo root)
// Not recovered, on purpose: files.jsonl (dev-server folder listings, regenerated), cards.jsonl and usage.jsonl (newest-line-wins snapshots: an old line appended last would win).
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [src, ...flags] = process.argv.slice(2), dry = flags.includes("--dry");
const skipVerbs = new Set((flags.find(x => x.startsWith("--skip-verbs="))?.slice(13) ?? "").split(",").filter(Boolean));   // e.g. assign,agent,file: state lines an old copy must not overwrite
const verbOf = l => Object.keys(JSON.parse(l))[0];
const TaskDirs = (await import(pathToFileURL(path.resolve("Server/TaskDirs.mjs")).href)).default;
const lost = JSON.parse(fs.readFileSync(src, "utf8")), done = [], skipped = [];
for (const [f, lines] of Object.entries(lost)) {
	if (/(^|\/)(files|cards|usage)\.jsonl$/.test(f)) { skipped.push({ f, n: lines.length, why: "listing/snapshot" }); continue; }
	let abs = path.resolve(f); if (!fs.existsSync(abs)) abs = TaskDirs.follow(abs);
	if (!fs.existsSync(abs)) { skipped.push({ f, n: lines.length, why: "file gone" }); continue; }
	const have = new Set(fs.readFileSync(abs, "utf8").split("\n")), add = lines.filter(l => !have.has(l) && !skipVerbs.has(verbOf(l)));
	for (const l of add) JSON.parse(l);   // every recovered line must be valid JSON
	if (!add.length) { skipped.push({ f, n: 0, why: "already there" }); continue; }
	if (!dry) {
		let out = add.join("\n") + "\n";
		const size = fs.statSync(abs).size; if (size) { const fd = fs.openSync(abs, "r"), b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, size - 1); fs.closeSync(fd); if (b[0] !== 10) out = "\n" + out; }
		fs.appendFileSync(abs, out, "utf8");
	}
	done.push({ f: path.relative(".", abs).replace(/\\/g, "/"), n: add.length });
}
console.log(JSON.stringify({ dry, appended: done.reduce((a, d) => a + d.n, 0), files: done.length, skipped: skipped.length }));
fs.writeFileSync(src.replace(/\.json$/, ".applied.txt"), JSON.stringify({ done, skipped }, null, 1));
