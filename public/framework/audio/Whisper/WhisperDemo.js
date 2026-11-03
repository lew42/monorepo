import { View, div, span, button, a, details, summary, pre, p } from "../../core/View/View.js";
import JSONL from "../../ext/JSONL/JSONL.js";
import Dictate from "../../ux/Dictate/Dictate.js";
import { inspect } from "../../ux/Content/Object/Inspect.js";
import WhisperLog from "./WhisperLog.js";
import Rows from "./WhisperLogRows.js";
import Whisper from "./Whisper.js";

View.stylesheet(import.meta, "WhisperDemo.css");

const SAMPLE = new URL("doc/proof-2026-10-16.jsonl", import.meta.url).href;   // a real dictation (jfk.wav), committed, so the demo is never empty
const pct = x => `${Math.round(x * 100)}%`;

/**
 * class WhisperDemo extends View — every answer whisper-server sends, one row each, newest last; click a row to drill in.
 *
 *   new WhisperDemo();                  // Whisper's answers only (the Whisper page)
 *   new WhisperDemo({ steps: true });   // plus what Dictate, the composer and Refine did with each (the log page)
 *
 * Tails the WhisperLog bucket with `JSONL.live()`, so dictation in any tab shows up. Replay plays the last run back
 * at its real speed. Architecture and the interim → final story: `audio/Whisper/doc/demo.md`.
 */
export default class WhisperDemo extends View {
	static icon = "graphic_eq";

	steps = false;      // show every step, not just Whisper's answers
	max = false;        // full-screen takeover
	tab = "log";        // log | class
	source = "today";   // today | sample: where the rows come from
	replay = null;      // { shown: [], timer } while a replay plays
	opened = new Set(); // rows drilled into, by `run|seq`
	picked = null;      // the last row opened, for the Class tab

	render(){
		this.ac("wd");
		this.read_hash();
		this.$head = div.c("wd-head", () => {
			div.c("wd-title", () => { span.c("wd-name", "Whisper, live"); span.c("wd-sub muted", "every answer from the speech server"); });
			this.mic = new Dictate({ on_text(){}, session: "Whisper page" });
			WhisperLog.attach(this.mic);   // asks for the whole answer (segments, confidence) on every request
			[this.mic.$caption?.el, this.mic.$send_on_pause?.el?.parentElement].forEach(el => { if (el) el.style.display = "none"; });   // the rows show the words
			this.$new = button.c("wd-btn", "New session").attr("type", "button").attr("title", "start a fresh bucket: the rows before this point are hidden, never deleted").click(() => { WhisperLog.event("bucket", "new", { msg: "new session" }); this.opened.clear(); });
			this.$replay = button.c("wd-btn", "▶ Replay").attr("type", "button").click(() => this.replay ? this.stop() : this.play());
			this.$steps = button.c("wd-btn", "Every step").attr("type", "button").attr("title", "also show what Dictate, the composer and Refine did with each answer").click(() => { this.steps = !this.steps; this.draw(); });
			this.$max = button.c("wd-btn wd-max", "⤢").attr("type", "button").click(() => this.set_max(!this.max));
		});
		this.$tabs = div.c("wd-tabs");
		this.$body = div.c("wd-body");
		Whisper.shared.check();
		this.$foot = div.c("wd-foot");
		this.log = new JSONL({ url: WhisperLog.path() });
		this.log.live(() => this.draw()).then(() => this.draw()).catch(() => this.draw());
		fetch(SAMPLE).then(r => r.text()).then(t => { this.sample = t.split("\n").filter(Boolean).map(l => JSON.parse(l)); this.draw(); }).catch(() => {});
		this.on_key = e => { if (e.key === "Escape" && this.max) this.set_max(false); };
		document.addEventListener("keydown", this.on_key);
		globalThis.addEventListener?.("hashchange", () => { this.read_hash(); this.draw(); });
		this.draw();
	}

	// ---- state ----

	/** `#max`, `#class`, `#max+class`: the view a reload or a back button lands on. */
	read_hash(){
		const words = (globalThis.location?.hash ?? "").slice(1).split("+");
		this.max = words.includes("max");
		if (words.includes("steps")) this.steps = true;
		this.tab = words.includes("class") ? "class" : "log";
	}
	write_hash(){
		const words = [this.max && "max", this.tab === "class" && "class"].filter(Boolean).join("+");
		history.replaceState(null, "", words ? "#" + words : location.pathname + location.search);
	}
	/** Maximized, the demo moves to <body> (the site's bars sit in their own stacking contexts); a placeholder keeps its spot. */
	lift(){
		if (this.max && this.el.parentNode && this.el.parentNode !== document.body){
			this.$spot = document.createComment("whisper-demo");
			this.el.replaceWith(this.$spot);
			document.body.append(this.el);
		} else if (!this.max && this.$spot){
			this.$spot.replaceWith(this.el);
			this.$spot = null;
		}
	}
	set_max(on){ this.max = on; this.write_hash(); this.draw(); }
	set_tab(t){ this.tab = t; this.write_hash(); this.draw(); }

	/** The bucket's lines since the last "New session" marker (file order; a marker hides what came before, never deletes it). */
	today(){
		const all = (this.log?.logs ?? []).filter(l => l && l.seq != null);
		const cut = all.findLastIndex(l => l.src === "bucket" && l.kind === "new");
		return all.slice(cut + 1);
	}

	/** The lines on screen: a replay in progress, else today's file, else the sample run. */
	lines(){
		if (this.replay) return this.replay.shown;
		const today = this.today();
		this.source = today.some(l => l.src === "server") ? "today" : "sample";
		return this.source === "today" ? today : (this.sample ?? []);
	}

	rows(){
		let rows = Rows.supersede(Rows.annotate(this.lines()));
		if (!this.steps) rows = rows.filter(r => r.src === "server");
		return rows.slice(-300);
	}

	/** The last run with a Whisper answer in it, today's or the sample. */
	last_run(){
		const pool = this.today().some(l => l.src === "server") ? this.today() : (this.sample ?? []);
		const run = pool.filter(l => l.src === "server").at(-1)?.run;
		return pool.filter(l => l.run === run).sort((a, b) => a.t - b.t || a.seq - b.seq);
	}

	/** Play the last run back at its real speed (gaps over 2 s are cut to 2 s). */
	play(){
		const run = this.last_run();
		if (!run.length) return;
		this.replay = { shown: [], timer: 0 };
		let delay = 0;
		run.forEach((l, i) => {
			if (i) delay += Math.min(2000, Math.max(0, l.t - run[i - 1].t));
			setTimeout(() => { if (!this.replay) return; this.replay.shown.push(l); this.draw(); if (i === run.length - 1) setTimeout(() => this.stop(), 1500); }, delay);
		});
		this.draw();
	}
	stop(){ this.replay = null; this.draw(); }

	/** A plain snapshot of this demo, for the Class tab's live instance card. */
	state(){
		const rows = this.rows(), server = rows.filter(r => r.src === "server");
		return {
			file: WhisperLog.path(), source: this.replay ? "replay" : this.source, steps: this.steps, max: this.max,
			rows: rows.length, guesses: server.filter(r => r.kind === "interim").length,
			replaced: server.filter(r => r.replaced_by != null).length, finals: server.filter(r => r.kind === "final").length,
			amended: server.filter(r => r.change === "amend").length,
		};
	}

	// ---- drawing ----

	draw(){
		this.el.classList.toggle("is-max", this.max);
		this.lift();
		this.$replay.text(this.replay ? "■ Stop" : "▶ Replay");
		this.$steps.el.classList.toggle("is-on", this.steps);
		this.$max.text(this.max ? "✕" : "⤢").attr("title", this.max ? "back to the page (Esc)" : "full screen");
		this.$tabs.empty(() => [["log", "Log"], ["class", "Class"]].forEach(([t, label]) =>
			button.c(`wd-tab${this.tab === t ? " is-on" : ""}`, label).attr("type", "button").click(() => this.set_tab(t))));
		const rows = this.rows();
		if (this.tab === "class") this.draw_class();
		else this.draw_log(rows);
		this.draw_foot(rows);
	}

	draw_log(rows){
		const el = this.$body.el, stick = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
		this.$body.empty(() => {
			if (this.source === "sample" && !this.replay && rows.length) div.c("wd-banner", "Nothing dictated in this session yet, so this is a recorded sample (a famous sentence, read into the mic). Press Replay to watch it arrive, or the 🎤 to talk.");
			if (!rows.length) return div.c("wd-empty", this.replay ? "Replaying…" : "Loading…");
			let run = null;
			rows.forEach(r => {
				if (r.run !== run){ run = r.run; div.c("wd-run muted", `Page load at ${WhisperLog.local(r.at)}${r.page ? " · " + r.page : ""}`); }
				this.draw_row(r);
			});
		});
		if (stick || this.replay) el.scrollTop = el.scrollHeight;
	}

	draw_row(r){
		const key = `${r.run}|${r.seq}`, server = r.src === "server";
		const flags = [r.replaced_by != null && "is-replaced", r.change === "amend" && "is-amended", this.opened.has(key) && "is-open"].filter(Boolean).join(" ");
		div.c(`wd-row is-${r.src} k-${r.kind} ${flags}`, () => {
			span.c("wd-at", `#${r.seq}  ${WhisperLog.local(r.at, true)}`);
			span.c("wd-kind", server ? (r.kind === "interim" ? "guess" : "final") : `${r.src} ${r.kind}`);
			span.c("wd-text", () => {
				if (server && r.diff && r.change !== "same") r.diff.forEach(d => span.c(`wd-w is-${d.op}`, d.w + " "));
				else span(r.msg ?? "");
			});
			span.c("wd-note", this.note(r));
		}).click(() => { this.opened.has(key) ? this.opened.delete(key) : this.opened.add(key); this.picked = r; this.draw(); });
		if (this.opened.has(key)) new WhisperDemo.Detail({ subject: r });
	}

	/** The one thing to know about a row, in a few words. */
	note(r){
		if (r.replaced_by != null) return `${r.change === "amend" ? "amended · " : ""}replaced by #${r.replaced_by}`;
		if (r.replaces?.length) return `replaces ${r.replaces.length} guess${r.replaces.length > 1 ? "es" : ""}`;
		if (r.change === "amend") return "amended";
		if (r.dup_of != null) return `same as #${r.dup_of}`;
		return r.ms != null ? `${r.ms} ms` : "";
	}

	draw_foot(rows){
		const s = this.state();
		this.$foot.empty(() => {
			span.c("wd-count", `${s.guesses} guesses (${s.replaced} replaced) · ${s.finals} final · ${s.amended} amended`);
			if (rows.length) span.c("wd-legend muted", () => {
				span("A guess is Whisper re-reading everything said so far; it can still change. A pause sends the final, which replaces the guesses before it. ");
				a("How it works").attr("href", "/framework/audio/Whisper/doc/demo.md");
			});
		});
	}

	draw_class(){
		this.$body.empty(() => div.c("wd-class", () => {
			div(() => { p.c("muted", "The class"); inspect(WhisperDemo, { properties: "steps max tab source replay opened picked" }); });
			div(() => { p.c("muted", "This demo, live"); inspect(this.state()); });
			div(() => { p.c("muted", "The Whisper server, live"); inspect(Whisper.shared, { properties: "url status ping_ms restarts checked_at" }); });
			div(() => { p.c("muted", this.picked ? `The row you opened (#${this.picked.seq}), as an object` : "Open a row on the Log tab to see it here as an object"); if (this.picked) inspect(WhisperDemo.Detail.plain(this.picked)); });
		}));
	}
}

/** WhisperDemo.Detail — one answer drilled down: a sentence first, then the facts, each segment, the raw JSON. */
WhisperDemo.Detail = class extends View {

	/** The row without the view's own bookkeeping, for inspect(). */
	static plain(r){ const { diff, ...rest } = r; return rest; }

	render(){
		const r = this.subject, b = r.server ?? {};
		this.ac("wd-detail");
		p.c("wd-say", this.say(r));
		if (r.src === "server") div.c("wd-facts", () => {
			const fact = (k, v) => v != null && v !== "" && div(() => { span.c("muted", k + " "); span(String(v)); });
			fact("request", r.req); fact("segment", r.segment); fact("audio", r.seconds != null ? `${r.seconds} s` : null);
			fact("sent", r.bytes ? `${Math.round(r.bytes / 1024)} KB` : null); fact("answered in", r.ms != null ? `${r.ms} ms` : null); fact("language", b.language);
		});
		(b.segments ?? []).forEach(s => div.c("wd-seg", () => {
			div.c("wd-seg-head", () => {
				span.c("muted", `${(+s.start).toFixed(1)}–${(+s.end).toFixed(1)} s`);
				if (s.avg_logprob != null) span(`sure ${pct(Math.exp(s.avg_logprob))}`);
				if (s.no_speech_prob != null) span.c("muted", `silence ${pct(s.no_speech_prob)}`);
			});
			div.c("wd-words", () => (s.words?.length ? s.words : [{ word: s.text }]).forEach(w =>
				span.c("wd-word", w.word).style("--p", w.probability ?? 1).attr("title", w.probability != null ? `${pct(w.probability)} sure` : "")));
		}));
		details.c("wd-raw", () => { summary("Everything it recorded (JSON)"); pre(JSON.stringify(WhisperDemo.Detail.plain(r), null, 1)); });
	}

	say(r){
		if (r.src !== "server") return `What ${r.src} did with an answer: ${r.kind}.`;
		const heard = r.seconds != null ? `the ${r.seconds} s heard so far` : "the audio so far";
		if (r.kind === "interim") return `A guess. Dictate sent ${heard}; Whisper answered in ${r.ms ?? "?"} ms. ${r.replaced_by != null ? `The final #${r.replaced_by} replaced it.` : "A later answer may still change it."}`;
		return `The final answer for this pause: Dictate sent the whole ${r.seconds ?? "?"} s once more. ${r.replaces?.length ? `It replaced guesses #${r.replaces.join(", #")}.` : ""}`;
	}
};
