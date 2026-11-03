import { View, div, span, button, a, details, summary, pre } from "../../core/View/View.js";
import Dictate from "./Dictate.js";
import Connection from "./Connection.js";
import DictateHealth from "./DictateHealth.js";
import chat from "./chat.js";

View.stylesheet(import.meta, "DictateDebug.css");

/**
 * class DictateDebug — the Debug tab: a row of lights, one per stage a spoken sentence passes through (`DictateHealth.LAYERS`,
 * drawn by the shared `Connection` row in its `lights` layout), so "all green = should work". Hover or tap a light for its
 * last word; a tap also narrows the log to that stage. Under it, a compact live log: one line per record, its time and
 * stage, the raw data one click down. Doc: doc/debug-tab.md.
 *
 *   new DictateDebug();   // reads DictateHealth; starts nothing: the mic, Whisper and Servex are the chat's own
 *
 * The one request it makes is "Check Whisper", on load and on the button.
 */
export default class DictateDebug extends View {

	static AGE_MS = 1000;   // how often the picked light's "4 s ago" is redrawn while the tab is on screen (display only, no request)
	
	render(){
		this.ac("dictate-debug flex v");
		this.conn = new Connection({ whisper_url: Dictate.prototype.whisper_url, layout: "lights", steps: DictateHealth.LAYERS,
			on_pick: id => this.pick(this.only === id ? null : id),
			on_check: (up, why) => DictateHealth.set("whisper", up ? "ok" : "bad", why) });
		this.$detail = div.c("dictate-debug-detail").attr("aria-live", "polite");
		div.c("dictate-debug-bar flex wrap v-center", () => {
			button.c("dictate-debug-check", "Check Whisper").attr("type", "button").click(() => this.conn.check_whisper());
			button.c("dictate-debug-copy", "Copy report").attr("type", "button").attr("title", "Every light and log line as JSON, to paste into a chat or a bug")
				.click(() => this.copy());
			this.$copied = span.c("muted");
			span.c("dictate-debug-links flex wrap", () => {
				this.$session = a("session log").attr("target", "_blank").attr("title", "this conversation's own file, as Servex wrote it");
				a("Whisper log").href("/framework/audio/Whisper/log/").attr("title", "every Whisper answer and connection drop");
				// git-ignored and written on this machine at the first failure: until then (and on the static site) it would 404
				this.$failures = a("failures").href(DictateHealth.MODULE + "failures.jsonl").attr("target", "_blank").attr("title", "ux/Dictate/failures.jsonl: every light that turned red");
				fetch(DictateHealth.MODULE + "failures.jsonl", { method: "HEAD", cache: "no-store" }).then(r => { this.failures_file = r.ok; this.draw(); })
					.catch(() => {});   // ignored on purpose: no file is the normal case, the link stays hidden
			});
		});
		this.$log = div.c("dictate-debug-log").attr("role", "log");
		this.$empty = span.c("dictate-debug-empty muted", "Nothing yet. Press the mic in the chat and say something.");
		this.stop = DictateHealth.on(() => this.draw());
		this.conn.check_whisper();
		this.timer = setInterval(() => this.el.isConnected ? this.draw_detail() : this.dispose(), this.constructor.AGE_MS);
		this.draw();
	}

	dispose(){ clearInterval(this.timer); this.stop?.(); }

	static ago(at){
		if (!at) return "";
		const s = Math.round((Date.now() - at) / 1000);
		return s < 2 ? "just now" : s < 120 ? s + " s ago" : Math.round(s / 60) + " min ago";
	}

	static time(at){
		const d = new Date(at);
		return d.toLocaleTimeString([], { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
	}

	static label(id){ return DictateHealth.LAYERS.find(l => l.id === id)?.label ?? id; }

	/** A light was tapped: its last word in full above the log, and the log narrowed to its stage (tap again for all). */
	pick(id){
		this.only = id;
		for (const el of this.conn.el.querySelectorAll("[data-step]")) el.setAttribute("aria-pressed", String(el.dataset.step === id));
		for (const el of this.$log.el.children) el.hidden = !!id && el.dataset.layer !== id;
		this.draw_detail();
	}

	draw(){
		const L = DictateHealth.layers;
		for (const { id, label } of DictateHealth.LAYERS) this.conn.set(id, L[id].state, `${label}: ${L[id].why}${L[id].state !== "bad" && L[id].last_bad ? `  (last error: ${L[id].last_bad.why})` : ""}`);
		const file = chat.file?.();
		this.$session.href(file);
		this.$session.el.hidden = !file;
		this.$failures.el.hidden = !(this.failures_file || DictateHealth.LAYERS.some(({ id }) => L[id].state === "bad"));   // a red light has just written it
		this.draw_log();
		this.draw_detail();
	}

	draw_detail(){
		const id = this.only;
		if (!id){ this.$detail.text("All green = it should work. Tap a light for its last word; the log below is newest first."); return; }
		const l = DictateHealth.layers[id], ask = DictateHealth.LAYERS.find(x => x.id === id)?.ask ?? "";
		const age = l.at ? (l.state === "wait" ? " · waiting " + this.constructor.ago(l.since ?? l.at).replace(/ ago$/, "") : " · " + this.constructor.ago(l.at)) : "";
		this.$detail.empty(() => {
			span.c("dictate-debug-detail-ask muted", ask + " ");
			span.c("dictate-debug-detail-why", l.why + age);
			if (l.state !== "bad" && l.last_bad) span.c("dictate-debug-detail-last muted", ` Last error ${this.constructor.ago(l.last_bad.at)}: ${l.last_bad.why}`);
		}).attr("data-state", l.state);
	}

	/** New events only, newest on top; an open line (its raw data showing) stays open. */
	draw_log(){
		const events = DictateHealth.events, start = events.lastIndexOf(this.last_event) + 1;
		const fresh = this.last_event && start === 0 ? events : events.slice(start);   // start 0 with a last_event: it scrolled out, draw them all
		if (!fresh.length) return;
		this.last_event = events.at(-1);
		const T = this.constructor;
		for (const e of fresh){
			const raw = e.raw === undefined ? null : e.raw;
			const line = new View({ el: document.createElement("details"), capture: false }).append(() => {
				summary.c("dictate-debug-line-sum flex", () => {
					span.c("dictate-debug-when muted", T.time(e.at));
					span.c("dictate-debug-tag", T.label(e.layer));
					span.c("dictate-debug-why", e.why);
				});
				pre.c("dictate-debug-raw", raw === null ? e.why : typeof raw === "string" ? raw : JSON.stringify(raw, null, 2));
			});
			line.el.className = "dictate-debug-line";
			line.el.dataset.layer = e.layer; line.el.dataset.state = e.state;
			if (this.only && this.only !== e.layer) line.el.hidden = true;
			this.$log.el.prepend(line.el);
		}
		while (this.$log.el.children.length > DictateHealth.KEEP) this.$log.el.lastElementChild.remove();
		this.$empty.el.hidden = this.$log.el.children.length > 0;
	}

	async copy(){
		const report = JSON.stringify({ at: new Date().toISOString(), page: location.href, ...DictateHealth.snapshot() }, null, 2);
		try { await navigator.clipboard.writeText(report); this.$copied.text("copied"); }
		catch { this.$copied.text("the browser refused the clipboard: the report is in the console"); console.log(report); }   // shown, not silent
	}
}
