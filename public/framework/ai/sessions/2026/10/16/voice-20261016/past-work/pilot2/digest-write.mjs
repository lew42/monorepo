// Round 4 step 3: write digest.json beside each session folder, no AI. Add only (an existing file is kept).   node digest-write.mjs [days=3] [--dry]
import fs from "node:fs"; import path from "node:path";
import { AISessionDigest as D } from "../../../../../../../AISession/AISessionDigest.mjs";
import AISessionIndex from "../../../../../../../AISession/AISessionIndex.mjs";
const days = +process.argv[2] || 3, dry = process.argv.includes("--dry");
const dirs = new Map((await new AISessionIndex({ log() {} }).session_dirs()).map(d => [d.id, d.dir]));
const ds = D.all(days), n = { sessions: ds.length, wrote: 0, kept: 0, no_folder: 0 }, miss = [];
for (const d of ds) {
	const dir = dirs.get(d.id); if (!dir) { n.no_folder++; miss.push(d.id.slice(0, 8)); continue; }
	if (dry) n[fs.existsSync(path.join(dir, "digest.json")) ? "kept" : "wrote"]++; else n[d.write(dir)]++;
}
console.log(JSON.stringify(n), miss.slice(0, 10).join(" "));
