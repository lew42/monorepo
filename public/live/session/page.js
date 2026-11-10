import { Page, div, span, a, p, h2, icon, ui } from "/app.js";
import SessionView from "./SessionView.js";

/* /live/session/ — prototype session view for ONE session (2026-11-09, requirements.md). The owner can't read the
 * current session page: tasks show as crossed-off paragraphs with no titles. This reads the one file (one fetch,
 * SessionView.fold) and draws titled rows, grouped by state, open on tap — built only from ui/card and ui/item
 * (ui.item: a row, or a tree node when it has children), no new CSS (the owner, via voice-app, 2026-11-09).
 * Later: every session, at its own folder. */
const SESSION_URL = "/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/session.jsonl";
const SESSION_FOLDER = "/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/";

const fmt = ms => ms ? new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

const STATE_ICON = { running: "play_circle", waiting: "schedule", idle: "radio_button_unchecked", paused: "pause_circle", complete: "check_circle", stopped: "block" };
const GROUP_ICON = { working: "bolt", waiting: "schedule", open: "radio_button_unchecked", done: "check_circle" };

export default new Page({
	meta: import.meta,
	title: "Session",
	description: "One session's tasks, titled and grouped, not a crossed-off wall of text.",
	icon: "forum",

	content(){
		const $out = div.c("wide flex v gap");
		const t0 = performance.now();
		$out.empty(() => p("Loading…"));
		fetch(SESSION_URL).then(r => r.ok ? r.text() : Promise.reject(new Error(`${SESSION_URL}: ${r.status}`)))
			.then(text => {
				const data = SessionView.fold(text);
				console.log(`SessionView: fetch to drawn in ${Math.round(performance.now() - t0)} ms`);
				$out.empty(() => draw(data));
			}, e => $out.empty(() => p(`Could not load the session: ${e.message}`)));
	},
});

function draw(data){
	header_card(data);
	h2("Tasks");
	for (const group of SessionView.grouped(data.tasks)) if (group.tasks.length || group.key === "waiting") group_item(group);   // "Waiting on you (0)" says nothing is waiting, rather than leaving it unsaid (review note 7)
	h2("Child sessions");
	children_card(data.children);
	h2("The owner's prompts");
	p.c("muted", "Not in this file: no prompt or owner-sentence lines here, and none in the session's own ai/ or page.jsonl either (checked 2026-11-09; logged as a gap on this task).");
}

function header_card(data){
	div.c("card flex v gap-25", () => {
		div.c("flex gap-50", () => { icon("forum"); a(data.id).attr("href", SESSION_FOLDER); });
		p.c("muted", `Started ${fmt(data.startAt)} · last line ${data.lastAt ? fmt(Date.parse(data.lastAt)) : "—"}`);
		p(`${data.done} of ${data.total} tasks done`);
	});
}

function group_item(group){
	ui.item({ icon: GROUP_ICON[group.key], name: `${group.label} (${group.tasks.length})`, open: group.key !== "done",
		children: group.tasks.map(t => ({ icon: STATE_ICON[t.state] ?? "circle", name: t.title, children: () => task_detail(t) })) });
}

function task_detail(t){
	div.c("flex v gap-25", () => {
		p(t.title);   // the row truncates at phone width, so the full title opens with the detail (review finding 1)
		if (t.why) p(`Why: ${t.why}`);
		if (t.waiting) p(`Waiting on ${t.waiting.on ?? "?"}${t.waiting.what ? `: ${t.waiting.what}` : ""}`);
		if (t.outcome) p(t.outcome);
		if (t.evidence?.length) p(() => {
			span("Evidence: ");
			[].concat(t.evidence).forEach((e, i) => { if (i) span(", "); evidence_link(e); });
		});
		if (!t.why && !t.waiting && !t.outcome && !t.evidence?.length) span.c("muted", "Nothing logged yet.");
	});
}

function evidence_link(e){
	const text = String(e);
	if (text.startsWith("/")) a(text).attr("href", text);
	else span(text);
}

function children_card(children){
	if (!children.length){ p.c("muted", "None spawned."); return; }
	div.c("card flex v gap-25", () => {
		for (const c of children) ui.item({ icon: "smart_toy", name: c.agent ?? "?", ...(c.task_dir ? { href: c.task_dir, end: "arrow" } : {}) });
	});
}
