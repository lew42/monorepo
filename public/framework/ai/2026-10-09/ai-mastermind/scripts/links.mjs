// Checks every markdown link in the given readmes resolves to a file/dir (site routes /framework/x/ map to public/framework/x).
import fs from "node:fs"; import path from "node:path";
for (const f of process.argv.slice(2)) {
  const txt = fs.readFileSync(f, "utf8"), dir = path.dirname(f);
  for (const m of txt.matchAll(/\]\(([^)\s#]+)/g)) {
    let l = m[1]; if (/^https?:|^mailto/.test(l)) continue;
    const cands = l.startsWith("/") ? [path.join("public", l), path.join("public/framework", l.replace(/^\/framework/, "")), path.join("public/framework", l), path.join(".", l), path.join("Servex", l.replace(/^\/framework\/servex/, "")), path.join("Server", l.replace(/^\/framework\/dev/, ""))] : [path.join(dir, l)];
    if (!cands.some(c => fs.existsSync(c) || fs.existsSync(c + ".js") || fs.existsSync(path.join(c, "page.js")))) console.log(f, "->", l);
  }
}
