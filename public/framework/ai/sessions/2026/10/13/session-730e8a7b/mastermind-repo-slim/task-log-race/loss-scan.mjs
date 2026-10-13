// Finds lines present in one committed version of a record file and absent from the next. Read-only.
// usage: node loss-scan.mjs <dir> [since]   -> one JSON object per loss window: {file, from, to, lost[]}
import { execFileSync } from "child_process";
const [dir, since = "2026-10-13 00:00"] = process.argv.slice(2);
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28, windowsHide: true });
const files = git("ls-files", dir).split("\n").filter(f => /(^|\/)(task|page|log|inbox|day)\.jsonl$/.test(f));
let total = 0;
for (const f of files) {
	const revs = git("log", "--since=" + since, "--format=%H %cI", "--reverse", "--", f).trim().split("\n").filter(Boolean).map(l => l.split(" "));
	for (let i = 0; i + 1 < revs.length; i++) {
		const a = new Set(git("show", `${revs[i][0]}:${f}`).split("\n").filter(Boolean));
		const b = new Set(git("show", `${revs[i + 1][0]}:${f}`).split("\n").filter(Boolean));
		const lost = [...a].filter(l => !b.has(l));
		if (lost.length) { total++; console.log(JSON.stringify({ file: f, from: revs[i][0].slice(0, 9) + " " + revs[i][1], to: revs[i + 1][0].slice(0, 9) + " " + revs[i + 1][1], lost: lost.map(l => l.slice(0, 160)) })); }
	}
}
console.error("files scanned", files.length, "windows with loss", total);
