// Mechanical proof check: every path/URL a landing names must exist in the repo.
import fs from "fs"; import path from "path";
const root = path.resolve(import.meta.dirname, "../../../../..");
const claims = JSON.parse(fs.readFileSync(path.join(import.meta.dirname,"claims.json")));
const res = [];
for (const c of claims.filter(c=>c.landed)) {
  const refs = [...new Set(c.outcome.match(/(?:\/|\b)(?:framework|public|Servex|Server)\/[\w./\-]+[\w/]/g) || [])];
  for (let r of refs) {
    r = r.replace(/^\/?(?=framework\/)/, "public/").replace(/^\//,"").replace(/[.:,)]+$/,"");
    const p = path.join(root, r);
    const ok = fs.existsSync(p) || fs.existsSync(p + ".js") || fs.existsSync(path.join(p,"page.js")) || fs.existsSync(path.join(p,"readme.md"));
    if (!ok) res.push({task: c.task, ref: r});
  }
}
fs.writeFileSync(path.join(import.meta.dirname,"refs-missing.json"), JSON.stringify(res,null,1));
console.log(res.length, "missing"); res.forEach(r=>console.log(r.task, r.ref));
