import { Page, p, a, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../../forms/field.js";
import { this_file } from "../../forms/this_file.js";
import { autosave } from "../autosave.js";

export default new Page({
	meta: import.meta,
	title: "Autosave, for real",
	classes: "mutation",

	content(){
		demo(() => {
			const $state = p.c("forms-status", "");

			this.$note = field("Type. Watch the state. Then reload.", { name: "note", rows: 4 });

			this.saver = autosave(this.$note, "autosave-ref", {
				state: (name, detail) => $state.text(detail ? `${name} — ${detail}` : name),
			});

			button("is it dirty?").click(() =>
				$state.text(this.saver.dirty() ? "dirty — typed since the last write" : "clean"));

			button("clear").click(() => { this.saver.clear(); this.$note.el.value = ""; });
		}, "`clean → dirty → saved`, and `failed` if the write throws. The handle carries `dirty()` — **which is exactly the question a navigation guard would have asked**, answerable without one.");

		section("Why four states and not two");

		code(`
clean    nothing typed since the last write
dirty    typed, not yet written — the debounce window, ~300ms
saved    written, and the value written is the value on screen
failed   the write threw`, "\"saved / not saved\" cannot render honestly");

		p("`failed` is not defensive padding. `localStorage.setItem` raises `QuotaExceededError` when the origin is full, and in some private-browsing modes it throws on every call. It is the one storage failure that actually happens in the wild and the one nobody handles — and a UI that says *saved* while the write is throwing has lied to the user about the only thing that mattered.").ac("note");

		section("The storage decision");

		code(`
where                cost          survives reload   survives tab close
───────────────────  ────────────  ───────────────   ──────────────────
the Page instance    free          NO                no
sessionStorage       a JSON round  yes               no
localStorage         a JSON round  yes               yes
                     + cleanup
                     + cross-tab
                     collisions`, "pick the cheapest tier that outlives the boundary you care about");

		md("**The Page instance is the working copy; storage is the durability.** They are not alternatives — you want both, and the split is the point. The instance is free and instant and covers every in-app navigation. Storage costs a serialize and only earns its keep at the reload boundary.").ac("note");

		md("**Default to `sessionStorage`.** It is per-tab, so two tabs editing the same form cannot overwrite each other, and the browser cleans it up. `localStorage` buys exactly one more row — surviving a closed tab — and charges two real costs for it: two tabs share one key and will clobber each other, and nothing ever expires. Take that trade only when you have decided you want it. `/mutation/recovery/` is the case where you have.").ac("note");

		section("Measured");

		code(`
type "durable text"     sessionStorage {"text":"durable text","at":1754…}
reload                  value="durable text"   restored
navigate away and back  value="durable text"   never left the DOM at all
clear + reload          value=""`, "and the second row is the only one storage was needed for");

		md("Read the third row: after a soft navigation the value is back because the **node** never left. Autosave did nothing there — memoization did. Autosave exists for row two, and row two alone.").ac("note");

		section("This is what the framework is recommending");

		p("`/forms/` concluded that a framework with no navigation guard is quietly recommending autosave, because the exits a guard could refuse lose nothing and the exits that lose everything never reach `Router`. This page is that recommendation implemented. Nothing on it touches `Router`, and nothing on it could have been done by a guard.").ac("note");

		a.c("page-link", "next: what restores a draft, and when →").href("/mutation/recovery/");

		this_file(import.meta);
	},
});
