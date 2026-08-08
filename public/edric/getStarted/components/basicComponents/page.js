import { Page, md, div } from "/app.js";
import { card as cell } from "/framework/styles/gallery/gallery.js";   // `card` is taken, by the component

import avatar from "/framework/styles/components/avatar/component.js";
import badge from "/framework/styles/components/badge/component.js";
import field from "/framework/styles/components/field/component.js";
import tags from "/framework/styles/components/tags/component.js";

import {
	button_demo, input_demo, textarea_demo, checkbox_demo, radio_demo, toggle_demo,
	select_demo, search_demo, label_demo, icon_demo, multiselect_demo, combobox_demo,
	slider_demo, rating_demo, language_demo, copy_demo, download_demo, share_demo,
	password_demo, segmented_demo, field_error_demo,
} from "../parts.js";

// Real components first (Avatar, Badges, Form field, Tag input), then the
// hand-built controls in the shape a form actually reads in, top to bottom,
// same order Custom Components used before this category got its own url.
const items = [
	{ title: "Avatar", icon: "account_circle", fn: avatar, url: "/edric/getStarted/components/basicComponents/avatar/", desc: "Initials in a circle, one function, sized by a token." },
	{ title: "Badges", icon: "label", fn: badge, url: "/edric/getStarted/components/basicComponents/badges/", desc: "Six pills from one style object, and the tones the token set can't give you." },
	{ title: "Form field", icon: "input", fn: field, url: "/edric/getStarted/components/basicComponents/form-field/", desc: "Label, control, error: one flex column and two token colours." },
	{ title: "Tag input", icon: "local_offer", fn: tags, url: "/edric/getStarted/components/basicComponents/tag-input/", desc: "Chips in a field, and the section's one override of framework.css." },
	{ title: "Button", icon: "smart_button", fn: button_demo, url: "/edric/getStarted/components/basicComponents/button/", desc: "`.btn, button` share padding and cursor, so a link can look like one without being one." },
	{ title: "Input / Text field", icon: "text_fields", fn: input_demo, url: "/edric/getStarted/components/basicComponents/text-field/", desc: "Text-ish controls fill their container by default, no width rule to write." },
	{ title: "Textarea", icon: "notes", fn: textarea_demo, url: "/edric/getStarted/components/basicComponents/textarea/", desc: "Resizes vertically only; `.auto` follows the text instead." },
	{ title: "Checkbox", icon: "check_box", fn: checkbox_demo, url: "/edric/getStarted/components/basicComponents/checkbox/", desc: "`accent-color` on `body` colours the tick, one declaration, every checkbox." },
	{ title: "Radio button", icon: "radio_button_checked", fn: radio_demo, url: "/edric/getStarted/components/basicComponents/radio/", desc: "Same reset as a checkbox, grouped by a shared `name`." },
	{ title: "Toggle / Switch", icon: "toggle_on", fn: toggle_demo, url: "/edric/getStarted/components/basicComponents/toggle/", desc: "No framework equivalent yet, a track and a thumb, both inline styles, state flipped by a click handler." },
	{ title: "Select / Dropdown", icon: "unfold_more", fn: select_demo, url: "/edric/getStarted/components/basicComponents/select/", desc: "The one native control still worth a rule: `appearance: none` plus a hand-drawn arrow." },
	{ title: "Search bar", icon: "search", fn: search_demo, url: "/edric/getStarted/components/basicComponents/search/", desc: "`type=\"search\"` plus an icon, no dedicated component, four classes and an attribute." },
	{ title: "Label", icon: "short_text", fn: label_demo, url: "/edric/getStarted/components/basicComponents/label/", desc: "No rule of its own, an inline box; `flex v` is what stacks it over its control." },
	{ title: "Icon", icon: "emoji_symbols", fn: icon_demo, url: "/edric/getStarted/components/basicComponents/icon/", desc: "A ligature font: the name is the icon, and a typo renders as the typo." },
	{ title: "Multi-select", icon: "checklist", fn: multiselect_demo, url: "/edric/getStarted/components/basicComponents/multi-select/", desc: "Native `<select multiple>`, the `size` attribute is what turns it into a list instead of a closed dropdown." },
	{ title: "Combobox / Autocomplete", icon: "manage_search", fn: combobox_demo, url: "/edric/getStarted/components/basicComponents/combobox/", desc: "A plain text input plus a `<datalist>`, the browser supplies the filtering." },
	{ title: "Slider", icon: "tune", fn: slider_demo, url: "/edric/getStarted/components/basicComponents/slider/", desc: "Native `<input type=\"range\">`, themed by `accent-color` for free, same as a checkbox." },
	{ title: "Rating", icon: "star", fn: rating_demo, url: "/edric/getStarted/components/basicComponents/rating/", desc: "Five icons and one closure over which is \"on\", the same swap Sort controls makes on its arrow." },
	{ title: "Language Selector", icon: "translate", fn: language_demo, url: "/edric/getStarted/components/basicComponents/language/", desc: "A `<select>` of names, nothing framework-specific about it." },
	{ title: "Copy Button", icon: "content_copy", fn: copy_demo, url: "/edric/getStarted/components/basicComponents/copy/", desc: "`navigator.clipboard`, and the label swaps to confirm it worked." },
	{ title: "Download Button", icon: "download", fn: download_demo, url: "/edric/getStarted/components/basicComponents/download/", desc: "A real `<a download>`, a data: url standing in for a file." },
	{ title: "Share Button", icon: "share", fn: share_demo, url: "/edric/getStarted/components/basicComponents/share/", desc: "`navigator.share` where it exists, the clipboard where it doesn't." },
	{ title: "Password Input", icon: "password", fn: password_demo, url: "/edric/getStarted/components/basicComponents/password/", desc: "Same wrapper as Search bar, an icon that swaps its own type and glyph on click." },
	{ title: "Segmented Control", icon: "view_column", fn: segmented_demo, url: "/edric/getStarted/components/basicComponents/segmented/", desc: "Filter's exclusive selection, visually joined instead of separated pills." },
	{ title: "Field with Error", icon: "error_outline", fn: field_error_demo, url: "/edric/getStarted/components/basicComponents/field-error/", desc: "Form field's shape, Error message's literal colour: no error token to reach for instead." },
];

export default new Page({
	meta: import.meta,
	title: "Basic components",
	description: "Every basic control, each with its own page and a style variant or two.",

	// A gallery is not prose: no measure, so the wall gets the room it has.
	classes: "pad",

	children: "avatar badges form-field tag-input button text-field textarea checkbox radio toggle select search label icon multi-select combobox slider rating language copy download share password segmented field-error",

	// Same reasoning as Custom Components: I'm nested two deep under the
	// sidebar's "Get Started" dropdown, so landing here directly should still
	// force it open. Then clear any stale `.current` its scroll-spy left
	// behind: I'm a CHILD of Custom Components, not a sibling, so its
	// deactivated() never fires for me (Router's chain diff never touches a
	// shared ancestor), its scroll listener keeps running against now-hidden
	// headings, and "last heading whose top passed the line" degenerates to
	// "the last category in the list" once every rect reads 0, which is why
	// it was always Sections stuck lit, not a random one.
	activated(){
		this.app.$app.el.querySelector(".sidebar-group")?.setAttribute("open", "");
		this.app.$app.el.querySelectorAll(".sidebar-link.current").forEach(l => l.classList.remove("current"));
	},

	content(){
		md("Every cell below is a **live render**, the same move Custom Components' own index makes with `gallery.js`, shrunk with `zoom`, click-inert so the render's own buttons and inputs can't fight the card's one real link. Click through for a second style variant of each.").ac("mb");

		div.c("grid gap auto", () => {
			items.forEach(c => cell({ url: c.url, label: c.title, icon: c.icon }, c.fn, "zoom-50 pad"));
		}).style({ "--column": "13em", "--gap": "1.5em" });
	}
});