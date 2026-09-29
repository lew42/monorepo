/* `node Server/clarity.mjs landing <task dir>` or `node Server/clarity.mjs proposal <file>`
 * Wakes the clarity agent (.claude/skills/clarity/) on one target: a fresh Sonnet at medium effort,
 * spawned INSIDE Servex (spawn_agent over its loopback /mcp), so it runs hidden and never bloats.
 * `look ai2` (from .git/hooks/post-merge) shoots the whole AI 2 dashboard as the owner sees it.
 * A proposal waits until the file has been quiet for a minute. The same target is not
 * re-checked within 30 minutes. Off switch: CLARITY=off, or a file `.claude/skills/clarity/off`.
 * It then waits for the agent's one turn and stops it, so nothing idles.
 * Every outcome, including "not run", is one line in .claude/skills/clarity/flags.jsonl. Never throws. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const dir = path.join(root, ".claude/skills/clarity");
const log = path.join(dir, "flags.jsonl");
const MCP = "http://127.0.0.1:8090/mcp";
const [kind, arg] = process.argv.slice(2);

const rel = p => path.relative(root, path.resolve(p)).replaceAll("\\", "/");
const note = o => { try { fs.appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), ...o }) + "\n"); } catch {} };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main(){
	if (!["landing", "proposal", "look"].includes(kind) || !arg) return;
	if (process.env.CLARITY === "off" || fs.existsSync(path.join(dir, "off"))) return;
	const target = kind === "look" ? "look:" + arg : rel(arg);
	if (/\/clarity(\/|$)/.test(target)) return;                 // never check itself

	const recent = fs.existsSync(log) && fs.readFileSync(log, "utf8").split("\n").some(l => {
		try { const e = JSON.parse(l); return e.target === target && Date.now() - Date.parse(e.at) < (kind === "look" ? 10 : 30) * 60000; } catch { return false; }
	});
	if (recent && process.env.CLARITY_FORCE !== "1") return;   // CLARITY_FORCE=1: re-check while refining the skill
	// ONCE PER TASK (lifecycle, 2026-09-29): a clarity agent used to be spawned for every minion
	// landing, which multiplied agents under memory pressure. A sub-task (its parent dir has a
	// task.jsonl) is checked with its parent; a task whose log already has a clarity line is skipped.
	if (kind === "landing") {
		const own = path.join(arg, "task.jsonl");
		if (fs.existsSync(path.join(path.dirname(path.resolve(arg)), "task.jsonl"))) return note({ target, verdict: "skipped", what: "a sub-task: its parent task gets the one check" });
		try { if (fs.readFileSync(own, "utf8").includes('"clarity: ')) return note({ target, verdict: "skipped", what: "this task already had its clarity check" }); } catch {}
		try { fs.appendFileSync(own, JSON.stringify({ log: { at: new Date().toISOString(), msg: "clarity: queued (once per task)" } }) + "\n"); } catch {}
	}
	note({ target, verdict: "queued", kind });
	// Wait while the machine is under strain (Servex's monitor flag), at most an hour.
	for (let i = 0; i < 60; i++) {
		let flag = null;
		try { flag = (await (await fetch(MCP.replace("/mcp", "/api/system"), { signal: AbortSignal.timeout(3000) })).json()).flag; } catch {}
		if (!flag) break;
		await sleep(60000);
	}
	if (kind === "proposal") {                                   // let the writer finish
		for (let i = 0; i < 10; i++) {
			const age = Date.now() - fs.statSync(arg).mtimeMs;
			if (age > 60000) break;
			await sleep(60000 - age + 1000);
		}
	}

	const slug = kind === "look" ? "look-" + arg : path.basename(kind === "landing" ? arg : path.dirname(arg)).replace(/[^a-z0-9-]+/gi, "-").slice(0, 30);
	let pages = [];
	if (kind === "landing") try {
		const lines = fs.readFileSync(path.join(arg, "task.jsonl"), "utf8");
		const out = String(lines.split("\n").map(l => { try { return JSON.parse(l); } catch { return {}; } }).filter(e => e.assign?.landed_at).pop()?.assign?.outcome || "");
		pages = [...out.matchAll(/\]\((\/framework\/[^)\s#?]*\/)\)/g)].map(m => m[1]);
		if (/framework\/ai2\//.test(lines)) pages.unshift("/framework/ai2/");
		pages = [...new Set(pages)].slice(0, 5);
	} catch {}
	const prompt = kind === "look"
		? `Load the \`clarity\` skill and run only its "Look at it as the owner would" section on AI 2, just after a merge changed it: the rail at http://monorepo.localhost/framework/ai2/, the three cards at the top of the rail, and one card marked done. Repo root: ${root.replaceAll("\\", "/")}. One pass, then stop.`
		: `Load the \`clarity\` skill, then check this ${kind === "landing" ? "landed task" : "proposal"}: ${target}. `
		+ `Repo root: ${root.replaceAll("\\", "/")}. One pass, then stop.`
		+ (pages.length ? ` Pages it changed, to look at as the owner would (host http://monorepo.localhost): ${pages.join(" ")}.` : "")
		+ (kind === "proposal" && target.endsWith("todo.md") ? " Check only the entries changed most recently (git diff on the file)." : "");
	const body = { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "spawn_agent", arguments: {
		role: "clarity", name: slug, prompt, model: "claude-sonnet-5", effort: "medium",
		permission_mode: "bypassPermissions", cwd: root, visibility: "team"
	} } };
	try {
		const r = await fetch(MCP, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
		const j = await r.json();
		const text = j.result?.content?.[0]?.text || j.error?.message || "";
		const id = (() => { try { return JSON.parse(text).id; } catch { return null; } })();
		note({ target, verdict: id ? "spawned" : "not run", to: id, what: id ? undefined : text.slice(0, 200) });
		if (id) {   // one pass: wait for its turn to end, then stop it, so no idle session holds memory
			const call = (name, args, ms) => fetch(MCP, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }), signal: AbortSignal.timeout(ms) });
			try { await call("wait_for_agent", { id, timeout_s: 900 }, 910000); } catch {}
			try { await call("stop_agent", { id }, 20000); } catch {}
		}
	} catch (e) {
		note({ target, verdict: "not run", what: "Servex unreachable: " + String(e?.message || e).slice(0, 150) });
	}
}
main().catch(() => {}).finally(() => { process.exitCode = 0; });
