import { Page, md, div, View } from "/app.js";
import { button } from "/framework/core/View/View.js";
import Bench from "./Bench.js";

View.stylesheet(import.meta, "Bench.css");

export default new Page({
	meta: import.meta,
	title: "Batching benchmark",
	description: "Seven ways to update 1,000 rows at once. Click one and watch the milliseconds.",
	icon: "timer",

	content(){
		md(`**Reading layout between writes is the only slow way.** Click a strategy: it updates 1,000 rows (5,000 cells, three writes each) and reports the time until the frame painted. The paint and layout counts come from the headless runner: [doc/batching.md](/framework/code/performance/doc/batching.md).`);
		const host = div.c("pad");
		const out = div.c("pad");
		let t = Bench.build(host.el);
		let n = 0;
		div.c("pad", () => {
			for (const [name, s] of Object.entries(Bench.strategies)){
				button(s.label, async () => {
					if (name === "thrash") out.el.textContent = "Running the slow one, the tab will freeze for about 7 seconds...";
					await new Promise(r => setTimeout(r, 50));
					const r = await Bench.time(name, t, ++n);
					out.el.textContent = `${s.label}: ${r.painted_ms.toFixed(0)} ms to paint (${r.sync_ms.toFixed(0)} ms in your code)`;
				});
			}
		});
	},
});
