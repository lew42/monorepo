import { div, span, p, ul, li, button, input } from "../../core/View/View.js";
import Socket from "../../dev/Socket/Socket.js";
import { edit } from "../Ask/edit.js";
import "../../ui/decision/decision.js";
import { Ranking, stamp } from "./rank.js";
import { reply } from "../Ask/reply.js";

/**
 * The Decisions tab — every choice this task made, with the alternatives it was
 * made over, and the owner's Approve or Improve on each one.
 *
 * LEVEL 1 is a list, one row per decision: the question, the option that won,
 * and a status mark. A dozen decisions fit on one screen, which is the point.
 *
 * LEVEL 2 opens in place, under that row: **every option gets a card with its
 * own ground** (`ui/decision`, the template), the chosen one marked, the reason
 * under them, the rule that produced it, and the two buttons.
 *
 * A press is not an edit. It appends a `verdict` line to THIS task's own
 * `task.jsonl` through the dev socket (`rpc:append`), the line comes back off
 * the wire like anybody else's, `TaskJSONL.verdict()` merges it onto the
 * decision's `status`/`note`, and the row redraws — no reload, no second file.
 * The task log is the record; see `doc/decisions-tab.md`.
 */

/* How long the wire gets to hand the writer its own line back. /imagine/stream/
   measures the real round trip at 9 ms; the safety net below is for a dev server
   that is up enough to accept the append and not to stream it. */
const WIRE = 2000;

/* The one switch every editor control reads (ext/Ask/edit.js) — off localhost, or
   with the rail's Edit toggle off, the buttons are not drawn at all, the same rule
   ext/Saver, the CMS editor, /imagine/importance/ and /layouts/browse/ already
   follow. The static site still SHOWS every decision and every verdict either way. */
const writable = () => edit();

/**
 * @param m     the task's manifest (a TaskJSONL carrying `decisions`)
 * @param state { open, improving, redraw } — which row is open, which is taking
 *              a note, and how to draw the whole tab again after a change.
 *              Held by the page, not by this module, so a streamed append can
 *              redraw without closing what the reader had open.
 */
export function decisions(m, state){
	const rank = new Ranking({ m, list: "decisions", redraw: state.redraw });
	const rows = rank.sort(m.decisions ?? []);

	return div.c("ai-decisions-tab flow", () => {
		summary(rows);
		// One band: the decisions of one task are one list, in the order the owner
		// put them. `rank.js` draws the grips and writes the `rank` line.
		div.c("ai-decisions", $rows => {
			const band = rank.band($rows);
			rows.forEach(d => row(d, m, state, band));
		});
	});
}

/* What this list IS, then the count of each answer. "6 DECISIONS" alone is a
   number; a reader arriving cold has to be told what they are looking at. */
function summary(rows){
	const count = say => rows.filter(d => (d.status ?? "open") === say).length;
	div.c("ai-decisions-head flex split v-baseline wrap", () => {
		span.c("ai-group-title muted", `${rows.length} choice${rows.length === 1 ? "" : "s"} this task made`);
		span.c("muted", `${count("approved")} approved · ${count("improve")} to improve · ${count("open")} waiting on you`);
	});
}

/* ── level 1: one row ──────────────────────────────────────────────────────── */

function row(d, m, state, band){
	div.c("ai-decision").ac(state.open === d.id && "active").append($row => {
		band?.grip($row, d.id);
		div.c("ai-decision-line flex split v-baseline wrap").append($line => {
			span.c("ai-decision-about", d.about ?? d.id);
			span.c("ai-decision-chose flex v-center", () => {
				// A decision with no `chose` is legitimate — the question is
				// open and the options are laid out for the owner to pick from.
				span.c("muted", chose(d)?.say || d.chose || "nothing chosen yet");
				mark(d);
			});
			$line.on("click", () => {
				state.open = state.open === d.id ? null : d.id;
				state.improving = null;
				state.redraw();
			});
		});

		if (state.open === d.id) body(d, m, state);

		/* Say something about this one choice. Approve and Improve are the two
		   verdicts; this is everything that is neither — a question, a
		   correction, a third option. `ext/Ask`'s `reply()` hands the turn the
		   question and every option before a word is typed. */
		reply({ m, about: { kind: "decision", id: d.id, summary: d.about,
			status: d.status ?? "open", options: d.options, chose: d.chose } });
	});
}

/** The option that won, found by its id — the row shows its one line. */
const chose = d => (d.options ?? []).find(o => o.id === d.chose);

const mark = d => span.c("ai-decision-status").ac(d.status ?? "open").text(d.status ?? "open");

/* ── level 2: the option cards, in place ───────────────────────────────────── */

function body(d, m, state){
	div.c("ai-decision-body ui-decision", () => {
		ul.c("ui-decision-options", () => (d.options ?? []).forEach(o => option(o, o.id === d.chose)));
		if (d.because) p.c("ui-decision-because", d.because);
		rule(d);
		if (d.note) p.c("ai-decision-note", `you asked for better: ${d.note}`);
		acts(d, m, state);
	});
}

/* The decision UI itself is `ui/decision` — one class list, no second copy of
   the markup here. The chosen card is marked by its ground, its outline AND the
   word "chosen", because the accent is 2.96:1 on white and may carry neither. */
const option = (o, chosen) => li.c("ui-decision-option").ac(chosen && "chosen").append(() => {
	if (chosen) span.c("ui-decision-mark", "chosen");
	div.c("ui-decision-say", o.say ?? o.id);
	if (o.why) p.c("ui-decision-why", o.why);
});

/* ⚠ A CHIP, NOT A LINK. `rule` is `<skill>#<section>` and the skills live in
   `.claude/skills/`, outside `public/` — nothing serves them, so a link here
   would 404. That is the finding the Asks tab already made about deliverable
   pills (2026-09-17): a control that goes nowhere is worse than no control. The
   chip carries the real path in its `title`, ready to paste into an editor. */
function rule(d){
	if (!d.rule) return;
	const [skill, section] = String(d.rule).split("#");
	span.c("ai-decision-rule", d.rule)
		.attr("title", `.claude/skills/${skill}/SKILL.md${section ? " — the " + section + " section" : ""}`);
}

/* ── approve or improve ────────────────────────────────────────────────────── */

function acts(d, m, state){
	if (!writable())
		return p.c("muted", "Approve and Improve need the dev server — here this is the record, read-only.");

	div.c("ai-decision-acts flex wrap v-center", () => {
		button.c("ai-decision-act", "Approve").on("click", () => cast(d, m, state, "approve", ""));
		button.c("ai-decision-act", "Improve").on("click", () => {
			state.improving = state.improving === d.id ? null : d.id;
			state.redraw();
		});
	});

	if (state.improving === d.id) note(d, m, state);
}

/* One line, because the note becomes one line in a skill's improvements.md.
   Enter sends it, which is the gesture anyone types into a one-field form. */
function note(d, m, state){
	div.c("ai-decision-note-row flex wrap v-center").append($row => {
		const $text = input.c("ai-decision-input")
			.attr("type", "text")
			.attr("placeholder", "what is wrong with this decision, in one line");

		button.c("ai-decision-act", "Send").on("click", () => send());

		$text.on("keydown", e => e.key === "Enter" && send());
		setTimeout(() => $text.el.focus(), 0);

		function send(){
			const said = $text.el.value.trim();
			if (said) cast(d, m, state, "improve", said);
		}
	});
}

/**
 * Append one verdict line to this task's own log, and let it come back.
 *
 * ⚠ THE WRITER DOES NOT APPLY ITS OWN LINE. It arrives off the wire like
 *   everybody else's, so there is one code path and the server is the only
 *   orderer — the rule `/layouts/browse/verdicts.js` set. `expect()` is the
 *   safety net: a press that visibly did nothing is the worst failure here.
 */
async function cast(d, m, state, say, said){
	const at = stamp();
	const verdict = { id: `v-${d.id}-${at}`, at, decision: d.id, say, note: said };

	const reply = await Promise.race([
		Socket.singleton().async_rpc("append", m.url, JSON.stringify({ verdict })),
		new Promise(done => setTimeout(done, WIRE, null)),
	]);

	if (reply?.response !== "append successful"){
		console.error("decisions: the dev server refused the append — restart it (rpc:append landed 2026-08-31)", reply);
		return;
	}

	state.improving = null;
	expect(verdict, m, state);
}

function expect(verdict, m, state){
	setTimeout(() => {
		if (m.verdicts?.some(v => v.id === verdict.id)) return;
		console.warn("decisions: the appended verdict never came back off the wire — applying it locally.", verdict);
		m.verdict(verdict);
		state.redraw();
	}, WIRE);
}

/* `stamp()` — the local-offset ISO timestamp every line this browser appends
   carries — lives in `rank.js` now, beside `append()`, so there is one of it. */

export default decisions;
