import { Page, p, h3, pre, div, a, span, button, demo } from "/app.js";
import { page_work } from "../../ai/work.js";
import Logger from "./Logger.js";
import LogView from "./LogView.js";

// A tiny object with its own log — two methods, one of them async, so the
// demo below can show a group closing itself either way.
class Counter {
	constructor(){ this.value = 0; }

	increment(by = 1){
		this.log("was", this.value);
		this.value += by;
		this.log("now", this.value);
		return this.value;
	}

	async load(){
		this.log("fetching a starting value");
		await new Promise(resolve => setTimeout(resolve, 300));
		this.value = 10;
		this.log("loaded", this.value);
		return this.value;
	}
}

export default new Page({
	meta: import.meta,
	title: "Log",
	description: "An object-oriented logger, rendered as nested cards — any object's own log, its methods as groups.",
	icon: "terminal",
	children: "whisper",

	content(){
		p("Any object can have its own log. `Logger.attach(obj)` gives it `this.log(...)`. `Logger.wrap(obj, [\"method\"])` makes every call of that method its own group, holding whatever it logs inside — sync or async, both the same way. `LogView` renders the result as nested cards, and redraws itself every time a new entry lands.");

		demo(() => {
			const counter = new Counter();
			Logger.attach(counter);
			Logger.wrap(counter, ["increment", "load"]);
			counter.increment(); // one call already logged, so the group shows before any click

			div.c("flex gap", () => {
				button("Increment").click(() => counter.increment());
				button("Load (async)").click(() => counter.load());
			});

			new LogView({ logger: counter.logger });
		}, "One \"increment\" group is already there from load — click a button to open another.");

		h3("How deep it can nest");
		p("Levels 1 through 3 keep the box. Level 4 drops it — a bold heading at the same indentation as its own content, never a fourth nested border — and it keeps getting quieter, not smaller forever, past that. `card/nesting/page.js`'s plain card tree uses this exact same rule, from the same shared constant (`card/depth.js`), so the two can't disagree again.");

		demo(() => {
			const logger = new Logger();

			logger.group("Section", () => {
				logger.log("a level-1 line — boxed");
				logger.group("Subsection", () => {
					logger.log("a level-2 line — still boxed");
					logger.group("Detail", () => {
						logger.log("a level-3 line — the last box");
						logger.group("Deeper still", () => {
							logger.log("a level-4 line — no box, just a heading");
							logger.group("Deepest", () => {
								logger.log("a level-5 line — smaller, quieter");
							});
						});
					});
				});
			});

			new LogView({ logger });
		}, "Five nested calls, rendered as: card, card, card, then a plain heading that just gets quieter as it goes deeper.");

		h3("Reading a log back");
		p("`Logger.JSONL` turns the same entries into one line per event — a group's open, its logs, its close. `Logger.from_jsonl(text)` reads that text back into the same nested shape `LogView` renders, so a saved log file looks exactly like a live one.");

		demo(() => {
			const sample = new Counter();
			const jsonl = new Logger.JSONL();
			Logger.attach(sample, { outputs: [jsonl] });
			Logger.wrap(sample, ["increment"]);

			sample.increment();
			sample.increment(5);

			pre(jsonl.text());
			new LogView({ entries: Logger.from_jsonl(jsonl.text()) });
		}, "The raw JSONL text above; the same text read back and rendered below.");

		h3("A real use");
		p(() => {
			a("Whisper debug log").href("whisper/");
			span(" runs this exact Logger against a real Transcriber.Whisper, ticking against a saved audio clip or the mic — one group per tick, the raw whisper-server text, what committed, and the seam it left in the running transcript.");
		});

		div.c("card pad", $box => page_work($box, { match: ["log", "logger"], page: this }));
	},
});
