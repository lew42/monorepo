import { div, p, span, a, code, icon } from "../../core/View/View.js";
import { pick, chips, btn } from "./controls.js";
import { draw, MODES, PAGE } from "./words.js";
import { cssdoc } from "../CSSDoc/CSSDoc.js";

/* What a selection reads as: its name, the line that would build it, and the groups
   of controls that apply to it. `panel.js` owns the drawer and hands this the
   selection, whatever `layout.context()` registered above it, and a redraw. */

const CHIPS = {
	flex: "v wrap auto three all-1 reverse h-center v-center split",
	grid: "auto three",
};
const ITEM = "flex-1 basis measure";

// ⚠ No ✕ here — the rail draws its own and never hands it over, so nothing this file
// does can leave the reader with no way to shut it (ext/drawer, 2026-08-16).
export function head($el){
	span.c("layout-name", $el ? name_of($el) : "nothing selected");
	$el && row(() => btn("copy", function(){ copy(this, $el); }));
}

export function body($el, extras, redraw){
	if (!$el) { nothing(); return; }

	code.c("layout-code", source($el));

	/* A `.page.standard` IS a grid, so the container section would offer to flip it to
	   flex and take the breakout template with it. A page gets page words. */
	if ($el.hc("page")) group("page", () => draw($el, PAGE));
	else container($el, redraw);

	if (laid_out($el.el.parentElement))
		group("item", () => { row(() => chips($el, ITEM)); draw($el, "basis"); });

	extras.forEach(fn => group("", () => fn($el)));

	defined($el);
}

/* WHERE it is defined — every rule the browser is actually applying, read live out of the
   CSSOM (`ext/CSSDoc`). `part` is the FILE that owns the rule, which is the one thing that
   says whether you are about to edit the framework, the theme, the site skin or one
   component. Read-only for now; the lock and the core-component page are the design at
   `ai/2026-08-18/element-provenance/proposal.md`.
   ⚠ The selection's own chrome is dropped: `.layout-selected` is this widget, not the page. */
const CHROME_RULE = /layout-(selected|hot|region)/;

// The lock is a LABEL ("this is shared"), not a permission — nothing here edits CSS yet.
const LOCKED = new Set(["framework", "lew42"]);

// The link a part's label opens: framework and lew42 to the styles pages, any other
// part to its own module dir, derived from the sheet's own href (never hard-coded to
// `ext/`, so a `dev/` or `core/` sheet still resolves) — the Router 404s honestly if
// that dir has no page.
const PART_LINK = { framework: "/framework/styles/", lew42: "/framework/styles/layers/" };
const part_href = rule => PART_LINK[rule.part]
	?? (rule.path && rule.part !== "site" ? rule.path.slice(0, rule.path.lastIndexOf("/") + 1) : null);

function defined($el){
	const rules = cssdoc.rules($el).filter(rule => !CHROME_RULE.test(rule.selector));

	// The CSSOM walk cannot see `el.style` — an element's own inline declarations, set
	// by the layout bar's knobs, are invisible to `cssdoc.rules()` and stronger than
	// every rule it finds. One row, only when there is anything to show.
	const inline = [...$el.el.style].map(prop => `${prop}: ${$el.el.style.getPropertyValue(prop)};`);

	group(rules.length + " css rules", () => {
		if (inline.length) div.c("flex v", () => {
			row(() => { span.c("layout-tag", "inline"); span.c("muted", "— written by JS"); });
			code.c("muted", inline.join(" "));
		});

		rules.forEach(rule => div.c("flex v", () => {
			const href = part_href(rule);
			const locked = LOCKED.has(rule.part);

			row(() => {
				(href ? a.c("layout-tag").href(href) : span.c("layout-tag"))
					.append(() => { locked && icon("lock"); return rule.part; });
				span.c("muted", rule.layer);
			});
			code(rule.selector);
			code.c("muted", rule.decls);
		}));
	});
}

/* Two groups, because the chip list DEPENDS on the mode — `.flex.split` and
   `.grid.three` are not the same vocabulary — so changing it redraws the panel. */
function container($el, redraw){
	const mode = MODES.find(word => $el.hc(word));

	group("container", () => {
		row(() => pick(MODES, word => { $el.rc(MODES.join(" ")).ac(word); redraw(); }, mode));
		row(() => chips($el, (CHIPS[mode] || "") + " gap pad"));
	});

	group("tokens", () => draw($el, "gap column pad"));
}

/* The selection as the code that would build it. This widget's own `layout-*`
   classes are chrome and the Router writes its marks on every navigation — neither
   is vocabulary, and neither is anything you would type. */
const CHROME = /^(layout-|active-|in-path$)/;

export function source($el){
	const words = [...$el.el.classList].filter(word => !CHROME.test(word)).join(" ");
	return `${$el.el.tagName.toLowerCase()}${words ? `.c("${words}")` : "()"}`;
}

function copy($btn, $el){
	navigator.clipboard?.writeText(source($el));
	$btn.text("copied");
	setTimeout(() => $btn.text("copy"), 1200);
}

const nothing = () => div.c("layout-empty flex v", () => {
	p("Click a box inside any region — or the sliders chip on any toolbar — and its words, its tokens and the line that builds it land here.");
});

const group = (tag, fn) => div.c("layout-sect flex v", () => { tag && span.c("layout-tag h4", tag); fn(); });
const row = fn => div.c("layout-chips flex wrap", () => { fn(); });
const laid_out = el => !!el && (el.classList.contains("flex") || el.classList.contains("grid"));
const name_of = $el => $el.hc("page") ? "the page" : $el.el.tagName.toLowerCase();
