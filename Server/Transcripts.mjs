// Server/Transcripts.mjs — condense raw Claude SDK transcripts into a factual essence.jsonl beside each task's task.jsonl. No LLM calls.
// Doc: Server/doc/transcripts.md. Join key: task.jsonl line 1 `assign.session_id` == the transcript file name (SessionIndex reads both).
//   node Server/Transcripts.mjs [--all (with --grep: agent briefs too)] [--since YYYY-MM-DD] [--limit N] [--dry-run] [--session <uuid>] [--grep <regex>] [--force]
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import SessionIndex from "./SessionIndex.mjs";

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESSIONS = path.join(REPO, "public", "framework", "ai", "sessions");

export default class Transcripts {

	/** $ per million tokens. VERIFY: fitted on 2026-10-16 against the `cost-state` records in the transcripts themselves (those are the real numbers; this table is only the fallback). */
	static PRICES = {
		"claude-haiku-4-5": { in: 1, out: 5, read: 0.1, write5m: 1.25, write1h: 2 },
		"claude-haiku-5-5": { in: 4, out: 20, read: 0.2, write5m: 5, write1h: 8 },
		"claude-sonnet-5": { in: 1.9, out: 9.5, read: 0.19, write5m: 2.4, write1h: 3.8 },
		"claude-sonnet-5-5": { in: 2.5, out: 12.5, read: 0.25, write5m: 3.1, write1h: 5 },
		"claude-opus-5-5": { in: 4, out: 20, read: 0.2, write5m: 5, write1h: 8 },
		"default": { in: 4, out: 20, read: 0.2, write5m: 5, write1h: 8 },
	};

	static TEXT_CAP = 600;       // assistant text per block
	static PROMPT_CAP = 8000;    // a prompt past this is cut (the owner's own prompts are far shorter)
	static OTHER_CAP = 2000;     // agent briefs and system notices: kept shorter than the owner words
	static CMD_CAP = 200;

	/** Who wrote a prompt: "owner" (typed in VS Code, or relayed by the voice agent as "[from: owner"), "system" (task notifications, schedules), else "agent" (a dispatcher or parent brief). */
	static who(text, o) {
		if (o.turnOrigin === "human" || text.startsWith("[from: owner")) return "owner";
		if (o.turnOrigin === "task_notification" || o.turnOrigin === "scheduled" || o.promptSource === "system") return "system";
		return "agent";
	}
	static FILE_TOOLS = new Set(["Read", "Edit", "Write", "MultiEdit"]);
	static WRITE_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);
	static SEARCH_TOOLS = new Set(["Glob", "Grep"]);

	static price(model) {
		const P = Transcripts.PRICES, key = Object.keys(P).filter(k => k !== "default").sort((a, b) => b.length - a.length).find(k => String(model).startsWith(k));
		return P[key] ?? P.default;
	}

	static cost(model, u) {
		const p = Transcripts.price(model), w1 = u.cache_1h ?? 0, w5 = (u.cache_creation ?? 0) - w1;
		return (u.input * p.in + u.output * p.out + u.cache_read * p.read + w5 * p.write5m + w1 * p.write1h) / 1e6;
	}

	/** A repo-relative path with worktree and monorepo prefixes stripped, or null if it is outside the repo. */
	static rel(p) {
		let s = String(p ?? "").replace(/\\/g, "/");
		if (!/^[A-Za-z]:|^\//.test(s)) return s.replace(/^\.\//, "");
		const m = s.match(/^.*?\/(?:monorepo|worktrees\/[^/]+)\/(.*)$/i);
		if (!m) return null;
		return m[1].replace(/^\.claude\/worktrees\/[^/]+\//, "");
	}

	/** Prompt text with the dispatcher's readme dump cut off (it is a copy of readmes, not the ask). */
	static clean_prompt(text) {
		let pre = 0;
		if (text.startsWith("Where you are: readmes from")) {
			const i = text.indexOf("[You are Servex agent");
			if (i > 0) { pre = i; text = text.slice(i); }
		}
		return { text, pre };
	}

	/** Stream one transcript into { summary, events }. */
	static async condense(file, session, task) {
		const events = [], seen = new Set();
		const msgs = new Map();                               // message.id -> { model, usage } (a message is written once per content block; usage repeats)
		const tools = {}, edited = {}, read = {}, dirs = {};
		let owner_prompts = 0, cwd = "", first = "", last = "", prompts = 0, cost_state = null, branch = "", preamble = 0;
		const add_prompt = (at, text, src, o = {}) => {
			const c = Transcripts.clean_prompt(text); text = c.text.trim(); if (!text) return;
			const key = text.slice(0, 300); if (seen.has(key)) return; seen.add(key);
			preamble ||= c.pre; prompts++;
			const from = Transcripts.who(text, o), cap = from === "owner" ? Transcripts.PROMPT_CAP : Transcripts.OTHER_CAP;
			if (from === "owner") owner_prompts++;
			const e = { at, k: "prompt", from, src, text: text.slice(0, cap) };
			if (text.length > cap) { e.truncated = true; e.len = text.length; }
			events.push(e);
		};
		let raw_bytes = 0;
		try { raw_bytes = fs.statSync(file).size; } catch {}
		for await (const line of readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity })) {
			if (!line.startsWith("{")) continue;
			let o; try { o = JSON.parse(line); } catch { continue; }
			const at = o.timestamp ?? "";
			if (at) { first ||= at; if (at > last) last = at; }
			if (o.cwd && !cwd) cwd = o.cwd;
			if (o.gitBranch && !branch) branch = o.gitBranch;
			if (o.type === "user" && !o.isMeta) {
				const c = o.message?.content;
				const text = typeof c === "string" ? c : Array.isArray(c) ? c.filter(b => b.type === "text").map(b => b.text).join("\n") : "";
				if (text && !/^<local-command-|^<command-(name|message|args)>/.test(text)) add_prompt(at, text, "user", o);
			} else if (o.type === "attachment" && o.attachment?.type === "queued_command" && typeof o.attachment.prompt === "string") {
				add_prompt(at, o.attachment.prompt, "queued", {});
			} else if (o.type === "cost-state") {
				cost_state = o;
			} else if (o.type === "assistant" && o.message) {
				const m = o.message, id = m.id ?? o.uuid;
				const u = m.usage;
				if (u && m.model !== "<synthetic>") {
					const rec = { model: m.model, input: u.input_tokens ?? 0, output: u.output_tokens ?? 0, cache_creation: u.cache_creation_input_tokens ?? 0, cache_read: u.cache_read_input_tokens ?? 0, cache_1h: u.cache_creation?.ephemeral_1h_input_tokens ?? 0 };
					const old = msgs.get(id); if (!old || rec.output >= old.output) msgs.set(id, rec);
				}
				for (const b of Array.isArray(m.content) ? m.content : []) {
					if (b.type === "text" && b.text?.trim()) {
						const e = { at, k: "say", text: b.text.trim().slice(0, Transcripts.TEXT_CAP) };
						if (b.text.trim().length > Transcripts.TEXT_CAP) e.truncated = true;
						events.push(e);
					} else if (b.type === "tool_use") {
						const name = b.name, i = b.input ?? {};
						tools[name] = (tools[name] ?? 0) + 1;
						let e = null, p = null;
						if (Transcripts.FILE_TOOLS.has(name)) { p = i.file_path ?? i.path; e = { at, k: "tool", tool: name, path: p }; }
						else if (Transcripts.SEARCH_TOOLS.has(name)) { p = i.path; e = { at, k: "tool", tool: name, path: i.path ?? "", pattern: String(i.pattern ?? "").slice(0, 120) }; }
						else if (name === "Bash") e = { at, k: "tool", tool: "Bash", cmd: String(i.command ?? "").slice(0, Transcripts.CMD_CAP) };
						if (e) events.push(e);
						if (p) {
							const r = Transcripts.rel(p);
							if (r != null) {
								const mod = SessionIndex.module_of(r), d = path.posix.dirname(r.replace(/\/+$/, "") + (Transcripts.SEARCH_TOOLS.has(name) ? "/x" : ""));
								dirs[d] = (dirs[d] ?? 0) + 1;
								if (mod) { const bucket = Transcripts.WRITE_TOOLS.has(name) ? edited : read; bucket[mod] = (bucket[mod] ?? 0) + 1; }
							}
						}
					}
				}
			}
		}
		// usage, summed by model over unique messages
		const by_model = {};
		for (const r of msgs.values()) {
			const t = by_model[r.model] ??= { turns: 0, input: 0, output: 0, cache_creation: 0, cache_read: 0, cache_1h: 0, est_usd: 0 };
			t.turns++; t.input += r.input; t.output += r.output; t.cache_creation += r.cache_creation; t.cache_read += r.cache_read; t.cache_1h += r.cache_1h;
			t.est_usd += Transcripts.cost(r.model, r);
		}
		for (const t of Object.values(by_model)) t.est_usd = +t.est_usd.toFixed(4);
		const est_usd = +Object.values(by_model).reduce((a, t) => a + t.est_usd, 0).toFixed(4);
		const recorded = cost_state ? { usd: +(cost_state.totalCostUSD ?? 0).toFixed(4), by_model: Object.fromEntries(Object.entries(cost_state.modelUsage ?? {}).map(([k, v]) => [k, +(v.costUSD ?? 0).toFixed(4)])) } : null;
		const top = (o, n) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n));
		const summary = {
			session_id: session, task, cwd, branch, models: Object.keys(by_model), first, last,
			prompts, owner_prompts, assistant_turns: msgs.size, preamble_chars: preamble || undefined,
			raw_bytes, essence_bytes: 0, est_tokens_raw: Math.round(raw_bytes / 4), est_tokens_essence: 0,
			modules_edited: top(edited, 20), modules_read: top(read, 20), dirs: top(dirs, 15), tools: top(tools, 20),
			usage: by_model, est_usd, recorded_usd: recorded?.usd ?? null, recorded_by_model: recorded?.by_model ?? null,
			price_table: "verify",
		};
		return { summary, events };
	}

	/** The JSONL text of an essence: summary line first; sizes patched in so they describe the file itself. */
	static render(summary, events) {
		const body = events.map(e => JSON.stringify(e)).join("\n");
		let head = JSON.stringify({ summary }), size = 0;
		for (let n = 0; n < 4; n++) {                                   // sizes are digits inside the text they measure: iterate until stable
			summary.essence_bytes = size; summary.est_tokens_essence = Math.round(size / 4);
			head = JSON.stringify({ summary });
			const next = Buffer.byteLength(head + "\n" + body + "\n");
			if (next === size) break; size = next;
		}
		return head + "\n" + body + "\n";
	}

	/** session id -> task dir (repo-relative), from every task.jsonl under ai/sessions (first assign wins). */
	static task_map() {
		const map = new Map(), walk = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents) {
				const p = path.join(dir, e.name);
				if (e.isDirectory()) walk(p);
				else if (e.name === "task.jsonl") {
					try {
						const fd = fs.openSync(p, "r"), buf = Buffer.alloc(16384), n = fs.readSync(fd, buf, 0, buf.length, 0); fs.closeSync(fd);
						for (const l of buf.toString("utf8", 0, n).split("\n").slice(0, 3)) {
							const sid = l.startsWith("{") && (() => { try { return JSON.parse(l).assign?.session_id; } catch { return null; } })();
							if (sid) { if (!map.has(sid)) map.set(sid, path.relative(REPO, dir).replace(/\\/g, "/")); break; }
						}
					} catch {}
				}
			}
		};
		walk(SESSIONS);
		return map;
	}

	/** First real user text of a transcript (stops reading early). */
	static async first_prompt(file) {
		const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
		try {
			for await (const line of rl) {
				if (!line.startsWith('{"parentUuid"') && !line.includes('"type":"user"')) continue;
				let o; try { o = JSON.parse(line); } catch { continue; }
				if (o.type !== "user" || o.isMeta) continue;
				const c = o.message?.content;
				const t = typeof c === "string" ? c : Array.isArray(c) ? c.filter(b => b.type === "text").map(b => b.text).join("\n") : "";
				if (t) return t;
			}
		} finally { rl.close(); }
		return "";
	}

	static median(a) { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

	/** --grep: the owner's prompts in every essence.jsonl already written. */
	static grep(pattern, all = false) {
		const re = new RegExp(pattern, "i"), hits = [];
		const walk = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents) {
				const p = path.join(dir, e.name);
				if (e.isDirectory()) walk(p);
				else if (e.name === "essence.jsonl") {
					const lines = fs.readFileSync(p, "utf8").split("\n"); let sum = null;
					for (const l of lines) {
						if (!l.startsWith("{")) continue; let o; try { o = JSON.parse(l); } catch { continue; }
						if (o.summary) { sum = o.summary; continue; }
						if (o.k !== "prompt" || (!all && o.from !== "owner")) continue;
						for (const t of o.text.split("\n")) if (re.test(t)) { hits.push({ at: o.at, session: sum?.session_id, task: path.relative(REPO, path.dirname(p)).replace(/\\/g, "/"), line: t.trim().slice(0, 240) }); break; }
					}
				}
			}
		};
		walk(SESSIONS);
		return hits.sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
	}

	static arg(argv, name) { const i = argv.indexOf(name); return i < 0 ? null : (argv[i + 1] ?? true); }

	static async main(argv) {
		const grep = Transcripts.arg(argv, "--grep");
		if (grep) {
			const hits = Transcripts.grep(grep, argv.includes("--all"));
			for (const h of hits) console.log(`${(h.at ?? "").slice(0, 10)}  ${h.session?.slice(0, 8) ?? "?"}  ${h.task}\n    ${h.line}`);
			console.log(`\n${hits.length} prompt(s) match /${grep}/i`);
			return;
		}
		const dry = argv.includes("--dry-run"), force = argv.includes("--force"), only = Transcripts.arg(argv, "--session"), limit = +Transcripts.arg(argv, "--limit") || Infinity;
		const sinceArg = Transcripts.arg(argv, "--since");
		const since = sinceArg ? Date.parse(sinceArg + "T00:00:00") : Date.now() - 2 * 864e5;
		const tasks = Transcripts.task_map(), files = [];
		for (const [id, p] of SessionIndex.transcripts()) {
			if (only && id !== only) continue;
			let st; try { st = fs.statSync(p); } catch { continue; }
			if (!only && st.mtimeMs < since) continue;
			files.push({ id, p, mtime: st.mtimeMs, size: st.size });
		}
		files.sort((a, b) => b.mtime - a.mtime);
		const withTask = files.filter(f => tasks.has(f.id)), without = files.filter(f => !tasks.has(f.id));
		let tests = 0, other = 0;
		const prefixes = {};
		for (const f of without) {
			const fp = await Transcripts.first_prompt(f.p);
			if (fp.startsWith("Current outline")) tests++;
			else { other++; const k = fp.slice(0, 40).replace(/\s+/g, " "); prefixes[k] = (prefixes[k] ?? 0) + 1; }
		}
		const rows = [];
		let done = 0, skipped = 0;
		for (const f of withTask) {
			if (done >= limit) break;
			const task = tasks.get(f.id), out = path.join(REPO, task, "essence.jsonl");
			if (!force && !dry) {
				try {
					const head = fs.readFileSync(out, "utf8").split("\n", 1)[0], s = JSON.parse(head).summary;
					if (s.raw_bytes === f.size) { skipped++; continue; }
				} catch {}
			}
			const { summary, events } = await Transcripts.condense(f.p, f.id, task);
			const text = Transcripts.render(summary, events);
			if (!dry) fs.writeFileSync(out, text);
			rows.push(summary); done++;
			console.log(`${dry ? "dry " : "wrote"} ${f.id.slice(0, 8)}  ${(summary.raw_bytes / 1024).toFixed(0).padStart(6)} KB -> ${(summary.essence_bytes / 1024).toFixed(1).padStart(6)} KB  ~${summary.est_tokens_raw}->${summary.est_tokens_essence} tok  $${summary.recorded_usd ?? summary.est_usd}  ${task.replace(/^public\/framework\/ai\/sessions\//, "")}`);
		}
		const kb = n => +(n / 1024).toFixed(1), sum = (a, f) => a.reduce((x, r) => x + f(r), 0);
		const cost_by_model = {};
		for (const r of rows) for (const [m, usd] of Object.entries(r.recorded_by_model ?? Object.fromEntries(Object.entries(r.usage).map(([k, v]) => [k, v.est_usd])))) cost_by_model[m] = +((cost_by_model[m] ?? 0) + usd).toFixed(2);
		const report = {
			since: new Date(since).toISOString().slice(0, 10), transcripts_in_range: files.length, with_task_folder: withTask.length, without_task_folder: without.length,
			without_refine_dictate_tests: tests, without_other: other,
			without_other_top_first_prompts: Object.fromEntries(Object.entries(prefixes).sort((a, b) => b[1] - a[1]).slice(0, 6)), processed: rows.length, skipped_unchanged: skipped,
			raw_kb_median: kb(Transcripts.median(rows.map(r => r.raw_bytes))), raw_kb_max: kb(Math.max(0, ...rows.map(r => r.raw_bytes))),
			essence_kb_median: kb(Transcripts.median(rows.map(r => r.essence_bytes))), essence_kb_max: kb(Math.max(0, ...rows.map(r => r.essence_bytes))),
			raw_mb_total: +(sum(rows, r => r.raw_bytes) / 1048576).toFixed(1), essence_mb_total: +(sum(rows, r => r.essence_bytes) / 1048576).toFixed(2),
			essence_under_50k_tokens: rows.filter(r => r.est_tokens_essence < 50000).length, raw_under_50k_tokens: rows.filter(r => r.est_tokens_raw < 50000).length,
			cost_usd_by_model: cost_by_model, cost_usd_total: +Object.values(cost_by_model).reduce((a, b) => a + b, 0).toFixed(2),
			cost_source: "recorded cost-state where present, else price-table estimate",
		};
		console.log("\n" + JSON.stringify(report, null, 1));
		return report;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	await Transcripts.main(process.argv.slice(2));
	process.exit(0);
}
