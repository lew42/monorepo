import { Page, p, h3, strong, div, button, select, option, input } from "/app.js";
import Transcriber from "../../../../../audio/Transcriber/index.js";
import MicStream from "../../../../../audio/MicStream/MicStream.js";
import { page_work } from "../../../ai/work.js";
import Logger from "../Logger.js";
import LogView from "../LogView.js";
import ClipMic from "./ClipMic.js";
import Transcript from "./Transcript.js";
import instrument_whisper from "./Instrument.js";

const CLIPS = [
	{ label: "JFK — inaugural line", url: "/framework/ai/recordings/jfk.wav" },
	{ label: "just_a_test", url: "/framework/ai/recordings/just_a_test.wav" },
	{ label: "whisper-servex clip", url: "/framework/ai/2026-09-22/whisper-servex/clip.wav" },
];

// `fetch`, but it gives up instead of hanging — copied from Whisper.js's own
// `fetch_timeout()` (four lines; `audio/**` is read-only for this task).
async function fetch_timeout(url, ms){
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	try { return await fetch(url, { signal: ctrl.signal }); }
	finally { clearTimeout(timer); }
}

export default new Page({
	meta: import.meta,
	title: "Whisper debug log",
	description: "Runs a real Transcriber.Whisper against a saved clip or the mic, and logs every tick as a nested card.",
	icon: "subtitles",

	content(){
		p(function(){
			this.backticks("This is the owner's own old idea, rebuilt: ");
			strong("read the actual log file for the whisper process.");
			this.backticks(" It runs a real `Transcriber.Whisper` against a saved audio clip — no microphone needed to see it work — and turns every tick into one log group: how many seconds of audio went in, the previous guess's tail, the raw text whisper-server answered (nested, its group's own duration is the request's `ms`), how many words agreed, what committed (highlighted), and the new tail. A forced commit past `window_s` opens as its own group, marked a seam.");
		});

		this.$status = p.c("muted", "checking whisper-server…");
		this.check_server();

		const $controls = div.c("card pad flex gap wrap");
		$controls.append(() => {
			this.$clip = select(() => CLIPS.forEach(c => option(c.label).attr("value", c.url)));
			this.$start = button("Start with this clip").click(() => this.run({ url: this.$clip.el.value }));
			this.$mic = button("Use the mic instead").click(() => this.run({ mic: true }));
			this.$stop = button("Stop").attr("disabled", "").click(() => this.stop_run());
		});

		h3("Transcript");
		p("The running committed text. A thin │ between two commits is a seam — click it to jump to the tick that made it.");
		this.$transcript = new Transcript();

		h3("Log");
		this.$log_slot = div();

		h3("Keep a run");
		div.c("flex gap wrap", () => {
			this.$download = button("Download JSONL").attr("disabled", "").click(() => this.download());
			this.$file_input = input().attr("type", "file").attr("accept", ".jsonl,text/plain")
				.on("change", e => this.load_file(e.target.files[0]));
		});
		this.$loaded_label = p.c("muted");
		this.$loaded_slot = div();

		div.c("card pad", $box => page_work($box, { match: ["whisper", "dictate", "transcrib"], page: this }));
	},

	// `Transcriber.Whisper.whisper_url` is a public instance field, set from
	// the same `default_whisper_url()` Whisper.js uses internally — reading
	// it off a throwaway instance is simpler than re-deriving the rule.
	async check_server(){
		const url = new Transcriber.Whisper().whisper_url;
		try {
			const r = await fetch_timeout(url + "/", 2500);
			this.$status.text(r.ok || r.status < 500 ? "whisper-server is answering at " + url + "." : "whisper-server answered " + url + " with " + r.status + ".");
		} catch {
			this.$status.text("whisper-server isn't answering at " + url + " right now — Servex supervises it; ask for a restart.");
		}
	},

	// `source` is `{ url }` (a saved clip) or `{ mic: true }` (a real
	// microphone). Stops whatever run is already going first — Start is
	// always safe to click again.
	async run(source){
		this.stop_run();
		this.$transcript.empty();

		this.mic = source.mic ? new MicStream() : new ClipMic({ url: source.url });
		this.whisper = new Transcriber.Whisper();
		const { logger, on_seam } = instrument_whisper(this.whisper);
		this.jsonl = new Logger.JSONL();
		logger.outputs.push(this.jsonl);
		on_seam((tick_id, text) => this.$transcript.commit(tick_id, text));

		this.$log_slot.empty(() => { new LogView({ logger }); });
		this.$download.el.removeAttribute("disabled");
		this.$start.attr("disabled", "");
		this.$stop.el.removeAttribute("disabled");

		try {
			await this.mic.start();
		} catch (e){
			this.$status.text("Couldn't start " + (source.mic ? "the mic" : "the clip") + ": " + e.message);
			this.stop_run();
			return;
		}
		await this.whisper.start(this.mic);
	},

	stop_run(){
		this.whisper?.stop();
		this.mic?.stop();
		this.whisper = null;
		this.mic = null;
		this.$start?.el.removeAttribute("disabled");
		this.$stop?.attr("disabled", "");
	},

	download(){
		if (!this.jsonl) return;
		const blob = new Blob([this.jsonl.text()], { type: "application/jsonl" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url; a.download = "whisper-log.jsonl";
		a.click();
		URL.revokeObjectURL(url);
	},

	async load_file(file){
		if (!file) return;
		const text = await file.text();
		const entries = Logger.from_jsonl(text);
		this.$loaded_label.text("Loaded " + file.name + " — for comparison beside the run above, not replacing it.");
		this.$loaded_slot.empty(() => { new LogView({ entries }); });
	},
});
