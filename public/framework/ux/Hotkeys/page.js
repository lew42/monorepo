import { Doc, md, demo, div } from "/app.js";
import Hotkeys from "./Hotkeys.js";
import { hotkeys_section } from "./row.js";

// A demo action so the page has something real to show and rebind, without
// reaching into any other module — this page owns no upward import (CLAUDE.md
// law 6; the brief's own words: "this module doesn't know about Dictate at all").
Hotkeys.register("demo.example", { label: "Demo action (try me)", default: { type: "key", code: "KeyH" } });

// A second demo action with MODIFIERS held, so the "Ctrl+Shift+M"-style binding
// (ux/Dictate's open-mic toggle uses this shape) has something real to show too.
Hotkeys.register("demo.toggle", { label: "Demo toggle (modifiers)", default: { type: "key", code: "KeyM", ctrlKey: true, shiftKey: true } });

export default new Doc({
	meta: import.meta,
	title: "Hotkeys",
	description: "One flat list of named hotkeys, filterable and rebindable — a key or a mouse button, remembered per browser.",
	icon: "keyboard",

	files: "Hotkeys.js row.js page.js readme.md",
	notes: "decisions",

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(hotkeys_section, steer).ac("bleed"),
			def: hotkeys_section,
			file: new URL("row.js", import.meta.url).pathname,
			note: "**Type in the filter to narrow the rows. Click \"press a key or button…\", then press anything** — a key, or your mouse's own back/forward thumb button. It's saved immediately, remembered the next time you load this page. The one row above, `demo.example`, is registered right in this page's own `page.js` so there's something real to rebind without reaching into another module.",
		});

		md("## How a module registers its own action");

		md("`ux/Hotkeys` never imports the module that owns an action — each one registers itself, once, at import time:");

		md("```js\nimport Hotkeys from \"/framework/ux/Hotkeys/Hotkeys.js\";\n\nHotkeys.register(\"dictate.push\", { label: \"Push to talk\", default: { type: \"button\", button: 4 } });\n\nHotkeys.on(\"dictate.push\", \"down\", () => start());\nHotkeys.on(\"dictate.push\", \"up\",   () => stop());\n```");

        md("`default` is a `{ type: \"key\", code }` (a `KeyboardEvent.code`, e.g. `\"AltRight\"`) or a `{ type: \"button\", button }` (a `MouseEvent.button`, e.g. `4` for the mouse's forward button). A key binding can also hold down `ctrlKey`/`shiftKey`/`altKey`/`metaKey` — `{ type: \"key\", code: \"KeyM\", ctrlKey: true, shiftKey: true }` is Ctrl+Shift+M, the second demo row above. Omitted means that modifier must be UP, not \"don't care\" — a bare `M` and `Ctrl+Shift+M` are two separate bindings, never one firing for the other. `Hotkeys.bind()` is what the settings UI above calls once the owner picks something else; it is saved per browser and wins over the default from then on.");

		md("## One flat list, no nested scopes");

		md("Every hotkey lives in ONE list, site-wide — there is no per-panel scope to open first, on purpose: [`doc/decisions.md`](./doc/decisions/) has the owner's own words for why.");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => hotkeys_section())); },
});
