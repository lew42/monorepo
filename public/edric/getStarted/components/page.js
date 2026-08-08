import { Page, h2, md, demo, div, p, label, input, textarea, select, option, span, a, button, icon, hr, ul, li, details, summary, el, code } from "/app.js";

import alert from "/framework/styles/components/alert/component.js";
import { avatar as avatarFn } from "/framework/styles/components/avatar/component.js";   // Profile Menu's trigger; the demo composition itself moved to basicComponents/
import card from "/framework/styles/components/card/component.js";
import crumbs from "/framework/styles/components/crumbs/component.js";
import dialog from "/framework/styles/components/dialog/component.js";
import menu from "/framework/styles/components/menu/component.js";
import pagination from "/framework/styles/components/pagination/component.js";
import panel from "/framework/styles/components/panel/component.js";
import progress from "/framework/styles/components/progress/component.js";
import stats from "/framework/styles/components/stats/component.js";
import table from "/framework/styles/components/table/component.js";
import toolbar from "/framework/styles/components/toolbar/component.js";
import tooltip from "/framework/styles/components/tooltip/component.js";
import navbar from "/framework/styles/sections/navbar.js";
import hero from "/framework/styles/sections/hero.js";
import logos from "/framework/styles/sections/logos.js";
import features from "/framework/styles/sections/features.js";
import split from "/framework/styles/sections/split.js";
import numbers from "/framework/styles/sections/stats.js";   // `stats` is taken, by the component
import testimonials from "/framework/styles/sections/testimonials.js";
import pricing from "/framework/styles/sections/pricing.js";
import faq from "/framework/styles/sections/faq.js";
import signup from "/framework/styles/sections/signup.js";
import callout from "/framework/styles/sections/callout.js";
import footer from "/framework/styles/sections/footer.js";
import { card as cell } from "/framework/styles/gallery/gallery.js";   // `card` is taken, by the component
import mode from "/framework/core/App/mode.js";

// A stack of native disclosures, no stylesheet needed: unlike Menu, nothing here
// is positioned against a trigger, so there's no relationship or state an inline
// style can't say.
const accordion_demo = () => div.c("flex v", () => {
	[
		["What is this?", "A stack of native <details> elements."],
		["Does it need JS?", "No, the browser owns open and close."],
		["Can more than one be open?", "Yes, each <details> is independent."],
	].forEach(([q, answer]) => details(() => {
		summary.c("btn", q);
		p(answer).ac("pad");
	}));
});

// The native Popover API: top-layer, light-dismiss, no z-index fight, no JS.
// A fresh id per call, not a hardcoded one: this function now runs twice per
// page load (a gallery thumbnail, then the full demo below it), and a
// duplicate id would make `popovertarget` resolve to whichever came first.
let popover_count = 0;
const popover_demo = () => div.c("flex v-center", () => {
	const id = "cc-popover-demo-" + popover_count++;
	button("Show info").attr("popovertarget", id);
	div.c("pad", () => p("A native popover. Click outside, or press Escape, to close it."))
		.attr("popover", "auto").attr("id", id)
		.style({ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", maxWidth: "16em" });
});

// scroll-snap, entirely inline styles, no framework equivalent, and none
// needed: overflow-x plus snap-type is the whole mechanism.
const carousel_demo = () => div.c("flex", () => {
	["Slide one", "Slide two", "Slide three", "Slide four"].forEach(t =>
		div.c("pad flex v-center h-center", t).style({
			background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)",
			minWidth: "70%", flex: "0 0 auto", scrollSnapAlign: "start",
		}));
}).style({ gap: "0.75em", overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: "0.5em" });

const list_demo = () => ul(() => { li("First item"); li("Second item"); li("Third item"); });

const divider_demo = () => div.c("flow", () => {
	p("Above the line.");
	hr();
	p("Below the line.");
});

// A button, a fixed-position box and a timeout, no toast component in the
// framework, and this one needs no stylesheet either. The click fires well after
// the render that captured `.demo-render`, so the captor has already popped back
// to the page's own $pages, exactly where a toast should land, not nested
// inside the demo box.
const toast_demo = () => button("Show toast").click(() => {
	const $toast = div.c("pad flex gap v-center", () => {
		icon("check_circle").style("color", "var(--prim)");
		span("Saved.");
	}).style({
		position: "fixed", bottom: "1.5em", right: "1.5em",
		background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)",
		boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)", zIndex: "999",
	});
	setTimeout(() => $toast.remove(), 2500);
});

// The one place this page reaches for real CSS: an animation is rung 4, not
// something a utility class or an inline style object can express. See
// edric/styles.css.
const spinner_demo = () => div.c("cc-spinner");

const skeleton_demo = () => div.c("flex v gap", () => {
	[["80%"], ["60%"], ["40%"]].forEach(([w]) => div.c("cc-skeleton").style({ height: "1em", width: w }));
});

// No error/success tokens in framework.css, it only names colour once, on
// .prim/.bg, and neither is red or green. This is the same deliberate move,
// made twice: a literal colour where a token genuinely doesn't exist yet.
const error_demo = () => div.c("flex gap v-center", () => {
	icon("error").style("color", "#c0392b");
	span("Something went wrong. Try again.");
});

const empty_demo = () => div.c("flex v gap v-center h-center pad", () => {
	icon("inbox").style({ color: "var(--subtle)", fontSize: "2em" });
	p("Nothing here yet.").style("color", "var(--subtle)");
}).style("textAlign", "center");

const success_demo = () => div.c("flex gap v-center", () => {
	icon("check_circle").style("color", "var(--prim)");
	span("Payment complete.");
});

// Native `<input type="date">`, same framing as Dialog: the browser is the
// component, and framework.css leaves it alone.
const date_demo = () => input().attr("type", "date");

// No calendar component anywhere in the framework, and a real one is a lot more
// than a grid (months, keyboard nav, a selected range). This is the display
// half only: a fixed 7-column grid, inline styles, one day picked out with
// `--prim`, the same token every other "selected" state on this page uses.
const calendar_demo = () => div(() => {
	["S", "M", "T", "W", "T", "F", "S"].forEach(d => span.c("h4", d).style("color", "var(--subtle)"));
	Array.from({ length: 30 }, (_, i) => i + 1).forEach(day =>
		span(day).style(day === 14
			? { background: "var(--prim)", color: "white", borderRadius: "999px" }
			: {}));
}).style({ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.35em", textAlign: "center", maxWidth: "20em" });

// Native `<input type="file">`, wrapped the same way Label demos it.
const upload_demo = () => label.c("flex v", () => {
	div.c("h4", "Attach a file");
	input().attr("type", "file");
});

// No filter component either: a row of toggle buttons, exclusive selection
// kept in a plain array, the same click-flips-a-style move as Toggle / Switch.
const filter_demo = () => {
	const buttons = [];

	div.c("flex gap wrap", () => {
		["All", "Active", "Archived", "Starred"].forEach((label, i) =>
			buttons.push(button.c("btn", label).style(i === 0 ? { background: "var(--prim)", color: "white" } : {})));
	});

	buttons.forEach($btn => $btn.click(() => {
		buttons.forEach(b => b.style({ background: "", color: "" }));
		$btn.style({ background: "var(--prim)", color: "white" });
	}));
};

// A field select plus a direction button, `.empty()` re-fills the icon on
// click the same way `steps()` on Get Started swaps its panel.
const sort_demo = () => div.c("flex gap v-center", () => {
	select(() => { option("Name"); option("Date"); option("Size"); });

	let asc = true;
	const $dir = button(() => icon("arrow_upward"));
	$dir.click(() => {
		asc = !asc;
		$dir.empty(() => icon(asc ? "arrow_upward" : "arrow_downward"));
	});
});

// No chart library, none vendored, and none asked for: see CLAUDE.md on npm
// dependencies. Six divs and a height percentage is a bar chart, and it's
// honestly what most "chart" needs turn out to be.
const chart_demo = () => div.c("flex gap", () => {
	[40, 70, 55, 90, 65, 30].forEach(v => div().style({
		width: "1.5em", height: v + "%",
		background: "var(--prim)", borderRadius: "var(--radius) var(--radius) 0 0",
	}));
}).style({ alignItems: "flex-end", height: "8em" });

// A numbered stepper: three circles, a line between each, the current step
// picked out with `--prim`. Static, the "Install / Start Using It" card is the
// interactive version of this same idea (see Tabs, below).
const stepper_demo = () => div.c("flex v-center", () => {
	["Account", "Profile", "Confirm"].forEach((label, i) => {
		div.c("flex v-center", () => {
			span(i + 1).style({
				width: "1.6em", height: "1.6em", borderRadius: "999px",
				display: "flex", alignItems: "center", justifyContent: "center",
				background: i === 0 ? "var(--prim)" : "var(--wash)",
				color: i === 0 ? "white" : "var(--ink)",
			});
			span(label).style("marginLeft", "0.4em");
		});
		if (i < 2) div().style({ width: "2em", height: "2px", background: "var(--line)", margin: "0 0.5em" });
	});
});

// A slide-in panel, fixed to the edge, toggled the same way Toggle / Switch
// is: no stylesheet, a transform flipped by a click handler.
const drawer_demo = () => {
	let open = false;

	const $panel = div.c("pad flex v gap", () => {
		p.c("h4", "Filters");
		p("Drawer content goes here.").style("color", "var(--subtle)");
	}).style({
		position: "absolute", top: 0, right: 0, bottom: 0, width: "10em",
		background: "var(--surface)", borderLeft: "1px solid var(--line)",
		transform: "translateX(100%)", transition: "transform 0.2s",
	});

	button("Open drawer").click(() => {
		open = !open;
		$panel.style("transform", open ? "translateX(0)" : "translateX(100%)");
	});
};

const file_preview_demo = () => div.c("flex v gap", () => {
	let $name;

	input().attr("type", "file").on("change", function(){
		$name.text(this.el.files[0]?.name ?? "No file selected.");
	});

	$name = p("No file selected.").style("color", "var(--subtle)");
});

const time_demo = () => input().attr("type", "time");

const timeline_demo = () => div.c("flex v", () => {
	const events = [["Today", "Deployed to production"], ["Yesterday", "Opened PR #42"], ["Monday", "Created branch"]];

	events.forEach(([when, what], i) => {
		div.c("flex gap", () => {
			div.c("flex v h-center", () => {
				span().style({ width: "0.6em", height: "0.6em", borderRadius: "999px", background: "var(--prim)", flex: "0 0 auto" });
				if (i < events.length - 1) span().style({ width: "2px", flex: "1 1 auto", background: "var(--line)" });
			});
			div.c("flex v", () => {
				p.c("h4", when);
				p(what).style("color", "var(--subtle)");
			}).style({ gap: "0.1em", paddingBottom: "1em" });
		}).style("gap", "0.8em");
	});
});

// `.checkered` is gallery.js's own "this is unpainted" floor, borrowed for
// the same reason it's borrowed there: an empty box should read as empty, not
// as a colour choice.
const gallery_demo = () => div.c("grid gap auto", () => {
	Array.from({ length: 6 }).forEach(() => div.c("checkered").style({ aspectRatio: "1", borderRadius: "var(--radius)" }));
}).style("--column", "5em");

const code_demo = () => code.lang("bash", `npm install
node server.js`);

const overlay_demo = () => {
	let on = false, $overlay;

	div.c("flex v-center", () => {
		button("Process").click(() => {
			on = !on;
			$overlay.style("display", on ? "flex" : "none");
		});

		$overlay = div.c("flex v-center h-center", () => div.c("cc-spinner")).style({
			position: "absolute", inset: 0, display: "none",
			background: "color-mix(in srgb, var(--bg) 60%, transparent)",
		});
	}).style({ position: "relative", minHeight: "4em" });
};

const notfound_demo = () => div.c("flex v gap v-center h-center pad", () => {
	p.c("h1", "404");
	p("This page doesn't exist.").style("color", "var(--subtle)");
}).style("textAlign", "center");

const forbidden_demo = () => div.c("flex v gap v-center h-center pad", () => {
	p.c("h1", "403");
	p("You don't have permission to view this.").style("color", "var(--subtle)");
}).style("textAlign", "center");

// avatarFn is the named export alert/component.js's sibling, avatar,
// actually builds with, the default import above is just its own demo.
const profile_menu_demo = () => details.c("menu", () => {
	summary.c("flex v-center", () => avatarFn("ML", { "--avatar": "1.75em" }));

	div.c("menu-list flex v", () => {
		["Profile", "Settings", "Sign out"].forEach(item => a.c("menu-item", item).href("#"));
	});
});

// The real toggle, `framework/core/App/mode.js`: the same function the
// Sidebar footer already renders. `window.app`, not `this.app`: this array is
// built at module scope, before any Page exists to own a `this`, and unlike
// framework/ core files this only ever runs from a click well after the app
// has booted, which is exactly the case the "console convenience" comment in
// mode.js's own file describes.
const theme_demo = () => mode(window.app);

// The framework's own version of this is `--measure`, the token every `.page`
// gets by default (see Style > Layouts > Fit), this is that same idea, one
// level down, for a single box instead of a whole page.
const container_demo = () => div.c("pad", () => p("A fixed max-width, centred: the same idea `--measure` gives every `.page` by default."))
	.style({ maxWidth: "20em", margin: "0 auto", background: "var(--wash)", borderRadius: "var(--radius)" });

const grid_demo = () => div.c("grid gap auto", () => {
	["One", "Two", "Three", "Four"].forEach(t => div.c("pad", t).style({ background: "var(--wash)", borderRadius: "var(--radius)" }));
}).style("--column", "8em");

// Same wrapper Search bar uses: a relative box, an absolute icon. The icon
// itself is the toggle, `this` inside a `function(){}` click handler is the
// icon's own View (View.on() calls `cb.call(this, ...)`), so `.attr()`/`.text()`
// on `this` swap its own type/glyph, no separate variable needed for it.
// Menu's own `.menu-list`/`.menu-item` classes, borrowed for a panel that isn't
// inside a `<details>` at all: inline `position: fixed` at the click's own
// coordinates beats menu.css's `position: absolute` at any layer, so this
// doesn't need `.menu`'s positioning context, only its look.
const context_menu_demo = () => div.c("pad flex v-center h-center", () => p("Right-click here"))
	.style({ border: "1px dashed var(--line)", borderRadius: "var(--radius)", minHeight: "5em", color: "var(--subtle)" })
	.on("contextmenu", function(e){
		e.preventDefault();

		const $menu = div.c("menu-list flex v").style({ position: "fixed", left: e.clientX + "px", top: e.clientY + "px", zIndex: 999 });

		["Edit", "Delete", "View"].forEach(item => a.c("menu-item", item).href("#").append_to($menu));

		document.addEventListener("click", () => $menu.remove(), { once: true });
	});

const command_palette_demo = () => div.c("flex v-center", () => {
	let $panel;

	button.c("flex gap v-center", () => {
		icon("search");
		span("Search...").ac("flex-1");
		span("⌘K").style({ color: "var(--subtle)", fontSize: "0.85em" });
	}).style({ justifyContent: "flex-start", width: "100%" })
		.click(() => $panel.style("display", $panel.el.style.display === "none" ? "flex" : "none"));

	$panel = div.c("flex v", () => {
		["Go to Dashboard", "Open Settings", "Toggle theme"].forEach(item => div.c("menu-item", item));
	}).style({
		display: "none", position: "absolute", top: "2.5em", left: 0, right: 0, zIndex: 10,
		background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)",
		padding: "0.3em", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
	});
}).style({ position: "relative", maxWidth: "16em" });

const notification_bell_demo = () => span.c("flex v-center h-center", () => {
	icon("notifications").style({ fontSize: "1.6em" });
	span("3").style({
		position: "absolute", top: "-0.2em", right: "-0.2em",
		background: "var(--prim)", color: "white", borderRadius: "999px",
		fontSize: "0.7em", padding: "0.1em 0.4em", lineHeight: "1.2",
	});
}).style({ position: "relative", width: "2em", height: "2em" });

// Category order for the card grid below. Names match the three lists this
// page was built from, so a category here reads as the same word it did there.
// Sections is the odd one out: not from any of those lists, but framework/
// styles/sections/ has ten ready-made bands (see catalogue.js) and only two of
// them (Navbar, Hero) were reused before now.
const CATEGORIES = ["Basic components", "Navigation", "Content / Layout", "Feedback", "Data / Complex components", "Sections"];

// Real components, borrowed straight from framework/styles/components/: each
// one's own component.js, unmodified, so a fix or a rename there shows up here
// for free instead of drifting out of a copy. `icon` is the same glyph the real
// component's own page.js declares, not a guess.
const components = [
	// Navigation: structural (Navbar, Drawer, Breadcrumbs, Pagination) first,
	// menus/dropdowns next, controls last. Wrapped in a zero-arg arrow where
	// needed: `div.c(cls, fn)` calls fn with the new View as its argument
	// (`fn.call(this, this)` in View.append_fn), and navbar/hero both take an
	// optional `tone` positional param, passed bare, the View would land in
	// `tone` and silently pick the wrong band colour.
	{ title: "Navbar", icon: "menu", category: "Navigation", fn: () => navbar(), desc: "A row: brand, links, one call-to-action, borrowed from framework/styles/sections." },
	{ title: "Drawer", icon: "view_sidebar", category: "Navigation", fn: drawer_demo, desc: "A slide-in panel, fixed to the edge, toggled the same way Toggle / Switch is." },
	{ title: "Breadcrumbs", icon: "chevron_right", category: "Navigation", fn: crumbs, desc: "A row of links that knows where you are without asking." },
	{ title: "Pagination", icon: "last_page", category: "Navigation", fn: pagination, desc: "Links that look like buttons, and the two declarations `.btn` forgets." },
	{ title: "Menu", icon: "arrow_drop_down_circle", category: "Navigation", fn: menu, desc: "A <details> dropdown, the second component to earn a stylesheet." },
	{ title: "Context Menu", icon: "more_vert", category: "Navigation", fn: context_menu_demo, desc: "Menu's own `.menu-list`/`.menu-item` classes, positioned at the click instead of a summary." },
	{ title: "Profile Menu", icon: "account_circle", category: "Navigation", fn: profile_menu_demo, desc: "Avatar's own builder as the trigger, Menu's own CSS classes for the dropdown, no new component." },
	{ title: "Command Palette", icon: "keyboard_command_key", category: "Navigation", fn: command_palette_demo, desc: "A button that looks like a search field, and a panel it shows and hides." },
	{ title: "Toolbar", icon: "tune", category: "Navigation", fn: toolbar, desc: "Groups, a growing field, and why `flex-1` beats `split`." },
	{ title: "Theme Toggle", icon: "brightness_auto", category: "Navigation", fn: theme_demo, desc: "The real one: `framework/core/App/mode.js`, the same function the Sidebar footer already renders." },

	// Content / Layout: containers first (Container, Grid, Card, Panel), then
	// content basics (List, Divider), then the disclosure/overlay family
	// (Accordion, Tooltip, Popover, Dialog), then media, then marketing.
	{ title: "Container", icon: "crop_free", category: "Content / Layout", fn: container_demo, desc: "A fixed max-width, centred: the same idea `--measure` gives every `.page` by default." },
	{ title: "Grid", icon: "grid_view", category: "Content / Layout", fn: grid_demo, desc: "`.grid.auto`, the same utility Stat tiles and Image Gallery both build on." },
	{ title: "Card", icon: "web_asset", category: "Content / Layout", fn: card, desc: "A surface, and why it is three inline declarations rather than a class." },
	{ title: "Panel", icon: "crop_square", category: "Content / Layout", fn: panel, desc: "Header, body, footer, and `reverse`, the right-aligned action row nobody expects." },
	{ title: "List", icon: "format_list_bulleted", category: "Content / Layout", fn: list_demo, desc: "One declaration, `ul, ol { padding-left: 1.2em }`, is the entire list stylesheet." },
	{ title: "Divider", icon: "horizontal_rule", category: "Content / Layout", fn: divider_demo, desc: "Native `hr`, themed once: a hairline in the theme's own line colour, no margin of its own." },
	{ title: "Accordion", icon: "expand_more", category: "Content / Layout", fn: accordion_demo, desc: "A stack of native <details>, no stylesheet: nothing here is positioned against a trigger." },
	{ title: "Tooltip", icon: "help_outline", category: "Content / Layout", fn: tooltip, desc: "The one component that needs a stylesheet, and exactly why." },
	{ title: "Popover", icon: "chat_bubble_outline", category: "Content / Layout", fn: popover_demo, desc: "The native Popover API: top-layer, light-dismiss, no z-index fight." },
	{ title: "Dialog", icon: "picture_in_picture", category: "Content / Layout", fn: dialog, desc: "Native <dialog>, the browser is the component." },
	{ title: "Carousel", icon: "view_carousel", category: "Content / Layout", fn: carousel_demo, desc: "scroll-snap-type plus overflow-x, entirely inline styles, no JS." },
	{ title: "Image Gallery", icon: "photo_library", category: "Content / Layout", fn: gallery_demo, desc: "gallery.js's own `.checkered` class, borrowed for the same reason it's borrowed there." },
	{ title: "Code Block", icon: "code", category: "Content / Layout", fn: code_demo, desc: "`code.lang()`, from ext/highlight, already used on every page in this section." },
	{ title: "Hero section", icon: "campaign", category: "Content / Layout", fn: () => hero(), desc: "A band that bleeds, a measure inside it, borrowed from framework/styles/sections." },

	// Feedback: attention-grabbers, then loading states, then result states,
	// then whole-page states.
	{ title: "Alerts", icon: "info", category: "Feedback", fn: alert, desc: "A callout: an icon, a heading, a sentence, and one token in two places." },
	{ title: "Toast / Notification", icon: "notifications", category: "Feedback", fn: toast_demo, desc: "A button, a fixed-position box and a `setTimeout`, no stylesheet." },
	{ title: "Notification Bell", icon: "notifications", category: "Feedback", fn: notification_bell_demo, desc: "An icon and a count, absolutely positioned over it, the same move Badges makes." },
	{ title: "Progress", icon: "donut_large", category: "Feedback", fn: progress, desc: "Native <progress> and <meter>, themed by accent-color for free." },
	{ title: "Loading spinner", icon: "autorenew", category: "Feedback", fn: spinner_demo, desc: "The one place this page reaches for real CSS: an animation is rung 4, not something a utility class can express." },
	{ title: "Loading Overlay", icon: "hourglass_top", category: "Feedback", fn: overlay_demo, desc: "The same `.cc-spinner` as Loading spinner, over a dimmed absolute-positioned box." },
	{ title: "Skeleton loader", icon: "view_stream", category: "Feedback", fn: skeleton_demo, desc: "Same animation as the spinner, a pulsing opacity instead of a rotation." },
	{ title: "Success state", icon: "check_circle", category: "Feedback", fn: success_demo, desc: "Same shape as an alert, `--prim` instead of a literal colour, because green isn't in the palette." },
	{ title: "Error message", icon: "error", category: "Feedback", fn: error_demo, desc: "No error token in framework.css yet, a literal colour where one genuinely doesn't exist." },
	{ title: "Empty state", icon: "inbox", category: "Feedback", fn: empty_demo, desc: "An icon, a sentence, `--subtle` for both: nothing here that isn't already a token." },
	{ title: "Not Found / 404", icon: "search_off", category: "Feedback", fn: notfound_demo, desc: "The same centred-message shape as Empty state, a different sentence." },
	{ title: "Unauthorized / 403", icon: "block", category: "Feedback", fn: forbidden_demo, desc: "Same shape again: a wall of demos this size only needs one composition, reused honestly." },

	// Data / Complex: tiles and tables, then the three date-ish native
	// controls, then upload, then list controls, then charts and progress.
	{ title: "Stat tiles", icon: "bar_chart", category: "Data / Complex components", fn: stats, desc: "A card wall with one token retuned, no new selector." },
	{ title: "Data table", icon: "table_chart", category: "Data / Complex components", fn: table, desc: "The component with no classes at all." },
	{ title: "Date picker", icon: "calendar_today", category: "Data / Complex components", fn: date_demo, desc: "Native `<input type=\"date\">`, same framing as Dialog: the browser is the component." },
	{ title: "Calendar", icon: "event", category: "Data / Complex components", fn: calendar_demo, desc: "The display half only, a fixed 7-column grid, inline styles, `--prim` on the selected day." },
	{ title: "Time Picker", icon: "schedule", category: "Data / Complex components", fn: time_demo, desc: "Native `<input type=\"time\">`, the third of the three date-ish native controls on this page." },
	{ title: "File upload", icon: "upload_file", category: "Data / Complex components", fn: upload_demo, desc: "Native `<input type=\"file\">`, wrapped the way Label demos it." },
	{ title: "File Preview", icon: "description", category: "Data / Complex components", fn: file_preview_demo, desc: "The `change` event and `.files[0].name`, no upload actually happens." },
	{ title: "Filter", icon: "filter_list", category: "Data / Complex components", fn: filter_demo, desc: "A row of toggle buttons, exclusive selection kept in a plain array." },
	{ title: "Sort controls", icon: "sort", category: "Data / Complex components", fn: sort_demo, desc: "A field select plus a direction button, `.empty()` re-fills the icon on click." },
	{ title: "Timeline", icon: "history", category: "Data / Complex components", fn: timeline_demo, desc: "A dot, a line, a line again: three flex rows, no SVG, no library." },
	{ title: "Stepper / Multi-step form", icon: "linear_scale", category: "Data / Complex components", fn: stepper_demo, desc: "Three numbered circles and the lines between them, static; Get Started's tabs are the interactive version of the same idea." },
	{ title: "Charts", icon: "insights", category: "Data / Complex components", fn: chart_demo, desc: "No chart library vendored, none asked for, six divs and a height percentage." },

	// Sections: whole marketing bands, borrowed straight from framework/styles/
	// sections/, same as Navbar and Hero above. Icons are catalogue.js's own,
	// not a guess. Each takes an optional `tone`, wrapped zero-arg for the same
	// reason Navbar/Hero are: `div.c(cls, fn)` calls fn with the new View as an
	// argument, and a bare `tone => …` would silently pick that up as its tone.
	{ title: "Logo wall", icon: "domain", category: "Sections", fn: () => logos(), desc: "Wordmarks in the type scale, no logo files needed for the demo." },
	{ title: "Features", icon: "grid_view", category: "Sections", fn: () => features(), desc: "Cards, filled: `grid gap auto` inside a measured band." },
	{ title: "Split", icon: "vertical_split", category: "Sections", fn: () => split(), desc: "Two equal panes that stack themselves, no breakpoint written." },
	{ title: "Numbers", icon: "insights", category: "Sections", fn: () => numbers(), desc: "Dashboard's `grid gap auto`, retuned with one token." },
	{ title: "Testimonials", icon: "format_quote", category: "Sections", fn: () => testimonials(), desc: "A real `blockquote` plus Avatar's own builder: a section is components composed." },
	{ title: "Pricing", icon: "sell", category: "Sections", fn: () => pricing(), desc: "Split, filled: two panes with an equal basis, so they're equal." },
	{ title: "FAQ", icon: "help", category: "Sections", fn: () => faq(), desc: "Native `<details>` again, the same primitive Accordion demos." },
	{ title: "Sign up", icon: "mail", category: "Sections", fn: () => signup(), desc: "One input, one button; `flex: 1 1 12em` is the whole responsive story." },
	{ title: "Call out", icon: "bolt", category: "Sections", fn: () => callout(), desc: "A `split` row: the pitch on one side, two buttons on the other." },
	{ title: "Footer", icon: "call_to_action", category: "Sections", fn: () => footer(), desc: "Holy grail's bottom band, on its own: `flex wrap split` does both jobs." },
];

// gallery.js's card() needs a thumb to render, and these two have no demo of
// their own to show, just the icon, large, standing in for one.
const link_thumb = name => () => div.c("flex v-center h-center", () => {
	icon(name).style({ fontSize: "2.5em", color: "var(--subtle)" });
}).style({ height: "100%" });

// Sidebar and Tabs already have their own real pages elsewhere in edric, see
// the two components/page.js rounds before this one. They still belong in the
// Navigation card grid, just pointed at those pages instead of an anchor here.
// Stack is the same deal, one door over: it's a real framework layout, already
// reused (unmodified) on Style > Layouts, so it links out instead of drifting
// into a second copy here. Basic components is now the same shape too: all 25
// of its items moved to basicComponents/, one url each, so this card is the
// whole "Basic components" section now, not a fan-out of 25 thumbnails.
const external_links = [
	{ title: "Sidebar", icon: "view_sidebar", category: "Navigation", url: "/edric/getStarted/framework/sidebar/", fn: link_thumb("view_sidebar"), desc: "A brand over a list of links. See Framework > Sidebar." },
	{ title: "Tabs", icon: "tab", category: "Navigation", url: "/edric/getStarted/framework/page/", fn: link_thumb("tab"), desc: "Page.tabs() is the routed version. See Framework > Page." },
	{ title: "Stack", icon: "view_agenda", category: "Content / Layout", url: "/edric/getStarted/style/layouts/", fn: link_thumb("view_agenda"), desc: "Vertical rhythm, a form that needed none of its own CSS. See Style > Layouts." },
	{ title: "Basic components", icon: "widgets", category: "Basic components", url: "/edric/getStarted/components/basicComponents/", fn: link_thumb("widgets"), desc: "Every basic control, each with its own page and a style variant or two." },
];

const slug = title => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// One card per category, not per item: a `.page-preview` like Get Started's
// own Explore section, not gallery.js's cell(): there's no single live render
// for a whole category, so this is a navigation card, not a component demo.
// Basic components links out to its real page; the other five link to their
// own anchor further down this same page, since none of them has one yet.
const CATEGORY_INFO = {
	"Basic components": { icon: "widgets", url: "/edric/getStarted/components/basicComponents/", desc: "Buttons, inputs, selects, form controls." },
	"Navigation": { icon: "alt_route", desc: "Navbars, menus, breadcrumbs, pagination." },
	"Content / Layout": { icon: "view_quilt", desc: "Cards, panels, dialogs, accordions." },
	"Feedback": { icon: "feedback", desc: "Alerts, toasts, loading and error states." },
	"Data / Complex components": { icon: "dataset", desc: "Date pickers, tables, charts, multi-step forms." },
	"Sections": { icon: "view_day", desc: "Hero, pricing, FAQ, and other marketing bands." },
};

// Which category you're reading: the last one whose heading has passed the
// reading line, same idea ext/toc's own spy() uses, and the same reason it
// isn't an IntersectionObserver either: between two widely spaced headings
// nothing is intersecting, and "no category is current" is never the answer a
// reader wants. `.pages` scrolls, not the window (Page.css), so the listener
// has to live there. Returns a cleanup fn; deactivated() below calls it so a
// page nobody's looking at doesn't keep a scroll listener alive.
function spy_categories(page){
	const root = page.app.$app.el;

	const entries = CATEGORIES
		.map(title => ({
			heading: root.querySelector("#" + slug(title)),
			link: root.querySelector(`.sidebar-link[href$="#${slug(title)}"]`),
		}))
		.filter(e => e.heading && e.link);

	if (!entries.length) return;

	// edric/page.js claims its OWN `.pages` region (Page.class's container()
	// walk), so $app has TWO of them, an outer one and this inner one. The
	// scroller has to be the ancestor of the actual heading, the same reason
	// toc.js derives it from `page.closest(".pages")` instead of querying blind.
	const scroller = entries[0].heading.closest(".pages");

	if (!scroller) return;

	const update = () => {
		if (!scroller.offsetParent) return;   // hidden, same guard toc.js uses

		// I'm a shared ancestor once basicComponents/ is the active leaf, and
		// Router's chain diff never deactivates a shared ancestor on a deeper
		// navigation, so this listener keeps running against headings that
		// aren't the page on screen anymore. Once they're all off-screen every
		// rect reads top: 0, "last one whose top passed the line" degenerates
		// to "the last category, always", and self-removing here is what stops
		// it from re-painting that wrong answer on the next scroll.
		if (!page.view?.hc("active-page")){
			stop();
			return;
		}

		const line = scroller.getBoundingClientRect().top + 90;
		let current = 0;

		entries.forEach((e, i) => { if (e.heading.getBoundingClientRect().top <= line) current = i; });
		entries.forEach((e, i) => e.link.classList.toggle("current", i === current));
	};

	// The sidebar is edric/page.js's, not mine: it isn't rebuilt when I'm not
	// the active page, so a `.current` I set stays stuck forever unless
	// something clears it. Two call sites: deactivated() below, for the
	// ordinary case of leaving me entirely, and update() above, for the
	// shared-ancestor case neither activate() nor deactivate() ever sees.
	const stop = () => {
		scroller.removeEventListener("scroll", update);
		entries.forEach(e => e.link.classList.remove("current"));
	};

	scroller.addEventListener("scroll", update, { passive: true });
	update();
	requestAnimationFrame(update);

	return stop;
}

export default new Page({
	meta: import.meta,
	title: "Custom Components",
	description: "A UI kit: real framework pieces where they exist, small honest ones where they don't.",

	// A gallery is not prose: no measure, so the wall gets the room it has.
	// Same reasoning as framework/styles/components/page.js.
	classes: "pad",

	// Basic components moved one door over: basicComponents/ holds all 25 of
	// its items (each with its own url and a style variant or two), the same
	// shape framework/styles/components/ itself uses. The other five
	// categories are still inline below, for now.
	children: "basicComponents",

	// Same reasoning as framework/page.js: I'm nested under the sidebar's "Get
	// Started" dropdown, so landing here should force it open. Then the
	// scroll-spy, so a category lights up as you scroll to it.
	activated(){
		this.app.$app.el.querySelector(".sidebar-group")?.setAttribute("open", "");
		this.stop_spy = spy_categories(this);
	},

	deactivated(){
		this.stop_spy?.();
	},

	content(){
		const all = [...components, ...external_links];

		md("Every cell below is a **live render** of the same function its demo further down runs, the same move framework/styles/components/page.js makes with `gallery.js`, shrunk with `zoom`, windowed with `overflow: hidden`, and click-inert so the render's own buttons and inputs can't fight the card's one real link.").ac("mb");

		h2("Categories").ac("mb");

		// .page-preview is `display: flex` (Page.css), a single row meant for
		// exactly two children: the icon, and ONE content block. Title and desc
		// have to share that second slot, or all three squeeze into flex
		// columns side by side instead of desc sitting under the title.
		div.c("page-previews mb", () => {
			CATEGORIES.forEach(category => {
				const info = CATEGORY_INFO[category];

				a.c("page-preview").href(info.url ?? "#" + slug(category)).append(() => {
					icon(info.icon);
					div(() => {
						div.c("page-preview-title", category);
						div.c("page-preview-desc", info.desc);
					});
				});
			});
		});

		// Basic components sits out this loop: its Categories card above already
		// points straight to its own page, and re-showing its one teaser card
		// here as a whole "section" was worse than redundant: a `.grid.auto`
		// with exactly one item has nothing to share the row with, so the
		// single cell stretches to fill it.
		CATEGORIES.filter(category => category !== "Basic components").forEach(category => {
			h2(category).attr("id", slug(category)).style("scrollMarginTop", "1em").ac("mb");

			div.c("grid gap auto mb", () => {
				all.filter(c => c.category === category).forEach(c =>
					cell({ url: c.url ?? "#" + slug(c.title), label: c.title, icon: c.icon }, c.fn, "zoom-50 pad"));
			}).style({ "--column": "13em", "--gap": "1.5em" });
		});

		components.forEach(c => {
			h2(c.title).attr("id", slug(c.title)).style("scrollMarginTop", "1em").ac("mb");
			demo(c.fn, c.desc).ac("mb");
		});

		md("Back to [Get Started](/edric/getStarted/).");
	}
});