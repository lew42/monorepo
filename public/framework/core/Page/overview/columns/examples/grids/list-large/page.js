import { Page, div, p, md } from "/app.js";

/* Small list → large detail — the Finder pattern inverted in weight. Each row's
   detail is a small stat grid, wide enough to earn a `large` column. */
// ⚠ `p()` reads backticks only — bold renders as literal asterisks (View.js `backticks()`).
const stats = pairs => div.c("grid auto gap pad wash", () => pairs.forEach(([k, v]) => p(`${k}: ${v}`)));

export default new Page({
	meta: import.meta,
	title: "List → Large",
	description: "A small picker opens a large content column.",
	width: "small",

	initialize(){ this.columns(); },

	content(){
		md("A **small** picker opens a **large** content column — the Finder pattern, inverted in weight.");
		md("**Verdict:** small list + large detail works when the detail is genuinely wide content (a stat grid, a table) — `large` earns its width only when what opens actually needs it.");
	},

	children: {
		Overview: { icon: "dashboard", width: "large", classes: "default", content(){
			md("A status board — four short stats.");
			stats([["Uptime", "99.9%"], ["Requests", "1.2k/s"], ["Errors", "0.02%"], ["Latency", "42ms"]]);
		} },
		Metrics: { icon: "insights", width: "large", content(){
			md("A metrics row.");
			stats([["Users", "8,214"], ["Sessions", "31,005"], ["Bounce", "24%"], ["Avg. time", "3m12s"]]);
		} },
		Timeline: { icon: "schedule", width: "large", content(){
			md("A short timeline, one line each.");
			stats([["09:00", "Deploy shipped"], ["09:04", "Traffic normal"], ["11:30", "Cache warmed"], ["14:02", "No incidents"]]);
		} },
	},
});
