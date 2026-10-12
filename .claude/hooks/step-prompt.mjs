// step-prompt.mjs — PostToolUse(Bash). When an append.mjs to a task.jsonl moves `step`, tell the agent that step's text
// (Steps.prompt) as additionalContext, at no extra turn. Never throws, always exits 0, silent when there is nothing to say.
// Plan: public/framework/ai/sessions/2026/10/12/session-87bec773/step-runner/plan.md
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

try {
	const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
	const cmd = String(input.tool_input?.command ?? "");
	if (cmd.includes("append.mjs")){
		const m = cmd.match(/(?:"([^"]*task\.jsonl)"|'([^']*task\.jsonl)'|(\S*task\.jsonl))/);
		// append.mjs prints "<target>: appended …" with the real path, so a $VAR or a moved path still resolves
		const r = input.tool_response, out = typeof r === "string" ? r : String(r?.stdout ?? r?.output ?? "");
		const said = out.match(/^(.*task\.jsonl): appended/m);
		const raw = said?.[1] || (m && (m[1] || m[2] || m[3]));
		if (raw){
			const file = path.resolve(input.cwd || process.cwd(), raw);
			if (fs.existsSync(file)){
				const { default: Steps } = await import("../../Server/Steps.mjs");
				const info = Steps.read(file);
				if (info && info.steps.length && !info.landed && !info.closed){
					const stamp = path.join(os.tmpdir(), "step-prompt-" + crypto.createHash("sha1").update(file).digest("hex").slice(0, 16));
					let last = null; try { last = Number(fs.readFileSync(stamp, "utf8")); } catch {}
					if (last !== info.step){
						fs.writeFileSync(stamp, String(info.step));
						const text = Steps.prompt(info, info.step);
						if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: text } }));
					}
				}
			}
		}
	}
} catch {}
process.exit(0);
