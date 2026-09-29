import { div, span, label, input } from "/framework/core/View/View.js";
import { edit, set_edit } from "/framework/ext/Ask/edit.js";
import { section, check } from "/framework/dev/DevBar/parts.js";
import width from "/framework/dev/DevBar/width.js";
import blocked from "/framework/dev/DevBar/blocked.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { page_settings } from "/framework/core/Page/settings/settings.js";

/* THE SETTINGS TAB — the dev bar's own settings, reused, nothing new: the edit switch
   (ext/Ask/edit.js, the one every editor control reads), the reader's reload block,
   the width line, and the x-ray outline. Each is the dev bar's own function drawing
   into this box, so the two can never disagree; the dev bar's stylesheet is already
   on every page (app.js mounts it). "This page" (below) is the one thing here that IS
   new: a per-page setting, not a dev-bar-wide one — core/Page/settings/, loading-study.md
   section 4. */
export default function settings({ app }){
	div.c("drawer-settings flex v", () => {
		section("editing", () => {
			label.c("dev-knob", () => {
				// Same as the dev bar: every editor control decides at construction, so a flip reloads.
				const $box = input().attr("type", "checkbox")
					.on("change", function(){ set_edit(this.el.checked); location.reload(); });
				if (edit()) $box.attr("checked", true);
				span("edit mode — drag/drop, verdicts, Ask");
			});
		});

		section("live reload", () => { blocked(); });
		section("width", () => { width(app); });
		section("x-ray", () => check("outline every box", "dev-outline"));
		this_page(app);
	});
}

// "This page" — the page you are actually LOOKING at, `app.router.active` (Router.js;
// the leaf of whatever url is in the address bar). Nothing here on the drawer's own
// chrome or a boxed demo with no real url — `Router.activate()` never sets `.active` to
// one of those, so `page.url` is the guard that answers both "no page yet" and "not a
// real page" in one check.
function this_page(app){
	const page = app?.router?.active;
	if (!page?.url) return;

	section("this page", () => {
		span.c("muted", page.url);

		// ⚠ NO DOM AFTER AN AWAIT — the checkbox is built now, disabled, and filled in
		// by the callback once page_settings() answers (it may need to fetch a sibling
		// settings.jsonl or weight.jsonl; see settings.js). Building it unchecked would
		// flash the wrong state for a page that already opted out.
		label.c("dev-knob", () => {
			const $box = input().attr("type", "checkbox").attr("disabled", true);
			span("Appears in navigation");

			page_settings(page.url).then(({ nav }) => {
				$box.el.disabled = false;
				if (nav) $box.attr("checked", true);

				// A page.jsonl page's own log is `page.jsonl_url`; a page.js folder has
				// none, and writes to a sibling `settings.jsonl` instead — the same rule
				// weight.jsonl already uses (core/Page/weight/doc/design.md), so a
				// settings line never subscribes that folder to the file watcher.
				$box.on("change", async function(){
					const target = page.jsonl_url ?? page.url + "settings.jsonl";
					await Socket.singleton().request({ method: "append", args: [target, { settings: { nav: this.el.checked } }] });
					location.reload();
				});
			});
		});
	});
}
