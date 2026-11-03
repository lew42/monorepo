import { Page, div, h1, a, p, span, small, md } from "/app.js";
import Browse from "./Browse.js";

// Browse's own page IS a Browse: sample rows on the left, the clicked one beside them. The class architecture is the next tab.
const SAMPLES = [
	{ id: "welcome", title: "Click a row: it opens on the right", sub: "The list stays where it is; the url changes, so Back and a reload land here." },
	{ id: "drag", title: "Drag the list's right edge", sub: "The width is remembered; double-click the edge to go back to a third of the screen." },
	{ id: "phone", title: "On a phone, two screens", sub: "Under 40em the list is one screen and the row's page the next." },
	{ id: "wide", title: "Wider list, more columns", sub: "Rows read the list's width (a container query), never the screen's." },
];
const PINNED = [
	{ id: "pick", title: "A decision that waits on you", sub: "Tick it and it leaves this list.", href: "welcome/" },
	{ id: "risk", title: "A risk an agent flagged", sub: "One line each, its page linked.", href: "drag/" },
];

class SampleBrowse extends Browse {
	key = "browse-demo";
	draw_list(){
		div.c("inbox-rows", () => {
			this.pins_box();
			SAMPLES.forEach(s => a.c("inbox-row").href(this.url + s.id + "/").append(() => {
				div.c("inbox-row-head flex gap-25", () => span.c("inbox-row-title").text(s.title));
				div.c("inbox-row-foot", () => small.c("inbox-row-line muted").text(s.sub));
			}));
		});
	}
}

export default new Page({
	meta: import.meta,
	title: "Browse",
	icon: "view_sidebar",
	description: "One list-and-detail view: a resizable list on the left, the row you clicked on the right.",
	classes: "full fill",
	leaf: true,

	content(){
		div.c("inbox-head", () => {
			div.c("doc-well", () => h1.c("doc-title h2", "Browse"));
			div.c("tabs block", () => div.c("tab-bar", () => {
				a.c("tab tab-default").href(this.url).text("Demo");
				a.c("tab").href(this.url + "architecture/").text("Architecture");
				a.c("tab").href("/framework/ai/").text("Live: the AI Inbox");
			}));
		});
		const browse = new SampleBrowse({ page: this });
		browse.pin(new Browse.Pinned({ title: "Waiting on you", key: "browse-demo-pinned", tick: () => null,
			rows: PINNED.map(r => ({ ...r, href: this.url + r.href })) }));
		this.browse = browse.mount();
	},

	route(id){
		if (id === "architecture") return new Page({ title: "Architecture", url: this.url + "architecture/", classes: "inbox-takeover inbox-tab",
			content(){ div.c("flow").append(md.file({ url: import.meta.url }, "doc/architecture.md")); div.c("flow").append(md.file({ url: import.meta.url }, "readme.md", { h1: false })); } });
		const s = SAMPLES.find(x => x.id === id);
		if (s) return new Page({ title: s.title, url: this.url + id + "/", classes: "inbox-page", content(){ p(s.sub); } });
	},
});
