/* apply-echo-gate.mjs: the hook half of the echo-loop fix (2026-10-02 22:17, 16 claude processes
 * in four minutes). Run it once: node public/framework/ai/sessions/2026/10/02/servex-mastermind/apply-echo-gate.mjs
 * It takes effect at once (a hook is read fresh on every prompt; no restart).
 *
 * Why: prompt-relay.mjs and reply-relay.mjs treat a session as the owner's when SERVEX_MCP is
 * missing. Echo.js's clean()/structure() start SDK sessions from inside Servex, whose own env has
 * no SERVEX_MCP, so each one was relayed as an owner prompt, got its own echo agent, and was
 * refined again. The owner's rule: refine only the owner's prompts. A session is the owner's only
 * if it is not Servex-started, not an askOnce call (LEW42_NO_RELAY, set by Server/ask-each.mjs),
 * and not any SDK or `claude -p` session (CLAUDE_CODE_ENTRYPOINT sdk-*). VS Code is claude-vscode,
 * a terminal is cli: both still count.
 *
 * Written by mastermind-servex-10, whose session may not edit .claude/hooks. All-or-nothing per file. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const OLD = "const started_by_servex = () => Boolean(process.env.SERVEX_MCP);";
const NEW = "const started_by_servex = () => Boolean(process.env.SERVEX_MCP || process.env.LEW42_NO_RELAY   // the echo loop, 2026-10-02: only the owner's own sessions\n"
	+ "\t|| /^sdk/i.test(process.env.CLAUDE_CODE_ENTRYPOINT || \"\"));";

for (const name of ["prompt-relay.mjs", "reply-relay.mjs"]){
	const file = path.join(ROOT, ".claude/hooks", name);
	const text = fs.readFileSync(file, "utf8");
	if (text.includes("LEW42_NO_RELAY")){ console.log(`${name}: already gated`); continue; }
	if (!text.includes(OLD)){ console.log(`${name}: the old line moved; apply the same meaning by hand`); process.exitCode = 1; continue; }
	const eol = text.includes("\r\n") ? "\r\n" : "\n";
	fs.writeFileSync(file, text.replace(OLD, NEW.replace(/\n/g, eol)));
	console.log(`${name}: gated`);
}
