/* Server/council.mjs — The Feedback Council collector and runner.
 *
 * Gathers the owner's words since the last run from `.claude/prompts/<day>.jsonl`
 * and AI 2 card `page.jsonl` files (filtering out Servex agent sessions), writes
 * `words.jsonl` to the run directory, and manages the council evaluation loop.
 *
 * Usage:
 *   node Server/council.mjs collect [dir]   # Gathers words since last run into words.jsonl
 *   node Server/council.mjs maybe           # Called by on-landing: checks 10 landings / 24h rhythm
 *   node Server/council.mjs run [dir]       # Collects words and spawns council mastermind
 *   node Server/council.mjs merge <dir>     # Merges votes/*.json into ai/council/asks.jsonl
 *
 * Off switch: public/framework/ai/council/off, or env COUNCIL=off. Never throws.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import TaskDirs from "./TaskDirs.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const councilDir = path.join(root, "public/framework/ai/council");
const asksFile = path.join(councilDir, "asks.jsonl");
const offFile = path.join(councilDir, "off");
const MCP = "http://127.0.0.1:8090/mcp";

const [cmd, argDir] = process.argv.slice(2);

// run folders live in the sessions store (ai/doc/task-folders.md), never the retired ai/YYYY-MM-DD/ day folder
const storeDir = slug => TaskDirs.dir({ slug });
const now = () => {
	const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`;
};

/** Get the latest run ID and ISO timestamp from asks.jsonl */
export function lastRunInfo() {
	let lastRunAt = "2026-09-25T16:00:00-05:00";
	let lastRunId = "2026-09-25/feedback-council";
	if (fs.existsSync(asksFile)) {
		try {
			const lines = fs.readFileSync(asksFile, "utf8").split("\n").filter(Boolean);
			for (const l of lines) {
				try {
					const a = JSON.parse(l).ask;
					if (a?.at && a.at > lastRunAt) lastRunAt = a.at;
					if (a?.run) lastRunId = a.run;
				} catch {}
			}
		} catch {}
	}
	return { lastRunAt, lastRunId };
}

/** Gather known Servex agent session IDs to filter out relay/agent-to-agent prompts */
export async function getKnownAgentSessions() {
	const sessions = new Set();
	// 1. Live Servex agents
	try {
		const r = await fetch("http://127.0.0.1:8090/api/agents", { signal: AbortSignal.timeout(3000) });
		const agents = await r.json();
		if (Array.isArray(agents)) {
			for (const a of agents) {
				if (a.id) sessions.add(a.id);
				if (a.session_id) sessions.add(a.session_id);
			}
		}
	} catch {}

	// 2. Lifecycle logs outside repo
	try {
		const lp = path.join(process.env.LOCALAPPDATA || "", "lew42/servex/logs/lifecycle.jsonl");
		if (fs.existsSync(lp)) {
			const lines = fs.readFileSync(lp, "utf8").split("\n").filter(Boolean);
			for (const l of lines) {
				try {
					const e = JSON.parse(l);
					if (e.id) sessions.add(e.id);
					if (e.session_id) sessions.add(e.session_id);
				} catch {}
			}
		}
	} catch {}

	// 3. Scan recent task.jsonl files
	function walkTasks(dir) {
		let res = [];
		try {
			for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
				const p = path.join(dir, f.name);
				if (f.isDirectory()) res.push(...walkTasks(p));
				else if (f.name === "task.jsonl") res.push(p);
			}
		} catch {}
		return res;
	}

	const taskFiles = walkTasks(path.join(root, "public/framework/ai"));
	for (const tf of taskFiles) {
		try {
			const lines = fs.readFileSync(tf, "utf8").split("\n").filter(Boolean);
			for (const l of lines) {
				try {
					const obj = JSON.parse(l);
					if (obj.assign?.session_id) sessions.add(obj.assign.session_id);
					if (obj.action?.session_id) sessions.add(obj.action.session_id);
				} catch {}
			}
		} catch {}
	}

	return sessions;
}

/** Check if a prompt event was genuinely spoken/written by the owner */
export function isOwnerPrompt(p, agentSessions, sinceAt) {
	if (!p) return false;
	if (p.author !== "owner" && p.by !== "owner") return false;
	if (p.at && sinceAt && p.at <= sinceAt) return false;
	if (p.session_id && agentSessions.has(p.session_id)) return false;

	const text = String(p.text || p.raw || "").trim();
	if (!text) return false;

	// Drop Servex agent system prompts and agent relay headers
	if (text.startsWith("[You are Servex agent") || text.startsWith("[You are an assistant")) return false;
	if (text.startsWith("[from: ") && !text.startsWith("[from: owner")) return false;
	if (text.includes("You are checking whether a landed task actually did what the owner asked")) return false;
	if (text.startsWith("Load the `clarity` skill")) return false;
	if (text.startsWith("You were stopped last night before landing.")) return false;
	if (text.startsWith("You are on duty. The next message will be the owner's words.")) return false;
	if (/^Card \d{4}\/\d{2}\/\d{2}.*— its whole log/i.test(text)) return false;
	// the Whisper sample clip the voice walk scripts feed as the mic (JFK); 2026-10-12 it ran 8 empty passes
	if (/ask not what your country can do for you/i.test(text)) return false;

	return true;
}

/** Collect all owner words since the last run and write to words.jsonl */
export async function collect(targetDir) {
	const { lastRunAt, lastRunId } = lastRunInfo();
	const outDir = targetDir || storeDir("feedback-council");
	fs.mkdirSync(outDir, { recursive: true });

	const agentSessions = await getKnownAgentSessions();
	const gathered = [];

	// 1. Scan .claude/prompts/<day>.jsonl
	const promptDir = path.join(root, ".claude/prompts");
	if (fs.existsSync(promptDir)) {
		const files = fs.readdirSync(promptDir).filter(f => f.endsWith(".jsonl")).sort();
		for (const f of files) {
			const fp = path.join(promptDir, f);
			try {
				const lines = fs.readFileSync(fp, "utf8").split("\n").filter(Boolean);
				for (const l of lines) {
					try {
						const e = JSON.parse(l);
						if (isOwnerPrompt(e.prompt, agentSessions, lastRunAt)) {
							gathered.push({
								source: `.claude/prompts/${f}`,
								at: e.prompt.at,
								session_id: e.prompt.session_id || null,
								text: String(e.prompt.text || e.prompt.raw || "").trim()
							});
						}
					} catch {}
				}
			} catch {}
		}
	}

	// 2. Scan AI 2 card page.jsonl files
	function walk(dir) {
		let res = [];
		try {
			for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
				const p = path.join(dir, f.name);
				if (f.isDirectory()) res.push(...walk(p));
				else if (f.name === "page.jsonl") res.push(p);
			}
		} catch {}
		return res;
	}

	const cardFiles = [
		...walk(path.join(root, "public/framework/ai")),
		...walk(path.join(root, "public/framework/ai2"))
	];

	for (const cf of cardFiles) {
		try {
			const lines = fs.readFileSync(cf, "utf8").split("\n").filter(Boolean);
			for (const l of lines) {
				try {
					const obj = JSON.parse(l);
					if (isOwnerPrompt(obj.prompt, agentSessions, lastRunAt)) {
						const relPath = path.relative(root, cf).replaceAll("\\", "/");
						gathered.push({
							source: relPath,
							at: obj.prompt.at,
							session_id: obj.prompt.session_id || null,
							card: obj.prompt.on || null,
							text: String(obj.prompt.text || obj.prompt.raw || "").trim()
						});
					}
				} catch {}
			}
		} catch {}
	}

	// Sort chronologically
	gathered.sort((a, b) => (a.at || "").localeCompare(b.at || ""));

	// Write words.jsonl
	const wordsFile = path.join(outDir, "words.jsonl");
	const content = gathered.map(g => JSON.stringify(g)).join("\n") + (gathered.length ? "\n" : "");
	fs.writeFileSync(wordsFile, content, "utf8");

	// Ensure standing requirements.md exists in outDir
	const reqFile = path.join(outDir, "requirements.md");
	const sourceReq = path.join(councilDir, "requirements.md");
	if (!fs.existsSync(reqFile) && fs.existsSync(sourceReq)) {
		fs.copyFileSync(sourceReq, reqFile);
	}

	return {
		outDir,
		wordsFile,
		count: gathered.length,
		lastRunId,
		lastRunAt
	};
}

/** Count tasks landed since lastRunAt */
export function countLandingsSince(sinceAt) {
	let landings = 0;
	function walkTasks(dir) {
		let res = [];
		try {
			for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
				const p = path.join(dir, f.name);
				if (f.isDirectory()) res.push(...walkTasks(p));
				else if (f.name === "task.jsonl") res.push(p);
			}
		} catch {}
		return res;
	}
	const tasks = walkTasks(path.join(root, "public/framework/ai"));
	for (const t of tasks) {
		try {
			const lines = fs.readFileSync(t, "utf8").split("\n").filter(Boolean);
			for (const l of lines) {
				try {
					const obj = JSON.parse(l);
					const landed = obj.assign?.landed_at;
					if (landed && (!sinceAt || landed > sinceAt)) {
						landings++;
						break;
					}
				} catch {}
			}
		} catch {}
	}
	return landings;
}

/** Check rhythm: 10 landings since last run, or 24 hours with at least 1 landing */
export async function maybeRun() {
	if (process.env.COUNCIL === "off" || fs.existsSync(offFile)) {
		return { ran: false, why: "council off switch active" };
	}

	const { lastRunAt, lastRunId } = lastRunInfo();
	const landings = countLandingsSince(lastRunAt);
	const hoursSince = (Date.now() - Date.parse(lastRunAt)) / (3600 * 1000);

	const shouldRun = landings >= 10 || (hoursSince >= 24 && landings >= 1);
	if (!shouldRun) {
		return { ran: false, landings, hoursSince, lastRunId, why: `landings=${landings}/10, hours=${hoursSince.toFixed(1)}/24` };
	}

	return await runCouncil();
}

/** Run the full council loop */
export async function runCouncil(targetDir) {
	const outDir = targetDir || storeDir("feedback-council");
	fs.mkdirSync(outDir, { recursive: true });

	const col = await collect(outDir);
	// no new owner words = nothing to check; it spawned 13 empty passes on 2026-10-12
	if (!col.count && !targetDir) return { ran: false, why: "no new owner words", wordsCount: 0 };

	// Initialize task.jsonl in run directory if not present
	const taskPath = path.join(outDir, "task.jsonl");
	if (!fs.existsSync(taskPath)) {
		const init = JSON.stringify({
			assign: {
				session_id: `task-mastermind-council-${now().slice(0, 10)}`,
				group: "system-design",
				request: "Feedback council: checkers verify asks against live site, record verdicts, append to asks.jsonl",
				requested_at: now(),
				model: "claude-sonnet-5-5",
				words_gathered: col.count,
				now: "words collected, preparing checkers"
			}
		}) + "\n";
		fs.writeFileSync(taskPath, init, "utf8");
	}

	// Try spawning mastermind via Servex MCP if Servex is up
	let spawned = false;
	try {
		const prompt = `Load the standing brief public/framework/ai/council/requirements.md. Check the words in ${col.wordsFile.replaceAll("\\", "/")}, turn new words into asks, and verify open asks against http://monorepo.localhost. Repo root: ${root.replaceAll("\\", "/")}.`;
		const body = {
			jsonrpc: "2.0", id: 1, method: "tools/call",
			params: {
				name: "spawn_agent",
				arguments: {
					role: "task-mastermind",
					name: "feedback-council",
					prompt,
					model: "claude-sonnet-5-5",
					effort: "medium",
					permission_mode: "bypassPermissions",
					cwd: root,
					visibility: "team"
				}
			}
		};
		const r = await fetch(MCP, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(15000)
		});
		if (r.ok) {
			const j = await r.json();
			spawned = Boolean(j.result);
		}
	} catch {}

	return {
		ran: true,
		outDir,
		wordsCount: col.count,
		spawned
	};
}

/** Merge votes/<name>.json files in a run directory into asks.jsonl */
export function mergeVotes(runDir) {
	const votesDir = path.join(runDir, "votes");
	if (!fs.existsSync(votesDir)) return { count: 0, why: "no votes directory found" };

	const voteFiles = fs.readdirSync(votesDir).filter(f => f.endsWith(".json"));
	if (!voteFiles.length) return { count: 0, why: "no vote files found" };

	// Read existing asks
	const existingAsks = new Map();
	if (fs.existsSync(asksFile)) {
		for (const l of fs.readFileSync(asksFile, "utf8").split("\n").filter(Boolean)) {
			try {
				const a = JSON.parse(l).ask;
				if (a?.id) existingAsks.set(a.id, a);
			} catch {}
		}
	}

	// Aggregate votes
	const aggregated = new Map();
	for (const vf of voteFiles) {
		try {
			const data = JSON.parse(fs.readFileSync(path.join(votesDir, vf), "utf8"));
			if (data.votes) {
				for (const [id, res] of Object.entries(data.votes)) {
					if (!aggregated.has(id)) aggregated.set(id, []);
					aggregated.get(id).push(res);
				}
			}
			if (Array.isArray(data.extra)) {
				for (const ext of data.extra) {
					if (ext.ask) {
						const extraId = "X-" + ext.ask.slice(0, 20).replace(/[^a-z0-9]+/gi, "-");
						if (!aggregated.has(extraId)) aggregated.set(extraId, []);
						aggregated.get(extraId).push({ v: ext.v, e: ext.e, f: ext.f, t: ext.ask });
					}
				}
			}
		} catch {}
	}

	const runRel = path.relative(path.join(root, "public/framework/ai"), runDir).replaceAll("\\", "/");
	const appended = [];

	for (const [id, votes] of aggregated.entries()) {
		const vCounts = {};
		for (const v of votes) vCounts[v.v] = (vCounts[v.v] || 0) + 1;
		const sortedVotes = Object.entries(vCounts).sort((a, b) => b[1] - a[1]);
		const topVerdict = sortedVotes[0]?.[0] || "partly";
		const isSplit = sortedVotes.length > 1 && sortedVotes[0][1] <= (votes.length / 2);
		const voteStr = sortedVotes.map(([v, c]) => `${c} ${v}`).join(", ");
		const evidence = votes.find(v => v.e)?.e || "";
		const fix = votes.find(v => v.f)?.f || "";
		const title = votes[0]?.t || existingAsks.get(id)?.t || id;

		const askEntry = {
			ask: {
				id,
				t: title,
				verdict: topVerdict,
				votes: voteStr,
				split: isSplit,
				evidence,
				fix,
				run: runRel,
				at: now()
			}
		};
		appended.push(askEntry);
		fs.appendFileSync(asksFile, JSON.stringify(askEntry) + "\n");
	}

	return { count: appended.length, appended };
}

async function main() {
	if (cmd === "maybe") {
		const res = await maybeRun();
		console.log(JSON.stringify(res));
	} else if (cmd === "collect") {
		const res = await collect(argDir);
		console.log(`Collected ${res.count} owner words into ${res.wordsFile}`);
	} else if (cmd === "run") {
		const res = await runCouncil(argDir);
		console.log(JSON.stringify(res));
	} else if (cmd === "merge") {
		const res = mergeVotes(argDir || storeDir("feedback-council"));
		console.log(JSON.stringify(res));
	} else {
		// Default: collect preview
		const res = await collect();
		console.log(`Council status: last run was ${res.lastRunId} at ${res.lastRunAt}`);
		console.log(`Gathered ${res.count} owner words since last run into ${res.wordsFile}`);
	}
}

main().catch(() => {}).finally(() => { process.exitCode = 0; });
