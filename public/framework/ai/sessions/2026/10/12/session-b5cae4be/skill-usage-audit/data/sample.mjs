import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const root = path.join(os.homedir(), ".claude/projects"); const out = [];
for (const d of fs.readdirSync(root)) for (const f of fs.readdirSync(path.join(root, d))) {
	if (!f.endsWith(".jsonl")) continue; const p = path.join(root, d, f);
	if (fs.statSync(p).size > 3e6) continue;
	const t = fs.readFileSync(p, "utf8");
	if (/"name":"mcp__servex__create_page"/.test(t) && !/"name":"Skill","input":\{"skill":"new-page"/.test(t)) out.push({ file: p, agent: /\[You are Servex agent ([\w-]+)/.exec(t)?.[1] ?? "tab", has_skill_tool: /"name":"Skill"/.test(t.slice(0, 60000)), reads_newpage: /new-page/.test(t.slice(0, 200000)) });
	if (out.length >= 6) break;
}
console.log(JSON.stringify(out, null, 1));
