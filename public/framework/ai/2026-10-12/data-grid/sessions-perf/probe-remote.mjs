// node probe-remote.mjs [YYYY/MM/DD] — the node (remote-mode) path of Sessions over one day of real snapshots: listed rows, kind chips, an open kind, two searches.
import fs from "fs";
const W = new URL("../../../../", import.meta.url).href;   // public/framework/
const { default: Query } = await import(W + "ext/Query/Query.js");
const { default: Src } = await import(W + "ai/AISession/AISessionSource.mjs");
const raw = JSON.parse(fs.readFileSync(new URL("../../../sessions/" + (process.argv[2] ?? "2026/10/12") + "/index.json", import.meta.url), "utf8"));
const snaps = raw.snapshots;
const items = snaps.map(s => Src.shape(s));
const ask = (extra) => new Query({ sort: { by: "last_activity", dir: "desc" }, limit: 50, sum: ["claude_usd"], open: { kinds: [], ids: [] }, ...extra }).run(items, Src.arrange);
const a = ask({});
console.log("items", items.length, "matched", a.matched, "total(listed)", a.total, "meta", JSON.stringify(a.meta));
console.log("first", a.rows.slice(0, 4).map(r => (r.title ?? r.agent ?? r.id).slice(0, 40) + " $" + (r.claude_usd ?? 0).toFixed(2)).join(" | "), "bucket rows:", a.rows.filter(r => r.bucket).length);
const b = ask({ open: { kinds: ["clarity"], ids: [] } });
console.log("clarity open: total", b.total, "listed", b.meta.listed);
const c = ask({ where: [{ fields: ["title", "agent", "id", "folder", "model", "role"], op: "contains", value: "clarity" }], open: { kinds: [], ids: [], all: true } });
console.log("search clarity: matched", c.matched, "total", c.total);
const d = ask({ where: [{ fields: ["title", "agent", "id", "folder", "model", "role"], op: "contains", value: "server-query" }], open: { kinds: [], ids: [], all: true } });
console.log("search server-query:", d.rows.map(r => r.agent ?? r.title).join(", "));
