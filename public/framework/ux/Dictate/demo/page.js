import { Page, p, div, button, span } from "/app.js";
import { composer } from "/framework/ext/Chat/Composer.js";

/* Fake dictation: no microphone, no Whisper. Each sentence "arrives" the way a real one does —
   a guess that grows word by word, then the finished sentence — with a pause before it.
   The last sentence stays half-said for a while, so you can press Send in the middle of it. */
const SCRIPT = [
	["Hello, this is the first sentence.", 300],
	["Here comes the second one.", 500],
	["And the third sentence ends here.", 500],
	["After a long silence, a new thought starts.", 6000],
	["It has two sentences.", 500],
	["Now I keep talking without finishing this sentence, so press Send right now and watch it stay", 700],
];
const TAIL = " until it is done.";

const MODES = {
	pause: "Sends by itself: every finished sentence goes out as it completes, and whatever is left after 4 seconds of silence.",
	manual: "Send only. Nothing ever leaves by itself.",
	sentences: "Sends every finished sentence as it completes; leftovers wait for Send.",
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default new Page({
	meta: import.meta,
	title: "Send modes",
	description: "Fake dictation you can watch: the same words, three ways of deciding when they are sent.",
	icon: "send",

	content(){
		let $composer, $log, $why, mic, run = 0;
		const $modes = {};

		const pick = mode => {
			mic.send_mode = mode;   // this demo's own switch; the real default is SETTINGS.send_mode in ext/Chat/Mic.js
			for (const [m, $b] of Object.entries($modes)) $b.el.classList.toggle("prim", m === mode);
			$why.text(MODES[mode]);
			mic.arm();
		};

		const reset = () => {
			run++;
			clearTimeout(mic.held_timer); clearInterval(mic.auto_timer);
			Object.assign(mic, { state: "idle", held: [], pending: [], partial_text: "", gaps: [], has_speech: false, tail: "", segment_epoch: 0, dropped: null });
			if (mic.base !== undefined) mic.base = "";
			mic.field.el.value = "";
		};

		const play = async () => {
			reset();
			const me = run;
			mic.state = "listening";
			mic.last_send_at = performance.now();
			mic.auto_timer = setInterval(() => mic.auto_check(), 250);
			for (const [text, gap] of SCRIPT){
				await sleep(gap);
				if (me !== run) return;
				mic.gap_before = gap; mic.has_speech = true;
				const words = text.split(" ");
				for (let i = 1; i <= words.length; i++){
					if (me !== run) return;
					mic.partial_text = words.slice(0, i).join(" ");
					mic.last_loud_at = mic.last_speech = performance.now();
					mic.draw_caption();
					await sleep(140);
				}
				if (text === SCRIPT.at(-1)[0]) break;   // this one is finished only after the wait below
				mic.gaps.push(gap); mic.commit(text); mic.has_speech = false;
			}
			await sleep(7000);
			if (me !== run) return;
			const last = SCRIPT.at(-1)[0] + TAIL;
			mic.gaps.push(0); mic.commit(last); mic.has_speech = false;
			mic.state = "idle";
		};

		div.c("flex v gap", () => {
			p("Press ▶ Dictate, pick a way of sending, and watch the box. Words appear as they are spoken; a mode decides when they leave.");

			div.c("flex gap wrap", () => {
				for (const m of Object.keys(MODES)) $modes[m] = button.c("").attr("type", "button").text(m).click(() => pick(m));
				button.c("").attr("type", "button").text("▶ Dictate").click(play);
				button.c("").attr("type", "button").text("Reset").click(() => { reset(); $log.el.replaceChildren(); });
			});
			$why = span.c("muted", "");

			$composer = composer({
				mic: true,
				placeholder: "fake words appear here",
				deliver: async entry => {
					$log.append(() => div.c("pad", "sent: " + entry.text));
					return true;
				},
			});
			mic = globalThis.$demo_mic = $composer.mic;   // the test hook: a headless run drives this same mic
			$log = div.c("flex v gap muted");
			pick("pause");
		}).style("max-width", "40em");
	},
});
