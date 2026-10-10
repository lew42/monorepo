// Adds `tag` (a /path icon-item reference) and `alert` (needs the owner: high/normal) to loose-ends.jsonl. Run in this dir.
import fs from "fs";
const f = "loose-ends.jsonl";
const rows = fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
for (const r of rows) {
	const d = (r.dir || "").replace(/^public\//, "").replace(/\/$/, "");
	r.tag = d.startsWith("framework/") ? "/" + d : d ? "/framework/ai/" + d : "#" + r.module;
	const text = (r.title + " " + r.ask + " " + r.evidence).toLowerCase();
	if (r.state !== "scratch" && /await|owner|approve|decision|credential|login|verdict/.test(text) && r.state !== "done-unverified") r.alert = r.priority ? "high" : "normal";
}
fs.writeFileSync(f, rows.map(r => JSON.stringify(r)).join("\n") + "\n");
console.log(rows.length, "rows;", rows.filter(r => r.alert).length, "alerts");
