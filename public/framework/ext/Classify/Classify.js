/**
 * Classify — a light overlay that shows the layout each container uses.
 *
 * `classify(el)` outlines `el` and each of its direct children (the columns), and prints a
 * small label above it: the layout algorithm (flex, grid or columns — read from computed
 * style) and the element's CSS classes. Everything lives in one absolutely-positioned layer,
 * so it never changes the layout it shows.
 *
 *   classify(el)          outline one element
 *   classify.all()        every flex / grid / multi-column container on the page
 *   classify.toggle()     all() on and off — bound to Alt+L, remembered in localStorage
 *   any element with class="classify" is outlined on load
 *
 * Reuse: the CSS classes come from `el.classList`; `ext/CSSDoc` is the tool for the rules behind them.
 */
import { App } from "/framework/core/App/App.js";

const KEY = "classify", STYLE_KEY = "classify-style";
export const STYLES = {
	"items-dashed":   "Dashed around each item; the container has a faint solid line.",
	"container-solid": "Solid around the container only.",
	"tint":           "No lines: the container and its items get a light tint.",
	"items-dotted":   "Dotted around each item, nothing on the container.",
};
const store = {
	get(k){ try { return localStorage.getItem(k); } catch { return null; } },
	set(k, v){ try { localStorage.setItem(k, v); } catch {} },
};

let layer, marked = new Set(), every = false, timer, ro;

/** The layout algorithm computed style reports for `el`, or "" when it is none of the three. */
export function algorithm(el){
	const s = getComputedStyle(el);
	if (/flex/.test(s.display)) return "flex";
	if (/grid/.test(s.display)) return "grid";
	if (s.columnCount !== "auto" || s.columnWidth !== "auto") return "columns";
	return "";
}

function ensure(){
	if (layer && layer.isConnected) return layer;
	layer = document.createElement("div");
	layer.className = "classify-layer";
	layer.dataset.style = store.get(STYLE_KEY) || "items-dashed";
	document.body.append(layer);
	return layer;
}

function box(cls, r, text, style){
	const b = document.createElement("div");
	b.dataset.style = style || layer.dataset.style;
	b.className = "classify-box " + cls;
	b.style.cssText = `left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;height:${r.height}px`;
	if (text) b.textContent = text;
	layer.append(b);
	return b;
}

function draw(el){
	const r = el.getBoundingClientRect();
	if (r.width < 8 || r.height < 8 || !el.isConnected) return;
	const algo = algorithm(el);
	const names = [...el.classList].filter(c => c !== "classify" && !c.startsWith("classify-") && !/^active|^default$/.test(c)).slice(0, 4);
	const words = names.includes(algo) ? names : [algo, ...names].filter(Boolean);
	const st = el.dataset.sample;
	box("classify-container", r, "", st);
	if (words.length && r.height >= 40){
		const l = box("classify-label", { left: r.left, top: r.top < 14 ? r.top : r.top - 13, width: 0, height: 0 }, words.join(" "), st);
		l.style.width = l.style.height = "";
	}
	for (const c of el.children){
		if (c.closest(".classify-layer")) continue;
		const cr = c.getBoundingClientRect();
		if (cr.width >= 4 && cr.height >= 4) box("classify-item", cr, "", st);
	}
}

function containers(){
	const out = [];
	for (const el of document.body.querySelectorAll("*")){
		if (el.closest(".classify-layer") || el.children.length < 2 || out.length > 1500) continue;
		if (algorithm(el)) out.push(el);
	}
	return out;
}

/** Redraw everything that is on. Cheap enough to run on any resize or DOM change. */
export function redraw(){
	if (!marked.size && !every){ layer?.remove(); layer = null; return; }
	ensure().replaceChildren();
	const set = new Set(marked);
	if (every) containers().forEach(c => set.add(c));
	for (const el of set) draw(el);
}
function later(){ clearTimeout(timer); timer = setTimeout(redraw, 60); }   // not rAF: a hidden tab never runs it

function watch(){
	if (ro) return;
	ro = new ResizeObserver(later);
	ro.observe(document.body);
	new MutationObserver(m => { if (m.some(x => !x.target.closest?.(".classify-layer"))) later(); })
		.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
	addEventListener("resize", later);
	addEventListener("scroll", later, true);
}

/** Outline one element (and its direct children). Returns an `off()` function. */
export function classify(el){
	marked.add(el); watch(); redraw();
	return () => { marked.delete(el); redraw(); };
}
classify.all = (on = true) => { every = on; store.set(KEY, on ? "1" : ""); watch(); redraw(); };
classify.toggle = () => classify.all(!every);
classify.style = name => { store.set(STYLE_KEY, name); if (layer){ layer.dataset.style = name; redraw(); } };
classify.on = () => every;

// A stylesheet of its own: the overlay is not part of any page.
App.stylesheet(import.meta, "./Classify.css");

addEventListener("keydown", e => {
	if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyL"){ e.preventDefault(); classify.toggle(); }
});
const boot = () => {
	document.querySelectorAll(".classify").forEach(el => marked.add(el));
	if (store.get(KEY) || new URLSearchParams(location.search).has("classify")) every = true;
	if (marked.size || every){ watch(); setTimeout(redraw, 300); }
};
document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();

export default classify;
