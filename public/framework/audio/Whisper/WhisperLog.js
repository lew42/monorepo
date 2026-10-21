import { View, div, span, button } from "../../core/View/View.js";
import JSONL from "../../ext/JSONL/JSONL.js";
import FsFile from "../../ext/filesystem/FsFile.js";
import Rows from "./WhisperLogRows.js";

View.stylesheet(import.meta, "WhisperLog.css");

/**
 * class WhisperLog — the one log of everything between the microphone and the page, one line per event,
 * every line numbered in the order it happened.
 *
 *   WhisperLog.event("composer", "deliver", { msg: "What is it?", req: 4 });   // anyone can add a line
 *   WhisperLog.attach(mic, system);                                            // wires the downstream events (below)
 *   new WhisperLog();                                                          // the view: a table that tails the file
 *
 * A line: `{ seq, run, t, at, src, kind, msg, ...whatever else }`. `seq` counts up per page load (`run` names it, so
 * two tabs never mix); `src` is where it came from, `kind` what happened:
 *
 *   server   interim | final   whisper-server's own reply to one request: `msg` is its text, `server` its WHOLE
 *                              answer (segments, word probabilities, no_speech_prob), `req`, `segment`, `ms`
 *   dictate  guess | commit | stale   what `ux/Dictate` did with a reply (a reply dropped as out of date is "stale")
 *   composer commit-in | commit-dropped | enqueue | post | send-check | deliver    the box and the send queue (`ext/Chat/Mic.js`)
 *   refine   sending | go | chunk | done | sentences    `RefineSystem`: the send to the cleaner, the chunk, the sentence list
 *
 * Stored in `/framework/ai/whisper/bucket.jsonl`, one temporary bucket (one store, one writer: `Dictate.log_whisper`,
 * tailed by `JSONL.live()`); old lines have no `seq` and the table skips them. Nothing records unless a page wires
 * it: `WhisperSession.record` (the server lines) and `attach()` (the rest). Reading rules: `WhisperLogRows.js`.
 * Doc: `audio/Whisper/readme.md`.
 */
export default class WhisperLog extends View {
	static icon = "receipt_long";
	static dir = "/framework/ai/whisper/";
	static path(){ return `${WhisperLog.dir}bucket.jsonl`; }   // one temporary bucket, no date code; "New session" appends a {src:"bucket"} marker: doc/demo.md

	static run = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
	static seq = 0;
	static where = globalThis.location?.pathname ?? "";

	/** An ISO time as local time (the file keeps UTC): `19:08:55.880`, or with `date` false `10-16 19:08:50`. */
	static local(at, ms = false){
		const d = new Date(at);
		if (isNaN(d)) return "";
		const p = (n, w = 2) => String(n).padStart(w, "0"), clock = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
		return ms ? `${clock}.${p(d.getMilliseconds(), 3)}` : `${p(d.getMonth() + 1)}-${p(d.getDate())} ${clock}`;
	}

	/** Add one line. Returns its `seq` at once; the write is not awaited and never throws. */
	static event(src, kind, fields = {}){
		const seq = ++WhisperLog.seq;
		const t = globalThis.performance ? +(performance.timeOrigin + performance.now()).toFixed(2) : Date.now();
		const line = { seq, run: WhisperLog.run, t, at: new Date().toISOString(), src, kind, ...fields };
		if (seq === 1) line.page = WhisperLog.where;
		try { FsFile.append(WhisperLog.path(), line).catch(() => {}); } catch {}
		return seq;
	}

	/** One whisper-server reply, in the shape `Dictate.on_whisper` and `WhisperSession.record` use. */
	static record({ kind, text, body, ...rest }){
		return WhisperLog.event("server", kind, { msg: text ?? "", server: body, ...rest });
	}

	/** Wire the downstream half: `mic` is a `ComposerMic`/`Dictate`, `system` a `RefineSystem` (either may be omitted).
	 *  Only wraps methods on these two instances; each wrapper logs, then calls the original and returns its result. */
	static attach(mic, system){
		const E = WhisperLog.event;
		const wrap = (obj, name, before, after) => {
			const orig = obj[name];
			if (typeof orig !== "function" || orig.wl) return;
			const fn = function(...args){
				try { before?.(args); } catch {}
				const out = orig.apply(this, args);
				try { after?.(args, out); } catch {}
				return out;
			};
			fn.wl = true;
			obj[name] = fn;
		};
		if (mic){
			mic.on_trace = (kind, f) => E("dictate", kind, f);
			mic.response_format = "verbose_json";   // the log wants everything the server says; ~70 ms slower per reply, so only a mic that is logged
			const guess = mic.on_guess;
			mic.on_guess = text => { E("dictate", "guess", { msg: text }); return guess?.call(mic, text); };
			let pushed = 0;
			wrap(mic, "commit", ([text, reason]) => { pushed = 0; E("composer", "commit-in", { msg: String(text ?? ""), reason }); },
				([text]) => { if (!pushed) E("composer", "commit-dropped", { msg: String(text ?? ""), why: "stripped as already sent, or an annotation" }); });
			wrap(mic, "push_to_target", ([text, reason, chunk]) => { pushed++; E("dictate", "commit", { msg: String(text ?? ""), reason, chunk }); });
			wrap(mic, "enqueue", ([items]) => (items ?? []).forEach(it => E("composer", "enqueue", { msg: typeof it === "string" ? it : it.text, raw: it?.raw ?? undefined })));
			wrap(mic, "post_held", ([item]) => E("composer", "post", { msg: typeof item === "string" ? item : item?.text, raw: item?.raw ?? undefined }));
			wrap(mic, "same_as_last_send", null, (a, dup) => E("composer", "send-check", { msg: String(a[0] ?? ""), dup }));
			const deliver = mic.deliver;
			if (typeof deliver === "function") mic.deliver = (entry, ...r) => { E("composer", "deliver", { msg: entry?.text, raw: entry?.raw, via: entry?.via }); return deliver.call(mic, entry, ...r); };
		}
		if (system){
			wrap(system, "sending_start", ([text]) => E("refine", "sending", { msg: String(text ?? "") }));
			wrap(system, "go", ([text]) => E("refine", "go", { msg: String(text ?? "").trim() }),
				([text], p) => {
					E("refine", "chunk", { msg: String(text ?? "").trim(), n: system.chunks.length });
					Promise.resolve(p).then(() => { const c = system.chunks.at(-1); if (c) E("refine", "done", { msg: c.raw, status: c.status, ms: c.ms, error: c.error || undefined }); }).catch(() => {});
				});
			let before = "";
			wrap(system, "compose", null, () => {
				const sentences = (system.prompt?.clean ?? []).map(s => s.text), key = sentences.join("\u0001");
				if (key === before || !sentences.length) return;
				before = key;
				const repeats = sentences.filter((s, i) => i && Rows.norm(s) && Rows.norm(s) === Rows.norm(sentences[i - 1])).length;
				E("refine", "sentences", { msg: sentences.at(-1), n: sentences.length, all: sentences, repeats: repeats || undefined });
			});
		}
		return WhisperLog;
	}

	// ---- the view ----

	render(){
		this.ac("wl");
		this.only_problems = false;
		this.$head = div.c("wl-head");
		div.c("wl-legend", "req = the request number sent to whisper-server · seg = which segment · conf = the average word confidence (1 is sure) · nospeech = the chance the audio was not speech · click a row for everything it recorded.");
		this.$rows = div.c("wl-rows");
		this.log = new JSONL({ url: WhisperLog.path() });
		this.log.live(() => this.draw()).then(() => this.draw());   // live() calls back for later lines only; the first replay resolves the promise
		this.draw();
	}

	lines(){ return (this.log?.logs ?? []).filter(l => l && l.seq != null); }

	draw(){
		const all = this.lines(), runs = Rows.runs(all);
		this.run ??= runs.at(-1);
		if (this.run && !runs.includes(this.run)) this.run = runs.at(-1);
		let rows = Rows.annotate(all.filter(l => l.run === this.run));
		const sum = Rows.summary(rows);
		if (this.only_problems) rows = rows.filter(r => r.change === "amend" || r.dup_of != null);
		this.$head.empty(() => {
			span.c("wl-stat", `${sum.rows} events · ${sum.amends} amended · ${sum.dups} duplicates`);
			runs.forEach(r => button.c(`wl-run${r === this.run ? " is-on" : ""}`, this.run_label(r, all)).click(() => { this.run = r; this.draw(); }));
			button.c(`wl-run${this.only_problems ? " is-on" : ""}`, "problems only").click(() => { this.only_problems = !this.only_problems; this.draw(); });
		});
		const stick = this.$rows.el.scrollTop + this.$rows.el.clientHeight >= this.$rows.el.scrollHeight - 40;
		this.$rows.empty(() => {
			if (!rows.length) return div.c("wl-empty muted", "Nothing yet. Speak into a page that wires the log (the Refine page does).");
			div.c("wl-row wl-headrow", () => { ["#", "time", "src", "kind", "origin", "text (changed words vs the previous line)"].forEach(t => span.c("wl-h", t)); });
			let prev_t = null;
			rows.forEach(r => {
				const gap = prev_t == null ? "" : `+${Math.round(r.t - prev_t)} ms`;
				prev_t = r.t;
				const box = div.c(`wl-row is-${r.src} k-${r.kind} c-${r.change}${r.dup_of != null ? " is-dup" : ""}`, () => {
					span.c("wl-seq", String(r.seq));
					span.c("wl-at", () => { span.c("wl-clock", WhisperLog.local(r.at, true)); span.c("wl-gap", gap); });
					span.c("wl-src", r.src);
					span.c("wl-kind", () => {
						span.c("wl-chip", r.kind);
						if (r.change === "amend") span.c("wl-chip wl-amend", "amended");
						if (r.dup_of != null) span.c("wl-chip wl-dupchip", `same as #${r.dup_of}`);
					});
					span.c("wl-origin", this.origin(r));
					span.c("wl-text", () => {
						if (r.diff && r.change !== "same") r.diff.forEach(d => span.c(`wl-w wl-${d.op}`, d.w + " "));
						else span.c("wl-w", r.msg ?? "");
						if (r.change === "same" && r.prev_seq != null) span.c("wl-note", ` (unchanged from #${r.prev_seq})`);
					});
				});
				const detail = div.c("wl-detail", () => { div.c("wl-json", JSON.stringify(this.detail(r), null, 1)); });
				detail.el.hidden = true;
				box.el.addEventListener("click", () => { detail.el.hidden = !detail.el.hidden; });
			});
		});
		if (stick) this.$rows.el.scrollTop = this.$rows.el.scrollHeight;
	}

	/** A run button reads as its start time and size, so a run is findable without knowing its id. */
	run_label(run, all){
		const mine = all.filter(l => l.run === run);
		return `${WhisperLog.local(mine[0]?.at)} · ${mine.length}`;
	}

	/** The ids that say where a line came from, so a duplicate shows two different origins. */
	origin(r){
		const bits = [];
		if (r.req != null) bits.push(`req ${r.req}`);
		if (r.segment != null) bits.push(`seg ${r.segment}`);
		if (r.chunk) bits.push(`chunk ${String(r.chunk).slice(0, 6)}`);
		if (r.n != null) bits.push(`n ${r.n}`);
		if (r.ms != null) bits.push(`${r.ms} ms`);
		const s = r.server?.segments;
		if (s?.length) bits.push(`conf ${(s.reduce((a, x) => a + Math.exp(x.avg_logprob ?? 0), 0) / s.length).toFixed(2)}`, `nospeech ${Math.max(...s.map(x => x.no_speech_prob ?? 0)).toExponential(0)}`);
		return bits.join(" · ");
	}

	detail(r){ const { diff, ...rest } = r; return rest; }
}
