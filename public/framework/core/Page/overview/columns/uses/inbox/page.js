import { Page, div, span, a, md, p } from "/app.js";

/* Container: the app's page region — a columns host stretches to fill it. Size: this
   column is the default track, then a fixed 14em rail of previews, then the reader on
   the default track again — 420 + 211 + 420 of a 1051px row at 1280. Own layout:
   core's row; the rail's list is a flex column that sits straight in the column body,
   so it is already at the edges and needs no `bleed`. Regions: one per column, core's.
   Preview: the default card.

   THE CROSS-PAGE TOUCH, and the reason there are THREE pages rather than two: the
   rail and the reader are siblings' worth of code apart and neither imports the
   other. This page says `is: "topic"` about itself, so both get it back from
   `this.topic()` (core/Page/doc/roles.md). Opening a message marks it read on the
   topic; the rail is watching the topic, so its head count and its unread dots
   change without the reader knowing the rail exists. */

const MAIL = [
	{ from: "Ada",       subject: "Notes on the Analytical Engine", body: "The engine weaves algebraic patterns the way the Jacquard loom weaves flowers and leaves. I have appended a table for the Bernoulli numbers." },
	{ from: "Grace",     subject: "Found the moth",                 body: "Relay 70, panel F. First actual case of a bug being found. Taped it into the log book; the machine has run clean since." },
	{ from: "Alan",      subject: "On computable numbers",          body: "The paper is with the Society. The short version: a machine that reads its own description is enough, and that is the whole trouble." },
	{ from: "Edsger",    subject: "Go To considered harmful",       body: "The quality of programmers is a decreasing function of the density of go to statements in the programs they produce. Two pages, no more." },
	{ from: "Barbara",   subject: "The maize is doing something",   body: "The colour pattern moves between generations. The elements are not fixed in the chromosome — I know how that sounds." },
	{ from: "Katherine", subject: "Re-check the numbers",           body: "Ran the trajectory by hand against the machine's. They agree to five places. He will not fly until I say they do." },
];

// How far up the chain a ref actually walked — derived the way `nearest()` finds it,
// so the number on the page cannot disagree with the walk.
const hops = (from, to) => from.chain().length - from.chain().indexOf(to) - 1;

export default new Page({
	meta: import.meta,
	title: "Inbox",
	description: "Previews left, the message right — and a read/unread count that crosses three page boundaries through one ref.",
	icon: "inbox",

	// The one word that makes this page findable from anywhere below it.
	is: "topic",

	read: null,
	opens: 0,       // messages activated
	updates: 0,     // watcher runs — the two must agree, and both are on the page

	initialize(){
		this.read = new Set();
		this.columns();
	},

	// Not core, and it does not want to be: the ref is the framework's job, the
	// conversation is three lines of this page's own state (doc/roles.md).
	watch(fn){ (this.watchers ??= []).push(fn); fn(); },

	open(name){
		this.opens++;
		this.read.add(name);
		this.updates++;
		this.watchers?.forEach(fn => fn());
	},

	unread(){ return MAIL.length - this.read.size; },

	content(){
		md("An inbox is a **list** and a **detail**, and the column shape is already both: a `small` rail that stays, and the reader opening to its right.");
		md("Open a few. The count in the rail's head and the dots on its rows are drawn from state that lives **here**, two pages above the reader that writes it — `this.topic()`, no import either way.");
		md("**Verdict on the mix:** `width: \"small\"` + `is: \"topic\"` + one `column()` override on the rail. The override is the app — an inbox row is a preview, and a preview is the whole reason the column costs its 14em. Everything else is the arrangement and the ref, both already words.");
	},

	children: {
		Mail: {
			icon: "mail",
			width: "small",

			/* THE PREVIEW COLUMN, by hand. Core's `column()` draws one label per child,
			   which is right for a rail of sections and wrong for an inbox.
			   ⚠ A config that overrides `column()` stamps its own width class — `width:`
			     is a field nobody reads until something writes `.page-column-small`.
			   ⚠ Redrawing the rows drops Router.mark_links()'s marks, so the open row
			     would go dark on the very click that opened it. Ask for the pass back;
			     ext/tabs does the same after it fills its bar. */
			column(host){
				const topic = this.topic();

				return div.c("page-column-body page-column-small", () => {
					div.c("page-column-head", () => {
						span.c("page-column-title", this.title);
						span.c("page-uses-count", $count => topic.watch(() => $count.text(topic.unread() + " unread")));
					});

					div.c("page-uses-rows", $rows => topic.watch(() => {
						$rows.empty(() => this.children.forEach((mail, name) => {
							a.c("page-uses-row").ac(topic.read.has(name) && "page-uses-read").href(mail.url).append(() => {
								span.c("page-uses-from", mail.title);
								span.c("page-uses-peek", mail.subject);
							});
						}));

						this.app?.router?.mark_links();
					}));
				});
			},

			children: MAIL.map(mail => ({
				name: Page.slug(mail.from),
				title: mail.from,
				subject: mail.subject,   // the rail reads it off the child page, not off MAIL

				content(){
					const topic = this.topic();

					md("**" + mail.subject + "**");
					p(mail.body);

					// The other direction through the same ref: the reader shows the
					// rail's state, and the rail shows what the reader did.
					div.c("page-uses-tally flow", $tally => topic.watch(() => $tally.empty(() => {
						p(topic.unread() + " of " + MAIL.length + " still unread");
						p("opens: " + topic.opens + " · updates: " + topic.updates);
					})));

					md("`this.topic()` walked **" + hops(this, topic) + " hops** up. Nothing in this file names the rail.");
				},

				// The whole cross-page write, in one line.
				activated(){ this.topic().open(this.name); },
			})),
		},
	},
});
