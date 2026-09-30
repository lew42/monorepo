import { Page, md, div, span, p, button, icon, ui } from "/app.js";
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

/* 1. Icon alone — inline with text, and framed. */
const alone_demo = () => {
	const cell = (label, build) => div.c("flex v gap-25 card", () => { span.c("muted", label); build(); });

	return div.c("flex wrap gap v-center", () => {
		cell("inline with text", () => span.c("flex v-center gap-25", () => { icon("star"); span("Starred"); }));
		cell("framed — .ui-icon-frame", () => div.c("ui-icon-frame surface", () => icon("star")));
	});
};

/* 2. Icon button — flush, background, hover (try it), a toggle (click it). */
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

/* 4. Icon items in a list — with a background on each row (needs its own padding,
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

/* 5. The same small demo at three font sizes, side by side, with a guide toggle. */
const sizes_demo = () => div.c("flex v gap", () => {
	const boxes = [];

	button.c("ui-icon-btn ui-icon-btn-bg", () => icon("straighten"))
		.attr("type", "button").attr("aria-label", "toggle centre guide")
		.click(() => boxes.forEach($b => $b.toggle("ui-icon-guide")))
		.style("alignSelf", "flex-start");

	div.c("flex gap wrap v-end", () => {
		[14, 18, 28].forEach(px => {
			boxes.push(div.c("flex v gap-25 card", () => {
				span.c("muted", px + "px container");
				div.c("flex v-center gap", () => {
					div.c("ui-icon-frame", () => icon("star"));
					button.c("ui-icon-btn", () => icon("favorite")).attr("type", "button").attr("aria-label", "like");
					button.c("ui-icon-btn ui-icon-btn-bg", () => icon("bolt")).attr("type", "button").attr("aria-label", "flash");
				});
			}).style("fontSize", px + "px"));
		});
	});
});

export default new Page({
	meta: import.meta,
	title: "Icon",
	description: "One frame, one button, one rail — three classes around the icon() the site already has, all sized in em so a bigger container scales everything together.",
	icon: "widgets",

	content(){

		md("`ui/icon` is three classes, not a component: `.ui-icon-frame` (one icon in a fixed em box), `.ui-icon-btn` (the frame, clickable, with a flush/background/hover/toggle range), and `.ui-icon-rail` (a row of them). Nothing new to import for the glyph itself — that is still [`icon()`](/framework/core/View/), the same span every page already uses.");

		rail_demo().ac("bleed");
		md("A rail: back and search are flush, home is backed, save is the toggle — click it.");

		md("## The facts first: is Material Icons fixed width, and when does an icon need a frame?");

		md("**Yes — every Material Icons glyph sits on the same advance width** (the font ships each glyph in a 24×24 box, however much of that box the ink actually fills), so two icons side by side already line up horizontally with no help. A frame is not for that. A frame earns its place for three different reasons, and only when one of them is true:");

		md("- **A click target.** A bare glyph is often smaller than the ~2em a pointer or a thumb wants; the frame is the square hit area, and it is also where a background and a hover live.\n- **Vertical centring against something else.** The glyph's own line-height is 1, but the box around it (a button, a row) is usually taller — `place-items: center` in the frame is what actually centres the glyph inside that taller box, not the icon's own CSS.\n- **A consistent box in a grid of them** — a rail or a toolbar where every slot, icon or not, needs to measure the same.");

		md("An icon sitting inline with a sentence needs none of this — it just rides the text at `1.25em`, the same `.icon` class the site already has. `.ui-icon-frame` is additive, never a replacement for it.");

		md("## 1. Icon alone — inline, and framed");

		alone_demo();

		md("## 2. Icon button — flush, background, hover, toggle");

		md("A button is the frame made clickable. `aria-pressed` on the element itself is the toggle's on/off state — there is no separate class to fall out of sync with what a screen reader reads.");

		buttons_demo();

		md("## 3. Rail — mixed flush and backed");

		md("`.ui-icon-rail` only supplies the gap; each button inside still picks flush or backed for itself, so a row can mix both the way a real toolbar does.");

		div.c("ui-icon-rail card", () => {
			button.c("ui-icon-btn", () => icon("format_bold")).attr("type", "button").attr("aria-label", "bold");
			button.c("ui-icon-btn", () => icon("format_italic")).attr("type", "button").attr("aria-label", "italic");
			button.c("ui-icon-btn ui-icon-btn-bg", () => icon("format_underlined")).attr("type", "button").attr("aria-label", "underline");
			button.c("ui-icon-btn", () => icon("format_list_bulleted")).attr("type", "button").attr("aria-label", "list");
		});

		md("## 4. Icon items in a list (ui/item)");

		md("Reused, not duplicated: both lists below are plain `ui.item()` calls. The only difference is the `.boxed` class — on, each row paints its own background and needs the padding it already carries; off, the row is flat and only the `.card` wrapping the list paints anything, so the hover wash (point at a row) has to line up with the card's own edge and padding for the alignment to read as correct.");

		items_demo();

		md("## 5. Every demo at three font sizes");

		md("The frame, the click target, the button and the rail are all sized in `em` off the same container, so raising that container's `font-size` — 14px, 18px, 28px below — scales the icon, the frame and the padding together with no second number anywhere. The ruler button toggles a thin centre line to check the vertical alignment by eye.");

		sizes_demo();

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", rail_demo)); },
});
