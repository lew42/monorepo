import { Page, md, h2, img, code } from "/app.js";

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
	description: "Below 52em: an ✦ AI button that opens a listening sheet, and a ☰ that reaches the drawer's tabs — the two ways into ext/drawer on a phone.",
	icon: "smartphone",

	content(){

		h2("What it is");

		md("Below 52em (about 832px), every page grows a small bar pinned to the bottom of the screen — two buttons: **✦** opens a listening sheet, **☰** opens this same drawer on its tabs. Above 52em neither one exists; the side drawer's own ☰ (top right) is the whole story there.");

		img().attr("src", shot("rail-400.png")).attr("alt", "The bottom rail at 400px: ✦ AI and ☰ Menu buttons, page content unobstructed above them")
			.style({ maxWidth: "24em", width: "100%", border: "1px solid var(--line)", borderRadius: "0.4em", display: "block" });

		md("**Tap ✦** and a small sheet slides up: it starts listening right away ([`ux/Dictate`](/framework/ux/Dictate/), its own `mode: \"open\"`), and every finished sentence becomes its own card — the list grows as you keep talking.");

		img().attr("src", shot("sheet-cards-400.png")).attr("alt", "The sheet open, showing ux/Dictate's own mic status and two prompt-item cards")
			.style({ maxWidth: "24em", width: "100%", border: "1px solid var(--line)", borderRadius: "0.4em", display: "block" });

		md("Real mic access needs a real device and a real tap, so this page's own screenshots are from a headless run that **injected two finished utterances** straight through the sheet's public `card()` method — the same one a real dictation calls. `ux/Dictate` is used only through its own public API (`new Dictate({ mode: \"open\", on_text })`) — its microphone, its engine choice and its error wording are that module's job, not this rail's; see its own [readme](/framework/ux/Dictate/) for what a real press looks like, including an honest error when nothing is reachable.");

		md("**Desktop is untouched.** At 1920 the rail simply does not exist — no reserved space, no hidden bar, nothing to undo:");

		img().attr("src", shot("desktop-1920-no-rail.png")).attr("alt", "The same page at 1920px: no rail, no reserved space, the side drawer's own ☰ top right")
			.style({ maxWidth: "100%", border: "1px solid var(--line)", borderRadius: "0.4em", display: "block" });

		h2("The one seam");

		md("Built as a class (`DrawerRail`, `DrawerRail.Sheet`) so a later variant only has to override **one** method — `Sheet.card(text)`, what a finished utterance becomes. Everything else (opening, closing, wiring the microphone) stays exactly the same:");

		code.js(`import { DrawerRailSheet } from "/framework/ext/drawer/rail.js";

class MyChecklistSheet extends DrawerRailSheet {
    card(text){
        // a checkbox row instead of a plain card — nothing else in the
        // rail or the sheet needs to know this happened
    }
}`);

		h2("Why a normal flex row, not position: fixed");

		md("The side drawer is `position: fixed` and has to restate its own width as a `padding-inline-end` reservation on `.app` (`--rail-push`) so the page never sits behind it — two numbers that have to be kept in sync by hand. This rail skips that entirely: it is a plain, non-fixed last child of `.app`'s own `height: 100%; flex-direction: column` box, so it just takes its own row and `.pages` shrinks to fit above it — one layout fact, nothing to keep in sync. The alternative this ruled out — full-height, independently-scrolling sections for the whole page — would have meant rebuilding how every page scrolls, for a bar that only needed its own height reserved. [doc/decisions.md](/framework/ext/drawer/doc/decisions/) has the fuller record.");
	},
});
