import View from "/framework/core/View/View.js";
import { scope, REPEAT_KEY } from "./persist.js";

/* A "+" appended to a REPEATING run inside a leaf's body — a card grid, a nav rail, a
   list of quotes. Sits at the END of the run rather than riding the pointer the way
   insert.js's stub does: appending has exactly one valid target, so tracking the cursor
   would solve a problem this feature does not have.
   Persisted through persist.js's `text` overlay — the one key `Panel.shared` already
   carries — under its own key, so a mirror shows the same appended items. Own separate
   file: the detection and the cloning are a different concern from anything already in
   this directory's ten, and persist.js's `text` shape (one key → one dressable element)
   does not fit a whole cloned subtree. Record: readme.md. */
View.stylesheet(import.meta, "repeat.css");

export const REPEAT = { on: true };

const MIN_RUN = 3;
const ADD_CLASS = "panel-repeat-add";

// A bare element (no class) never anchors a run — otherwise three plain <p> in a row,
// the shape of ordinary prose, would read as "repeating" too.
const signature = el => el.classList.length && el.tagName + "." + [...el.classList].sort().join(".");

// The longest contiguous same-signature run among ONE container's own children.
function runs_in(container, found){
	const kids = [...container.children].filter(el => !el.classList.contains(ADD_CLASS));

	let start = 0;
	for (let i = 1; i <= kids.length; i++){
		const sig = signature(kids[start]);
		if (i < kids.length && sig && signature(kids[i]) === sig) continue;

		if (sig && i - start >= MIN_RUN && (!found || i - start > found.run.length))
			found = { container, run: kids.slice(start, i), signature: sig };
		start = i;
	}

	return found;
}

// The longest run anywhere under `root` — depth-first, so a grid three divs down is
// found over the loose wrapper around it.
function find_run(root){
	let found = runs_in(root);
	root.querySelectorAll("*").forEach(el => { found = runs_in(el, found); });
	return found;
}

function make_tile(){
	const made = document.createElement("button");
	made.type = "button";
	made.className = ADD_CLASS;
	made.title = "Add another";

	const glyph = document.createElement("span");
	glyph.className = "material-icons icon";
	glyph.textContent = "add";
	made.append(glyph);
	return made;
}

function save(item, found, clone){
	const key = scope(item) + "/" + REPEAT_KEY;
	const saved = item.get("text") ?? {};
	const entry = saved[key]?.signature === found.signature ? saved[key] : { signature: found.signature, items: [] };

	item.set("text", { ...saved, [key]: { signature: found.signature, items: [...entry.items, clone.outerHTML] } });
}

// The saved clones replayed back onto a fresh drawing — idempotent because `apply()`
// only ever runs against a container `paint()` just rebuilt from nothing.
function replay(item, found){
	const saved = item.get("text")?.[scope(item) + "/" + REPEAT_KEY];
	if (!saved || saved.signature !== found.signature) return;

	saved.items.forEach(html => {
		const made = document.createRange().createContextualFragment(html).firstElementChild;
		if (made) found.container.append(made);
	});
}

function apply(root, item){
	const found = find_run(root);
	if (!found) return;

	replay(item, found);

	const tile = make_tile();
	tile.addEventListener("click", () => {
		const last = tile.previousElementSibling;
		if (!last) return;

		const clone = last.cloneNode(true);
		found.container.insertBefore(clone, tile);
		save(item, found, clone);
	});
	found.container.append(tile);
}

/* Root → { item, seen }, so `repeat_apply()` — `paint()`'s synchronous hook — reaches the
   SAME observer `run()` uses instead of standing up a second one. Same shape as
   persist.js's `owners`. */
const owners = new WeakMap();

/* One MutationObserver per body, same shape as persist.js's `text_observe` — a lazy
   template lands its DOM a tick after `paint()` runs. ⚠ Disconnected around `apply()`'s
   own inserts: a run whose CONTAINER is `$body` itself would otherwise hear its own
   tile land and re-fire on itself. */
export function repeat_layers($body, item){
	const root = $body.el;
	const seen = new MutationObserver(() => run());
	owners.set(root, { item, seen });

	function run(){
		seen.disconnect();
		apply(root, item);
		seen.observe(root, { childList: true });
	}

	run();
	return () => { seen.disconnect(); owners.delete(root); };
}

/* `paint()`'s synchronous hook, called right after `text_apply()` the same way — so a
   saved clone is in the FIRST painted frame on a synchronously-drawn template instead of
   waiting for the observer's own tick. Absent owner (repeat off for this root, or
   `repeat_layers` hasn't run yet) is a no-op, exactly like `text_apply` against a root
   `text_observe` never bound. ⚠ Reuses `run()`'s own disconnect/observe guard rather than
   a second one — two guards racing the same observer would leave it either double-bound
   or dropped. */
export function repeat_apply($body, item){
	const root = $body.el;
	const owner = owners.get(root);
	if (!owner) return $body;

	owner.seen.disconnect();
	apply(root, item);
	owner.seen.observe(root, { childList: true });
	return $body;
}
