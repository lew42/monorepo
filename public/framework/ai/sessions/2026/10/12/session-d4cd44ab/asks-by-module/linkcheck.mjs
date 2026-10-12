// Spot-check readmes: line count and dead relative links / backticked paths. Usage: node linkcheck.mjs <readme...> (repo-relative)
import fs from "fs"; import path from "path";
const root = path.resolve(import.meta.dirname, "../../../../..");
for (const r of process.argv.slice(2)) {
  const fp = path.join(root, r), dir = path.dirname(fp), txt = fs.readFileSync(fp, "utf8");
  const dead = [];
  for (const m of txt.matchAll(/\]\(([^)#\s]+)[^)]*\)|`((?:\.\.?\/|public\/|Servex\/|Server\/)[^`\s*]+)`/g)) {
    const l = m[1] || m[2]; if (/^(https?:|mailto:)/.test(l)) continue;
    let p = l.startsWith("/framework/") ? path.join(root, "public", l) : l.startsWith("/") ? path.join(root, "public", l) : /^(public|Servex|Server)\//.test(l) ? path.join(root, l) : path.join(dir, l);
    p = p.replace(/\?.*$/, "");
    if (!fs.existsSync(p) && !fs.existsSync(p + ".md") && !fs.existsSync(p + "/page.js") && !fs.existsSync(p + "/readme.md")) dead.push(l);
  }
  console.log(r, txt.split("\n").length + " lines", dead.length ? "DEAD: " + [...new Set(dead)].join(", ") : "ok");
}
