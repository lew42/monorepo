import { Page, div, h1, a, p, small, md } from "/app.js";
import InboxRail from "/framework/core/Page/ext/Inbox/Rail.js";

/* A minute, an hour, a day ago — so the sample rows read like a live inbox. */
const ago = minutes => new Date(Date.now() - minutes * 60000).toISOString();

/* THE SAMPLE ROWS. Each is a page (`route()` below opens it beside the rail). The scores
   show the floor: the Inbox shows 90 and up, so two of these only appear at `?min=0`. */
const SAMPLES = [
	{ id: "welcome", icon: "waving_hand", score: 95, at: ago(2), needs: true,
		title: "Welcome: this is an inbox rail",
		text: "Each row is a page. Click one and it opens on the right. The rail stays exactly where it is: nothing in it moves, scrolls or redraws." },
	{ id: "question", icon: "help", score: 98, at: ago(25), needs: true,
		title: "A question that waits on you",
		text: "Rows that need you carry a mark the Needs you chip filters on. Tick it to see only these." },
	{ id: "build", icon: "build", score: 92, at: ago(70),
		title: "A build finished",
		text: "The dot on the left means unread. Press it to mark the row read; press it again for unread. The × archives the row." },
	{ id: "note", icon: "sticky_note_2", score: 40, at: ago(60 * 5), kind: "note",
		title: "A quiet note (score 40)",
		text: "Below the floor of 90, so the Inbox hides it. Set the floor to 0, which is what the Log is, and it appears." },
	{ id: "summary", icon: "history", score: 20, at: ago(60 * 24 * 3),
		title: "Last week's summary (score 20)",
		text: "Old and low: only the Log shows it." },
	{ id: "done", icon: "check_circle", score: 91, at: ago(60 * 24 * 6), status: "archived",
		title: "An archived row",
		text: "Archived, never deleted. The archived word in the rail's foot shows it again, greyed; a search finds it too." },
];
SAMPLES.forEach(it => { it.sub = it.text.split(". ")[0] + "."; });

/* A SUBCLASS, the way AIRail is one: one method overridden, everything else inherited.
   `head_extra()` is where AIRail puts its usage meters; here it is one line saying so.
   Read state is kept in memory, so the demo never writes to your browser. */
class SampleRail extends InboxRail {
	title = "Sample inbox";
	read = new Set();
	head_extra(){ small.c("muted").text("A subclass adds its own parts here (AIRail: the usage meters)."); }
	is_read(id){ return this.read.has(id); }
	mark_read(id, val = true){ val ? this.read.add(id) : this.read.delete(id); }
}

export default new Page({
	meta: import.meta,
	title: "Inbox",
	description: "A rail of page previews beside the page you picked: persistent navigation that never jumps, with filters, a score floor, read/unread and archive.",
	icon: "inbox",
	classes: "full fill",
	leaf: true,

	content(){
		div.c("inbox-head", () => {
			div.c("doc-well", () => h1.c("doc-title h2", "Inbox"));
			div.c("tabs block", () => div.c("tab-bar", () => {
				a.c("tab tab-default").href(this.url).text("Demo");
				a.c("tab").href(this.url + "about/").text("How to use it");
			}));
		});
		this.rail = new SampleRail({ page: this, items: SAMPLES }).mount();
	},

	route(id){
		if (id === "about") return about(this);
		const it = SAMPLES.find(s => s.id === id);
		if (it) return sample(this, it);
	},
});

/* One sample row's own page: what you see when you click it. */
function sample(root, it){
	return new Page({
		title: it.title, icon: it.icon, url: root.url + it.id + "/",
		classes: "inbox-page",
		content(){ p(it.text); },
	});
}

/* The short version of the readme, as a tab that takes over the shell. */
function about(root){
	return new Page({
		title: "How to use it", url: root.url + "about/",
		classes: "inbox-takeover inbox-tab",
		content(){
			md([
				"**An inbox rail is a list of page previews beside the page you picked.** Extend `InboxRail` and say what the rows are:",
				"```js",
				"import InboxRail from \"/framework/core/Page/ext/Inbox/Rail.js\";",
				"",
				"class MyRail extends InboxRail {",
				"\tsource(){ return my_rows(); }   // [{ id, title, icon, at, score, sub, needs }]",
				"}",
				"",
				"// inside a page's content(), the page wearing `full fill`:",
				"this.rail = new MyRail({ page: this }).mount();",
				"```",
				"Each row links to `<page url>/<id>/`, so give the page a `route(id)` that returns the row's page. It opens in the detail column; the rail never moves.",
				"",
				"- **Change one part:** every part is a method — `head_extra()`, `actions()`, `face()`, `when()` and the rest. The AI page's rail, `AIRail` (ai2/rail.js), overrides a few to add usage meters and \"+ New card\".",
				"- **The floor:** rows scoring under `?min=` (default 90) stay out; `0` shows everything, which is the AI page's Log.",
				"- **The look:** `ux/Inbox/Inbox.css`, including `.flush-stack`, the rail's own rows-touching list, which any list can wear.",
				"",
				"The whole readme: [readme.md](/framework/ux/Inbox/readme.md).",
			].join("\n"));
		},
	});
}
