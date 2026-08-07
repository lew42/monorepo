import { Page, p, a, div, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../field.js";
import { post } from "../post.js";
import { this_file } from "../this_file.js";

export default new Page({
	meta: import.meta,
	title: "A wizard whose steps are urls",
	classes: "forms",

	slot: "forms:wizard",
	data: { name: "", email: "" },

	initialize(){
		Object.assign(this.data, JSON.parse(sessionStorage.getItem(this.slot) ?? "{}"));

		this.add("step-1", {
			title: "Step 1 — who",
			content(){
				field("Your name", { name: "wiz-name", value: this.parent.data.name })
					.on("input", e => this.parent.collect("name", e.target.value));

				a.c("page-link", "next →").href("/forms/wizard/step-2/");
			},
		});

		this.add("step-2", {
			title: "Step 2 — where",
			content(){
				field("Your email", { name: "wiz-email", value: this.parent.data.email })
					.on("input", e => this.parent.collect("email", e.target.value));

				a.c("page-link", "← back").href("/forms/wizard/step-1/");
				a.c("page-link", "next →").href("/forms/wizard/step-3/");
			},
		});

		this.add("step-3", {
			title: "Step 3 — review",

			content(){
				this.$review = p.c("forms-status", "");
				this.$result = p.c("forms-status", "");

				button("finish (a promise and a setTimeout — there is no server)").click(() => {
					this.$result.text("posting…");
					post(this.parent.data).then(() => this.$result.text("accepted. Nothing left the browser."));
				});

				a.c("page-link", "← back").href("/forms/wizard/step-2/");
			},

			/* Derived content is built ONCE, because render() memoizes — so a review
			 * step reached twice would still be showing the first visit's numbers.
			 * activate() runs on every entry, which is where a refresh belongs.
			 * Mount first, then repaint: $review does not exist until render(). */
			activate(){
				Page.prototype.activate.call(this);
				this.$review.text(this.parent.summary());
				return this;
			},
		});
	},

	summary(){ return `data = ${JSON.stringify(this.data)}`; },

	// A step is handing me one field: persist it, then repaint whatever shows it.
	collect(key, value){
		this.data[key] = value;
		sessionStorage.setItem(this.slot, JSON.stringify(this.data));
		this.$summary?.text(this.summary());
		return this;
	},

	content(){
		demo(() => {
			div.c("row", () => {
				a.c("page-link", "step-1").href("/forms/wizard/step-1/");
				a.c("page-link", "step-2").href("/forms/wizard/step-2/");
				a.c("page-link", "step-3").href("/forms/wizard/step-3/");
			});

			this.$summary = p.c("forms-status", this.summary());

			button("clear").click(() => {
				this.collect("name", "");
				this.collect("email", "");

				// The step inputs are still in the document even when their step is
				// off screen — which is the whole thesis of this section, used here
				// as a convenience rather than argued about.
				document.querySelectorAll(".wiz-name, .wiz-email").forEach(node => node.value = "");
			});
		}, "Three real urls, a real Back button, and a summary that stays live while you move between them. Type in step 1, press Back and Forward, reload — the summary is unchanged every time.");

		// The steps mount HERE rather than in app.$pages, so this bar and this
		// summary stay on screen while a step is the leaf. One line, and CSS's
		// `.page.active-ancestor:has(.page.active-page)` does the rest.
		this.$pages = div.c("pages forms-steps");

		section("Where the accumulated data lives");

		code(`
the parent Page     the model      an ordinary object, alive for the session
sessionStorage      durability     the only thing that survives a reload
the url             the cursor     which step, and nothing else`,
			"three things, three jobs — and the position this section takes");

		md("A parent `Page` is constructed once at import and held in its parent's `children` map for the whole session. It is not a store, a context or a provider — it is an object, and `this.parent.data` is the whole API. **That is genuinely easier here than in most frameworks**, and it is worth saying plainly: nothing had to be invented for this to work.").ac("note");

		section("Why not the url");

		code(`
/forms/wizard/step-3/?name=Ada&email=ada%40example.com&note=four+hundred+words…`,
			"what putting the model in the url looks like");

		md("It has a length limit, it lands in history, referrers and any log the url touches, and it makes every keystroke a `replaceState`. The url should say **where you are**, not **what you typed** — and this framework's own claim, *the state is read entirely off the url*, is exactly the claim a form cannot honour. A form's state is not in the url and never will be.").ac("note");

		section("Why the steps need no guard");

		code(`
oninput -> this.parent.collect(key, value) -> sessionStorage`,
			"nothing is ever unsaved, so there is nothing to guard");

		md("Every keystroke is committed to the parent and to storage before you can click anything. Leaving is free, Back is free, reload is free. The wizard is the clearest case in this section where **autosave dissolves the guard question instead of answering it**.").ac("note");

		section("The memoization trap, and its fix");

		code(`
step-1 "Ada"   -> step-3    review  data = {"name":"Ada","email":""}
step-1 "Grace" -> step-3    review  data = {"name":"Grace","email":""}   <- activate()
Back                        /forms/wizard/step-1/
RELOAD                      sessionStorage {"name":"Grace","email":""}
                            .wiz-name value="Grace"  restored`,
			"measured — derived content is built once; entering happens many times");

		md("This is the cost of the memoization that makes everything else here work. `render()` runs once; `activate()` runs on every entry. Anything derived from state that another page can change belongs in `activate()`, and it has to run **after** `Page.prototype.activate.call(this)` because the views it repaints do not exist until then.").ac("note");

		a.c("page-link", "next: submit, then navigate →").href("/forms/submit/");

		this_file(import.meta);
	},
});
