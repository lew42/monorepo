// Untracks (git rm --cached) every tracked picture inside a shots/ folder. Files stay on disk.
// node UntrackShots.mjs --plan   writes untrack-manifest.jsonl (path, bytes, kept-on-disk) and prints totals
// node UntrackShots.mjs --apply  runs git rm --cached from that manifest;  --undo re-adds them (git add -f)
import { execFileSync } from "node:child_process";
import { statSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

class UntrackShots {
	static dir = dirname(fileURLToPath(import.meta.url));
	static manifest = join(UntrackShots.dir, "untrack-manifest.jsonl");
	static pic = /\.(png|jpe?g|webp|gif)$/i;
	static git(...a) { return execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28, windowsHide: true }); }
	static root() { return UntrackShots.git("rev-parse", "--show-toplevel").trim(); }

	static plan() {
		const root = UntrackShots.root();
		const rows = UntrackShots.git("ls-files").split("\n").filter(f => /(^|\/)shots\//.test(f) && UntrackShots.pic.test(f))
			.map(path => { const abs = join(root, path); const onDisk = existsSync(abs); return { path, bytes: onDisk ? statSync(abs).size : 0, kept_on_disk: onDisk }; });
		writeFileSync(UntrackShots.manifest, rows.map(r => JSON.stringify(r)).join("\n") + "\n");
		const mb = rows.reduce((s, r) => s + r.bytes, 0) / 1048576;
		console.log(`${rows.length} pictures, ${mb.toFixed(1)} MB on disk, ${rows.filter(r => !r.kept_on_disk).length} not on disk -> ${UntrackShots.manifest}`);
	}
	static rows() { return readFileSync(UntrackShots.manifest, "utf8").trim().split("\n").map(l => JSON.parse(l)); }
	static run(verb) {
		const paths = UntrackShots.rows().map(r => r.path);
		for (let i = 0; i < paths.length; i += 200) {
			const chunk = paths.slice(i, i + 200);
			if (verb === "apply") UntrackShots.git("rm", "--cached", "-q", "--", ...chunk);
			else UntrackShots.git("add", "-f", "--", ...chunk);
		}
		console.log(`${verb}: ${paths.length} paths`);
	}
}
const a = process.argv[2];
if (a === "--plan") UntrackShots.plan();
else if (a === "--apply") UntrackShots.run("apply");
else if (a === "--undo") UntrackShots.run("undo");
else console.log("usage: --plan | --apply | --undo");
