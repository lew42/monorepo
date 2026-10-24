// AISession.js — one Claude session's cost, read from its raw transcript, in code (never by an LLM).
//
// WHY: a transcript is the only place per-message token counts exist, and it can be tens of MB.
// This class reads it ONCE, keeps running totals (updated per message), and saves a small summary
// (`sessions/YYYY/MM/DD/<id>/cache.jsonl`, see doc/layout.md) so a page never re-reads the raw file. Same file runs on the
// server (reads transcripts, writes the cache) and in the browser (reads the cache, renders).
//
// THE TRUTH (token-accounting + session-class findings): Anthropic's usage is repeated on EVERY
// transcript line of one API message (one line per content block). Each message counts ONCE, keyed by
// message.id. Priced this way a session matches the SDK's own `total_cost_usd` within 0.5%
// (sonnet-5, haiku-4-5); pricing each line instead overcounts about 2x.
//
// TWO CODE PATHS, ON PURPOSE: this class updates its totals incrementally (`apply_line`). The audit
// (`AISession.audit`) does NOT call that code: it re-reads the whole file with public/framework/ai/AISession/AISessionAudit.mjs
// (`cost_of_session`, its own parser and grouping) and compares. A bug in one shows up as a diff.
//
// Browser-safe: no top-level node imports. Node-only parts (`update`, `audit`, `save`) import
// node:fs lazily. Docs: sessions/doc/ui/session-class.md

const r6 = n => Math.round(n * 1e6) / 1e6;

// $ per million tokens. `verified` = checked against the SDK's own billed total on real sessions
// (public/framework/ai/sessions/2026/10/08/3f5a5fec-dbf0-4a4b-8573-560f281a0be3/session-class/fit-rates.mjs). One price table for the whole repo:
// public/framework/ai/AISession/AISessionAudit.mjs re-exports these.
const DEFAULT_MODEL = "claude-sonnet-5";
const PRICES = {
	"claude-sonnet-5":   { in: 2,  out: 10, verified: true },
	"claude-sonnet-5-5": { in: 2,  out: 10, verified: false },   // ASSUMED equal to sonnet-5: only 2 sessions measured, implied in-price 2.8-3.5
	"claude-opus-5":     { in: 5,  out: 25, verified: false },
	"claude-opus-5-5":   { in: 4,  out: 20, verified: false },   // measured implied in-price clusters near 3.5, not 4
	"claude-haiku-4-5":  { in: 1,  out: 5,  verified: true },
	"claude-haiku-5-5":  { in: 1,  out: 5,  verified: false },   // ASSUMED = haiku-4-5 (main added it 2026-10-08)
	"claude-fable-5":    { in: 10, out: 50, verified: false },
	"claude-fable-5-1":  { in: 10, out: 50, verified: false },
};
for (const p of Object.values(PRICES)){ p.cache_read = p.in * 0.1; p.cache_write_5m = p.in * 1.25; p.cache_write_1h = p.in * 2; p.cache_write = p.cache_write_1h; }

// What a model with no rate costs: nothing. It is UNPRICED, flagged on the session, never guessed from another model's rate.
const UNPRICED = { in: 0, out: 0, cache_read: 0, cache_write_5m: 0, cache_write_1h: 0, cache_write: 0, unpriced: true };

// Exact name first, then the name without a date suffix (claude-haiku-4-5-20251001), else UNPRICED (and the model is added to `unknown`).
function price_for(model, unknown){
	if (PRICES[model]) return PRICES[model];
	const bare = String(model || "").replace(/-\d{8}$/, "");
	if (PRICES[bare]) return PRICES[bare];
	if (model && model !== "<synthetic>") unknown?.add(model);
	return UNPRICED;
}

// claude-sonnet-5-5 -> "Sonnet 5.5"; claude-haiku-4-5-20251001 -> "Haiku 4.5"
function model_label(model){
	const m = /^claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?$/.exec(model || "");
	return m ? `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}${m[3] ? "." + m[3] : ""}` : (model || "unknown");
}
// Who bills a model: an OpenRouter id is "vendor/model" (google/gemini-3.8-flash); a Claude one never has a slash.
const provider_of = model => String(model || "").includes("/") ? "openrouter" : "claude";
const bare_model = m => String(m || "").replace(/-\d{8}$/, "");

const BUCKETS = ["preamble", "user", "tool_result", "assistant", "thinking", "other"];
const zero = () => Object.fromEntries(BUCKETS.map(k => [k, 0]));
const sum = o => Object.values(o).reduce((n, v) => n + v, 0);
const add_to = (a, b) => { for (const k in b) a[k] = (a[k] || 0) + b[k]; return a; };
const STATE_V = 2;                 // bump to make every cached session re-read its log once (v1 deduped with a 40-slot ring: doc/cost-accounting.md)
const ACTIVE_GAP_MS = 5 * 60000;   // a gap longer than the cache TTL is idle, not active

const PURPOSE_LABELS = {
	preamble: "System prompt, tools, CLAUDE.md, skills, memory (first call)",
	user: "Your prompts", tool_result: "Tool results (reads, greps, command output)",
	assistant: "Assistant replies and tool-call inputs", thinking: "Thinking", other: "Other (attachments, reminders, after a compaction)",
};
const PURPOSE_METHOD =
	"Estimate. The first call's whole context is the preamble (minus your first prompt, sized by chars/4). After that, each call's context growth " +
	"is exact; it is split into the previous reply (its exact output tokens, thinking from the usage detail), then new tool results / prompts / " +
	"attachments in proportion to their characters (chars/4 weights, scaled to the exact growth). Typical error: tens of percent on the split between " +
	"tool results and prompts, none on the total. Dollars follow tokens: a token pays its cache-write once, then a cache-read on every later call.";

import Session from "../../core/Session/Session.js";

export default class AISession extends Session {
	constructor(id, data){
		super(id);
		this.s = data || AISession.blank(id);
	}

	static blank(id){
		return {
			v: STATE_V, id, provider: "claude",
			cursor: {},                                   // part -> { off }  byte offset of the last complete line read
			first_at: null, last_at: null, active_ms: 0, last_main_at: null,
			messages: 0, prompts: 0, resets: 0,
			usd: 0, usd_parts: { in: 0, out: 0, cache_read: 0, cache_write: 0 },
			tokens: { input: 0, output: 0, cache_read: 0, cache_write_5m: 0, cache_write_1h: 0, cache_write_unsplit: 0 },
			sidechain: { messages: 0, usd: 0 },           // usd from in-process subagent files (inside the total)
			units: {},                                    // "model|effort" -> { model, effort, n, usd, input, output, cache_read, cache_write }
			main_models: {}, main_efforts: {},            // what the MAIN thread actually ran (for the configured-vs-actual check)
			tools: {},                                    // name -> { n, result_tokens }
			unknown_models: [],
			purpose: { tokens: zero(), usd: zero() },
			configured: null, flags: [],
			state: { seen: {}, tool_seen: {}, prev: {}, comp: {}, pend: {}, tu: {} },   // seen: every message id counted so far -> its tokens (never trimmed)
		};
	}

	// ---- the incremental path --------------------------------------------------------------

	// Apply many complete JSONL lines from one file ("main" or a subagent's id).
	apply_text(text, part = "main"){
		let n = 0;
		for (const line of text.split("\n")){
			if (!line.trim()) continue;
			let o; try { o = JSON.parse(line); } catch { continue; }
			this.apply_line(o, part); n++;
		}
		return n;
	}

	apply_line(o, part = "main"){
		const s = this.s;
		if (o.timestamp){
			const t = Date.parse(o.timestamp);
			if (t){
				if (!s.first_at || t < Date.parse(s.first_at)) s.first_at = o.timestamp;
				if (!s.last_at || t > Date.parse(s.last_at)) s.last_at = o.timestamp;
				if (part === "main"){
					if (s.last_main_at){ const gap = t - Date.parse(s.last_main_at); if (gap > 0 && gap <= ACTIVE_GAP_MS) s.active_ms += gap; }
					if (!s.last_main_at || t > Date.parse(s.last_main_at)) s.last_main_at = o.timestamp;
				}
			}
		}
		if (o.type === "custom-title" || o.type === "ai-title"){ const t = o.customTitle ?? o.aiTitle; if (t && (o.type === "custom-title" || !s.custom_title)){ s.title = t; if (o.type === "custom-title") s.custom_title = true; } return; }   // the tab title the owner sees
		if (o.type === "user") return this._user(o, part);
		if (o.type === "attachment"){ this._pend(part).other += this._chars(o.attachment); return; }
		if (o.type === "assistant" && o.message?.usage) return this._assistant(o, part);
	}

	_pend(part){ return (this.s.state.pend[part] ||= { user: 0, other: 0, tools: {} }); }

	_chars(x){
		if (x == null) return 0;
		if (typeof x === "string") return x.length;
		if (Array.isArray(x)) return x.reduce((n, b) => n + this._chars(b), 0);
		if (typeof x === "object") return typeof x.text === "string" ? x.text.length : JSON.stringify(x).length;
		return 0;
	}

	_user(o, part){
		const content = o.message?.content, pend = this._pend(part), s = this.s;
		if (typeof content === "string"){
			const real = !o.isSidechain && part === "main" && o.turnOrigin !== "task_notification" && !o.isMeta;
			if (real) s.prompts++;
			pend.user += content.length; return;
		}
		if (!Array.isArray(content)) return;
		for (const b of content){
			if (b.type === "tool_result"){
				const name = s.state.tu[b.tool_use_id] || "unknown";
				delete s.state.tu[b.tool_use_id];
				const ch = this._chars(b.content);
				pend.tools[name] = (pend.tools[name] || 0) + ch;
			} else pend.user += this._chars(b);
		}
	}

	// One API message is written as several transcript lines (one per content block), and the early
	// lines carry a PARTIAL output count: the LAST line of a message holds its final usage. So a message
	// is counted when first seen and corrected if a later line carries different numbers.
	_assistant(o, part){
		const s = this.s, m = o.message, id = m.id || o.uuid;
		if (m.model === "<synthetic>") return;
		this._blocks(m);                                     // tools are per line, not per message

		const u = m.usage, model = bare_model(m.model || "unknown");
		const cw5 = u.cache_creation?.ephemeral_5m_input_tokens, cw1 = u.cache_creation?.ephemeral_1h_input_tokens, split = cw5 != null || cw1 != null;
		const cw_total = u.cache_creation_input_tokens || 0;
		const e = { id, model, effort: o.effort ?? o.perTurnEffort ?? null, side: !!(o.isSidechain || part !== "main"), part,
			input: u.input_tokens || 0, output: u.output_tokens || 0, cread: u.cache_read_input_tokens || 0,
			w5: split ? (cw5 || 0) : 0, w1: split ? (cw1 || 0) : cw_total };       // no split reported: price as 1-hour (what this machine uses)
		const think = u.output_tokens_details?.thinking_tokens || 0;

		const key = part === "main" ? id : part + "|" + id, seen = s.state.seen;
		if (seen[key]){
			const old = this._entry(key, seen[key]), top = AISession.merge_usage(old, e);
			if (top === old) return;                          // a repeat line, or a replayed copy with zeroed usage: nothing to add
			e.input = top.input; e.output = top.output; e.cread = top.cread; e.w5 = top.w5; e.w1 = top.w1;
			const before = this._tally(old, -1); const after = this._tally(e, +1);
			seen[key] = this._store(e);
			const pv = s.state.prev[part];                   // the next call's growth uses this reply's final size
			if (pv && pv.id === id){ pv.out = e.output; pv.think = think; }
			s.purpose.usd.assistant += (after.out - before.out) * (1 - (e.output ? Math.min(1, think / e.output) : 0));
			s.purpose.usd.thinking += (after.out - before.out) * (e.output ? Math.min(1, think / e.output) : 0);
			return;
		}
		seen[key] = this._store(e);
		if (!split) s.tokens.cache_write_unsplit += cw_total;
		const usd = this._tally(e, +1);
		s.messages++;
		if (e.side){ s.sidechain.messages++; }
		this._unit(e).n++;
		if (!e.side){
			s.main_models[model] = (s.main_models[model] || 0) + 1;
			s.main_efforts[e.effort ?? "?"] = (s.main_efforts[e.effort ?? "?"] || 0) + 1;
			s.current = { model, effort: e.effort ?? null };   // the LATEST main turn: a tab can change model mid-session
		}
		this._purpose(part, { id, input: e.input, output: e.output, cread: e.cread, cw: e.w5 + e.w1, usd, think });
	}

	_store(e){ return [e.model, e.effort, e.side ? 1 : 0, e.part, e.input, e.output, e.cread, e.w5, e.w1]; }
	_entry(key, r){ return { id: key, model: r[0], effort: r[1], side: !!r[2], part: r[3], input: r[4], output: r[5], cread: r[6], w5: r[7], w1: r[8] }; }

	/** THE dedupe rule (one place; AISessionCost, the audit and the digest use the same): one API message counts once, and each token field is
	 *  the LARGEST value any of its lines carries. Early lines hold a partial output count; the SDK also replays old messages with zeroed usage
	 *  (after a compaction or resume). A maximum survives both, and it does not depend on line order, so a tail and the whole log agree.
	 *  Returns `old` itself when `e` adds nothing. */
	static merge_usage(old, e){
		const m = { ...old, input: Math.max(old.input, e.input), output: Math.max(old.output, e.output), cread: Math.max(old.cread, e.cread), w5: Math.max(old.w5, e.w5), w1: Math.max(old.w1, e.w1) };
		return m.input === old.input && m.output === old.output && m.cread === old.cread && m.w5 === old.w5 && m.w1 === old.w1 ? old : m;
	}
	_unit(e){
		const key = e.model + "|" + (e.effort ?? "?");
		return (this.s.units[key] ||= { model: e.model, effort: e.effort, n: 0, usd: 0, input: 0, output: 0, cache_read: 0, cache_write: 0 });
	}

	// Add (sign +1) or remove (-1) one message's tokens and dollars from every running total. Returns its dollar parts.
	_tally(e, sign){
		const s = this.s, unknown = new Set(s.unknown_models), p = price_for(e.model, unknown);
		s.unknown_models = [...unknown];
		const usd = { in: e.input * p.in / 1e6, out: e.output * p.out / 1e6, cache_read: e.cread * p.cache_read / 1e6, cache_write: (e.w5 * p.cache_write_5m + e.w1 * p.cache_write_1h) / 1e6 };
		const total = usd.in + usd.out + usd.cache_read + usd.cache_write;
		s.usd += sign * total;
		for (const k in usd) s.usd_parts[k] += sign * usd[k];
		s.tokens.input += sign * e.input; s.tokens.output += sign * e.output; s.tokens.cache_read += sign * e.cread;
		s.tokens.cache_write_5m += sign * e.w5; s.tokens.cache_write_1h += sign * e.w1;
		if (e.side) s.sidechain.usd += sign * total;
		const unit = this._unit(e);
		unit.usd += sign * total; unit.input += sign * e.input; unit.output += sign * e.output; unit.cache_read += sign * e.cread; unit.cache_write += sign * (e.w5 + e.w1);
		return usd;
	}

	// tool_use blocks: count each tool call once (ids seen recently are skipped), remember id -> name for its result.
	_blocks(m){
		const s = this.s, seen = (s.state.tool_seen ||= {});
		for (const b of Array.isArray(m.content) ? m.content : []){
			if (b.type !== "tool_use" || seen[b.id]) continue;
			seen[b.id] = 1;
			(s.tools[b.name] ||= { n: 0, result_tokens: 0 }).n++;
			s.state.tu[b.id] = b.name;
			const fp = b.input?.file_path ?? b.input?.notebook_path;
			if (fp && /^(Edit|Write|MultiEdit|NotebookEdit)$/.test(b.name)){   // what this session wrote: repo-relative path -> times
				const rel = String(fp).replaceAll("\\", "/").replace(/^.*?\/(?:monorepo|worktrees\/[^/]+|\.claude\/worktrees\/[^/]+)\//, ""), t = (s.touched ||= {});
				if (t[rel] || Object.keys(t).length < 200) t[rel] = (t[rel] || 0) + 1;
			}
		}
	}

	// Where the context grew and what it paid. See PURPOSE_METHOD.
	_purpose(part, c){
		const s = this.s, st = s.state, P = s.purpose;
		const ctx = c.input + c.cread + c.cw, prev = st.prev[part], added = zero();
		let comp = st.comp[part] ||= zero();
		const pend = this._pend(part), tool_tokens = {};
		if (!prev){
			const user_est = Math.min(Math.round(pend.user / 4), Math.round(ctx / 2));
			added.user = user_est; added.preamble = ctx - user_est;
		} else {
			const delta = ctx - prev.ctx;
			if (delta < 0){ s.resets++; st.comp[part] = comp = zero(); added.other = ctx; }
			else {
				const po = Math.min(prev.out, delta), th = Math.min(prev.think, po);
				// the previous reply: text vs tool-call inputs are both "assistant"; thinking is exact from the usage detail
				added.thinking = th; added.assistant = po - th;
				const rest = delta - po, tool_chars = sum(pend.tools), total = pend.user + pend.other + tool_chars;
				if (rest > 0){
					if (!total) added.other += rest;
					else {
						added.user += rest * pend.user / total; added.other += rest * pend.other / total;
						added.tool_result += rest * tool_chars / total;
						for (const [name, ch] of Object.entries(pend.tools)) tool_tokens[name] = rest * ch / total;
					}
				}
			}
		}
		for (const [name, t] of Object.entries(tool_tokens)) (s.tools[name] ||= { n: 0, result_tokens: 0 }).result_tokens += Math.round(t);
		st.pend[part] = { user: 0, other: 0, tools: {} };

		// dollars: reads are shared by everything already in context; writes + fresh input by what was just added; output by thinking vs reply
		const spread = (usd, weights, fallback) => {
			const w = sum(weights); if (!usd) return;
			if (!w){ P.usd[fallback] += usd; return; }
			for (const k of BUCKETS) P.usd[k] += usd * weights[k] / w;
		};
		spread(c.usd.cache_read, comp, "preamble");
		spread(c.usd.cache_write + c.usd.in, added, "other");
		if (c.usd.out){
			const th = c.output ? Math.min(1, c.think / c.output) : 0;
			P.usd.thinking += c.usd.out * th; P.usd.assistant += c.usd.out * (1 - th);
		}
		add_to(comp, added); add_to(P.tokens, added);
		st.prev[part] = { id: c.id, ctx, out: c.output, think: c.think };
	}

	// ---- reading it back -------------------------------------------------------------------

	get total_usd(){ return r6(this.s.usd); }
	get wall_ms(){ const s = this.s; return s.first_at && s.last_at ? Date.parse(s.last_at) - Date.parse(s.first_at) : 0; }

	// Configured (Servex registry: what we asked for) against actual (what the file says it ran).
	set_configured(cfg){
		const s = this.s; s.configured = cfg || null; s.flags = [];
		if (!cfg) return this;
		const ran = Object.keys(s.main_models), efforts = Object.keys(s.main_efforts).filter(e => e !== "?");
		if (cfg.model && ran.length && !ran.includes(bare_model(cfg.model)))
			s.flags.push(`model: configured ${cfg.model}, the file shows ${ran.join(", ")}`);
		if (cfg.effort && efforts.length && !efforts.includes(cfg.effort))
			s.flags.push(`effort: configured ${cfg.effort}, the file shows ${efforts.join(", ")}`);
		if (!cfg.effort && efforts.length) s.flags.push("effort: no configured effort recorded (a VS Code or CLI tab), the file says " + efforts.join(", "));
		if (s.unknown_models.length) s.flags.push("price: no rate for " + s.unknown_models.join(", ") + " (UNPRICED: counted as $0)");
		return this;
	}

	// The model the main thread ran most, with its effort: "model + effort is the unit".
	model_effort(){
		const s = this.s; let best = null;
		for (const u of Object.values(s.units)) if (!best || u.n > best.n) best = u;
		return best ? { model: best.model, effort: best.effort, label: model_label(best.model) + (best.effort ? " · " + best.effort : ""), id: best.model } : { model: null, effort: null, label: "unknown", id: null };
	}

	/** The model the main thread runs NOW (the latest turn), else the one it ran most (an older cached session with no latest yet). */
	current_model(){
		const c = this.s.current, me = this.model_effort();
		return c?.model ? { model: c.model, effort: c.effort ?? me.effort, label: model_label(c.model) + ((c.effort ?? me.effort) ? " · " + (c.effort ?? me.effort) : ""), id: c.model } : me;
	}

	cache_read_pct(){ const s = this.s; return s.usd ? Math.round(s.usd_parts.cache_read / s.usd * 1000) / 10 : 0; }

	// Display mode 1: the data-grid row. Plain strings and numbers; AISessionView.js draws them.
	preview(tree){
		const s = this.s, me = this.current_model(), t = tree ?? {}, cfg = s.configured;
		// ONE source per provider. An OpenRouter session is billed by OpenRouter and recorded by the Servex registry
		// (cost, turns, model); its transcript priced at Claude rates would be a made-up number. A Claude session reads its transcript.
		const provider = provider_of(cfg?.model || me.id), or = provider === "openrouter";
		// Real dollars only: OpenRouter's own per-call cost, summed by Servex into the registry row (cfg.cost). A session with no such row has NO
		// recorded cost; its transcript priced at Claude rates is a made-up number, so it is kept apart as usd_estimate and never added to usd.
		const real = or && typeof cfg?.cost === "number", usd = or ? (real ? cfg.cost : 0) : s.usd;
		return {
			id: s.id, provider, usd: r6(usd), usd_source: or ? (real ? "openrouter" : "unrecorded") : "claude", ...(or && !real ? { usd_estimate: r6(s.usd) } : {}), tree_usd: or ? r6(usd) : (t.tree_usd ?? r6(s.usd)), children: t.children ?? 0,
			wall_ms: this.wall_ms, active_ms: s.active_ms, messages: or && typeof cfg?.turns === "number" ? cfg.turns : s.messages,
			model: or ? (cfg?.model || me.id) : me.label, model_id: or ? (cfg?.model || me.id) : me.id, effort: me.effort,
			flags: s.flags, cache_read_pct: this.cache_read_pct(),
		};
	}

	// Display mode 2: the detail view's sections, as data.
	detail(){
		const s = this.s, P = s.purpose, total_tok = sum(P.tokens) || 1;
		return {
			...this.preview(),
			usd_parts: s.usd_parts, tokens: s.tokens, sidechain: s.sidechain,
			units: Object.values(s.units).sort((a, b) => b.usd - a.usd),
			tools: Object.entries(s.tools).map(([name, t]) => ({ name, ...t })).sort((a, b) => b.n - a.n),
			purpose: BUCKETS.map(k => ({ key: k, label: PURPOSE_LABELS[k], tokens: Math.round(P.tokens[k]), pct: Math.round(P.tokens[k] / total_tok * 1000) / 10, usd: r6(P.usd[k]) })),
			method: PURPOSE_METHOD, first_at: s.first_at, last_at: s.last_at, prompts: s.prompts, resets: s.resets,
			audit: s.audit ?? null, configured: s.configured,
		};
	}

	// ---- cache I/O (the server writes it, the browser reads it) -----------------------------

	// ---- where a session's folder lives (doc/layout.md) ---------------------------------------
	// sessions/YYYY/MM/DD/<id>/ , the day the session FIRST appeared (the owner's local day, Session.day -> Day.js), the same year/month/day tree the ai cards use.
	// Old flat folders (sessions/<id>/) are still read, and are moved into their day the first time a node writer touches them.
	static days = new Map();                       // id -> "2026/10/03", filled from the index (browser) or the disk (node)
	static use_index(index){
		const i = index?.columns?.indexOf("day"); if (i >= 0) for (const [id, v] of Object.entries(index.rows)) if (v[i]) AISession.days.set(id, v[i]);
		if (index?.columns && typeof document !== "undefined") for (const [id, v] of Object.entries(index.rows)) AISession.from_index(id, v, index.columns);
	}

	// ---- the live index (browser): one light Session per id, kept current by snapshots (doc/realtime.md) ----------
	// `all` is the registry. A light Session carries only the grid's fields in `ix`; the full computed totals stay in `s`
	// (blank here) and arrive from the session's own cache when its detail page opens.
	static all = new Map();
	static INDEX_COLUMNS = ["usd", "tree_usd", "children", "wall_ms", "model", "effort", "flags", "day", "provider"];

	/** The light Session for an id, made from one index row (the short array build_index writes). Re-reading the index refreshes it in place. */
	static from_index(id, arr, columns = AISession.INDEX_COLUMNS){
		const ses = AISession.all.get(id) ?? AISession.of(id);
		columns.forEach((c, i) => { if (!(c in ses.ix && ses.live)) ses.ix[c] = AISession.norm(c, arr[i]); });
		return ses;
	}

	static of(id){
		let ses = AISession.all.get(id);
		if (!ses){ ses = new AISession(id); ses.ix = {}; ses.subs = new Set(); AISession.all.set(id, ses); }
		return ses;
	}

	static norm(key, v){ return key === "model" || key === "effort" || key === "day" ? (v || null) : key === "provider" ? (v || "claude") : v; }

	/** One snapshot or feed line ({ id, ...fields }) folded into the Session it names. Returns { ses, fields, is_new }. */
	static apply_delta(line){
		const is_new = !AISession.all.has(line.id), ses = AISession.of(line.id), fields = [];
		ses.live = true;
		for (const [k, v] of Object.entries(line)){
			if (k === "id" || k === "at") continue;
			const n = AISession.norm(k, v);
			if (Array.isArray(n) ? JSON.stringify(ses.ix[k]) !== JSON.stringify(n) : ses.ix[k] !== n){ ses.ix[k] = n; fields.push(k); }
		}
		if (line.folder){ AISession.slugs.set(line.id, line.folder); if (line.day) AISession.days.set(line.id, line.day); }   // where this session's folder is (browser: from the snapshot)
		if (fields.length) ses.subs.forEach(fn => fn(ses, fields));
		return { ses, fields, is_new };
	}

	/** Subscribe to this session's changes: fn(session, changed_field_names). Returns the unsubscribe function. */
	subscribe(fn){ this.subs.add(fn); return () => this.subs.delete(fn); }

	// ---- its view (browser) -------------------------------------------------------------------------------------
	// The house pattern: the class owns its template. `AISession.View` is unset on the server (this file imports no browser code);
	// `AISession.View = AISessionView` is attached after the class, on the last line of AISessionView.js (never a static field), so a browser
	// that has loaded it can call `session.render()` to draw this session as a grid row. It reaches the View through `this.constructor`
	// like core/Item, audio/Part and lab/LiveView, so a subclass can swap `View`.

	/** This session drawn as a grid row (AISessionView). `opts` can carry the page's merged `row`, `url`, `spend`, `nest`. */
	render(opts = {}){
		if (!this.constructor.View) throw new Error("AISession.View is not set: import AISessionView.js first (a server never draws a session)");
		return new this.constructor.View({ session: this, row: this.grid_row(), url: AISession.root_url(), ...opts });
	}

	/** The row the grid draws for a session that only the live index knows (no VS Code tab record, no Servex agent). */
	grid_row(){
		const { first_at, model, state, last_activity } = this.ix;
		return { id: this.id, session_id: this.id, source: "vscode", entrypoint: null, tab_title: null, model, state: state ?? "idle", role: null,
			started_at: first_at ?? null, stopped_at: null, last_activity: last_activity ?? first_at ?? null, cost: null, last_prompt_first_line: null };
	}

	/** The grid row for this session in the object shape AISessionRows.row_of has always returned. */
	index_row(){ const { usd, tree_usd, children, wall_ms, model, effort, flags, day, provider } = this.ix; return { id: this.id, usd, tree_usd, children, wall_ms, model, effort, flags, day, provider: provider || "claude" }; }

	static root_url(){
		// SESSIONS_ROOT (node only) lets a script run from a worktree write into the main tree's sessions/ folder.
		const root = typeof process !== "undefined" && process.env?.SESSIONS_ROOT;
		return root ? new URL("file:///" + root.replace(/\\/g, "/").replace(/\/?$/, "/").replace(/^\/+/, "")) : new URL("../sessions/", import.meta.url);
	}
	// day(), dir_url(), scan() and locate() are inherited from core/Session; the maps below are this class's own (statics inherit by reference).
	static slugs = new Map();
	static scanned = false;

	// ---- the record: what a session's session.jsonl accepts (doc/record-spec.md) ----
	static LINE_TYPES = {
		tag:      l => typeof l.tag === "string" && l.tag.length > 0 && l.tag.length <= 40,
		note:     l => typeof l.note === "string" && l.note.length > 0,
		alert:    l => typeof l.alert === "string" && l.alert.length > 0 && (l.level == null || ["info", "warn", "error"].includes(l.level)),
		weight:   l => typeof l.weight === "number" && l.weight >= 0 && l.weight <= 10,
		closed:   l => typeof l.closed === "boolean",
		question: l => typeof l.question === "string" && Array.isArray(l.options) && l.options.length >= 2 && l.options.every(o => typeof o === "string"),
		links:    l => Array.isArray(l.links) && l.links.length >= 1 && l.links.length <= 3 && l.links.every(k => typeof k?.path === "string" && k.path),
	};

	// Validate and append one record line. Returns the stored line, or throws with the reason. Append only.
	static async log(id, line, by){
		if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("session id must be the 36-character session uuid");
		if (!by || typeof by !== "string") throw new Error("`by` (the author) is required");
		const types = Object.keys(AISession.LINE_TYPES).filter(k => k in line);
		if (types.length !== 1) throw new Error("a line has exactly one of: " + Object.keys(AISession.LINE_TYPES).join(", "));
		if (!AISession.LINE_TYPES[types[0]](line)) throw new Error(`bad shape for "${types[0]}" (see sessions/doc/data/record-spec.md)`);
		const fs = await import("node:fs/promises"), dir = await AISession.locate(id);
		await fs.mkdir(dir, { recursive: true });
		const out = { ...line, at: new Date().toISOString(), by, session: id };
		await fs.appendFile(new URL("session.jsonl", dir), JSON.stringify(out) + "\n");
		return out;
	}

	// Browser or node: read one of a session's small log files as text, or "" when it does not exist.
	static async read_text(id, name){
		const one = async url => {
			try {
				if (url.protocol === "file:"){ const fs = await import("node:fs/promises"); return await fs.readFile(url, "utf8"); }
				const r = await fetch(url, { cache: "no-store" }); return r.ok && !(r.headers.get("content-type") ?? "").includes("html") ? await r.text() : "";
			} catch { return ""; }
		};
		const node = typeof process !== "undefined" && process.versions?.node;
		let text = await one(new URL(name, node ? await AISession.locate(id) : AISession.dir_url(id)));
		return text;
	}
	static lines_of(text){ const out = []; for (const l of text.split("\n")) if (l.trim()) try { out.push(JSON.parse(l)); } catch {} return out; }

	// The hand-written record (tags, notes, alerts, weight, closed, questions, links) from session.jsonl, folded to what a
	// card needs. session.jsonl is TRACKED in git and append-only: only people and agents write to it.
	static async record(id){
		const r = { tags: [], alerts: 0, links: [], weight: null, closed: null, notes: 0, questions: 0 };
		for (const o of AISession.lines_of(await AISession.read_text(id, "session.jsonl"))){
			if (o.tag && !r.tags.includes(o.tag)) r.tags.push(o.tag);
			if (o.alert) r.alerts++;
			if (o.note) r.notes++;
			if (o.question) r.questions++;
			if (typeof o.weight === "number") r.weight = o.weight;
			if (Array.isArray(o.links)) r.links = o.links;
			if ("closed" in o) r.closed = o.closed ? o : null;
		}
		return r;
	}

	// The newest saved summary for an id, or null. The computed numbers live in cache.jsonl (gitignored machine state,
	// rewritten freely); the record in session.jsonl is only ever appended to.
	static async load_cached(id){
		let summary = null, audit = null;
		for (const o of AISession.lines_of(await AISession.read_text(id, "cache.jsonl"))){ if (o.summary) summary = o.summary; if (o.audit) audit = o.audit; }
		if (!summary) return null;
		const ss = new AISession(id, summary); ss.s.audit = audit; ss.s.closed = (await AISession.record(id)).closed; return ss;
	}

	// Node: read what the transcripts gained since the last run (new bytes only), then save.
	// `files` = [{ part, path }]. Returns { new_lines }.
	async update(files){
		const fs = await import("node:fs/promises"), s = this.s;
		let new_lines = 0;
		if ((s.v ?? 1) < STATE_V) return this.reset_and_update(files);   // saved before v2 (40-slot ring, or no messages yet): read the log again, once
		for (const { part, path } of files){
			let size; try { size = (await fs.stat(path)).size; } catch { continue; }
			let off = s.cursor[part]?.off ?? 0;
			if (size < off){ return this.reset_and_update(files); }          // file shrank: start over, never guess
			if (size === off) continue;
			if (s.current === undefined && part === "main" && s.messages && !s.rebuilt){ s.rebuilt = true; return this.reset_and_update(files); }   // a state saved before title/current existed: read it again once, when it has new lines
			const fh = await fs.open(path, "r");
			try {
				const buf = Buffer.alloc(size - off); await fh.read(buf, 0, size - off, off);
				const text = buf.toString("utf8"), cut = text.lastIndexOf("\n") + 1;       // complete lines only
				if (!cut) continue;
				new_lines += this.apply_text(text.slice(0, cut), part);
				s.cursor[part] = { off: off + Buffer.byteLength(text.slice(0, cut)) };
			} finally { await fh.close(); }
		}
		return { new_lines };
	}

	async reset_and_update(files){
		const keep = this.s.configured; this.s = AISession.blank(this.id); this.s.configured = keep; this.s.rebuilt = true;
		return this.update(files);
	}

	// Node: append the summary to <id>/cache.jsonl (stamped), folding that cache file so it stays tiny. Never touches session.jsonl.
	async save(by = "session-summary"){
		const fs = await import("node:fs/promises"), dir = await AISession.locate(this.id, this.s.first_at), file = new URL("cache.jsonl", dir);
		await fs.mkdir(dir, { recursive: true });
		const at = new Date().toISOString(), s = { ...this.s }; delete s.audit; delete s.closed;
		let old = ""; try { old = await fs.readFile(file, "utf8"); } catch {}
		const lines = old.split("\n").filter(l => l.trim());
		if (lines.length > 30){      // fold: the newest audit lines survive, the stale summaries do not
			const audits = [...lines.filter(l => l.startsWith('{"audit"')).slice(-10), ...lines.filter(l => !l.startsWith('{"audit"') && !l.startsWith('{"summary"'))];   // cache.jsonl holds only summaries and audits, so this fold can never lose a record line
			await fs.writeFile(file, audits.join("\n") + (audits.length ? "\n" : ""));
		}
		await fs.appendFile(file, JSON.stringify({ summary: s, at, by }) + "\n");
	}

	// Lifecycle: the owner marks a session done ("rubber stamp"). An appended, stamped, authored line; nothing is deleted.
	// closed:false re-opens it (a later line wins). The table hides closed sessions by default; chasing skips them.
	static async close(id, by = "owner", closed = true){
		const fs = await import("node:fs/promises"), dir = await AISession.locate(id);
		await fs.mkdir(dir, { recursive: true });
		const line = { closed, at: new Date().toISOString(), by };
		await fs.appendFile(new URL("session.jsonl", dir), JSON.stringify(line) + "\n");
		return line;
	}

	async save_audit(result, by = "session-summary --audit"){
		const fs = await import("node:fs/promises"), dir = await AISession.locate(this.id, this.s.first_at);
		await fs.mkdir(dir, { recursive: true });
		await fs.appendFile(new URL("cache.jsonl", dir), JSON.stringify({ audit: result, at: result.at, by }) + "\n");
		this.s.audit = result;
	}

	// ---- the audit: an independent recomputation ---------------------------------------------

	// Re-read the WHOLE raw file with public/framework/ai/AISession/AISessionAudit.mjs (a different parser and grouping from
	// apply_line) and compare to the rolling totals. `corrupt` lets the test tamper first.
	// Returns { match, at, old, new, diff } where diff lists every field that differs, in $ and tokens.
	async audit(session_id = this.id){
		const sc = await import("./AISessionAudit.mjs");
		const truth = sc.cost_of_session(session_id);
		if (!truth) return { match: false, at: new Date().toISOString(), error: "no transcript found", old: null, new: null, diff: {} };
		const s = this.s;
		const old = {
			usd: r6(s.usd), in: r6(s.usd_parts.in), out: r6(s.usd_parts.out), cache_read: r6(s.usd_parts.cache_read), cache_write: r6(s.usd_parts.cache_write),
			input: s.tokens.input, output: s.tokens.output, cache_read_tokens: s.tokens.cache_read, cache_write_tokens: s.tokens.cache_write_5m + s.tokens.cache_write_1h,
			messages: s.messages,
		};
		const neu = {
			usd: r6(truth.total_usd), in: r6(truth.usd_breakdown.in), out: r6(truth.usd_breakdown.out), cache_read: r6(truth.usd_breakdown.cache_read), cache_write: r6(truth.usd_breakdown.cache_write),
			input: truth.token_totals.input, output: truth.token_totals.output, cache_read_tokens: truth.token_totals.cache_read, cache_write_tokens: truth.token_totals.cache_write,
			messages: truth.messages,
		};
		const diff = {};
		for (const k of Object.keys(old)){
			const usd_field = ["usd", "in", "out", "cache_read", "cache_write"].includes(k);
			const d = r6(neu[k] - old[k]);
			if (usd_field ? Math.abs(d) > 0.0005 : d !== 0) diff[k] = { rolling: old[k], recomputed: neu[k], diff: d };
		}
		return { match: !Object.keys(diff).length, at: new Date().toISOString(), old, new: neu, diff };
	}

	// ---- the tree: parent + children, recursive totals ---------------------------------------

	// rows: [{ id, parent, usd, role }] -> Map id -> { tree_usd, children, depth }. Cycle-safe.
	static rollup(rows){
		const by = new Map(rows.map(r => [r.id, r])), kids = new Map();
		for (const r of rows) if (r.parent && by.has(r.parent) && r.parent !== r.id){ (kids.get(r.parent) ?? kids.set(r.parent, []).get(r.parent)).push(r.id); }
		const out = new Map(), visiting = new Set();
		const walk = id => {
			if (out.has(id)) return out.get(id).tree_usd;
			if (visiting.has(id)) return 0;
			visiting.add(id);
			let t = by.get(id).usd || 0, n = 0;
			for (const k of kids.get(id) || []){ t += walk(k); n += 1 + out.get(k).children; }
			visiting.delete(id);
			out.set(id, { tree_usd: r6(t), children: n, kids: kids.get(id) || [] });
			return t;
		};
		for (const r of rows) walk(r.id);
		return out;
	}
}

// The helpers other files need ride on the class: AISession.price_for(model), AISession.PRICES, ...
Object.assign(AISession, { STATE_V, DEFAULT_MODEL, UNPRICED, PRICES, price_for, model_label, provider_of, PURPOSE_LABELS, PURPOSE_METHOD });
