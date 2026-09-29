import drawer from "./drawer.js";
import tabs from "./tabs.js";

/* SELECT ANY ELEMENT ON THE PAGE — while the drawer is open (the owner, 2026-09-28: "for
   any content card whether it's a paragraph or a question or any list item… if you click
   on that thing it should be selectable… it just brightens the background color a little
   bit on hover. And then when you click it, it kind of stays selected… and it launches
   the properties in the sidebar").

   Hover brightens a content element (`[data-drawer-hover]`); a click keeps it selected
   (`[data-drawer-selected]`, one at a time) and opens the drawer's Element tab on it. Escape,
   or a click on empty page, clears it. With the drawer SHUT none of this runs, so plain
   reading, text selection and links are untouched. Links, buttons and inputs keep their
   own clicks, and nothing inside the drawer or the dev bar is ever selectable.

   ⚠ Data ATTRIBUTES, not classes: the element's own classes are what the Element tab
   reports and what ext/Ask maps to a module (css-scopes.txt), and a `drawer-` class
   would name ext/drawer as the owner of every element you select.

   The chip that carries a selection into the chat lives on `tabs` (`tabs.chips`), so the
   Element tab adds it and the AI tab shows it. doc/select.md. */
export class DrawerSelect {
	// What counts as a content element: the innermost of these under the pointer wins.
	static CONTENT = "p, h1, h2, h3, h4, h5, h6, li, dt, dd, blockquote, pre, figure, table, summary, details, "
		+ ".card, .preview-card, .ai2-full-card, [data-selectable]";

	// Controls keep their own clicks.
	static OWN_CLICK = "a[href], button, input, select, textarea, label, [contenteditable], [role=button]";

	// Never selectable: the drawer itself, the dev bar, the ☰, the picker's chrome, and a
	// page's own navigation (the sidebar and the tab bar are chrome, not content).
	static NEVER = ".drawer, .dev-bar, .drawer-menu, .ask-pick-ui, .sidebar, .tab-bar, nav";

	hovered = null;
	selected = null;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/** Listen, once. Every handler asks `active()` first, so nothing happens while the drawer is shut. */
	start(){
		if (this.started) return this;
		this.started = true;
		document.addEventListener("pointerover", e => this.hover(e.target));
		// ⚠ `pointerleave` never fires on document; `pointerout` with no relatedTarget is
		// the pointer leaving the window.
		document.addEventListener("pointerout", e => { if (!e.relatedTarget) this.hover(null); });
		document.addEventListener("click", e => this.click(e));
		document.addEventListener("keydown", e => { if (e.key === "Escape" && this.selected) this.clear(); });
		// The drawer shut: forget the hover and the selection, so nothing stays lit.
		window.addEventListener("drawer-close", () => { this.hover(null); this.clear(); });
		return this;
	}

	// Open on ITS tabs — not while another caller (ext/layout's panel) owns the drawer,
	// whose own clicks select its own things.
	active(){ return tabs.mine(); }

	/** The content element a target belongs to, or null: inside the page, never the chrome. */
	find(target){
		if (!target?.closest || target.closest(this.constructor.NEVER)) return null;
		const el = target.closest(this.constructor.CONTENT);
		return el && el.closest(".pages") ? el : null;
	}

	hover(target){
		const el = this.active() ? this.find(target) : null;
		if (el === this.hovered) return;
		this.hovered?.removeAttribute("data-drawer-hover");
		this.hovered = el;
		el?.setAttribute("data-drawer-hover", "");
	}

	click(e){
		if (!this.active() || e.defaultPrevented || e.button) return;
		if (e.target.closest?.(this.constructor.NEVER)) return;
		if (e.target.closest?.(this.constructor.OWN_CLICK)) return;
		// A drag that selected text is reading, not choosing.
		if (String(getSelection() ?? "").trim()) return;

		const el = this.find(e.target);
		if (el) this.select(el);
		else if (e.target.closest?.(".pages")) this.clear();
	}

	/** Select one element and show its properties on the drawer's Element tab. */
	select(el){
		if (this.selected !== el) this.selected?.removeAttribute("data-drawer-selected");
		this.selected = tabs.selected = el;
		el.setAttribute("data-drawer-selected", "");
		tabs.open("element");
		return el;
	}

	clear(){
		this.selected?.removeAttribute("data-drawer-selected");
		this.selected = tabs.selected = null;
		// The Element tab goes away with the selection: back to the tab before it.
		if (!tabs.mine()) return;
		if (tabs.current?.name === "element") tabs.open(tabs.before?.name);
		else drawer.refresh();
	}
}

/** What the chat is told about one element — the interface's shape,
 *  `{kind, label, text, selector}` (ai/2026-09-25/recursive-pairs/interface.md). */
export function item(el){
	const kind = el.tagName.toLowerCase();
	return { kind, label: "this " + word(el), text: text_of(el).slice(0, 300), selector: path(el) };
}

/* The words a reader sees, one space between blocks. `textContent` runs a card's blocks
   together ("restart.cardquestion") and reads an icon ligature out as a word ("forum"), so
   this walks the text nodes and skips any inside an icon or a control. */
const SKIP = "i, .icon, .material-icons, .material-symbols-outlined, [aria-hidden=true], select, button, script, style";
export function text_of(el){
	const words = [];
	const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	for (let node = walk.nextNode(); node; node = walk.nextNode()){
		const skip = node.parentElement?.closest(SKIP);
		if (!skip || !el.contains(skip)) words.push(node.nodeValue);
	}
	return words.join(" ").replace(/\s+/g, " ").replace(/\s+([.,;:!?])(?=\s|$)/g, "$1").trim();
}

// "this paragraph", "this heading" — how a reader would say it.
export function word(el){
	const tag = el.tagName.toLowerCase();
	if (el.matches(".card, .preview-card, .ai2-full-card")) return "card";
	return { p: "paragraph", li: "list item", dt: "term", dd: "definition", blockquote: "quote", pre: "code block",
		figure: "figure", table: "table", summary: "question", details: "question" }[tag]
		?? (/^h[1-6]$/.test(tag) ? "heading" : tag);
}

/** A selector that finds this element again: `tag:nth-of-type(n)` steps up to the page. */
export function path(el){
	const steps = [];
	for (let at = el; at && at.nodeType === 1 && !at.matches(".pages"); at = at.parentElement){
		if (at.id){ steps.unshift("#" + CSS.escape(at.id)); break; }
		// The page itself is named by core's own stamp, `.page--<name>`, not by position.
		if (at.matches(".page")){ steps.unshift("." + ([...at.classList].find(c => c.startsWith("page--")) ?? "page")); break; }
		const tag = at.tagName.toLowerCase();
		const same = [...(at.parentElement?.children ?? [])].filter(k => k.tagName === at.tagName);
		steps.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(at) + 1})` : tag);
	}
	return steps.join(" > ");
}

export const select = new DrawerSelect();
export default select;
