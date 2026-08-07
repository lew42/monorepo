import { Page, p, a, div, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../../forms/field.js";
import { this_file } from "../../forms/this_file.js";
import { autosave, age, ago } from "../autosave.js";

export default new Page({
	meta: import.meta,
	title: "Draft recovery",
	classes: "mutation",

	key: "recovery-draft",
	expires: 1000 * 60 * 60 * 24,     // a day. A week-old draft is its own horror.

	/* The offer is re-made on every ENTRY, not once at build.
	 *
	 * render() runs once, so an offer made there is made once — and a draft can
	 * appear while you are somewhere else entirely (a second tab writing the same
	 * localStorage key). activate() is the only hook that runs every time you
	 * arrive, which is exactly when "is there something to recover" is asked.
	 */
	activate(){
		Page.prototype.activate.call(this);
		this.offer();
		return this;
	},

	offer(){
		const ms = age(this.key);
		const stale = ms !== null && ms > this.expires;
		const mine = this.$draft.el.value;

		this.$offer.empty();

		if (ms === null || stale || mine) return this.$note.text(
			ms === null ? "no stored draft" :
			stale ? `a draft exists but is ${ago(ms)} — too old to offer` :
			"you have already typed here; the draft is not offered over your own work");

		this.$note.text("");
		this.$offer.append(() => {
			p.c("forms-status", `Unsaved draft from ${ago(ms)}.`);
			button("restore").click(() => {
				this.$draft.el.value = this.saver.read()?.text ?? "";
				this.$offer.empty();
				this.$note.text("restored");
			});
			button("discard").click(() => {
				this.saver.clear();
				this.$offer.empty();
				this.$note.text("discarded");
			});
		});
	},

	content(){
		demo(() => {
			this.$offer = div.c("mutation-offer");
			this.$note = p.c("forms-status", "");

			this.$draft = field("Type, then press \"simulate a closed tab\", then come back to this url", {
				name: "draft", rows: 4 });

			this.saver = autosave(this.$draft, this.key, { store: localStorage });

			button("simulate a closed tab").click(() => {
				this.$draft.el.value = "";          // the DOM is gone in a real one
				this.$note.text("the tab 'closed' — now leave this page and return");
			});

			button("forget the draft").click(() => {
				this.saver.clear();
				this.$offer.empty();
				this.$note.text("cleared");
			});
		}, "`localStorage` here, not `sessionStorage` — this is the one case that buys the extra row, because the whole scenario is *the tab was closed*. The costs come with it: two tabs share the key, and nothing expires unless you make it.");

		section("Three rules, and the middle one is the design");

		code(`
1  OFFER it — never apply it silently.
   A draft restored over content the page already had destroys the thing
   the user can see, to recover the thing they cannot.

2  Offer it in activate(), not render().
   render() runs ONCE. A draft can appear while you are somewhere else —
   a second tab, the same key. activate() runs on every arrival, which is
   when the question is actually being asked.

3  Expire it.
   Restoring last week's text into an empty form is its own small horror.
   A day here; the right number is a product decision, not a default.`);

		p("Rule 2 is the one this framework forces you to discover. In a framework that re-renders on navigation, \"check for a draft when the page appears\" is just render logic. Here `render()` is a build step that happens once and `activate()` is the only arrival hook — so a recovery offer written in `content()` is an offer made exactly once, at whatever moment the page was first built.").ac("note");

		section("…and it costs the prototype call again");

		code(`
activate(){
    Page.prototype.activate.call(this);   // placement, by hand
    this.offer();                          // the thing I actually wanted
    return this;
}`, "the third seat to write this line");

		md("The async seat hit this restarting a timer, I hit it refreshing a wizard's review step, and here it is a third time for a recovery offer. **Three different motivations, one workaround, independently.** That is the strongest evidence available for the async seat's PROPOSAL 4 — split placement into `mount()` and leave `activate()` as the seam — and I am backing it.").ac("note");

		section("Measured");

		code(`
type "recover me", wait for the write, then:

leave and return          no offer — "you have already typed here"
                          (the node never left; the draft is not news)
simulate a closed tab     field cleared, draft still in localStorage
leave and return          OFFER: "Unsaved draft from 4s ago." [restore] [discard]
restore                   value="recover me"
age > 24h                 no offer — "too old"`);

		p("Row one is the important one. After a soft navigation there is nothing to recover, because nothing was lost — offering anyway would be a prompt about a non-event, which teaches users to dismiss the prompt that matters.").ac("note");

		a.c("page-link", "next: an upload that outlives its page →").href("/mutation/outliving/");

		this_file(import.meta);
	},
});
