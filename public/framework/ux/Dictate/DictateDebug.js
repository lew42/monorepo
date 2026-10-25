import { View, div, span, button, a, h3, p } from "../../core/View/View.js";
import Dictate from "./Dictate.js";
import Connection from "./Connection.js";
import DictateHealth from "./DictateHealth.js";
import chat from "./chat.js";

View.stylesheet(import.meta, "DictateDebug.css");

/**
 * class DictateDebug — the Debug tab: dictation, layer by layer, live. One row per layer (`DictateHealth.LAYERS`,
 * drawn by the shared `Connection` row in its `rows` layout): green works, amber is waiting, red failed and says
 * why in full. Beside it, the last things that happened, newest first, and the logs to open.
 *
 *   new DictateDebug();   // reads DictateHealth; starts nothing: the mic, Whisper and Servex are the chat's own
 *
 * It only reads: the mic is the chat's (`ux/Dictate/chat.js`), so the layers fill as soon as you talk there.
 * The one request it makes is "Check Whisper", on load and on the button. Doc: doc/debug-tab.md.
 */
export default class DictateDebug extends View {

	static AGE_MS = 1000;   // how often the "4 s ago" words are redrawn while the tab is on screen (display only, no request)

	render(){
		this.ac("dictate-debug");
		div.c("dictate-debug-col dictate-debug-layers", () => {
			h3("Dictation, layer by layer");
			p.c("muted", "Each row is one step a spoken sentence passes through, from the microphone to the AI's answer. Green works, amber is waiting, red failed, and says why.");
			this.conn = new Connection({ whisper_url: Dictate.prototype.whisper_url, layout: "rows", steps: DictateHealth.LAYERS,
				on_check: (up, why) => DictateHealth.set("whisper", up ? "ok" : "bad", why) });
			div.c("dictate-debug-actions flex wrap gap", () => {
				button.c("dictate-debug-copy", "Copy the report").attr("type", "button").attr("title", "Every layer and event as JSON, to paste into a chat or a bug")
					.click(() => this.copy());
				this.$copied = span.c("muted");
			});
		});
		div.c("dictate-debug-col dictate-debug-events", () => {
			h3("What happened, newest first");
			this.$events = div.c("dictate-debug-list flex v");
			h3("Logs");
			div.c("dictate-debug-links flex v", () => {
				this.$session = a("this conversation's session log").attr("target", "_blank");
				a("every Whisper answer and connection drop").href("/framework/audio/Whisper/log/");
				a("dictation errors (ux/Dictate/failures.jsonl)").href(DictateHealth.MODULE + "failures.jsonl").attr("target", "_blank");
				a("the dictation playground").href("/framework/ux/Dictate/playground/");
			});
		});
		this.stop = DictateHealth.on(() => this.draw());
		this.conn.check_whisper();
		this.timer = setInterval(() => this.el.isConnected ? this.draw() : this.dispose(), this.constructor.AGE_MS);
		this.draw();
	}

	dispose(){ clearInterval(this.timer); this.stop?.(); }

	static ago(at){
		if (!at) return "";
		const s = Math.round((Date.now() - at) / 1000);
		return s < 2 ? "just now" : s < 120 ? s + " s ago" : Math.round(s / 60) + " min ago";
	}

	draw(){
		const L = DictateHealth.layers, ago = this.constructor.ago;
		for (const { id } of DictateHealth.LAYERS){
			const l = L[id], age = l.at ? (l.state === "wait" ? " · waiting " + ago(l.since ?? l.at).replace(/ ago$/, "") : " · " + ago(l.at)) : "";
			this.conn.set(id, l.state, l.why + age);
		}
		const file = chat.file?.();
		this.$session.href(file);
		this.$session.el.hidden = !file;
		const rows = DictateHealth.events.slice().reverse();
		if (rows.length === this.drawn && rows[0]?.at === this.newest) return;   // nothing new: only the ages above changed
		this.drawn = rows.length; this.newest = rows[0]?.at;
		this.$events.empty(() => {
			if (!rows.length) span.c("muted", "Nothing yet. Press the mic in the chat and say something.");
			for (const e of rows) div.c("dictate-debug-event", () => {
				span.c("dictate-debug-when muted", new Date(e.at).toLocaleTimeString());
				span.c("dictate-debug-layer", DictateHealth.LAYERS.find(l => l.id === e.layer)?.label ?? e.layer);
				span.c("dictate-debug-why", e.why);
			}).attr("data-state", e.state);
		});
	}

	async copy(){
		const report = JSON.stringify({ at: new Date().toISOString(), page: location.href, ...DictateHealth.snapshot() }, null, 2);
		try { await navigator.clipboard.writeText(report); this.$copied.text("copied"); }
		catch { this.$copied.text("the browser refused the clipboard: the report is in the console"); console.log(report); }
	}
}
