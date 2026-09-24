import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { agents as singleton } from "./Agents.js";

/* JOBS — background work done by node, answered later as a message.
 *
 * An agent calls `start_job({kind, args, from})` and gets `{job_id}` back at
 * once, so its turn can end and it stays free to answer the owner, a child's
 * wake, a sibling. Node does the work (read, grep, watch, check — or one cheap
 * no-tools model call, `decide`). When it is done:
 *
 *  - the FULL result goes to the `job-<n>` log through `host.store()`, Servex's
 *    single writer — never into anybody's context;
 *  - a live caller gets ONE message, `done: <≤300 chars> · full: <path>`, through
 *    its own `.send()` — the same door a child's wake uses;
 *  - a caller that is not a live agent (a VS Code tab) asks `job_result`.
 *
 * A job never writes repo files, never starts a job, never starts an agent.
 * Design and the rung table: doc/jobs.md. Proof: jobs-proof.mjs. */

const REPO = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const SUMMARY = 300;
const RESULT_CAP = 8000;         // what job_result hands back inline; the file has it all
const DECIDE_MODEL = "claude-sonnet-5";

const tool = (name, description, properties, required, handler) => {
	const inputSchema = { type: "object", required, properties };
	return { name, description, inputSchema, schema: inputSchema, handler };
};

/* Resolve a path against the job's base dir, and refuse a filesystem root —
 * a grep or glob of `/` or `C:\` is the machine-melting scan we never run. */
const within = (base, p = ".") => {
	const abs = path.resolve(base, p);
	if (path.parse(abs).root === abs) throw new Error(`Refusing a filesystem root ("${abs}"). Name a directory inside the repo.`);
	return abs;
};

const list = v => v == null ? [] : Array.isArray(v) ? v : [v];
const clip = (s, n) => s.length > n ? s.slice(0, n - 1) + "…" : s;

const skip = d => /^(node_modules|\.git)$/.test(path.basename(String(d?.name ?? d)));

/* files: exact paths; glob: patterns (node's own fs.promises.glob), both under `base`. */
async function gather(base, { files, glob }){
	const out = list(files).map(f => within(base, f));
	for (const pattern of list(glob))
		for await (const f of fs.promises.glob(pattern, { cwd: base, exclude: skip }))
			out.push(path.resolve(base, f));
	return [...new Set(out)];
}

/* ── the kinds. Each takes (args, ctx) and resolves {summary, result}. ── */

export const kinds = {

	/* Sizes, line counts, the lines matching `find`; the full text only with `full`. */
	async read(args, { base }){
		const paths = await gather(base, args);
		if (!paths.length) throw new Error("read: name `files` or a `glob`.");
		const find = args.find ? new RegExp(args.find, args.flags ?? "") : null;
		const cap = args.cap ?? 20000;
		const files = [];
		for (const p of paths){
			let text;
			try { text = await fs.promises.readFile(p, "utf8"); }
			catch (e){ files.push({ path: p, error: e.code || e.message }); continue; }
			const lines = text.split("\n");
			const row = { path: p, bytes: Buffer.byteLength(text), lines: lines.length };
			if (find) row.matches = lines.flatMap((t, i) => find.test(t) ? [{ line: i + 1, text: clip(t, 300) }] : []).slice(0, 200);
			if (args.full) row.text = clip(text, cap);
			files.push(row);
		}
		const hits = files.reduce((n, f) => n + (f.matches?.length ?? 0), 0);
		const bytes = files.reduce((n, f) => n + (f.bytes ?? 0), 0);
		const bad = files.filter(f => f.error).length;
		return { ok: bad === 0, result: { files },
			summary: `read ${files.length} file(s), ${bytes} bytes`
				+ (find ? `, ${hits} line(s) match /${args.find}/` : "")
				+ (bad ? `, ${bad} unreadable` : "")
				+ (find && hits ? `. First: ${files.find(f => f.matches?.length).matches[0].text}` : "") };
	},

	/* ripgrep in `dir` (never a root); a node walk when rg is not on PATH. */
	async grep(args, { base }){
		if (!args.pattern) throw new Error("grep: `pattern` is required.");
		const dir = within(base, args.dir ?? ".");
		const max = args.max ?? 500;
		let hits, via = "rg";
		try { hits = await rg(args, dir, max); }
		catch (e){ if (e.code !== "ENOENT") throw e; via = "node"; hits = await walk(args, dir, max); }
		const files = new Set(hits.map(h => h.file)).size;
		return { ok: true, result: { via, dir, pattern: args.pattern, hits },
			summary: `grep /${args.pattern}/ in ${dir} (${via}): ${hits.length}${hits.length >= max ? "+" : ""} hit(s) in ${files} file(s)`
				+ (hits[0] ? `. First: ${path.relative(dir, hits[0].file)}:${hits[0].line} ${hits[0].text.trim()}` : "") };
	},

	/* Follow a file until `pattern` appears in NEW text (or anywhere, with
	 * `from_start`), or until `timeout_s`. Not finding it is a result, not an error. */
	async watch(args, { base }){
		if (!args.file || !args.pattern) throw new Error("watch: `file` and `pattern` are required.");
		const file = within(base, args.file);
		const re = new RegExp(args.pattern, args.flags ?? "");
		const timeout = Math.min(args.timeout_s ?? 60, 1800) * 1000;
		const size = () => { try { return fs.statSync(file).size; } catch { return 0; } };
		let at = args.from_start ? 0 : size(), carry = "";
		const t0 = Date.now();
		let settled = false, timer = null;
		return new Promise(resolve => {
			const done = v => { settled = true; clearInterval(timer); resolve(v); };
			const tick = () => {
				const end = size();
				if (end < at) at = 0;                       // truncated or rotated: start over
				if (end > at){
					const fd = fs.openSync(file, "r");
					const buf = Buffer.alloc(end - at);
					fs.readSync(fd, buf, 0, buf.length, at); fs.closeSync(fd);
					at = end;
					const lines = (carry + buf.toString("utf8")).split("\n");
					carry = lines.pop();
					const hit = lines.find(l => re.test(l)) ?? (re.test(carry) ? carry : null);
					if (hit != null){ clearInterval(timer); return done({ ok: true,
						result: { file, matched: true, line: hit, waited_ms: Date.now() - t0 },
						summary: `watch: /${args.pattern}/ appeared in ${path.basename(file)} after ${Date.now() - t0} ms: ${hit.trim()}` }); }
				}
				if (Date.now() - t0 >= timeout){ clearInterval(timer); done({ ok: false,
					result: { file, matched: false, waited_ms: Date.now() - t0 },
					summary: `watch: /${args.pattern}/ did NOT appear in ${path.basename(file)} within ${timeout / 1000} s` }); }
			};
			tick();
			if (!settled) timer = setInterval(tick, args.every_ms ?? 250);
		});
	},

	/* `node --check` on each file, in parallel. Page loads are NOT done here:
	 * Playwright is a global module, not a Servex dependency, and a headless
	 * browser per check is heavy — probe.mjs / the site MCP `shot` do that. */
	async check(args, { base }){
		const paths = await gather(base, args);
		if (!paths.length) throw new Error("check: name `files` or a `glob`.");
		const files = await Promise.all(paths.map(p => new Promise(done => {
			const child = spawn(process.execPath, ["--check", p], { windowsHide: true });
			let err = "";
			child.stderr.on("data", d => err += d);
			child.on("close", code => done({ path: p, ok: code === 0, ...(code ? { error: clip(err.trim(), 2000) } : {}) }));
			child.on("error", e => done({ path: p, ok: false, error: e.message }));
		})));
		const bad = files.filter(f => !f.ok);
		return { ok: !bad.length, result: { files, pages: "not loaded — node --check only" },
			summary: bad.length
				? `check: ${bad.length} of ${files.length} file(s) FAIL node --check. First: ${path.basename(bad[0].path)} — ${bad[0].error.split("\n").find(l => /Error/.test(l)) ?? bad[0].error.split("\n")[0]}`
				: `check: all ${files.length} file(s) pass node --check (no page loads)` };
	},

	/* The little decision: node gathers the text, then ONE Sonnet call with no
	 * tools, no setting sources, a one-line system prompt. It cannot wander,
	 * cannot recurse. */
	async decide(args, { base, run_query = query }){
		if (!args.question) throw new Error("decide: `question` is required.");
		const paths = await gather(base, args);
		const cap = args.cap ?? 60000;
		let facts = "";
		for (const p of paths){
			let text; try { text = await fs.promises.readFile(p, "utf8"); } catch (e){ text = `(unreadable: ${e.code})`; }
			facts += `\n\n===== ${path.relative(base, p)} =====\n${text}`;
		}
		facts = clip(facts, cap);
		const prompt = `${args.question}${facts ? `\n\nThe facts, gathered for you:${facts}` : ""}`;
		const t0 = Date.now();
		let answer = "", usage = null, cost = null, sdk_ms = null;
		for await (const m of run_query({ prompt, options: {
			/* The minimal config measured on model-latency (823-token prefix): without
			 * strictMcpConfig the user's claude.ai connectors and skills still load and
			 * the prefix is ~51k tokens — $0.21 instead of about a cent. */
			model: args.model ?? DECIDE_MODEL, tools: [], mcpServers: {}, strictMcpConfig: true, skills: [],
			settingSources: [], maxTurns: 1, persistSession: false, cwd: base,
			extraArgs: { "disable-slash-commands": null },
			systemPrompt: "Answer the question from the facts given, briefly and directly; lead with the answer."
		} })){
			if (m.type === "result"){ answer = m.result ?? answer; usage = m.usage; cost = m.total_cost_usd; sdk_ms = m.duration_ms; }
			else if (m.type === "assistant") answer = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || answer;
		}
		const u = usage ?? {};
		const tokens = { input: u.input_tokens ?? 0, output: u.output_tokens ?? 0,
			cache_read: u.cache_read_input_tokens ?? 0, cache_write: u.cache_creation_input_tokens ?? 0 };
		return { ok: !!answer, result: { question: args.question, files: paths, answer, usage: tokens, cost_usd: cost, model_ms: Date.now() - t0, sdk_ms },
			summary: `decide: ${answer.trim().replace(/\s+/g, " ")}` };
	}
};

/* rg with MSYS path conversion off — a pattern starting with "/" is otherwise
 * rewritten into a Windows path by git-bash and silently finds nothing. */
function rg({ pattern, glob, flags }, dir, max){
	return new Promise((done, fail) => {
		const argv = ["-n", "--no-heading", "--with-filename", "--color", "never", "-m", "50",
			...(flags?.includes("i") ? ["-i"] : []), ...list(glob).flatMap(g => ["-g", g]), "-e", pattern, dir];
		const child = spawn("rg", argv, { windowsHide: true, env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
		const hits = []; let buf = "", err = "";
		child.stdout.on("data", d => {
			buf += d; const lines = buf.split("\n"); buf = lines.pop();
			for (const l of lines){
				const m = /^(.*?):(\d+):(.*)$/.exec(l.replace(/\r$/, ""));
				if (m && hits.length < max) hits.push({ file: m[1], line: +m[2], text: clip(m[3], 300) });
				if (hits.length >= max) child.kill();
			}
		});
		child.stderr.on("data", d => err += d);
		child.on("error", fail);
		child.on("close", code => code > 1 && hits.length < max ? fail(new Error(`rg: ${err.trim()}`)) : done(hits));
	});
}

async function walk({ pattern, glob, flags }, dir, max){
	const re = new RegExp(pattern, flags ?? "");
	const hits = [];
	const files = glob ? await gather(dir, { glob }) : [];
	if (!glob) for await (const f of fs.promises.glob("**/*", { cwd: dir, exclude: skip })) files.push(path.resolve(dir, f));
	for (const f of files){
		let text;
		try { if (!fs.statSync(f).isFile() || fs.statSync(f).size > 2e6) continue; text = await fs.promises.readFile(f, "utf8"); } catch { continue; }
		const lines = text.split("\n");
		for (let i = 0; i < lines.length && hits.length < max; i++) if (re.test(lines[i])) hits.push({ file: f, line: i + 1, text: clip(lines[i], 300) });
		if (hits.length >= max) break;
	}
	return hits;
}

/* ── the runner: a per-host job table, numbered past what is already on disk. ── */

function table(host){
	if (host.jobs) return host.jobs;
	let n = 0;
	try { for (const name of host.store().names()) { const m = /^job-(\d+)$/.exec(name); if (m) n = Math.max(n, +m[1]); } } catch {}
	return host.jobs = { n, all: new Map() };
}

export function start_job(host, { kind, args = {}, from, base } = {}, ctx = {}){
	if (!kinds[kind]) throw new Error(`Unknown job kind "${kind}". Kinds: ${Object.keys(kinds).join(", ")}.`);
	const jobs = table(host);
	const id = `job-${++jobs.n}`;
	const job = { id, kind, from, state: "running", started: Date.now() };
	job.done = (async () => {
		if (from) host.store().append(`agent-${from}`, { agent: from, type: "job", state: "started", job: id, kind }).catch(() => {});
		let out;
		try { out = await kinds[kind](args, { base: base ?? REPO, ...ctx }); }
		catch (e){ out = { ok: false, summary: `${kind} failed: ${e.message}`, result: { error: e.message } }; }
		const ms = Date.now() - job.started;
		const file = host.store().file(id).path;
		await host.store().append(id, { type: "job", job: id, kind, from: from ?? null, args, ok: out.ok, ms, summary: out.summary, result: out.result }).catch(() => {});
		Object.assign(job, { state: "done", ok: out.ok, ms, summary: clip(out.summary, SUMMARY), result: out.result, file });
		if (from){
			host.store().append(`agent-${from}`, { agent: from, type: "job", state: "done", job: id, kind, ms, ok: out.ok }).catch(() => {});
			const live = host.live?.get(from);
			if (live?.send && live.state !== "stopped"){
				try { live.send(`${out.ok ? "done" : "failed"}: ${job.summary} · full: ${file}`, { from: id, reply_to: `log agent-${from}` }); job.delivered = true; }
				catch {}
			}
		}
		return job;
	})();
	jobs.all.set(id, job);
	return { job_id: id };
}

export async function job_result(host, { job_id, wait_s = 0 } = {}){
	const job = table(host).all.get(job_id);
	if (!job){
		// Not in this process (Servex restarted): the log still has it.
		const [row] = (await host.store().tail(job_id, 1).catch(() => [])) ?? [];
		if (!row) throw new Error(`No job "${job_id}".`);
		return { job_id, state: "done", ok: row.ok, ms: row.ms, summary: clip(row.summary, SUMMARY), file: host.store().file(job_id).path, result: row.result };
	}
	if (job.state !== "done" && wait_s > 0)
		await Promise.race([job.done, new Promise(r => setTimeout(r, Math.min(wait_s, 600) * 1000))]);
	if (job.state !== "done") return { job_id, state: "running", kind: job.kind, running_ms: Date.now() - job.started };
	return { job_id, state: "done", kind: job.kind, ok: job.ok, ms: job.ms, summary: job.summary, file: job.file, result: job.result };
}

/* The two MCP tools, the same shape `tools(host)` returns. */
export function job_tools(host = singleton){ return [

	tool("start_job",
		"Hand background work to Servex's node process and get `{job_id}` back at once, so your turn can end."
		+ " When it finishes, a live agent named in `from` gets ONE message (≤300 chars + the full result's file path);"
		+ " anyone else calls `job_result`. Kinds: read {files|glob, find?, full?} · grep {pattern, dir, glob?}"
		+ " · watch {file, pattern, timeout_s?} · check {files|glob} (node --check) · decide {question, files?} (one no-tools Sonnet call).",
		{
			kind: { type: "string", enum: Object.keys(kinds), description: "read | grep | watch | check | decide" },
			args: { type: "object", description: "The kind's arguments (see the tool description). Paths resolve against the repo root." },
			from: { type: "string", description: "Your agent id, so the answer comes to you as a message and the job shows in your log. Leave out from a VS Code tab." }
		},
		["kind"],
		({ kind, args, from }) => JSON.stringify(start_job(host, { kind, args, from }))),

	tool("job_result",
		"A job's result: `running`, or `done` with its summary, the full-result file, and the result (capped)."
		+ " `wait_s` waits up to that long for it to finish first.",
		{
			job_id: { type: "string", description: "The id start_job gave you, e.g. `job-7`." },
			wait_s: { type: "number", description: "Seconds to wait for a running job (max 600). Default 0." }
		},
		["job_id"],
		async ({ job_id, wait_s }) => clip(JSON.stringify(await job_result(host, { job_id, wait_s }), null, 1), RESULT_CAP))
]; }

export default job_tools;
