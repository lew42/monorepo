import { div, span, label, input } from "/framework/core/View/View.js";
import { edit, set_edit } from "/framework/ext/Ask/edit.js";
import { section, check } from "/framework/dev/DevBar/parts.js";
import width from "/framework/dev/DevBar/width.js";
import blocked from "/framework/dev/DevBar/blocked.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { page_settings } from "/framework/core/Page/settings/settings.js";
import select from "../select.js";
import admin from "./admin.js";

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
		// card-measure-gap, 2026-09-30: click-anywhere selection (select.js) used to run
		// any time the drawer was open on its own tabs, so opening a dropdown or pressing
		// a button anywhere not on its OWN_CLICK list read as "select this" (the owner:
		// "it kind of destroys all the UX"). Off by default now; this is the only switch.
		// `changed`: turning it off drops a stale hover/selection instead of leaving it
		// lit with no way left to reach it (Escape still works, but a plain click no
		// longer clears anything once `active()` is false).
		section("inspect", () => check("inspect mode — click anything on the page to select it", "inspect-mode",
			() => { select.hover(null); select.clear(); }));
		this_page(app);
		// ADMIN, FOLDED IN (one-dictation drawer-chat, 2026-10-02): the reload hold and the
		// dev bar's route/server/structure/jump sections used to be their own top-level tab
		// (`tabs/admin.js`). Moved here, as one more section, so the tab row fits one line at
		// the drawer's 19rem default width (the owner's own screenshot showed six tabs
		// wrapping onto two lines). `admin.js`'s own function is called unchanged, not copied
		// — one set of code either way (CLAUDE.md law 6); it still draws its own heading-free
		// "reload hold" + dev-bar sections inside its own `drawer-admin` box, now just one
		// more child of this tab instead of a whole tab of its own.
		section("admin", () => admin({ app }));
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
				//
				// ⚠ 2026-09-29 fix round, finding 5: no more `location.reload()`. Once
				// this line streams back (only ever true for a page.jsonl page, whose
				// own log is being tailed — a page.js folder's sibling settings.jsonl
				// is never a live log, so THAT case still needs the reader to revisit
				// the page once to see the change, same as any other settings.jsonl
				// edit), the CHILD's own reader sees the `settings` key and asks ITS
				// PARENT to redraw (core/Page/Log.js's Reader.changed(), which is what
				// actually fixes the strip and the rail with no reload at all).
				$box.on("change", async function(){
					const target = page.jsonl_url ?? page.url + "settings.jsonl";
					await Socket.singleton().request({ method: "append", args: [target, { settings: { nav: this.el.checked } }] });
				});
			});
		});
	});
}
