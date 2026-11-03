// Readme-index census. Run: node census.mjs   (from anywhere; writes census.json beside itself)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../../../");           // public/framework
const SKIP = new Set(["node_modules", "ai", "ai2", "doc", "made", "hljs", ".git", "research", "audit"]);
const PARENTS = new Set(["core", "ext", "ui", "ux", "styles", "web"]);
const subdirs = d => fs.readdirSync(d, { withFileTypes: true })
    .filter(e => e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith(".") && !e.name.startsWith("_") && !/^\d{4}-\d\d-\d\d/.test(e.name))
    .map(e => e.name).sort();
const isModule = (d, parentName) => fs.existsSync(path.join(d, "page.js")) || fs.existsSync(path.join(d, "readme.md")) || PARENTS.has(parentName);
function indexNames(text) {
    const lines = text.split(/\r?\n/); let i = lines.findIndex(l => /^#\s/.test(l)); if (i < 0) i = -1;
    const out = []; let seenH2 = false;
    for (const l of lines.slice(i + 1)) {
        if (/^##\s/.test(l)) { if (seenH2) break; seenH2 = true; continue; }
        const m = l.match(/^\s*[-*]?\s*\[[^\]]*\]\(\.\/([^/)#]+)\/?\)\s*[—–-]/);
        if (m) out.push(m[1]);
    }
    return out;
}
function walk(dir, rel, parentName) {
    const rp = path.join(dir, "readme.md"), has = fs.existsSync(rp);
    const listed = has ? indexNames(fs.readFileSync(rp, "utf8")) : [];
    const kids = subdirs(dir).filter(n => isModule(path.join(dir, n), path.basename(dir)));
    const node = { path: rel || ".", name: path.basename(dir), readme: has, index: listed.length > 0,
        children_dirs: kids, missing: listed.length ? kids.filter(k => !listed.includes(k)) : (has ? kids : kids), children: [] };
    node.mark = has && node.index ? "✓" : has ? "~" : "✗";
    for (const k of kids) node.children.push(walk(path.join(dir, k), (rel ? rel + "/" : "") + k, path.basename(dir)));
    return node;
}
const tree = walk(root, "", "");
const flat = []; (function f(n) { flat.push(n); n.children.forEach(f); })(tree);
const counts = { ok: flat.filter(n => n.mark === "✓").length, noindex: flat.filter(n => n.mark === "~").length, none: flat.filter(n => n.mark === "✗").length, total: flat.length };
fs.writeFileSync(path.join(here, "census.json"), JSON.stringify({ made: new Date().toISOString(), counts, tree }, null, 1));
console.log(JSON.stringify(counts));
