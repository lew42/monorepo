import { Page, md, h2, img, code, div, p } from "/app.js";

const shot = name => new URL("shots/" + name, import.meta.url).href;

/* THE MOBILE BOTTOM RAIL — real screenshots, not a live embed: `rail.css` is
 * gated by an actual VIEWPORT media query (`@media (max-width: 52em)`), which a
 * narrow box on a wide desktop screen never trips — a container query would,
 * but the rest of this component's chrome (`.sidebar`, the side drawer) is
 * built the same viewport-query way, so a container query here would be one
 * rule that behaves differently from everything around it for no real gain.
 * Shrink this browser window below 52em (about 832px) — or open it on a phone
 * — to see it for real. */
export default new Page({
	meta: import.meta,
	title: "Mobile bottom rail",
	description: "Below 52em: an ✦ AI button that opens a listening sheet — a real voice session on a plain page, the card's own thread on a card page — and an ⋯ More that reaches the drawer's tabs.",
	icon: "smartphone",

	content(){

		h2("What it is");

		md("Below 52em (about 832px), every page grows a small bar pinned to the bottom of the screen — two buttons: **✦** opens a listening sheet, **⋯ More** opens this same drawer on its tabs. Not a second ☰: the page's own ☰ already lives at the top of the screen there (deliverable 1's fix), so this button names what it actually is instead of repeating that glyph. Above 52em neither button exists; the side drawer's own ☰ (top right) is the whole story there.");

		img().attr("src", shot("rail-400.png")).attr("alt", "The bottom rail at 400px: ✦ AI and ⋯ More buttons, page content unobstructed above them")
			.style({ maxWidth: "24em", width: "100%", border: "1px solid var(--line)", borderRadius: "0.4em", display: "block" });

		md("**Tap ✦** and a small sheet slides up: the same bubbles-plus-composer-plus-mic widget the desktop drawer's AI tab builds ([`ux/Dictate`'s `Widget`](/framework/ux/Dictate/)), so a finished sentence shows as a real chat bubble, not a bespoke card. The header names the page the sheet is about, and stays current as you navigate. On a plain page, the sentence goes into a real [voice session](/framework/ext/Session/) — one per browser tab, answered by a fast reply first and a smart one under it; **New session**, beside the sheet's other links, drops it so the next thing said starts fresh.");

		img().attr("src", shot("sheet-cards-400.png")).attr("alt", "The sheet open on a plain page: the header names the path, the owner's sentence, a fast reply then a smart reply under it, and the New session button")
			.style({ maxWidth: "24em", width: "100%", border: "1px solid var(--line)", borderRadius: "0.4em", display: "block" });

		h2("Swipe it up and it becomes a page");

		p("Drag the sheet's top edge: it follows your finger. Let go near the top and the sheet becomes the whole screen, with its own url and a ‹ Back. The phone's own back button steps it down one state at a time — full, then open, then closed — and never leaves the site.");

		div.c("flex wrap", () => {
			for (const [file, label] of [
				["sheet-1-open.png", "1 · Tap ✦ — ?sheet=open"],
				["sheet-2-dragged.png", "2 · Dragged up — it follows the finger"],
				["sheet-3-full.png", "3 · Let go near the top — ?sheet=full, ‹ Back"],
				["sheet-4-after-back.png", "4 · Phone back — open again, same height"],
				["sheet-5-closed.png", "5 · Phone back again — closed, same page"],
			]) div.c("flex v", () => {
				img().attr("src", shot(file)).attr("alt", label)
					.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.4em", display: "block" });
				p(label).style({ fontSize: "0.85em" });
			}).style({ width: "11em" });
		}).style({ gap: "1em" });

		md("How the states map to history, and what happens after an in-app link: [doc/sheet.md](/framework/ext/drawer/doc/sheet.md).");

		md("Real mic access needs a real device and a real tap, so this page's own screenshots are from a headless run that **typed into the sheet's own composer** — the same `deliver()` seam a real dictation calls once a sentence finishes. `Widget` is used only through its own public API (`new Widget({...})`, `deliver`/`history`/`say`/`sync`) — the microphone, the engine choice and the error wording are `ux/Dictate`'s own job, not this rail's; see its [readme](/framework/ux/Dictate/) for what a real press looks like, including an honest error when nothing is reachable.");

		md("**Desktop is untouched.** At 1920 the rail simply does not exist — no reserved space, no hidden bar, nothing to undo:");

		img().attr("src", shot("desktop-1920-no-rail.png")).attr("alt", "The same page at 1920px: no rail, no reserved space, the side drawer's own ☰ top right")
			.style({ maxWidth: "100%", border: "1px solid var(--line)", borderRadius: "0.4em", display: "block" });

		h2("What a plain page's sentence goes through");

		md("The default sheet is a class chain, each link kept reachable rather than deleted when the next one landed: `DrawerRailSheetV1` (opening, closing, wiring the mic, and the one thing that never changed — a CARD page's sentence always goes straight into that card's own persisted thread) → `DrawerRailSheet` adds the links footer and **New session** → `DrawerRailSheetPanel`, today's default, swaps the hand-wired mic-only build for [`ux/Dictate`'s `Widget`](/framework/ux/Dictate/) and, on a PLAIN page only, sends the sentence into a real voice session instead of the old page-ai bridge:");

		code.js(`// ext/drawer/rail.js — DrawerRailSheetPanel, the plain-page path
async voice_deliver(entry){
    await this.ensure_session();               // start() on the FIRST sentence only
    const r = await say({ session: this.session, path: drawer.page(), text: entry.text, via });
    this.panel.retag(entry.at, r.at);   // the widget already drew the bubble locally; this rekeys it
    return true;
}`);

		md("`ext/Session/Session.js`'s own file already writes the universal chat line `ext/Chat`'s `Chat.js` knows how to draw, so a fast reply and a smart reply underneath it need no translation — `watch()` just hands each new line straight to the panel. A route change while a session is open reports `nav()` (`DrawerRail.navigated()`, wired from `app.js`'s own seam); **New session** drops the stored id without starting a new one — the next sentence said is what actually spawns a fresh session. Full picture: [ext/Session](/framework/ext/Session/).");

		md("The rail's own second button changed once already — it launched as a second ☰ \"Menu,\" and the task mastermind judged that a repeated glyph reads as \"do this again,\" not \"here's something else,\" now that the page's own ☰ lives at the top. Nothing was deleted: `menu_icon`/`menu_label`/`menu_title` are prototype fields, and `DrawerRail.V1` is the old look, kept as a subclass rather than a comment saying what used to be here:");

		code.js(`import { DrawerRail } from "/framework/ext/drawer/rail.js";

// menu.js calls \`rail(app)\`, which builds \`new DrawerRail({ app })\`.
// A caller that wants the old look builds the variant class instead:
new DrawerRail.V1({ app });   // ☰ "Menu", verbatim`);

		h2("Why a normal flex row, not position: fixed");

		md("The side drawer is `position: fixed` and has to restate its own width as a `padding-inline-end` reservation on `.app` (`--rail-push`) so the page never sits behind it — two numbers that have to be kept in sync by hand. This rail skips that entirely: it is a plain, non-fixed last child of `.app`'s own `height: 100%; flex-direction: column` box, so it just takes its own row and `.pages` shrinks to fit above it — one layout fact, nothing to keep in sync. The alternative this ruled out — full-height, independently-scrolling sections for the whole page — would have meant rebuilding how every page scrolls, for a bar that only needed its own height reserved. [doc/decisions.md](/framework/ext/drawer/doc/decisions/) has the fuller record.");
	},
});
