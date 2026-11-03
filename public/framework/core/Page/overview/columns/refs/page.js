import { Page, div, p, h4, button, md } from "/app.js";

/* Container: a column region of its own — this page IS a columns host, four levels
   deep. Size: the picker is `width: "small"` (14em), the reader takes the default
   track. Own layout: `columns()`. Regions: one per column, core's. Preview: the
   default card.

   Everything below is ORDINARY pages. The only core API this demo needs is
   `nearest()` and its two sugars, `topic()` and `document()` — the picker and the
   reader are four levels apart and neither imports the other. */

const MAIL = [
	{ from: "Ada",    subject: "Notes on the Analytical Engine" },
	{ from: "Grace",  subject: "Found the moth" },
	{ from: "Alan",   subject: "On computable numbers" },
	{ from: "Edsger", subject: "Go To considered harmful" },
];

// How far up the chain a ref actually walked — the number the demo prints, derived
// the same way `nearest()` finds it, so it cannot disagree.
const hops = (from, to) => from.chain().length - from.chain().indexOf(to) - 1;

export default new Page({
	meta: import.meta,
	title: "Refs",
	description: "A picker and a reader four levels apart, talking through this.topic().",
	icon: "hub",

	// The one word that makes this page findable from anywhere below it.
	is: "topic",

	selection: MAIL[0],
	changes: 0,

	initialize(){ this.columns(); },

	// Not core, and it does not want to be: the ref is the framework's job, the
	// message is three lines of the topic's own state. A page that needs a different
	// conversation writes a different three lines.
	watch(fn){ (this.watchers ??= []).push(fn); fn(this.selection); },
	select(mail){ this.selection = mail; this.changes++; this.watchers?.forEach(fn => fn(mail)); },

	content(){
		md("This page says **`is: \"topic\"`** about itself. Every page below it — at any depth, in any column — gets it back from `this.topic()`.");
		md("Walk right to **Mail → Inbox**, pick a row, and watch **Reader** and **Notes** change. Nothing in the picker knows they exist.");
		md("The walk, the `is:` word and why the closest claim wins: [`doc/roles.md`](/framework/core/Page/doc/roles/). Splitting the height instead of the width: [Panels](/framework/core/Page/overview/columns/panels/).");
	},

	children: {
		Mail: {
			icon: "folder",
			width: "small",
			content(){ md("An ordinary column. It is only here to put some distance between the picker and the reader."); },

			children: {
				Inbox: {
					icon: "inbox",
					width: "small",
					content(){
						const topic = this.topic();

						md("Each row is `this.topic().select(mail)` — **" + hops(this, topic) + " hops** up the chain.");

						// `bleed` inside a column's prose spends the column's own inset
						// (core/Page/Page.css), so the list reaches the real edges.
						div.c("bleed flex v", () => MAIL.forEach(mail =>
							button(mail.from).on("click", () => topic.select(mail))));
					},

					children: {
						Reader: {
							icon: "mail",
							// The second role, claimed by a page in the middle of the tree.
							is: "document",

							content(){
								const topic = this.topic();

								md("This column is the **document**. It watches the topic it found " + hops(this, topic) + " hops up and redraws itself — no import, no event bus, no registry.");

								div.c("flow", $body => topic.watch(mail => $body.empty(() => {
									h4(mail.from);
									p(mail.subject);
								})));
							},

							children: {
								Notes: {
									icon: "sticky_note_2",
									content(){
										const topic = this.topic(), doc = this.document();

										md("One page, **two different ancestors**: `this.document()` is *" + doc.title + "* " + hops(this, doc) + " hop up, `this.topic()` is *" + topic.title + "* " + hops(this, topic) + " hops up. `findLast` is why the nearer one wins.");

										div.c("flow", $count => topic.watch(() => $count.empty(() => {
											p("hops: " + hops(this, topic));
											p("updates: " + topic.changes);
										})));
									},
								},
							},
						},
					},
				},
			},
		},
	},
});
