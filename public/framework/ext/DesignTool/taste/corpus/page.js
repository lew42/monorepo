import { Page, View, div, span, h2, md } from "/app.js";
import { PRESETS } from "/framework/styles/layouts/space/presets.js";
import { render } from "/framework/styles/layouts/space/spec.js";
import { rate } from "../taste.js";
import { BREAKS, SUBJECTS, WIDTHS, pair, judge } from "../corpus.js";

/* Thirty pairs, each one a layout and the same layout with one named thing broken —
 * and the assertion is only that the rulebook rates the original higher ON THE BAND
 * THE CASE IS ABOUT. Design record: ../readme.md.
 *
 * ⚠ Every render happens with the captor set to NOTHING. `render()` builds with bare
 *   factories, so a run started inside `content()` would append sixty throwaway
 *   layouts onto this page. */

export default new Page({
	meta: import.meta,
	title: "Corpus",
	description: "Break a layout on purpose, and check the rulebook noticed.",
	icon: "compare_arrows",

	content(){
		div.c("pad flow measure start", () => {
			md("**A rulebook that cannot be wrong is not a rulebook.** `tests/` asks whether a *rule fires*; nothing asked whether a *rating is in the right order* — and eleven bands were retuned twice with nothing anywhere asserting that the result ranks anything correctly.");

			md("A corpus of pages someone ranked needs someone. A corpus of **pairs** does not: take a layout, break one named thing, and the original is better by construction. Each case names the band it is about, so a failure says *which* band stopped working. Two cases are **expected to fail** — they mark the boundary of what this tier can see at all.");

			this.$note = span.c("space-tag muted", "measuring…");
		}).style("--measure", "52em");

		this.$out = div.c("bleed flex v gap").style("--gap", "1.6em");

		// ⚠ After the page is attached and settled — `rate()` reads geometry, and a
		//   corpus measured mid-render is a fact about the delay.
		setTimeout(() => this.run(), 500);
	},

	run(){
		const box = document.createElement("div");
		box.style.cssText = "position:fixed;left:-20000px;top:0;height:900px";
		box.setAttribute("data-layout-ignore", "");
		document.body.append(box);

		const marks = text => WIDTHS.map(w => {
			box.style.width = w + "px";
			View.set_captor(null);
			try {
				box.replaceChildren();
				box.append(render(text).style("height", "900px").el);
			} finally { View.restore_captor(); }
			return rate(box.firstElementChild, { ignore: null });
		});

		const rows = BREAKS.map(brk => ({ brk, cases: SUBJECTS.map(name => {
			const { base, broken, same } = pair(brk, PRESETS[name]);
			return same
				? { name, pass: null, why: "the break has nothing to change here" }
				: { name, ...judge(marks(base), marks(broken), brk) };
		}) }));

		box.remove();
		this.report(rows);
	},

	report(rows){
		const all = rows.flatMap(r => r.cases);
		const pass = all.filter(c => c.pass === true).length;
		const fail = all.filter(c => c.pass === false).length;

		this.$note.text(`${pass} agree · ${fail} disagree · ${all.length - pass - fail} not applicable`);

		this.$out.empty(() => rows.forEach(({ brk, cases }) => {
			div.c("surface pad flex v gap", () => {
				h2(brk.id).style("font-size", "1.2em");
				span.c("muted", brk.why);
				span.c("space-tag muted", `should cost ${brk.band}`
					+ (brk.expect === false ? " — and is expected NOT to, see the record" : ""));

				div.c("flex gap wrap", () => cases.forEach(c =>
					span.c("space-mark", () => {
						span.c("space-tag muted", c.name);
						span.c("space-grade", c.pass === null ? "n/a" : c.pass ? "agrees" : "DISAGREES")
							.style("color", c.pass === false ? "var(--prim)" : "inherit");
						c.band != null && span.c("space-tag muted", (c.band > 0 ? "−" : "+") + Math.abs(c.band));
					}).attr("title", c.why ?? `band moved ${c.band}, total moved ${c.total}`)))
					.style("--gap", "1.2em");
			}).style("--gap", "0.5em");
		}));
	},
});
