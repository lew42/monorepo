import { div, span, a } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";
import { dur, progress, quiet, spend, state } from "./stats.js";

/* One task, as a row — who | what | figures, at one type size: hierarchy is
   weight and muted color, never a second size. A running task also gets its
   step outline as segments; a dormant one gets no bar at all. */

export const when = iso => iso ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "…";
const first = m => (m?.outcome ?? m?.request ?? "").split("\n")[0].replaceAll("**", "");
const short_model = id => id?.replaceAll("claude-", "");

export const DOT = { proposed: "idea", running: "live" };

/* ⚠ `running 1h 26m`, not `running since 4:40 PM` (2026-08-17, day-page-ux):
   both card reads asked for the elapsed time in the same words — a clock time
   makes the reader do the subtraction, and how long it has been going is the
   question. A landed task keeps both stamps: that IS its duration, stated. */
const status = t => {
	const s = state(t.m);
	return s === "landed" ? when(t.m.requested_at) + " → " + when(t.m.landed_at)
		: s === "running" ? "running " + dur(Date.now() - Date.parse(t.m.requested_at))
		: "proposed";
};

/* The live line: an explicit `now`, else the latest agent still missing an
   outcome — agents are appended at dispatch, so that IS the current sub-task.
   Exported so the task page can show the same thing, not a second opinion. */
export const current = m => m.now ?? m.agents?.findLast?.(a => !a.outcome)?.task;

/* The category tag: the effort this task claimed, linking to the board filtered
   to it. A task claiming none is untagged rather than filed under a fake slug. */
const tag = t => t.m?.group &&
	a.c("ai-tag", t.m.group.replaceAll("-", " ")).href("/framework/ai/effort/" + t.m.group + "/");

/** The pill row of a manifest's own deliverable links — one function, called
    from the card AND the task page (AITask.js's `links()`), so the two never drift. */
export const links_row = m => m?.links?.length && div.c("ai-links flex gap wrap", () =>
	m.links.forEach(l => a.c("ai-link", l.label ?? l.url).href(l.url)));

// [value, label] pairs, so the figures column aligns instead of cramming a dotted line.
const figures = m => {
	if (!m) return [];
	const done = m.agents?.filter(x => x.outcome).length ?? 0, total = m.agents?.length;
	const idle = quiet(m);
	return [
		spend(m),
		m.window?.after != null && [Math.round(m.window.after * 100) + "%", "of window"],
		total && [done < total ? `${done}/${total}` : String(total), total === 1 ? "agent" : "agents"],
		idle && [idle, "quiet"],
	].filter(Boolean);
};

/* Segments, not a continuous fill: the outline has N steps and the bar moves a
   notch when one lands, which is exactly what the reader is being told. */
export const segments = pr => div.c("ai-steps", () => pr.steps.forEach((_, i) =>
	div.c("ai-seg").ac(i < pr.done ? "done" : i === pr.done && "now")));

function steps_of(m){
	const pr = progress(m);
	if (!pr || m.landed_at) return;

	segments(pr);
	div.c("ai-step-line", () => {
		span.c("ai-step-n", pr.done + "/" + pr.total + " ");
		span(pr.current ?? "");
	});
	return pr;
}

/* The title's ::after spreads the link over the whole row; anything that must
   stay clickable sits above it (.ai-links). */
export const manifest_card = t => div.c("ai-card surface", () => {
	div.c("ai-who flex gap", () => {
		span.c("ai-dot").ac(DOT[state(t.m)]);
		div.c("flex v", () => {
			a.c("ai-card-title", t.title).href(t.url);
			// ⚠ `t.m.tab` was here and is DELETED (2026-08-17, day-page-ux): the
			//   VS Code window title — "Design screenshot analys… - monorepo -
			//   Visual Studio Code" — on every one of thirty cards, neither a link
			//   nor a number nor the same on two machines. It is still in the log.
			div.c("flex gap wrap v-center", () => {
				span.c("muted", status(t));
				tag(t);
			}).style("--gap", ".5em");
		});
	}).style("--gap", "0.6em");

	/* ⚠ A RUNNING card no longer prints its dispatch `request` (2026-08-17,
	     day-page-ux). It is the prompt the task was launched with — two clamped
	     lines of it above the step bar, restating a title the reader just read,
	     on every live card. What a running task owes the day page is what it is
	     doing NOW: the step bar, the step, the `now` line. The request is one
	     click away and hasn't changed since launch. Measured at 1440: it was
	     52px × 4 live tasks, and it was the whole reason LANDED sat below the fold.
	   ⚠ The headline stays wherever it IS the answer — a landed task's `outcome`,
	     a proposed one's brief — which is exactly "neither a step nor a now". */
	div.c("flex v gap", () => {
		const pr = t.m && steps_of(t.m);
		const now = t.m && !t.m.landed_at && current(t.m);

		if (!pr && !now) div.c("ai-line", first(t.m) || t.brief || "not started — the brief is the only file");
		if (now && now !== pr?.current) div.c("ai-line muted", now).attr("title", now);
		links_row(t.m);
	}).style("--gap", "0.25em");

	div.c("ai-figures", () => {
		figures(t.m).forEach(([value, label]) => div(() => { span(value); span.c("muted", " " + label); }));
		if (t.m?.model) div.c("muted", short_model(t.m.model));
	});
});

// The bridge: a declared child whose OWN preview() is overridden draws its own row.
export const card = t => t.child?.preview && t.child.preview !== Page.prototype.preview
	? t.child.preview(t.nav)
	: manifest_card(t);

export default card;
