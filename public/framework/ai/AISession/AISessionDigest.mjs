// AISessionDigest.mjs: one raw Claude SDK transcript, boiled down by plain Node (no AI). Node only.
// It measures the transcript before and after stripping tool calls, tool results and thinking, keeps the owner's prompts and the final result,
// and re-counts the tokens and dollars from the transcript's own `usage` fields (one count per message.id, the LAST line of a message wins).
// The price table and the rule are AISession's / AISessionAudit's; this is a third, independent pass so a reconcile can disagree.
// Detail: sessions/2026/10/16/voice-20261016/past-work/round4.md and doc/digest.md (beside this file).
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { price_for } from "./AISessionAudit.mjs";

// machine pipeline calls (dictation cleaners, judges): not a real session
const MACHINE = /^(You clean up|Read this numbered|Current outline|The prompt, one numbered|You are cleaning|Turn this outline|These sentences|You judge|You are reading prompts|Call the SendMessage)/;
// text a harness or Servex injects into the user turn: not the owner's words
const NOISE = /^(This session is being continued|\[Request interrupted|Stop hook feedback|\[Image|\[Servex|<task|<command-|<local-command|Caveat:|Base directory for this skill|\[from: (?!owner)|Current outline|The user hasn't heard|Original image)/i;
const BRIEF = /^(Where you are|You are |Load the |Your brief)/;   // a Servex-written brief: not the owner typing
const EDIT = /^(Edit|Write|MultiEdit|NotebookEdit)$/;
const chars_of = c => typeof c === "string" ? c.length : Array.isArray(c) ? c.reduce((n, b) => n + chars_of(b?.text ?? b?.content ?? ""), 0) : 0;

export class AISessionDigest {
	static ROOT = path.join(os.homedir(), ".claude", "projects");
	static CHARS_PER_TOKEN = 2.9;    // measured round 2: the one ratio every size here uses

	/** Every main transcript modified in the last `days` days (0 = all): [{ file, id, mtime }]. Subagent files live under <id>/subagents/ and are read with their parent. */
	static files(days = 0){
		const out = [], since = days ? Date.now() - days * 864e5 : 0;
		for (const d of fs.readdirSync(this.ROOT)){
			const dir = path.join(this.ROOT, d); let es; try { es = fs.readdirSync(dir); } catch { continue; }
			for (const f of es) if (f.endsWith(".jsonl")){ const file = path.join(dir, f), st = fs.statSync(file); if (st.mtimeMs >= since) out.push({ file, id: f.slice(0, -6), mtime: st.mtimeMs }); }
		}
		return out;
	}

	/** The digest of every real (non-machine) session from the last `days` days. */
	static all(days = 3){ return this.files(days).map(f => new AISessionDigest(f.file, f.mtime).read()).filter(d => !d.machine); }

	constructor(file, mtime = 0){
		this.head = ""; this.file = file; this.id = path.basename(file, ".jsonl"); this.mtime = mtime;
		this.raw_bytes = 0; this.machine = false; this.first = ""; this.last = "";
		this.chars = { owner: 0, brief: 0, assistant: 0, thinking: 0, tool_use: 0, tool_result: 0 };   // content characters by kind; the envelope (ids, usage, paths) is raw_bytes minus their sum
		this.usage = { main: this.zero(), sub: this.zero(), subfiles: 0 };
		this.models = {}; this.prompts = []; this.result = ""; this.agent = ""; this.task = ""; this.edited = [];
	}
	zero(){ return { messages: 0, input: 0, output: 0, cache_read: 0, cache_write: 0, w5: 0, w1: 0, usd: 0 }; }

	read(){
		const text = fs.readFileSync(this.file, "utf8"); this.raw_bytes = Buffer.byteLength(text);
		this.scan(text, this.usage.main, true);
		const subdir = path.join(path.dirname(this.file), this.id, "subagents");
		let subs = []; try { subs = fs.readdirSync(subdir).filter(f => f.endsWith(".jsonl")); } catch {}
		for (const f of subs){ this.scan(fs.readFileSync(path.join(subdir, f), "utf8"), this.usage.sub, false); this.usage.subfiles++; }
		return this;
	}

	scan(text, bucket, main){
		const rows = [], last_line = new Map();
		for (const line of text.split("\n")){
			if (line.charCodeAt(0) !== 123) continue;
			let o; try { o = JSON.parse(line); } catch { continue; }
			if (o.type === "assistant" && o.message?.usage) last_line.set(o.message.id || o.uuid, rows.length);
			rows.push(o);
		}
		rows.forEach((o, i) => {
			if (main && o.timestamp){ this.first ||= o.timestamp; this.last = o.timestamp; }
			const m = o.message; if (!m) return; const c = m.content;
			if (o.type === "user" && main){
				if (typeof c !== "string" && !Array.isArray(c)) return;
				const blocks = typeof c === "string" ? [{ type: "text", text: c }] : c;
				for (const b of blocks){
					if (b.type === "tool_result"){ this.chars.tool_result += chars_of(b.content); continue; }
					if (b.type !== "text") continue;
					let t = b.text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").trim();
					if (!t) continue;
					if (!this.head) this.head = t;
					if (NOISE.test(t)) continue;
					const ag = t.match(/^\[You are Servex agent ([^\].\s]+)/); if (ag) this.agent ||= ag[1];
					if (BRIEF.test(t) || ag){ this.chars.brief += t.length; this.task ||= (t.replace(/\s+/g, " ").match(/public\/framework\/ai\/sessions\/\d{4}\/\d\d\/\d\d\/[\w.-]+(?:\/[\w.-]+)*/) || [""])[0]; continue; }
					this.chars.owner += t.length; this.prompts.push({ at: o.timestamp, t });
				}
			} else if (o.type === "assistant"){
				if (Array.isArray(c) && main){
					for (const b of c){
						if (b.type === "text") { this.chars.assistant += b.text.length; if (b.text.trim()) this.result = b.text.trim(); }
						else if (b.type === "thinking") this.chars.thinking += (b.thinking || "").length;
						else if (b.type === "tool_use"){ this.chars.tool_use += JSON.stringify(b.input ?? {}).length; if (EDIT.test(b.name) && b.input?.file_path) this.edited.push(String(b.input.file_path).replace(/\\/g, "/").replace(/^.*?(?:monorepo|worktrees\/[^/]+)\//, "")); }
					}
				}
				const u = m.usage; if (!u || m.model === "<synthetic>" || last_line.get(m.id || o.uuid) !== i) return;
				const model = (m.model || "unknown").replace(/-\d{8}$/, ""), p = price_for(model);
				const w5 = u.cache_creation?.ephemeral_5m_input_tokens ?? 0, w1 = u.cache_creation ? (u.cache_creation.ephemeral_1h_input_tokens ?? 0) : (u.cache_creation_input_tokens || 0);
				const usd = ((u.input_tokens || 0) * p.in + (u.output_tokens || 0) * p.out + (u.cache_read_input_tokens || 0) * p.cache_read + w5 * p.cache_write_5m + w1 * p.cache_write_1h) / 1e6;
				bucket.messages++; bucket.input += u.input_tokens || 0; bucket.output += u.output_tokens || 0; bucket.cache_read += u.cache_read_input_tokens || 0; bucket.cache_write += w5 + w1; bucket.w5 += w5; bucket.w1 += w1; bucket.usd += usd;
				this.models[model] = (this.models[model] || 0) + 1;
			}
		});
		if (main && MACHINE.test(this.head || "")) this.machine = true;
	}

	/** Sizes in tokens: the raw file, its content blocks only (tool calls and results kept), and the stripped text (owner words + the assistant's own text). */
	sizes(){
		const k = this.constructor.CHARS_PER_TOKEN, c = this.chars, t = n => Math.round(n / k);
		const content = c.owner + c.brief + c.assistant + c.thinking + c.tool_use + c.tool_result, stripped = c.owner + c.brief + c.assistant;
		return { raw: t(this.raw_bytes), content: t(content), stripped: t(stripped), owner_only: t(c.owner) };
	}
	usd(){ return this.usage.main.usd + this.usage.sub.usd; }
	tokens(){ const a = this.usage.main, b = this.usage.sub; return { input: a.input + b.input, output: a.output + b.output, cache_read: a.cache_read + b.cache_read, cache_write: a.cache_write + b.cache_write, w5: a.w5 + b.w5, w1: a.w1 + b.w1 }; }

	/** The small thing written beside the session: no tool bodies, no thinking. */
	toJSON(){
		const r = n => Math.round(n * 1e6) / 1e6;
		return { id: this.id, first: this.first, last: this.last, agent: this.agent || undefined, task: this.task || undefined, models: this.models, sizes: this.sizes(), usd: r(this.usd()), usd_main: r(this.usage.main.usd), usd_sub: r(this.usage.sub.usd), tokens: this.tokens(), messages: this.usage.main.messages + this.usage.sub.messages, subagent_files: this.usage.subfiles,
			prompts: this.prompts.map(p => ({ at: p.at, t: p.t.length > 1200 ? p.t.slice(0, 900) + " … " + p.t.slice(-250) : p.t })), result: this.result.length > 1500 ? this.result.slice(0, 1500) + " …" : this.result, edited: [...new Set(this.edited)] };
	}

	static quantiles(a, qs = [.1, .5, .9, .99]){ const s = [...a].sort((x, y) => x - y); return Object.fromEntries(qs.map(q => ["p" + Math.round(q * 100), s[Math.min(s.length - 1, Math.floor(s.length * q))] ?? 0]).concat([["max", s.at(-1) ?? 0]])); }
}
