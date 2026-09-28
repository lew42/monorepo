import { div, span, a, h3, h4, p, details, summary } from "../../core/View/View.js";
import Decision from "../../ux/Content/Decision/Decision.js";

/* One live run, drawn whole: the question, members as columns (their files and
   cost per phase), the phase track, every decision (the ask, the options, who
   actually won — nested under its parent for a package deal), every vote, the
   winner, and — when a scoreboard is given — the model table. Show it, don't
   tell it: this is what a reader who never saw the run looks at. */

const money = n => n == null ? "—" : "$" + Number(n).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
const base = url => (url ?? "").replace(/[^/]*$/, "");

/** Draw `collab` (a Collab, already loaded or `live()`-streaming) into the current
 *  captor. `scoreboard`, when given, is a Collab.Scoreboard — the model table. */
export function view(collab, scoreboard){
	const files = base(collab.url);

	div.c("collab", () => {
		head(collab);
		phase_track(collab);
		div.c("collab-members grid auto", () => collab.members.forEach(m => member_col(m, collab.phases, collab.votes, files)));
		decision_wall(collab);
		vote_list(collab);
		winner_card(collab, files);
		if (scoreboard) scoreboard_table(scoreboard);
	});
}

function head(collab){
	div.c("collab-head flex split v-baseline", () => {
		h3(collab.question ?? "Collaboration run");
		span.c("muted", [collab.kind, money(collab.cost)].filter(Boolean).join(" · "));
	});
}

function phase_track(collab){
	if (!collab.phases.length) return;
	div.c("collab-phases flex gap wrap", () => collab.phases.forEach(ph => {
		div.c("collab-phase").ac(ph.status === "done" ? "done" : ph.status === "start" ? "now" : "pending")
			.append(() => {
				span.c("collab-phase-n", "· " + ph.n + " ");
				span(ph.kind);
				if (ph.cost) span.c("muted", " " + money(ph.cost));
			});
	}));
}

// `votes`, when given (view() passes `collab.votes`), lets a vote-phase row show WHO this
// member picked ("→ sonnet-b") instead of a bare "—" — the owner asked to see the vote
// itself at a glance, not just a link to the raw vote.json.
function member_col(m, phases, votes, files){
	div.c("collab-member card", () => {
		div.c("collab-member-head flex split v-baseline", () => {
			span.c("collab-member-id", m.id);
			span.c("collab-dot").ac(m.status ?? "pending");
		});
		span.c("muted", m.model ?? "");
		div.c("collab-member-files", () => phases.forEach(ph => {
			const f = m.files[ph.n];
			const vote = ph.kind === "vote" && votes?.find(v => v.member === m.id && v.phase === ph.n);
			div.c("collab-member-file flex gap v-center", () => {
				span.c("muted", ph.kind);
				if (vote) span.c("collab-member-vote", "→ " + vote.pick);
				else if (f?.file) a.c("collab-file-link", "file").href(files + f.file);
				else span.c("muted", "—");
			});
		}));
		if (m.why) p.c("collab-member-why muted", m.why);
		span.c("collab-member-cost", money(m.cost));
	});
}

function vote_list(collab){
	if (!collab.votes.length) return;
	div.c("collab-votes flow", () => {
		h4("Votes");
		collab.votes.forEach(v => div.c("collab-vote flex gap v-center", () => {
			span.c("collab-vote-who", v.member);
			span.c("muted", "→");
			span.c("collab-vote-pick", v.pick);
			if (v.caveat) span.c("collab-vote-caveat muted", v.caveat);
		}));
	});
}

function decision_wall(collab){
	const roots = collab.root_decisions();
	if (!roots.length) return;
	div.c("collab-decisions flow", () => {
		h4("Decisions");
		roots.forEach(d => decision_node(collab, d));
	});
}

// A decision draws as ux/Content's own Decision widget, anchored by its own id
// (`?src=…#d-1` scrolls a reader straight to it) — the owner's click on another
// option IS the overrule, appended straight to collab.jsonl.
function decision_node(collab, d){
	const winner_say = d.options.find(o => o.key === d.winner())?.say;

	div.c("collab-decision card").attr("id", d.id).append(() => {
		div.c("collab-decision-head flex split v-baseline", () => {
			span.c("collab-decision-id muted", "#" + d.id);
			if (d.package) span.c("collab-decision-package muted", "package deal");
		});
		// The winner is trusted by default: seed the widget with the vote's own
		// pick (or the owner's later override — Collab.Decision.winner() already
		// resolved which), so it leads without waiting on the widget's own
		// separate, async re-read of the same log.
		new Decision({ id: d.id, ask: d.ask, options: d.options, chose: winner_say, log: collab.url });
		vote_badges(d);
		alternatives(d);
		if (d.overruled) span.c("collab-overruled", "owner overruled → " + d.final);

		const kids = collab.children_of(d.id);
		if (kids.length) div.c("collab-decision-children", () => kids.forEach(k => decision_node(collab, k)));
	});
}

// The number of votes and the winner, AT A GLANCE — the owner's own words. Every option
// gets its own badge right on the decision card, never only inside the "every option, by
// votes" disclosure below (which stays, for the file link each option carries).
function vote_badges(d){
	if (!d.options.length) return;
	const counts = d.counts ?? {};
	const ranked = [...d.options].sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0));
	div.c("collab-decision-badges flex gap wrap", () => ranked.forEach(o => {
		const n = counts[o.key] ?? 0;
		span.c("collab-decision-badge").ac(o.key === d.winner() && "winner")
			.append(`${o.key} — ${n} vote${n === 1 ? "" : "s"}`);
	}));
}

// Every option stays visible, ranked by its own votes, zeros included — the
// runner-up is a convenience, never the only alternative shown
// (collab-format.md "Added 14:25"). One click down: the winner already leads
// in the widget above, so this is only for "what else was on the table".
function alternatives(d){
	if (!d.options.length) return;
	const counts = d.counts ?? {};
	const ranked = [...d.options].sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0));

	details.c("collab-decision-alts", () => {
		summary.c("muted", "every option, by votes");
		ranked.forEach(o => div.c("collab-decision-alt flex split v-baseline", () => {
			span(o.say);
			span.c("muted", String(counts[o.key] ?? 0));
		}));
	});
}

function winner_card(collab, files){
	if (!collab.winner) return;
	div.c("collab-winner card", () => {
		h4.c("collab-winner-title", "Winner — " + collab.winner.pick);
		if (collab.winner.file) a.c("collab-winner-file", collab.winner.file).href(files + collab.winner.file);
		(collab.winner.caveats ?? []).forEach(c => p.c("muted", c));
		span.c("muted", money(collab.winner.cost));
	});
}

// The owner's own rule (owner-words-3.md): phase a model out once it has earned
// enough decisions to judge and still isn't winning or isn't cheap.
function scoreboard_table(sb){
	const models = sb.models();
	if (!models.length) return;
	const retired = new Set(sb.retire());

	div.c("collab-scoreboard flow", () => {
		h4("Model scoreboard");
		div.c("collab-score-table", () => {
			div.c("collab-score-row collab-score-head", () =>
				["model", "decisions", "wins", "win rate", "cost", "$/win"].forEach(t => span.c("muted", t)));

			models.forEach(m => div.c("collab-score-row").ac(retired.has(m.model) && "retired").append(() => {
				span(m.model + (retired.has(m.model) ? " — retire" : ""));
				span(String(m.decisions));
				span(String(m.wins));
				span(Math.round(m.win_rate * 100) + "%");
				span(money(m.cost));
				span(money(m.cost_per_win));
			}));
		});
	});
}

export default view;
