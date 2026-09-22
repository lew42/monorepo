import { Page, View, div, span, a, p } from "/app.js";
import { HealthLog, today_url, latest_by_url } from "./log.js";

View.stylesheet(import.meta, "health.css");

/* Is it working? — the live readout for Server/health.mjs, the watcher that
   loads a changed page in a hidden browser and writes down what it saw.
   Full story of the watcher itself: ../../../../Server/health.mjs and this
   dir's readme.md. This page only reads its log (log.js), the same way
   ai/v/2/page.js reads a task's own log. devbar.js reads the same log.js for
   the one-line dev-bar readout. */

const clock = at => at ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";

export default new Page({
	meta: import.meta,
	title: "Page health",
	icon: "monitor_heart",
	description: "Is it working? Every page a change could have broken, checked in a hidden browser right after the save.",

	content(){
		// No DOM after an await — the box is captured now, filled in a callback.
		const $box = div.c("health");

		(async () => {
			const log = new HealthLog({ url: today_url() });
			let draw = () => {};
			draw = () => $box.empty(() => board(log));
			log.live(draw).then(draw);
		})();
	},
});

function board(log){
	if (!log.loaded){
		p("Nothing logged yet today. Server/health.mjs writes here the first time a change needs checking — see readme.md for how to start it.");
		return;
	}

	const rows = latest_by_url(log);
	const broken = rows.filter(r => r.verb === "error");
	const warned = rows.filter(r => r.verb === "warning");
	const clean = rows.filter(r => r.verb === "ok");

	if (!broken.length && !warned.length){
		const last = rows.at(-1);
		div.c("health-clear", () => {
			span("All clear.");
			span.c("muted", clean.length ? ` ${clean.length} page(s) checked today.` : " No checks yet today.");
			if (last) span.c("muted", ` Last check ${clock(last.at)}.`);
		});
		return;
	}

	if (broken.length) section("Broken", "health-error", broken);
	if (warned.length) section("Warnings", "health-warning", warned);
}

function section(title, cls, rows){
	div.c("health-section", () => {
		div.c("health-head", `${title} — ${rows.length}`);
		rows.forEach(r => row(r, cls));
	});
}

function row(r, cls){
	div.c("health-row " + cls, () => {
		a.c("health-url", r.url).href(r.url);
		span.c("health-text", r.text ?? "");
		if (r.file) span.c("health-file muted", r.file);
		span.c("health-time muted", clock(r.at));
	});
}
