import { div, p, span, a, button, input, textarea, select, option, label, icon, el, details, summary, meter } from "/app.js";

// The hand-built Basic-components demos, moved here from components/page.js so
// both the index's gallery thumbnail and each item's own dedicated page can
// import the same function, one definition, two call sites, no second copy of
// the markup to drift. Same reasoning as framework/styles/components/parts.js.
// Native elements framework.css styles directly (see Style > Forms): nothing
// here that a utility class or an inline style object can't do.

export const button_demo = () => div.c("flex gap wrap v-center", () => {
	button("Button");
	button.c("prim", "Primary");
	button.c("bg", "Dark");
	a.c("btn prim", "Link as button").href("#");
});

export const button_sizes_demo = () => div.c("flex gap wrap v-center", () => {
	button.c("prim", "Small").style({ fontSize: "0.8em", padding: "0.2em 0.7em" });
	button.c("prim", "Default");
	button.c("prim", "Large").style({ fontSize: "1.15em", padding: "0.4em 1.2em" });
	button("Disabled").attr("disabled", "");
});

export const input_demo = () => label.c("flex v", () => {
	div.c("h4", "Email");
	input().attr("type", "email").attr("placeholder", "you@example.com");
});

export const input_icon_demo = () => div.c("flex v gap", () => {
	div.c("flex v-center", () => {
		icon("person").style({ position: "absolute", left: "0.6em", color: "var(--subtle)", pointerEvents: "none" });
		input().attr("placeholder", "Username").style("paddingLeft", "2em");
	}).style({ position: "relative", maxWidth: "16em" });

	input().attr("placeholder", "Disabled").attr("disabled", "").style("maxWidth", "16em");
});

export const textarea_demo = () => div.c("flex v gap", () => {
	textarea("Grows taller, never wider than its column.");
	textarea.c("auto", "textarea.auto follows the text, type into it.");
});

export const textarea_rows_demo = () => textarea("A fixed four rows tall, `rows` is a real HTML attribute, not a class.").attr("rows", "4");

export const checkbox_demo = () => div.c("flex gap wrap v-center", () => {
	label(input().attr("type", "checkbox"), " Subscribe");
	label(input().attr("type", "checkbox").attr("checked", ""), " Checked");
});

export const checkbox_disabled_demo = () => div.c("flex gap wrap v-center", () => {
	label(input().attr("type", "checkbox").attr("disabled", ""), " Disabled");
	label(input().attr("type", "checkbox").attr("disabled", "").attr("checked", ""), " Disabled, checked");
});

export const radio_demo = () => div.c("flex gap wrap v-center", () => {
	label(input().attr("type", "radio").attr("name", "r"), " One");
	label(input().attr("type", "radio").attr("name", "r"), " Two");
});

export const radio_vertical_demo = () => div.c("flex v gap", () => {
	["Small", "Medium", "Large"].forEach(size => label(input().attr("type", "radio").attr("name", "r2"), " " + size));
});

// No stylesheet: the track and thumb are inline style objects, and the state is
// a class the click handler flips, the same move tooltip.js uses for "shown".
// Factored so toggle_demo and the labeled variant share one track builder.
const toggle_track = () => {
	let on = false, $thumb;

	const $track = span.c("flex", () => {
		$thumb = span().style({
			position: "absolute", top: "0.15em", left: "0.15em",
			width: "1.1em", height: "1.1em", borderRadius: "999px",
			background: "white", transition: "left 0.15s",
		});
	}).style({
		position: "relative", display: "inline-block",
		width: "2.5em", height: "1.4em", borderRadius: "999px",
		background: "var(--wash)", cursor: "pointer", transition: "background 0.15s",
	});

	$track.click(() => {
		on = !on;
		$track.style("background", on ? "var(--prim)" : "var(--wash)");
		$thumb.style("left", on ? "1.25em" : "0.15em");
	});

	return $track;
};

export const toggle_demo = () => toggle_track();

export const toggle_labeled_demo = () => label.c("flex gap v-center", () => {
	toggle_track();
	span("Enable notifications");
});

export const select_demo = () => select(() => { option("One"); option("Two"); option("Three"); });

export const select_grouped_demo = () => select(() => {
	el("optgroup", () => { option("Apple"); option("Banana"); }).attr("label", "Fruit");
	el("optgroup", () => { option("Carrot"); option("Potato"); }).attr("label", "Vegetable");
});

export const search_demo = () => div.c("flex v-center", () => {
	icon("search").style({ position: "absolute", left: "0.6em", color: "var(--subtle)", pointerEvents: "none" });
	input().attr("type", "search").attr("placeholder", "Search...").style("paddingLeft", "2em");
}).style({ position: "relative", maxWidth: "16em" });

export const search_clear_demo = () => div.c("flex v-center", () => {
	icon("search").style({ position: "absolute", left: "0.6em", color: "var(--subtle)", pointerEvents: "none" });

	const $input = input().attr("type", "search").attr("placeholder", "Search...")
		.style({ paddingLeft: "2em", paddingRight: "2em" });

	icon("close").style({ position: "absolute", right: "0.6em", color: "var(--subtle)", cursor: "pointer" })
		.click(() => { $input.el.value = ""; $input.el.focus(); });
}).style({ position: "relative", maxWidth: "16em" });

export const label_demo = () => label.c("flex v", () => {
	span.c("h4", "A label as a column");
	input().attr("placeholder", "field");
});

export const label_required_demo = () => label.c("flex v", () => {
	span.c("h4", () => { span("Email"); span(" *").style("color", "#c0392b"); });
	input().attr("placeholder", "required field");
});

export const icon_demo = () => div.c("flex gap wrap v-center", () => {
	["home", "search", "settings", "favorite", "check_circle"].forEach(name => icon(name));
});

export const icon_sizes_demo = () => div.c("flex gap wrap v-center", () => {
	icon("star").style({ fontSize: "1em" });
	icon("star").style({ fontSize: "1.5em", color: "var(--prim)" });
	icon("star").style({ fontSize: "2.5em", color: "var(--subtle)" });
});

export const multiselect_demo = () => select(() => { option("Red"); option("Green"); option("Blue"); }).attr("multiple", "").attr("size", "3");

export const multiselect_large_demo = () => select(() => {
	["Red", "Green", "Blue", "Yellow", "Purple"].forEach(c => option(c));
}).attr("multiple", "").attr("size", "5");

// A fresh id per call: this runs twice per page load (a gallery thumbnail, then
// the full demo), and `<option>`s inside two `<datalist>`s sharing an id would
// both answer to whichever came first.
let combobox_count = 0;
export const combobox_demo = () => {
	const id = "cc-combobox-" + combobox_count++;
	input().attr("list", id).attr("placeholder", "Type to search fruit...");
	el("datalist", () => { option("Apple"); option("Banana"); option("Cherry"); }).attr("id", id);
};

export const combobox_disabled_demo = () => input().attr("placeholder", "Disabled").attr("disabled", "");

// Themed by accent-color already, same as a checkbox or radio, see Style >
// Forms: no rule of framework.css's own left to add here.
export const slider_demo = () => input().attr("type", "range").attr("min", "0").attr("max", "100").attr("value", "40");

export const slider_stepped_demo = () => div.c("flex v gap", () => {
	input().attr("type", "range").attr("min", "0").attr("max", "10").attr("step", "1").attr("value", "5");

	div.c("flex gap", () => {
		input().attr("type", "range").attr("min", "0").attr("max", "100").attr("value", "20").ac("flex-1");
		input().attr("type", "range").attr("min", "0").attr("max", "100").attr("value", "70").ac("flex-1");
	});
});

// Five icons, one closure over which is "on": the same swap Sort controls
// makes on its direction arrow, just five of them instead of one.
export const rating_demo = () => {
	let value = 3;
	const stars = [];

	div.c("flex", () => {
		for (let i = 0; i < 5; i++)
			stars.push(icon(i < value ? "star" : "star_border").style({ cursor: "pointer", color: "var(--prim)" }));
	});

	stars.forEach(($star, i) => $star.click(() => {
		value = i + 1;
		stars.forEach(($s, j) => $s.text(j < value ? "star" : "star_border"));
	}));
};

export const rating_readonly_demo = () => div.c("flex", () => {
	for (let i = 0; i < 5; i++) icon(i < 4 ? "star" : "star_border").style({ color: "var(--prim)" });
});

export const language_demo = () => select(() => {
	["English", "Español", "Français", "日本語"].forEach(name => option(name));
});

export const language_menu_demo = () => details.c("menu", () => {
	summary.c("btn flex v-center", () => {
		icon("translate");
		span("English");
		icon("arrow_drop_down");
	}).style("gap", "0.3em");

	div.c("menu-list flex v", () => {
		["English", "Español", "Français", "日本語"].forEach(l => a.c("menu-item", l).href("#"));
	});
});

export const copy_demo = () => {
	const $btn = button.c("flex gap v-center", () => { icon("content_copy"); span("Copy"); });

	$btn.click(async () => {
		await navigator.clipboard?.writeText("https://lew42.dev");
		$btn.empty(() => { icon("check"); span("Copied!"); });
		setTimeout(() => $btn.empty(() => { icon("content_copy"); span("Copy"); }), 1500);
	});
};

export const copy_icon_demo = () => button(() => icon("content_copy")).attr("title", "Copy")
	.click(async function(){
		await navigator.clipboard?.writeText("https://lew42.dev");
		this.empty(() => icon("check"));
		setTimeout(() => this.empty(() => icon("content_copy")), 1500);
	});

export const download_demo = () => a.c("btn prim flex gap v-center", () => { icon("download"); span("Download"); })
	.attr("href", "data:text/plain,Hello from Custom Components.").attr("download", "hello.txt");

export const download_outline_demo = () => a.c("btn flex gap v-center", () => { icon("download"); span("Download"); })
	.style({ border: "1px solid var(--line)" })
	.attr("href", "data:text/plain,Hello from Custom Components.").attr("download", "hello.txt");

export const share_demo = () => button.c("flex gap v-center", () => { icon("share"); span("Share"); })
	.click(() => navigator.share ? navigator.share({ title: "Lew42", url: location.href }) : navigator.clipboard?.writeText(location.href));

export const share_icon_demo = () => button(() => icon("share")).attr("title", "Share")
	.click(() => navigator.share ? navigator.share({ title: "Lew42", url: location.href }) : navigator.clipboard?.writeText(location.href));

// Same wrapper Search bar uses: a relative box, an absolute icon. The icon
// itself is the toggle, `this` inside a `function(){}` click handler is the
// icon's own View (View.on() calls `cb.call(this, ...)`), so `.attr()`/`.text()`
// on `this` swap its own type/glyph, no separate variable needed for it.
export const password_demo = () => div.c("flex v-center", () => {
	let shown = false;

	const $input = input().attr("type", "password").attr("placeholder", "Password").style("paddingRight", "2.2em");

	icon("visibility").style({ position: "absolute", right: "0.6em", color: "var(--subtle)", cursor: "pointer" })
		.click(function(){
			shown = !shown;
			$input.attr("type", shown ? "text" : "password");
			this.text(shown ? "visibility_off" : "visibility");
		});
}).style({ position: "relative", maxWidth: "16em" });

export const password_strength_demo = () => div.c("flex v gap", () => {
	let $meter;

	input().attr("type", "password").attr("placeholder", "Password").on("input", function(){
		$meter.attr("value", Math.min(4, this.el.value.length));
	});

	$meter = meter().attr("min", "0").attr("max", "4").attr("value", "0");
}).style("maxWidth", "16em");

// Visually joined instead of Filter's separated pills, the same exclusive
// selection, a different look, which is the whole reason it earns its own
// entry instead of being "Filter, but rounder".
export const segmented_demo = () => {
	const buttons = [];

	div.c("flex", () => {
		["Day", "Week", "Month"].forEach((label, i) =>
			buttons.push(button(label).style(i === 0 ? { background: "var(--prim)", color: "white" } : {})));
	}).style({ display: "inline-flex", border: "1px solid var(--line)", borderRadius: "var(--radius)", overflow: "hidden" });

	buttons.forEach($btn => $btn.click(() => {
		buttons.forEach(b => b.style({ background: "", color: "" }));
		$btn.style({ background: "var(--prim)", color: "white" });
	}));
};

export const segmented_icons_demo = () => {
	const buttons = [];

	div.c("flex", () => {
		["view_list", "grid_view", "view_agenda"].forEach((name, i) =>
			buttons.push(button(() => icon(name)).style(i === 0 ? { background: "var(--prim)", color: "white" } : {})));
	}).style({ display: "inline-flex", border: "1px solid var(--line)", borderRadius: "var(--radius)", overflow: "hidden" });

	buttons.forEach($btn => $btn.click(() => {
		buttons.forEach(b => b.style({ background: "", color: "" }));
		$btn.style({ background: "var(--prim)", color: "white" });
	}));
};

// Same literal colour Error message uses, for the same reason: no error token
// in framework.css to reach for instead.
export const field_error_demo = () => label.c("flex v", () => {
	div.c("h4", "Email");
	input().attr("value", "not-an-email").style("borderColor", "#c0392b");
	p("Enter a valid email address.").style({ color: "#c0392b", fontSize: "0.85em" });
}).style("gap", "0.2em");

export const field_success_demo = () => label.c("flex v", () => {
	div.c("h4", "Email");
	input().attr("value", "me@example.com").style("borderColor", "var(--prim)");
	p("Looks good.").style({ color: "var(--prim)", fontSize: "0.85em" });
}).style("gap", "0.2em");