import { Page, md, div, span, button, icon, ui } from "/app.js";
import "./icon.js";

/* The top exhibit: one rail, mixed flush and backed, with a real toggle in it — the
 * single picture that answers "what does this buy me" before any of the smaller,
 * focused sections below break it apart. */
const rail_demo = () => div.c("ui-icon-rail card", () => {
	button.c("ui-icon-btn", () => icon("arrow_back")).attr("type", "button").attr("aria-label", "back");
	button.c("ui-icon-btn ui-icon-btn-bg", () => icon("home")).attr("type", "button").attr("aria-label", "home");
	button.c("ui-icon-btn", () => icon("search")).attr("type", "button").attr("aria-label", "search");

	// The rail's one toggle: click it to see the on/off look change in place.
	const $save = button.c("ui-icon-btn", () => icon("bookmark"))
		.attr("type", "button").attr("aria-label", "save").attr("aria-pressed", "false");
	$save.click(() => $save.attr("aria-pressed", $save.attr("aria-pressed") === "true" ? "false" : "true"));

	button.c("ui-icon-btn", () => icon("more_vert")).attr("type", "button").attr("aria-label", "more");
});

/* Icon alone — inline with text, and framed. */
const alone_demo = () => {
	const cell = (label, build) => div.c("flex v gap-25 card", () => { span.c("muted", label); build(); });

	return div.c("flex wrap gap v-center", () => {
		cell("inline with text", () => span.c("flex v-center gap-25", () => { icon("star"); span("Starred"); }));
		cell("framed — .ui-icon-frame", () => div.c("ui-icon-frame surface", () => icon("star")));
	});
};

/* Icon button — flush, background, hover (try it), a toggle (click it). */
const buttons_demo = () => {
	const cell = (label, build) => div.c("flex v gap-25 card", () => { span.c("muted", label); build(); });

	return div.c("flex wrap gap v-center", () => {
		cell("flush — no background", () => button.c("ui-icon-btn", () => icon("favorite")).attr("type", "button").attr("aria-label", "like"));
		cell("background", () => button.c("ui-icon-btn ui-icon-btn-bg", () => icon("favorite")).attr("type", "button").attr("aria-label", "like"));
		cell("hover — point at it", () => button.c("ui-icon-btn ui-icon-btn-bg", () => icon("favorite")).attr("type", "button").attr("aria-label", "like"));
		cell("toggle — click it", () => {
			const $b = button.c("ui-icon-btn ui-icon-btn-bg", () => icon("bookmark"))
				.attr("type", "button").attr("aria-label", "save").attr("aria-pressed", "false");
			$b.click(() => $b.attr("aria-pressed", $b.attr("aria-pressed") === "true" ? "false" : "true"));
		});
	});
};

/* Icon items in a list — with a background on each row (needs its own padding,
 * ui/item's own .boxed), and without one (gap only, hover wash on point). Both
 * lists sit inside a card so the hover wash's edge is checkable against a real,
 * visible parent edge and padding. */
const items_demo = () => div.c("flex wrap gap", () => {
	const column = (label, build) => div.c("flex v gap-25", () => { span.c("muted", label); build(); }).style("minWidth", "16em");

	column("background on each row — .boxed, needs its own padding", () => {
		div.c("flex v", () => {
			ui.item({ icon: "description", name: "readme.md", href: "/framework/ui/icon/" }).ac("boxed");
			ui.item({ icon: "folder", name: "core", href: "/framework/core/" }).ac("boxed");
			ui.item({ icon: "settings", name: "settings.json", href: "/framework/ui/icon/" }).ac("boxed");
		});
	});

	column("no row background — gap only, hover on point; the card shows the edge", () => {
		div.c("card flex v", () => {
			ui.item({ icon: "description", name: "readme.md", href: "/framework/ui/icon/" });
			ui.item({ icon: "folder", name: "core", href: "/framework/core/" });
			ui.item({ icon: "settings", name: "settings.json", href: "/framework/ui/icon/" });
		});
	});
});

/* One compact copy of all five demos, captioned in a single line each — this is
 * what the three-font-size showcase below repeats at 14px, 18px and 28px, so the
 * scaling claim ("raise the container's font-size, everything grows together")
 * is something the reader SEES rather than takes on faith. */
const kit = () => div.c("flex v gap", () => {
	const row = (caption, build) => div.c("flex v gap-25", () => { build(); span.c("muted", caption); });

	row("Icon: inline, framed", () => div.c("flex gap v-center", () => {
		span.c("flex v-center gap-25", () => { icon("star"); span("Starred"); });
		div.c("ui-icon-frame surface", () => icon("star"));
	}));

	row("Button: flush, background, toggle — click it", () => div.c("flex gap v-center", () => {
		button.c("ui-icon-btn", () => icon("favorite")).attr("type", "button").attr("aria-label", "like");
		button.c("ui-icon-btn ui-icon-btn-bg", () => icon("favorite")).attr("type", "button").attr("aria-label", "like");
		const $b = button.c("ui-icon-btn ui-icon-btn-bg", () => icon("bookmark"))
			.attr("type", "button").attr("aria-label", "save").attr("aria-pressed", "false");
		$b.click(() => $b.attr("aria-pressed", $b.attr("aria-pressed") === "true" ? "false" : "true"));
	}));

	row("Rail: mixed flush and backed", () => div.c("ui-icon-rail", () => {
		button.c("ui-icon-btn", () => icon("format_bold")).attr("type", "button").attr("aria-label", "bold");
		button.c("ui-icon-btn", () => icon("format_italic")).attr("type", "button").attr("aria-label", "italic");
		button.c("ui-icon-btn ui-icon-btn-bg", () => icon("format_underlined")).attr("type", "button").attr("aria-label", "underline");
	}));

	row("Items: boxed (padding) vs flat (gap only, hover on point)", () => div.c("flex gap", () => {
		div.c("flex v", () => ui.item({ icon: "description", name: "readme.md", href: "/framework/ui/icon/" }).ac("boxed"));
		div.c("card flex v", () => ui.item({ icon: "description", name: "readme.md", href: "/framework/ui/icon/" }));
	}));
});

/* The page's own first thing: the same kit, three times, at three font sizes —
 * proof, not a claim, that raising a container's font-size scales the icon, the
 * frame and the padding together. The ruler button toggles a thin centre line to
 * check the vertical alignment by eye. */
const sizes_demo = () => div.c("flex v gap", () => {
	const boxes = [];

	button.c("ui-icon-btn ui-icon-btn-bg", () => icon("straighten"))
		.attr("type", "button").attr("aria-label", "toggle centre guide")
		.click(() => boxes.forEach($b => $b.toggle("ui-icon-guide")))
		.style("alignSelf", "flex-start");

	div.c("flex gap wrap v-start", () => {
		[14, 18, 28].forEach(px => {
			boxes.push(div.c("flex v gap card", () => {
				span.c("h4", px + "px container");
				kit();
			}).style("fontSize", px + "px"));
		});
	});
}).ac("bleed");

export default new Page({
	meta: import.meta,
	title: "Icon",
	description: "One frame, one button, one rail — three classes around the icon() the site already has, all sized in em so a bigger container scales everything together.",
	icon: "widgets",

	content(){

		sizes_demo();

		md("## Icon alone");
		alone_demo();
		md("`.ui-icon-frame` centres an icon in a fixed box; an icon inline with text keeps riding plain `.icon`, unframed.");

		md("## Icon button");
		buttons_demo();
		md("`.ui-icon-btn` is the frame, clickable — flush, backed, or toggled with `aria-pressed`, which is also the on/off state a screen reader reads.");

		md("## Rail");
		rail_demo().ac("bleed");
		md("`.ui-icon-rail` only supplies the gap between buttons; each one still picks flush or backed for itself.");

		md("## Icon items in a list");
		items_demo();
		md("Both lists below are plain `ui.item()` calls — `.boxed` on or off is the only difference between them.");

		md("Material Icons are fixed width (24×24); frame an icon only for a click target, centring in a taller box, or a grid of equal slots. Why: [Docs](doc/icons.md).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", rail_demo)); },
});
