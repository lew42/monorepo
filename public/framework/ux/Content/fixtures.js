/* Sample data for the doc pages — never a real log. Every module writes to its own
 * throwaway `demo.jsonl` in its folder; delete that file to start the demo over. */
const dir = name => new URL(`${name}/demo.jsonl`, import.meta.url).pathname;

export const decision_fresh = () => ({
	id: "d-demo-sidebar",
	log: dir("Decision"),
	ask: "Which view should the dashboard open with?",
	options: [
		{ say: "Newest first", caveat: "Always current, but a task that needs you can scroll out of sight." },
		{ say: "Needs-you first", caveat: "Nothing waits unseen, but the order jumps around when something new asks." },
		{ say: "Whatever I used last", caveat: "Feels familiar, but a stale view can hide new work for days." },
	],
	why: "Pick one; click another to change your mind. Each click adds one line to demo.jsonl.",
});

/* A real task.jsonl decision, exactly as written in the wild (id, chose, over, why). */
export const decision_legacy = () => ({
	log: dir("Decision"),
	at: "2026-09-24T17:30:23-05:00",
	id: "module-home",
	chose: "public/framework/ux/Content/ with Question/, Decision/, Quotation/ as child pages, prefix ux-content-. They hold state (a chosen option, an answer) so they are ux classes, not ui templates.",
	over: ["A new top-level framework/content/ tier (a new tier is surgery)", "Extend ui/decision (ui is markup only; it cannot hold a choice)"],
	why: "The ux tier rule: a template graduates when something has to be remembered between renders.",
});

/* The other legacy shape: a title and one alternative. */
export const decision_legacy_title = () => ({
	log: dir("Decision"),
	title: "how many pinned cards to show collapsed",
	at: "2026-09-20T14:44:07-05:00",
	chose: "4, ranked by the grid view's own score, with a plain \"+N more\" to expand",
	alternative: "3 felt stingy at 1920",
});

export const question = () => ({
	id: "q-demo-name",
	log: dir("Question"),
	ask: "What should we call the dashboard's second tab?",
	hint: "A short word is best. You can answer again to change it.",
});

export const quotation = () => ({
	text: "Every prompt that I make is a quotation; you could put a timestamp on it.",
	raw: "every prompt that i make is very tangible its a quotation you could put a timestamp on it",
	at: "2026-09-24T09:12:00-05:00",
	via: "whisper",
	by: "owner",
	url: "/framework/ux/Content/",
});
