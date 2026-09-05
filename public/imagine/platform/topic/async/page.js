import { Page, div, span, button, md } from "/app.js";
import { baseline } from "/imagine/paging/baseline.js";

/* Container: a COLUMN in /imagine/'s columns host, four levels up — no page grid, no `wide`.
   Size: `small`, the same rail its parent uses, because it does the same job. Own layout:
   core's `column()` plus one `flex v gap` of live state. Regions: one. Preview: the default
   card.

   THE SUBTOPIC THAT GRADUATED. This is a separate file for one reason: to prove the claim in
   /imagine/platform/decisions/topic-model/ that a subtopic becomes a topic by adding one word
   and nothing else. There is no import between this file and its parent in either direction,
   and both of them work alone.

   `nearest()` is `findLast`, so the CLOSEST claim wins — everything below here now finds THIS
   page as its topic, and gets its own `store()` for free because the store key is the url. */

const LESSONS = [
	["promises", "Promises", "The object, the three states, and why `then` returns a new one."],
	["await", "async / await", "The same machine, written flat — and the one line it costs you."],
	["loops", "The event loop", "Microtasks before timers. The only rule that explains the surprises."],
];

export default new Page({
	meta: import.meta,
	title: "Async",
	description: "A subtopic that graduated: one word, and its own subtree finds it instead of JavaScript.",
	icon: "sync",

	width: "small",

	// The one word. Delete it and this page keeps working — it just stops being a topic, and
	// every lesson under it goes back to writing JavaScript's log.
	is: "topic",

	initialize(){ this.log = [...this.store().get({ log: [] }).log]; },

	watch(fn){ (this.watchers ??= []).push(fn); fn(); },
	bump(){ this.watchers?.forEach(fn => fn()); },

	earn(id){
		if (this.log.includes(id)) return;
		this.log.push(id);
		this.store().set({ log: this.log });
		this.bump();
	},

	reset(){ this.log.length = 0; this.store().clear(); this.bump(); },

	content(){
		// The same mark its parent topic wears, for the same reason: this run is
		// remembered, and a reader has to be able to see that and undo it.
		baseline(this, { what: "this run", restore: () => this.reset() });

		div.c("flex v gap", $state => this.watch(() => $state.empty(() => {
			span(this.log.length + " of " + LESSONS.length + " walked");
			if (this.log.length) button("Erase").click(() => this.reset());
		})));

		md("Its own store: `" + this.store().key() + "` — a different key from the topic above,"
			+ " because it is a different url. Nothing was configured to make that true.");
	},

	children: LESSONS.map(([name, title, blurb], index) => ({
		name,
		title,
		description: blurb,
		width: "large",
		classes: index === 0 ? "default" : "",

		content(){
			md("## " + title);
			md(blurb);
			md("`this.topic()` → **" + this.topic().title + "**, not JavaScript. Same accessor,"
				+ " same call, different answer — the closest `is: \"topic\"` wins, the way a"
				+ " CSS override does ([roles](/framework/core/Page/doc/roles/)).");
			md("The topic above is still there: `this.parent.parent.topic()` → **"
				+ (this.parent.parent.topic()?.title ?? "none") + "**.");
		},

		activated(){ this.topic().earn(name); },
	})),
});
