// report.mjs — the recovery's numbers, computed from recovered.jsonl (the LAST line per path wins,
// since a later pass can turn a no-source into a restore). Writes counts.json and no-source.txt
// beside this file and prints the counts. Never typed from memory (law 7).
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const last = new Map();
for (const l of fs.readFileSync(path.join(here, "recovered.jsonl"), "utf8").split("\n")){
	try { const r = JSON.parse(l).recover; if (r?.path) last.set(r.path, r); } catch {}
}
const rows = [...last.values()];
const count = (f = () => true) => rows.filter(f).reduce((c, r) => (c[r.status] = (c[r.status] ?? 0) + 1, c), {});
const isImage = r => /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(r.path);
const out = {
	paths: rows.length,
	by_status: count(),
	restored_by_confidence: rows.filter(r => r.status === "restored").reduce((c, r) => (c[r.confidence] = (c[r.confidence] ?? 0) + 1, c), {}),
	no_source_images: rows.filter(r => r.status === "no-source" && isImage(r)).length,
	no_source_other: rows.filter(r => r.status === "no-source" && !isImage(r)).length,
	bytes_restored: rows.filter(r => r.status === "restored").reduce((n, r) => n + (r.bytes ?? 0), 0),
};
fs.writeFileSync(path.join(here, "counts.json"), JSON.stringify(out, null, 1) + "\n");
const gone = rows.filter(r => r.status === "no-source").map(r => r.path).sort();
fs.writeFileSync(path.join(here, "no-source.txt"), gone.join("\n") + "\n");
console.log(JSON.stringify(out, null, 1));
