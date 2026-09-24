import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

/* The three operator tools: restart Servex, pause dispatch, resume dispatch.
 * Same shape as `tools(host)` in tools.js; the handlers here need no host, but
 * the argument is kept so both are wired the same way:
 *
 *   for (const tool of ops_tools(servex.agents)) servex.mcp.tool(tool); */

const here = path.dirname(fileURLToPath(import.meta.url));
const SUSTAIN = path.resolve(here, "..", "sustain.mjs");
const DIR = path.join(process.env.LOCALAPPDATA || "", "lew42", "servex");
/* The same switch Dispatcher.js and Assistant.js read. */
export const OFF = path.join(DIR, "dispatch.off");

const tool = (name, description, properties, handler) => {
	const inputSchema = { type: "object", required: [], properties };
	return { name, description, inputSchema, schema: inputSchema, handler };
};

const state = () => JSON.stringify({ dispatch: fs.existsSync(OFF) ? "paused" : "running", switch: OFF });

export function ops_tools(host){ return [

	tool("restart_servex",
		"Restart Servex so it loads new code. ⚠ This restarts EVERY agent, the caller included: your own session ends"
		+ " when it happens. It runs `sustain.mjs --restart` (never --force) in the background and returns at once with"
		+ " the path of a log file. Sustain keeps its own guards — it refuses if a file does not parse or if agents are"
		+ " mid-turn — and a refusal is written in that log, so read the log to learn whether it went ahead.",
		{ dry_run: { type: "boolean", description: "Only report the command and log path; start nothing." } },
		({ dry_run } = {}) => {
			fs.mkdirSync(DIR, { recursive: true });
			const log = path.join(DIR, `restart-${Date.now()}.log`);
			const command = [process.execPath, SUSTAIN, "--restart"];
			if (dry_run) return JSON.stringify({ dry_run: true, command, log });
			const fd = fs.openSync(log, "a");
			const child = spawn(command[0], command.slice(1), { detached: true, stdio: ["ignore", fd, fd], windowsHide: true });
			child.unref();
			return JSON.stringify({ started: true, pid: child.pid, log });
		}),

	tool("pause_dispatch",
		"Stop the dispatcher and the assistant from spawning new agents, by creating the `dispatch.off` file."
		+ " Agents already running are not touched. Safe to call twice. Returns the new state.",
		{},
		() => {
			fs.mkdirSync(DIR, { recursive: true });
			if (!fs.existsSync(OFF)) fs.writeFileSync(OFF, "paused\n");
			return state();
		}),

	tool("resume_dispatch",
		"Let the dispatcher and the assistant spawn agents again, by deleting the `dispatch.off` file."
		+ " Safe to call twice. Returns the new state.",
		{},
		() => {
			fs.rmSync(OFF, { force: true });
			return state();
		})
]; }
