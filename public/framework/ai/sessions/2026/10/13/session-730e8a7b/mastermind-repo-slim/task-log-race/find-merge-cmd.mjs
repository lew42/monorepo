// Read-only: lists Bash/PowerShell tool calls between two times (UTC) in recent SDK session files whose command matches a regex.
// usage: node find-merge-cmd.mjs <fromISO> <toISO> <regex>
import fs from "fs"; import path from "path"; import os from "os";
const [from, to, re] = process.argv.slice(2); const rx = new RegExp(re, "i");
const root = path.join(os.homedir(), ".claude", "projects");
for (const f0 of fs.readdirSync(root, { recursive: true }).filter(f => String(f).endsWith(".jsonl") && !String(f).includes("subagents"))) { const f = String(f0);
	const full = path.join(root, f);
	if (fs.statSync(full).mtimeMs < Date.parse(from)) continue;
	for (const line of fs.readFileSync(full, "utf8").split("\n")) {
		if (!line.includes('"tool_use"')) continue;
		let j; try { j = JSON.parse(line); } catch { continue; }
		if (!j.timestamp || j.timestamp < from || j.timestamp > to) continue;
		for (const c of j.message?.content || []) {
			const cmd = c.input?.command;
			if (c.type === "tool_use" && typeof cmd === "string" && rx.test(cmd)) console.log(f.slice(0, 8), j.timestamp, "\n  ", cmd.slice(0, 500).replace(/\n/g, "\n   "));
		}
	}
}
