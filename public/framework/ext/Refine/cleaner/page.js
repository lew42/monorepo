import { Page, p, div, h2, h3, md, span, a, button, textarea } from "/app.js";
import Cleaner from "../Cleaner.js";
import Objects from "/framework/ux/Objects/Objects.js";

/* Class page for Cleaner (ext/Refine/Cleaner.js): the API first, then a live demo.
 * Left: raw text in, cleaned sentences out. Right: the live Cleaner instance, redrawn after every run. */
const SAMPLE = "um can you hear me, the the mic is on. you know i think it works so lets try a longer one";

export default new Page({
	meta: import.meta,
	title: "Cleaner",
	description: "class Cleaner: raw dictation in, near-verbatim numbered sentences out. Instant plain function or the model.",
	icon: Cleaner.icon,

	content(){
		md("**`class Cleaner`** (`ext/Refine/Cleaner.js`) turns one dictated chunk into numbered sentences that stay as close to what was said as possible: capitals, punctuation and filler words are fixed, nothing else is removed.");
		md("```js\nconst c = new Cleaner({ model: \"\" });\nc.quick_clean(raw);        // instant, no model: fillers out, capitals, ? or .\nawait c.clean(raw);        // the model, then a faithfulness check\nc.sentences                // [{ n, text }]   c.mode  c.status  c.ms  c.flags\n```");
		p(() => { span("Callers: "); a("RefineSystem").href("/framework/ext/Refine/RefineSystem.js"); span(" (instant text on every chunk), "); a("Revise").href("/framework/ux/Revise/"); span(" and Servex's Echo (the model). The old function names live on in "); a("engine.js").href("/framework/ext/Refine/engine.js"); span("."); });

		const cleaner = new Cleaner();
		const grid = div().style({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22em), 1fr))", gap: "var(--gap)", alignItems: "start" });
		let $out, $obj, $in;
		grid.append(() => {
			div(() => {
				h3("Raw in, sentences out");
				$in = textarea().attr("rows", 4).style({ width: "100%", font: "inherit" });
				$in.el.value = SAMPLE;
				div(() => {
					button("Quick clean").click(() => run(false));
					button("Model clean").click(() => run(true));
				}).style({ display: "flex", gap: "0.5em", flexWrap: "wrap" });
				$out = div();
			});
			div(() => { h3("The live instance"); $obj = div(); });
		});

		const draw = () => {
			$out.empty(() => {
				if (cleaner.status === "error") p("Could not clean: " + cleaner.error);
				cleaner.sentences.forEach(s => div(() => { span("S" + s.n + " ").style({ opacity: "0.6" }); span(s.text); }));
				if (cleaner.status === "done") p(`${cleaner.mode === "quick" ? "instant, no model" : "by the model"}, ${cleaner.ms} ms`).style({ opacity: "0.7", fontSize: "0.9em" });
				if (cleaner.status === "working") p("Cleaning with the model…");
			});
			$obj.empty(() => { Objects.of(cleaner); });
		};
		const run = async model => {
			const raw = $in.el.value;
			if (!model){ cleaner.quick_clean(raw); return draw(); }
			const pending = cleaner.clean(raw).catch(() => {});
			cleaner.status = "working"; draw();
			await pending; draw();
		};
		run(false);
	},
});
