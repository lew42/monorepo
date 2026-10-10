// Parse each Haiku agent's final text from the output transcripts into verdicts.json; also tokens.
import fs from "fs"; import path from "path";
const dir = process.argv[2]; const v = {}; let tok = 0, agents = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".output")) continue;
  const txt = fs.readFileSync(path.join(dir, f), "utf8");
  if (!/Read the file C:.*batch\d+/.test(txt) && !/batch\d\d\.txt/.test(txt)) continue;
  agents++;
  for (const m of txt.matchAll(/#(\d+) \| (delivered|partial|not found)(?: scratch)? \| ([^\\"\n]*)/g)) v[m[1]] = { verdict: m[2], scratch: /not found scratch|partial scratch/.test(m[0]) || /scratch/.test(m[0].slice(0, 40)), ev: m[3].trim() };
}
fs.writeFileSync(process.argv[3], JSON.stringify(v));
console.log(agents, "agents", Object.keys(v).length, "verdicts");
