// One headless Haiku call, with the flags that keep it cheap and plain (no thinking, no tools, no session file). Adds its real cost to a ledger so a run can stop at its cap.
import fs from "node:fs"; import path from "node:path"; import { spawnSync } from "node:child_process";
const LEDGER = path.join(process.env.TEMP, "pw", "haiku-ledger.json");
export const spent = () => { try { return JSON.parse(fs.readFileSync(LEDGER, "utf8")).usd; } catch { return 0; } };
export function haiku(system, input, { cap = 1.5, model = "claude-haiku-4-5" } = {}) {
	if (spent() >= cap) throw new Error(`Haiku cap $${cap} reached`);
	const r = spawnSync("C:/Users/mike/.local/bin/claude.exe", ["-p", "--model", model, "--effort", "low", "--tools", "", "--no-session-persistence", "--output-format", "json", "--disable-slash-commands", "--strict-mcp-config", "--setting-sources", "local", "--system-prompt", system],
		{ input, encoding: "utf8", shell: false, maxBuffer: 1e8, cwd: process.env.TEMP, env: { ...process.env, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1", MAX_THINKING_TOKENS: "0", DISABLE_PROMPT_CACHING: "1" } });
	let j; try { j = JSON.parse(r.stdout); } catch { throw new Error("haiku: " + (r.stdout || r.stderr || "").slice(0, 300)); }
	const total = +(spent() + j.total_cost_usd).toFixed(4); fs.writeFileSync(LEDGER, JSON.stringify({ usd: total }));
	return { text: j.result, usd: j.total_cost_usd };
}
export const json = s => { const m = s.match(/\[[\s\S]*\]|\{[\s\S]*\}/); return JSON.parse(m ? m[0] : s); };
