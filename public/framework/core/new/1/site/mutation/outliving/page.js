import { Page, p, a, button } from "/app.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { this_file } from "../../forms/this_file.js";
import { upload } from "../upload.js";

export default new Page({
	meta: import.meta,
	title: "An action that outlives its page",
	classes: "mutation",

	release: null,

	// Whoever subscribes, unsubscribes. A watcher that outlives its page is the
	// leak this shape is prone to — same discipline as /forms/guard/'s listener.
	deactivate(){
		this.release?.();
		this.release = null;
		return this;
	},

	// Re-subscribe on every arrival, and paint immediately with what is true NOW
	// rather than what was true when this view was built.
	activate(){
		Page.prototype.activate.call(this);
		if (this.parent.job && !this.release) this.watch(this.parent.job);
		return this;
	},

	watch(job){
		this.release = job.watch(j => this.$here.text(
			j.done ? `${j.name} — finished` : `${j.name} — ${j.percent}%`));
	},

	/* Raw DOM, not an element factory, and deliberately.
	 *
	 * This is built from a click handler and updated from an interval — the
	 * captor moved on long before either runs, so `div.c(…)` would auto-append
	 * to whatever is capturing now. It also must not live in $pages, because
	 * everything in $pages is hidden by the chain rules the moment you navigate,
	 * which is the exact thing this panel exists to survive.
	 */
	panel(job){
		const box = document.createElement("div");
		const bar = document.createElement("div");
		const fill = document.createElement("span");

		box.className = "mutation-job";
		bar.className = "mutation-bar";
		bar.append(fill);
		box.append(document.createTextNode(""), bar);
		document.body.append(box);

		job.watch(j => {
			box.firstChild.textContent = j.done ? `${j.name} — finished` : `${j.name} — ${j.percent}%`;
			fill.style.width = j.percent + "%";
			if (j.done) setTimeout(() => box.remove(), 2500);
		});
	},

	content(){
		demo(() => {
			this.$here = p.c("forms-status", "no job");

			button("start a 9-second upload, then navigate away").click(() => {
				this.release?.();

				// on the PARENT, not on me. A job on the page that started it dies
				// from view the instant you leave — correct, and invisible.
				const job = this.parent.job = upload("photo.jpg");

				this.panel(job);
				this.watch(job);
			});

			button("cancel").click(() => this.parent.job?.cancel());
		}, "Start it, then click three sidebar links. The panel bottom-left keeps counting, because the job is on `/mutation/` — an ancestor that stays mounted — and its progress renders outside `$pages` where navigation cannot hide it.");

		section("Where the work lives decides whether it survives");

		code(`
on the page that started it   dies from view on the first navigation
on an ancestor Page           runs, reports, and is still there when you return
in module scope               the same lifetime, but now it is a singleton and
                              two of them cannot coexist`,
			"all three survive the heap; only one of them is still visible");

		p("The Page instance wins for the same reason it won in `/forms/wizard/`: it is an ordinary object, alive for the session, and picking *which* ancestor is picking exactly how long the job outlives things. Module scope has the identical lifetime but silently makes the job a singleton — a second upload overwrites the first with no error.").ac("note");

		section("Where the progress renders — three answers, one missing");

		code(`
into the page that started it   correct, and invisible one navigation later
into app chrome                 MISSING — App builds $app and $pages, and
                                everything a page draws is inside $pages
into <body> directly            what this page does. A workaround.`);

		p("This is the same hole `/forms/optimistic/` hit from the other side. There, a rollback landed perfectly into a hidden page; here, progress would. `App.render()` gives a site `$app` and `$pages` and nothing else, so anything that must outlive a page has nowhere to go but `document.body` — outside the framework's own container, unmarked by `mark_links()`, and invisible to anything that reasons about `$app`.").ac("note");

		section("This is three seats meeting");

		code(`
the chrome seat    navigated() — chrome that must react to a route change
the async seat     content that arrives after paint, into a moved captor
this page          work that arrives after you LEFT

all three want the same missing thing: a region App owns, outside $pages,
that navigation does not touch.`);

		p("I am not proposing the API — three seats wanting it is the argument for designing it once, together, not for me to name it first. What I can contribute is the constraint: it must be built in `App.render()` beside `$pages`, because anything created later has the captor problem this page works around in `panel()`.").ac("note");

		section("Measured");

		code(`
start the upload at /mutation/outliving/, then:

on the page              photo.jpg — 7%     job.count() 2   page + panel
/mutation/concurrent/    panel 17%          job.count() 1   page released its own
/columns/                panel 27%          job.count() 1
/tabs/                   panel 37%          job.count() 1
back to /mutation/outliving/   readout "photo.jpg — 43%"    NOT stale
panel's parent           <body>
after 9s                 "finished", removed 2.5s later`,
			"count() drops to 1 the moment you leave — deactivate() released the page's watcher");

		a.c("page-link", "next: two urls, one record →").href("/mutation/concurrent/");

		this_file(import.meta);
	},
});
