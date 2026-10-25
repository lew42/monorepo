#!/usr/bin/env node
// SessionIdentity: is one Claude session really one session, in its transcripts, its folders, its cost and its children?
//   node Server/SessionIdentity.mjs <session id> [--print] [--out <file>]
// Read-only on every record. Answers as one JSON object: transcripts, folders, cost, chain, children, ok, problems.
// Doc: public/framework/core/Session/doc/identity.md; the tracking page shows it: public/framework/ai/tracking/readme.md.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO = path.resolve(process.env.TRACKING_ROOT || path.join(HERE, ".."));
const r4 = n => Math.round(n * 1e4) / 1e4;
const MSG_ID = /"id":"(msg_[A-Za-z0-9_]+)"/;

export default class SessionIdentity {
	constructor({ repo = DEFAULT_REPO, projects, sessions, registry, logs } = {}){
		const servex = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".local", "share"), "lew42", "servex");
		this.projects = projects ?? path.join(os.homedir(), ".claude", "projects");
		this.sessions = sessions ?? path.join(repo, "public", "framework", "ai", "sessions");
		this.registry = registry ?? path.join(servex, "registry.json");
		this.logs = logs ?? path.join(servex, "logs");
	}

	/** Every transcript of the id: [{path, dir, subagent}] — `<id>.jsonl` in each project dir, and `<id>/subagents/*.jsonl` beside it. */
	transcript_files(id){
		const out = [];
		let dirs = []; try { dirs = fs.readdirSync(this.projects, { withFileTypes: true }).filter(d => d.isDirectory()); } catch {}
		for (const d of dirs){
			const dir = path.join(this.projects, d.name), main = path.join(dir, id + ".jsonl");
			if (fs.existsSync(main)) out.push({ path: main, dir, subagent: false });
			const sub = path.join(dir, id, "subagents");
			let files = []; try { files = fs.readdirSync(sub).filter(f => f.endsWith(".jsonl")); } catch {}
			for (const f of files) out.push({ path: path.join(sub, f), dir, subagent: true });
		}
		return out;
	}

	/** One streaming pass over a transcript: id counts, repeated uuids, compactions, assistant message ids, first timestamp. */
	async scan_transcript(file, id){
		const stat = fs.statSync(file.path);
		const r = { path: file.path, bytes: stat.size, lines: 0, own_lines: 0, foreign_ids: {}, duplicate_uuids: 0, compactions: 0, ids_after_compaction: [], message_ids: new Set(), first_at: null };
		const seen = new Set(), after = new Set();
		let compacted = false;
		const rl = readline.createInterface({ input: fs.createReadStream(file.path, { encoding: "utf8" }), crlfDelay: Infinity });
		for await (const line of rl){
			if (!line) continue;
			r.lines++;
			let j; try { j = JSON.parse(line); } catch { continue; }
			if (j.sessionId){
				if (j.sessionId === id) r.own_lines++; else r.foreign_ids[j.sessionId] = (r.foreign_ids[j.sessionId] ?? 0) + 1;
				if (compacted) after.add(j.sessionId);
			}
			if (j.uuid){ if (seen.has(j.uuid)) r.duplicate_uuids++; else seen.add(j.uuid); }
			if (j.type === "system" && j.subtype === "compact_boundary"){ r.compactions++; compacted = true; }
			if (j.type === "assistant" && j.message?.id) r.message_ids.add(j.message.id);
			if (!r.first_at && j.timestamp) r.first_at = Date.parse(j.timestamp) || null;
		}
		r.ids_after_compaction = [...after];
		return r;
	}

	/** Every dated folder for the id: sessions/YYYY/MM/DD/session-<first 8> or the full uuid. */
	folders_of(id){
		const out = [], names = new Set([`session-${id.slice(0, 8)}`, id]);
		const kids = dir => { try { return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch { return []; } };
		for (const y of kids(this.sessions)) if (/^\d{4}$/.test(y))
			for (const m of kids(path.join(this.sessions, y))) for (const d of kids(path.join(this.sessions, y, m))) for (const n of kids(path.join(this.sessions, y, m, d)))
				if (names.has(n)) out.push({ dir: path.join(this.sessions, y, m, d, n), day: `${y}/${m}/${d}`, name: n });
		return out;
	}

	/** The newest {"summary"} line of a folder's cache.jsonl. */
	cache_summary(folder){
		let text; try { text = fs.readFileSync(path.join(folder, "cache.jsonl"), "utf8"); } catch { return null; }
		let found = null;
		for (const line of text.split("\n")){ if (!line.includes('"summary"')) continue; try { const j = JSON.parse(line); if (j.summary) found = j.summary; } catch {} }
		return found;
	}

	cache_usd_of(id){
		let best = null;
		for (const f of this.folders_of(id)){ const s = this.cache_summary(f.dir); if (s && (!best || String(s.last_at ?? "") >= String(best.last_at ?? ""))) best = s; }
		return best ? r4(best.usd ?? 0) : null;
	}

	/** Assistant message ids of other transcripts in the same project dir, modified since `since`, that this session also holds. */
	async shared_messages(main, own_ids, since){
		const shared = new Set(), files = new Set();
		let names = []; try { names = fs.readdirSync(main.dir).filter(f => f.endsWith(".jsonl")); } catch {}
		for (const n of names){
			const p = path.join(main.dir, n);
			if (p === main.path) continue;
			let st; try { st = fs.statSync(p); } catch { continue; }
			if (since && st.mtimeMs < since) continue;
			const rl = readline.createInterface({ input: fs.createReadStream(p, { encoding: "utf8" }), crlfDelay: Infinity });
			for await (const line of rl){
				if (!line.includes('"type":"assistant"')) continue;
				const m = MSG_ID.exec(line);
				if (m && own_ids.has(m[1])){ shared.add(m[1]); files.add(n); }
			}
		}
		return { count: shared.size, files: [...files] };
	}

	async chain_of(id){
		let registry = {}; try { registry = JSON.parse(fs.readFileSync(this.registry, "utf8")); } catch {}
		const rows = Object.values(registry).filter(r => r.session_id === id);
		if (!rows.length) return { rows: [], chain: null, registry };
		const { turn_costs } = await import(pathToFileURL(path.join(HERE, "..", "Servex", "agents", "turn-costs.js")).href);
		const chain = [];
		for (const row of rows){
			let text; try { text = fs.readFileSync(path.join(this.logs, `agent-${row.id}.jsonl`), "utf8"); } catch { continue; }
			const { turns } = turn_costs(text, { openrouter: row.provider === "openrouter" || row.spec?.provider === "openrouter" });
			const by = new Map();
			for (const t of turns){
				const k = t.session ?? null, e = by.get(k) ?? by.set(k, { session: k, from: null, to: null, turns: 0, turn_usd: 0 }).get(k);
				const at = t.line.at ?? null;
				if (at){ if (!e.from || at < e.from) e.from = at; if (!e.to || at > e.to) e.to = at; }
				e.turns++; e.turn_usd += t.cost;
			}
			for (const e of by.values()) chain.push({ agent: row.id, ...e, turn_usd: r4(e.turn_usd), transcript_usd: e.session ? this.cache_usd_of(e.session) : null });
		}
		chain.sort((a, b) => String(a.from).localeCompare(String(b.from)));
		return { rows, chain, registry };
	}

	/** The folder url ("/framework/...") of a task dir on disk. */
	static url_of(dir){
		const norm = String(dir).replace(/\\/g, "/").replace(/\/$/, ""), i = norm.indexOf("/public/");
		return i < 0 ? null : norm.slice(i + 7) + "/";
	}

	/** Task urls a record file lists: `{"task": url}` and `{"sessions":[{"task": url}]}`. */
	task_urls(dir){
		const urls = new Set();
		for (const n of ["session.jsonl", "task.jsonl"]){
			let text; try { text = fs.readFileSync(path.join(dir, n), "utf8"); } catch { continue; }
			for (const line of text.split("\n")){
				if (!line.includes('"task"')) continue;
				try { const j = JSON.parse(line); if (typeof j.task === "string") urls.add(j.task); for (const s of j.sessions ?? []) if (typeof s?.task === "string") urls.add(s.task); } catch {}
			}
		}
		return urls;
	}

	children_of(id, folders, registry){
		const rows = Object.values(registry).filter(r => r.parent_session === id);
		const folder_urls = folders.map(f => SessionIdentity.url_of(f.dir)).filter(Boolean);
		const listed = new Set(folders.flatMap(f => [...this.task_urls(f.dir)]));
		const children = rows.map(r => {
			const url = r.task_dir ? SessionIdentity.url_of(r.task_dir) : null;
			let linked = false, why = null;
			if (!url) why = "no task_dir";
			else {
				if (folder_urls.some(u => url.startsWith(u))) linked = true;
				else {
					const above = new Set(listed);
					for (let d = path.dirname(String(r.task_dir)); SessionIdentity.url_of(d) && d !== path.dirname(d); d = path.dirname(d)) for (const u of this.task_urls(d)) above.add(u);
					linked = [...above].some(u => url === u || url.startsWith(u));
					if (!linked) why = "not listed in the parent's record or any record above it";
				}
			}
			return { id: r.id, session_id: r.session_id ?? null, task_dir: r.task_dir ?? null, linked, ...(why ? { why } : {}) };
		});
		return { children, unlinked: children.filter(c => !c.linked).length };
	}

	async check(id){
		const problems = [];
		const files = this.transcript_files(id), scans = [];
		for (const f of files) scans.push({ f, scan: await this.scan_transcript(f, id) });
		const transcripts = scans.map(({ scan: s }) => ({
			path: s.path, bytes: s.bytes, lines: s.lines, own_lines: s.own_lines, foreign_ids: s.foreign_ids, duplicate_uuids: s.duplicate_uuids,
			compactions: s.compactions, ids_after_compaction: s.ids_after_compaction,
		}));
		if (!files.length) problems.push("No transcript file was found for this id.");
		for (const t of transcripts){
			const n = Object.keys(t.foreign_ids).length;
			if (n) problems.push(`${path.basename(t.path)} carries ${n} other session id${n === 1 ? "" : "s"} on its lines: ${Object.entries(t.foreign_ids).map(([k, v]) => `${k.slice(0, 8)} (${v})`).join(", ")}.`);
			if (t.compactions && !(t.ids_after_compaction.length === 1 && t.ids_after_compaction[0] === id)) problems.push(`${path.basename(t.path)}: after a compaction its ids are [${t.ids_after_compaction.map(x => x.slice(0, 8)).join(", ")}], not just this session.`);
		}

		const folders = this.folders_of(id).map(f => ({ day: f.day, name: f.name, path: f.dir }));
		const split = folders.length > 1;
		if (split) problems.push(`The session has ${folders.length} dated folders (${folders.map(f => f.day).join(", ")}).`);

		const cache_usd = this.cache_usd_of(id);
		let recount_usd = null;
		if (scans.length){
			const { cost_of_transcript } = await import(pathToFileURL(path.join(HERE, "..", "public", "framework", "ai", "AISession", "AISessionAudit.mjs")).href);
			recount_usd = r4(scans.reduce((n, { f }) => n + cost_of_transcript(f.path).total_usd, 0));
		}
		const agree = cache_usd != null && recount_usd != null && Math.abs(cache_usd - recount_usd) <= Math.max(0.005, 0.005 * Math.max(cache_usd, recount_usd));
		if (cache_usd == null) problems.push("No cache.jsonl summary was found for the session's folder.");
		else if (recount_usd != null && !agree) problems.push(`The stored cost $${cache_usd} and an independent recount $${recount_usd} differ by more than 0.5%.`);

		let shared = { count: 0, files: [] };
		const main = scans.find(({ f }) => !f.subagent);
		if (main){
			const own_ids = new Set(scans.flatMap(({ scan: s }) => [...s.message_ids]));
			shared = await this.shared_messages(main.f, own_ids, main.scan.first_at);
			if (shared.count) problems.push(`${shared.count} assistant message${shared.count === 1 ? "" : "s"} also appear in ${shared.files.length} other transcript${shared.files.length === 1 ? "" : "s"} (${shared.files.slice(0, 3).join(", ")}), so a resumed or forked copy may double-count.`);
		}

		const { chain, registry } = await this.chain_of(id);
		const { children, unlinked } = this.children_of(id, this.folders_of(id), registry);
		if (unlinked) problems.push(`${unlinked} child session${unlinked === 1 ? " is" : "s are"} not linked from the parent's record (${children.filter(c => !c.linked).slice(0, 3).map(c => c.id).join(", ")}).`);

		return {
			id, transcripts, folders: { list: folders, split },
			cost: { cache_usd, recount_usd, agree, shared_messages: shared },
			chain, children: { list: children, unlinked },
			ok: problems.length === 0, problems,
		};
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), id = argv.find(a => /^[0-9a-f]{8}-/.test(a));
	if (!id){ console.error("usage: node Server/SessionIdentity.mjs <session id> [--print] [--out <file>]"); process.exit(2); }
	const out_i = argv.indexOf("--out"), t0 = Date.now();
	const result = await new SessionIdentity().check(id);
	if (out_i >= 0) fs.writeFileSync(argv[out_i + 1], JSON.stringify(result, null, 1));
	if (argv.includes("--print")) console.log(JSON.stringify(result, null, 1));
	else console.log(`${id.slice(0, 8)} ${result.ok ? "ok" : result.problems.length + " problem(s)"}: cache $${result.cost.cache_usd}, recount $${result.cost.recount_usd}, ${result.folders.list.length} folder(s), ${((Date.now() - t0) / 1000).toFixed(1)} s\n` + result.problems.map(p => "  - " + p).join("\n"));
}
