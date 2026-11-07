import fs from "fs";
const D = process.argv[2], read = m => fs.readFileSync(`${D}/rank-${m}.tsv`, "utf8").split("\n").filter(l => l && !l.startsWith("#")).map(l => l.split("\t"));
const [h, s, o] = ["haiku", "sonnet", "opus"].map(read);
const norm = r => (r || "").trim().toLowerCase();
const rows = o.map((r, i) => ({ at: r[0], name: r[1], o: norm(r[2]), s: norm(s[i]?.[2]), h: norm(h[i]?.[2]), sw: s[i]?.[3], hw: h[i]?.[3], ok: s[i]?.[0] === r[0] && h[i]?.[0] === r[0] }));
const agree = (a, b) => rows.filter(r => r[a] === r[b]).length;
const all3 = rows.filter(r => r.o === r.s && r.s === r.h);
const out = { rows: rows.length, aligned: rows.filter(r => r.ok).length, opus_sonnet: agree("o", "s"), opus_haiku: agree("o", "h"), sonnet_haiku: agree("s", "h"), all_three: all3.length };
for (const m of ["o", "s", "h"]) out["counts_" + m] = ["core", "secondary", "move-out"].map(k => rows.filter(r => r[m] === k).length).join("/");
const by = k => all3.filter(r => r.o === k).map(r => r.name);
out.all3_core = by("core"); out.all3_move = by("move-out");
out.split = rows.filter(r => !(r.o === r.s && r.s === r.h)).map(r => `${r.name}: o=${r.o} s=${r.s} h=${r.h}`);
for (const f of ["Page.class", "Item.js"]) { const rr = rows.filter(r => r.at.includes(f)); out["move_" + f] = ["o", "s", "h"].map(m => rr.filter(r => r[m] === "move-out").length + "/" + rr.length).join(" "); }
fs.writeFileSync(`${D}/compare.json`, JSON.stringify(out, null, 1));
const { split, all3_core, all3_move, ...head } = out; console.log(JSON.stringify(head)); console.log("ALL3 CORE", all3_core.join(" ")); console.log("ALL3 MOVE", all3_move.join(" ")); console.log("SPLIT", split.length); console.log(split.slice(0, 200).join(" | "));
