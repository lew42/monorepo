import View from "/framework/core/View/View.js";

/* `panel.data.text`, the overlay a text edit is written to so it survives the `paint()`
   that throws the drawing itself away on every tone, template or mirror change — keyed by
   which drawing a run belongs to (`scope`) and its child-index path inside it (`path_of`),
   so an edit finds its way home even though nothing here keeps a DOM reference.
   `text.js` is the editing surface built on top of this; the import runs ONE way — nothing
   here reads `text.js`. css: .panel-text-box, .panel-text-new — drawn here, styled by
   text.js's `text.css`. */

const LEVELS = ["h1", "h2", "h3", "h4", "body"];

/* Weight and tracking write DIRECT inline styles, not custom properties: nothing else
   on the page would ever read a `--text-weight` token, so one would be plumbing with
   no second end — the same call `tools.js`'s `zoom_scrub` already made for `zoom`.
   Each "normal" is the empty string on purpose: picking it clears the override
   instead of fighting whatever the level's own weight already is. */
const WEIGHT = { normal: "", medium: "600", bold: "800" };
const TRACK  = { tight: "-0.02em", normal: "", wide: "0.08em" };
const ALIGN  = { left: "", center: "center", right: "right", justify: "justify" };
const ALIGN_ICON = {
	left: "format_align_left", center: "format_align_center",
	right: "format_align_right", justify: "format_align_justify",
};

const viewed = el => el && new View({ el, capture: false });

export const level_of = $el => LEVELS.find(l => l !== "body" && $el.hc(l)) ?? "body";
const set_level = ($el, name) => LEVELS.forEach(l => l !== "body" && $el[l === name ? "ac" : "rc"](l));

// Which name this value is — or the one that CLEARS, since every table spells "leave it
// alone" as the empty string and that is what an unrecognised value should read back as.
const named = (table, value) => Object.keys(table).find(k => table[k] === value) ?? Object.keys(table).find(k => !table[k]);

/* One table, two readers, now in two files: text.js's rail draws a row per entry, and
   `dress()` below replays one straight off the same table. Adding a typographic control
   anywhere else would give the tool a knob that does not survive a redraw. */
export const FIELDS = {
	level:  { names: LEVELS,               of: level_of,                                          set: set_level },
	weight: { names: Object.keys(WEIGHT),  of: $el => named(WEIGHT, $el.style("fontWeight")),      set: ($el, n) => $el.style("fontWeight", WEIGHT[n]) },
	track:  { names: Object.keys(TRACK),   of: $el => named(TRACK, $el.style("letterSpacing")),    set: ($el, n) => $el.style("letterSpacing", TRACK[n]) },
	align:  { names: Object.keys(ALIGN),   of: $el => named(ALIGN, $el.style("textAlign")),        set: ($el, n) => $el.style("textAlign", ALIGN[n]), icons: ALIGN_ICON },
};

/* Which panel a body belongs to, and the observer watching it — keyed by the body element,
   because an edit starts at a DOM node and has to find its way home to the data. */
const owners = new WeakMap();

// Whether `text_observe()` ever bound this body — false for a workspace running with
// `tools.text` off, which is exactly what should be invisible to a caller like `T`.
export const tracked = root => owners.has(root);

/* What a key is keyed AGAINST: the drawing the run belongs to. The template's name, plus its
   SEED where it has one — a re-rolled `space` is a different page, and a key that survived
   the roll would land on whatever now sits at that path. Losing copy beats moving it.
   ⚠ `get`, not `data`: a mirror carries neither of its own, it reads its master's. */
export const scope = item => !item.data.template && item.draw ? "draw"
	: item.get("template") + (item.get("seed") ? "~" + item.get("seed") : "");

// The one key under a scope that this file writes NOTHING to — repeat.js's own
// appended-item overlay, on the same `text` map so a mirror shares it too.
export const REPEAT_KEY = "repeat";

/* A run's address in the drawing: its child index at every level, from the body down.
   ⚠ A `.panel-text-box` is the OVERLAY's own doing and stands in the slot its run used to
   hold, so the walk steps through it — without that, boxing a run would re-key it and
   strand everything already saved under the old address. */
function path_of(root, el){
	const steps = [];

	for (let node = el; node !== root; ){
		const up = node.parentElement;
		if (!up) return null;
		if (up.classList.contains("panel-text-box")){ node = up; continue; }
		steps.unshift([...up.children].indexOf(node));
		node = up;
	}

	return steps.length ? steps.join(".") : null;
}

const find_at = (root, path) => path.split(".").reduce((node, i) => {
	const kid = node?.children[+i];
	return kid?.classList.contains("panel-text-box") ? kid.firstElementChild : kid;
}, root);

/* One edit written down. ⚠ The map is REPLACED, never mutated: `Item.set` skips an equal
   value, and a mutated object always compares equal to itself — the save would never fire.
   A box is refused because it has no address of its own; its run's is the one that saves. */
export function record(el, patch){
	const root = el.closest(".panel-body");
	const owner = root && owners.get(root);
	if (!owner || el.classList.contains("panel-text-box")) return null;

	const key = el.dataset.text ?? key_of(owner.item, root, el);
	if (!key) return null;

	const saved = owner.item.get("text") ?? {};
	const now = { ...saved[key], tag: el.tagName, ...patch };
	if (JSON.stringify(now) === JSON.stringify(saved[key])) return key;

	owner.item.set("text", { ...saved, [key]: now });
	return key;
}

function key_of(item, root, el){
	const path = path_of(root, el);
	return path && scope(item) + "/" + path;
}

/* The overlay replayed onto a fresh drawing. Idempotent: every write is a set, a box is
   only made when the run is not already in one, and an added run is found by its stamp
   before it would be made a second time. */
export function text_apply($body, item){
	const root = $body.el;
	const owner = owners.get(root);
	const saved = item.get("text");
	if (!owner || !saved) return $body;

	// ⚠ `disconnect` empties the record queue, so nothing written here wakes the observer.
	owner.seen.disconnect();

	const here = scope(item) + "/";
	for (const key in saved){
		if (!key.startsWith(here)) continue;                    // another drawing's edits, kept for its return
		const path = key.slice(here.length);
		if (path === REPEAT_KEY) continue;                      // repeat.js owns replaying this one
		const el = path[0] === "+" ? added(root, key, saved[key]) : find_at(root, path);
		if (el && el.tagName === saved[key].tag) dress(el, saved[key]);
	}

	owner.seen.observe(root, { childList: true });
	return $body;
}

/* ⚠ `View.text()` and not a raw write: re-setting an identical `textContent` still replaces
   the node under it, which COLLAPSES the caret — a fresh run typed into lost its whole-run
   selection to the observer's own replay, and every keystroke landed before the placeholder.
   ⚠ And never over a live edit at all: `data` only learns the new copy on blur, so replaying
   here would put the old words back while they are being retyped. */
const dress = (el, saved) => {
	const $el = viewed(el);
	if (saved.text !== undefined && !el.classList.contains("panel-text-edit")) $el.text(saved.text);
	for (const name in FIELDS) if (saved[name]) FIELDS[name].set($el, saved[name]);
	if (saved.box) box(el, saved.box);
	return el;
};

/* A run the user asked for that no template drew — it has no address in the drawing, so it
   is STAMPED with its key instead, which is also what stops a replay making it twice. */
function added(root, key, saved){
	const found = root.querySelector(`[data-text="${CSS.escape(key)}"]`);
	if (found) return found;

	const made = document.createElement(saved.tag ?? "p");
	made.className = "panel-text-new";
	made.dataset.text = key;
	root.append(made);
	return made;
}

/* ⚠ REPLACES an existing box rather than nesting in it: `data.text` holds one box per run,
   so a second wrap has to land on exactly the DOM a replay would build. Exported for
   `text.js`'s `wrap()` — the only place a box is created by a user action rather than a
   replay. */
export function box(el, tag){
	const had = el.parentElement?.classList.contains("panel-text-box") ? el.parentElement : null;
	if (had?.tagName === tag.toUpperCase()) return had;

	const made = document.createElement(tag);
	made.className = "panel-text-box";
	(had ?? el).replaceWith(made);
	made.append(el);
	return made;
}

/* ⚠ Called BEFORE a body is emptied. `edit()` writes down on blur, so a run still being
   typed into has nothing saved yet — emptying around it would take the copy with it. */
export function text_commit($body){
	$body.el.querySelectorAll(".panel-text-edit").forEach(el => el.blur());
	return $body;
}

/* ⚠ A lazy template — a section band, `space`, `properties` — appends a PROMISE to the
   body, so its DOM lands a tick after `paint()` has already replayed the overlay onto an
   empty box. `childList` WITHOUT `subtree`: only a top-level landing counts, so the
   clock ticking inside its own div never wakes this.
   ⚠ The returned dispose is what `text.js`'s `text_layers()` hands back to `overlays.js`,
   which disconnects it before a structural redraw discards this `$body` — nothing else
   releases it, and it never dies on its own. */
export function text_observe($body, item){
	const root = $body.el;

	const seen = new MutationObserver(() => text_apply($body, item));
	owners.set(root, { item, seen });
	seen.observe(root, { childList: true });

	return () => { seen.disconnect(); owners.delete(root); };
}

// A run the drawing does not have. Written down FIRST and built by the replay, so the one
// on screen is the one that comes back — there is no second way to make one.
export function fresh(root){
	const owner = owners.get(root);
	if (!owner) return null;

	const saved = owner.item.get("text") ?? {};
	const key = scope(owner.item) + "/+" + (Object.keys(saved).filter(k => k.includes("/+")).length + 1);
	const made = { tag: "P", text: "Text" };

	owner.item.set("text", { ...saved, [key]: made });
	return dress(added(root, key, made), made);
}
