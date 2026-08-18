import { Page, div, a, img, h2, h3, p, span, pre, button, details, summary, md } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import { CHANGES, OPEN } from "./changes.js";

const HERE = "/framework/ai/2026-08-17/layout-primitives/";
const VERDICTS = HERE + "verdicts.jsonl";
const BEFORE = "/framework/ai/2026-08-17/layout-system/";
const AFTER = "/framework/ai/2026-08-17/vision-after/";
const WAVE2 = "/framework/ai/2026-08-17/layout-wave-2/";
const WAVE3 = "/framework/ai/2026-08-17/layout-wave-3/";
const SWEEP = "/framework/ai/2026-08-17/sweep-harvest/";
const WIDTHS = [900, 1440, 3440];

/* No stylesheet, on purpose — this page is the proposal's own smoke test. Every box
   below is one of the five words plus the utility vocabulary that was already there:
   `wide` for the sheets and the wall, `wall` for the change cards, `surface pad flex
   v gap` for a card. If this page needed a sixth word, that was the finding.

   Accept/Reject (ai/2026-08-17/accept-buttons/): reuses the site's plain `button()` —
   no new component, no new CSS. A click calls `write_verdict()`, which follows
   `ext/DesignTool/audit/twin.js:85-91` exactly: the "write" RPC WRITES, it does not
   append, so every click fetches `verdicts.jsonl` back as text, adds one
   `{"verdict": {"id","accept","at"}}` line, and resends the whole file over the dev
   socket. `load_verdicts()` reads it the same way on mount and folds it into a Map
   keyed by id — last line for an id wins, so re-clicking changes a verdict rather
   than adding a second one. A rejected card's existing "Deletes" line already IS its
   revert; `render_status()` just repeats it under a "to apply" label so an agent
   applying reverts doesn't have to go hunting for it. */
export default new Page({
	meta: import.meta,
	title: "Five layout words",
	description: "The page shell, the rail, the wall, the stage and solo — what each one fixed, what it deletes on accept, and what is still open.",
	icon: "dashboard",

	content(){
		const broken = CHANGES.filter(c => c.cls === "broken").length;
		this.ready = this.load_verdicts();

		md(`**${CHANGES.length} changes, ${broken} of them things you can see are broken and `
			+ `${CHANGES.length - broken} judgement calls.** `
			+ "The five words are in [core/Page/Page.css](/framework/core/Page/Page.css); "
			+ `the reasoning and the measurements are the [proposal](${BEFORE}proposal.md). `
			+ `The ones marked **wave 2** are what the vision tool asked for after the first wave shipped `
			+ `([findings](${AFTER}proposal.md) · [the fixes](${WAVE2})); **wave 3** answers the `
			+ `[280-finding sweep](${SWEEP}proposal.md) ([the fixes](${WAVE3}) · `
			+ `[why the reach-through did not land](${WAVE3}proposal.md)). `
			+ 'Every "before" number below was measured on this site.');

		this.sheets();
		this.changes();
		this.open();
	},

	/* Before and after at the three widths Mike actually uses — the whole point of the
	   task in one row, at `wide` so it gets the room a reading column never would. */
	sheets(){
		h2("Before and after");

		md("Eight pages, three widths, DPR 1. ⚠ `/framework/ai/` and the day page were "
			+ "being edited by `ai-board-fix` while these were taken, so read those two tiles "
			+ "as *changed*, not as *changed by this task*.");

		div.c("wide wall", () => WIDTHS.forEach(w =>
			div.c("flex v gap", () => {
				h3(`${w}px`);
				/* ⚠ `.stage` on the DIV, never on the <img>: a stage declares
				   `container-type`, and size containment on a replaced element collapses
				   it — the sheets rendered at zero height for one build. A stage is a
				   box; the picture goes in it. */
				a.c("", () => div.c("stage surface", () => img.c("")
					.attr("src", `${HERE}after-${w}.png`).attr("alt", `after, ${w}px`))
					.style({ "--stage": "auto", "--stage-max": "20em" }))
					.href(`${HERE}after-${w}.png`);

				span.c("muted", () => {
					span("after · ");
					a.c("", "before").href(`${BEFORE}contact-${w}.png`);
				});
			}))).style({ "--column": "22em", "--gap": "1.5em" });
	},

	/* One card per change. `wall` counts its own columns, so this is six across at 3440
	   and one at 390 with no breakpoint anywhere in this file. */
	changes(){
		h2(`The ${CHANGES.length} changes`);

		this.$counts = p.c("muted", "");
		this.ready.then(() => this.render_counts());

		div.c("wide wall", () => CHANGES.forEach(c =>
			div.c("surface pad flex v gap", () => {
				div.c("flex gap v-center", () => {
					span.c("h4", c.cls === "broken" ? "BROKEN" : "MAYBE")
						.style("color", c.cls === "broken" ? "var(--error)" : "var(--subtle)");

					if (c.wave) span.c("muted h4", `WAVE ${c.wave}`);
				});

				h3(c.title);
				md(c.line);

				div.c("flex v gap").style("--gap", "0.25em").append(() => {
					div.c("muted", `before — ${c.before}`);
					div(`after — ${c.after}`);
				});

				if (c.imgs) div.c("flex v gap").style("--gap", "0.6em").append(() => c.imgs.forEach(s =>
					div.c("flex v gap").style("--gap", "0.25em").append(() => {
						span.c("muted h4", `${s.w}px — table ${s.beforeW} → ${s.afterW}px, page ${s.beforeH} → ${s.afterH}px tall`);
						div.c("flex gap wrap", () => [["before", s.before], ["after", s.after]].forEach(([label, src]) =>
							a.c("", () => img.c("").attr("src", `${HERE}${src}`).attr("alt", label).style({ maxWidth: "16em", display: "block" })).href(`${HERE}${src}`)));
					})));

				details.c("", () => {
					summary.c("muted", "the CSS");
					pre.c("", c.css);
				});

				md(`**Deletes:** ${c.deletes}`);
				span.c("muted", c.files.join(" · "));

				const $status = div.c("flex v gap").style("--gap", "0.5em");
				this.ready.then(() => this.render_status(c, $status));
			}))).style({ "--column": "26em", "--gap": "1.2em" });
	},

	/* One line, filled once `this.ready` resolves — see the top-of-file comment. */
	render_counts(){
		const verdicts = [...this.verdicts.values()];
		const accepted = verdicts.filter(v => v.accept === true).length;
		const rejected = verdicts.filter(v => v.accept === false).length;
		this.$counts.text(`${accepted} accepted · ${rejected} rejected · ${CHANGES.length - accepted - rejected} open`);
	},

	// Buttons + tag, rebuilt after every click so the row always shows the latest verdict.
	render_status(c, $status){
		const v = this.verdicts.get(c.id);

		$status.empty(() => {
			div.c("flex gap v-center wrap", () => {
				button("Accept").ac(v?.accept === true ? "prim" : "")
					.on("click", () => this.verdict(c, true, $status));
				button("Reject").style("color", v?.accept === false ? "var(--error)" : "")
					.on("click", () => this.verdict(c, false, $status));

				if (v) span.c("h4", v.accept ? "accepted" : "rejected")
					.style("color", v.accept ? "var(--ok)" : "var(--error)");
			});

			if (v?.accept === false) div.c("flex v gap").style("--gap", "0.25em").append(() => {
				span.c("muted h4", "to apply");
				md(c.deletes);
			});
		});
	},

	async verdict(c, accept, $status){
		await this.write_verdict(c.id, accept);
		this.render_counts();
		this.render_status(c, $status);
	},

	/* Same shape as ext/DesignTool/audit/twin.js:85-91: the "write" RPC WRITES the
	   whole file, it does not append, so every click reads verdicts.jsonl back as
	   text, adds one line, and resends the lot over the dev socket. Two clicks in
	   the same second would still race — this is Mike's rubber-stamp queue, not a
	   datastore, same caveat twin.js states for accepted.css. */
	async write_verdict(id, accept){
		const at = new Date().toISOString();
		const line = JSON.stringify({ verdict: { id, accept, at } }) + "\n";

		const res = await fetch(VERDICTS).catch(() => null);
		const existing = res?.ok && !res.headers.get("content-type")?.includes("html") ? await res.text() : "";

		await Socket.singleton().async_rpc("write", VERDICTS, existing + line);
		this.verdicts.set(id, { id, accept, at });
	},

	// Latest verdict per id wins — JSONL.parse tolerates a torn or missing file.
	async load_verdicts(){
		this.verdicts = new Map();

		const res = await fetch(VERDICTS).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return;

		for (const entry of JSONL.parse(await res.text()))
			if (entry.verdict?.id) this.verdicts.set(entry.verdict.id, entry.verdict);
	},

	open(){
		h2("Still open — read this before accepting");

		div.c("wide flex v gap", () => OPEN.forEach(([title, body]) =>
			div.c("surface pad flex v gap", () => { h3(title); md(body); })));

		md("**Accept/Reject buttons are on every card above**, writing `verdicts.jsonl` in this dir "
			+ "over the dev socket, `ext/DesignTool/audit/twin.js`'s write-whole-file pattern — see "
			+ "the top of `page.js`. Rejecting any single change is a one-line revert, and each card "
			+ "says which line; a rejected card repeats it under \"to apply\".");
	},
});
