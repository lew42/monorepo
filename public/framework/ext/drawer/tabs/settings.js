import { div, span, label, input } from "/framework/core/View/View.js";
import { edit, set_edit } from "/framework/ext/Ask/edit.js";
import { section, check } from "/framework/dev/DevBar/parts.js";
import width from "/framework/dev/DevBar/width.js";
import blocked from "/framework/dev/DevBar/blocked.js";

/* THE SETTINGS TAB — the dev bar's own settings, reused, nothing new: the edit switch
   (ext/Ask/edit.js, the one every editor control reads), the reader's reload block,
   the width line, and the x-ray outline. Each is the dev bar's own function drawing
   into this box, so the two can never disagree; the dev bar's stylesheet is already
   on every page (app.js mounts it). */
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
	});
}
