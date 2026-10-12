import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const root = path.join(os.homedir(), ".claude/projects"); const roles = {};
for (const d of fs.readdirSync(root)) for (const f of fs.readdirSync(path.join(root, d))) {
	if (!f.endsWith(".jsonl")) continue; const t = fs.readFileSync(path.join(root, d, f), "utf8");
	const m = /\[You are Servex agent ([a-z]+)/.exec(t.slice(0, 20000)); if (!m) continue;
	const r = (roles[m[1]] ||= { n: 0, told: 0, loaded_after_told: 0, loaded_untold: 0 });
	r.n++; const told = /Load the `[\w-]+`/.test(t.slice(0, 30000)); const loaded = /"name":"Skill","input":\{"skill"/.test(t);
	if (told) { r.told++; if (loaded) r.loaded_after_told++; } else if (loaded) r.loaded_untold++;
}
fs.writeFileSync("data/loadprefix.json", JSON.stringify(roles, null, 1));
console.log(Object.entries(roles).sort((a, b) => b[1].n - a[1].n).slice(0, 10).map(([k, v]) => k + " " + JSON.stringify(v)).join("\n"));
