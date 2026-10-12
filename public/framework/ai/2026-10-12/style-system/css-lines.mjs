// CSS census for the style-system slice: per page folder, CSS lines (non-blank, non-comment),
// rules, distinct classes defined, raw colour literals. Run: node css-lines.mjs [label] → appends census.jsonl.
import fs from "node:fs"; import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
const fw = path.resolve(here, "../../..");
const dirs = ["ext/Figma/colors", "ext/Figma/palette", "ext/Figma/palette/pricing", "ext/Figma/palette/controls",
  "ext/Figma/palette/features", "ext/Figma/palette/hero", "ext/Figma/palette/collab", "ext/Figma/palette/timeline",
  "ext/Figma/palette/tasks", "ext/Figma/palette/typography", "ext/Figma/autolayout", "core/Page/card", "ui/card"];
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "");
const rows = dirs.map(d => {
  const abs = path.join(fw, d); let lines = 0, rules = 0, colours = 0; const classes = new Set();
  for (const f of fs.existsSync(abs) ? fs.readdirSync(abs).filter(f => f.endsWith(".css")) : []) {
    const css = strip(fs.readFileSync(path.join(abs, f), "utf8"));
    lines += css.split(/\r?\n/).filter(l => l.trim()).length;
    rules += (css.match(/\{/g) || []).length;
    colours += (css.match(/#[0-9a-f]{3,8}\b|rgba?\(/gi) || []).length;
    for (const m of css.matchAll(/\.([a-z][\w-]*)/gi)) classes.add(m[1]);
  }
  return { dir: d, lines, rules, classes: classes.size, colours };
});
const total = rows.reduce((t, r) => ({ lines: t.lines + r.lines, rules: t.rules + r.rules, classes: t.classes + r.classes, colours: t.colours + r.colours }), { lines: 0, rules: 0, classes: 0, colours: 0 });
const label = process.argv[2] || "now";
fs.appendFileSync(path.join(here, "census.jsonl"), JSON.stringify({ label, at: new Date().toISOString(), total, rows }) + "\n");
console.table(rows); console.log(label, total);
