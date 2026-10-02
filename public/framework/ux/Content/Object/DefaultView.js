import View, { div, span, details, summary } from "../../../core/View/View.js";
import { item } from "../../../ui/item/item.js";

/**
 * class DefaultView extends View — give it any real object and it draws a tree of
 * `.item` rows, the same shape as a file tree: a header row naming the class, then
 * one row per own property, its name written with a leading dot (`.children`,
 * `.title`). A property whose value is a plain value (a string, a number, a
 * boolean) shows that value inline, right after the name. A property whose value
 * is an object, an array or a Map becomes an EXPANDABLE row — its own properties /
 * entries are not looked at, or drawn, until you actually click it open, so a huge
 * object graph (a `Page`, whose `.children` holds a Map of more `Page`s, whose
 * `.parent` points straight back) costs nothing until you go looking, and never
 * loops forever: a value already on the path you're expanding shows "↺ already
 * open above" instead of opening again.
 *
 *   new DefaultView({ subject: somePage })      // this is the whole call
 *   view(somePage)                              // the usual way in — see below
 *
 * Functions, DOM/View nodes, and a property that is declared but never set
 * (`undefined`) are skipped, same as `ObjectCard` (`Object.js`, beside this
 * file) does — nothing to usefully show for any of the three.
 *
 * **The override.** A class that wants its own look defines `static View`:
 *
 *   class Widget { … }
 *   Widget.View = class extends DefaultView { render(){ … } };
 *
 * and `view(thing)` finds it automatically — `thing.constructor.View` reaches an
 * inherited one too, because a JS static is on the constructor's own prototype
 * chain, the same as any other inherited member.
 */
export default class DefaultView extends View {

	render(){
		const subject = this.subject;
		const klass = typeof subject === "function" ? subject : subject?.constructor;
		const label = subject && typeof subject !== "function" ? (subject.name ?? subject.title) : null;
		const article = /^[aeiou]/i.test(klass?.name ?? "Object") ? "an " : "a ";

		item({
			// Any class may declare `static icon = "material-symbol-name"` (the same
			// convention `ObjectCard.icon_name()` and `Inspect.js` read) — absent, this
			// falls back to "data_object", same as it always has.
			icon: klass?.icon ?? "data_object",
			name: article + (klass?.name ?? "Object"),
			end: label ? () => span.c("item-end muted", String(label)) : undefined,
		});

		div.c("ux-content-defaultview-rows", () => this.properties(subject, new Set()));
	}

	/* Every own property worth a row, skipping the noise ObjectCard already skips:
	 * `undefined` (declared but never set — nothing there), functions (behaviour,
	 * not state), and DOM/View nodes (there's a live element to look at instead —
	 * showing its guts here is never what you wanted). */
	properties(subject, path){
		if (!subject || typeof subject !== "object") return;

		Object.keys(subject).forEach(name => {
			const value = subject[name];
			if (value === undefined) return;   // declared but never set — nothing to show
			if (typeof value === "function") return;
			if (value?.el || value instanceof Node) return;
			this.row(name, value, path);
		});
	}

	row(name, value, path){
		if (value !== null && typeof value === "object") return this.expandable(name, value, path);

		return item({ name: "." + name, end: () => span.c("item-end muted", this.describe(value)) });
	}

	/* An object/array/Map property: a row that looks exactly like item()'s own
	 * `children` form (same classes, so the CSS is the same), except the inside is
	 * built once, the first time it's actually opened — never before. `path` is
	 * every object already being drawn above this row on THIS branch; a value
	 * already in it is a cycle back to an ancestor, so it gets a plain note
	 * instead of opening into itself forever. */
	expandable(name, value, path){
		if (path.has(value)){
			item({ name: "." + name, end: () => span.c("item-end muted", "↺ already open above") });
			return;
		}

		details.c("item-node", $node => {
			summary.c("item", () => {
				span.c("item-caret", "▸");
				span.c("item-name", "." + name);
				span.c("item-end muted", this.describe(value));
			});

			const $kids = div.c("item-children");
			let opened = false;

			$node.el.addEventListener("toggle", () => {
				if (opened || !$node.el.open) return;
				opened = true;
				$kids.append(() => this.entries(value, new Set(path).add(value)));
			});
		});
	}

	entries(value, path){
		if (Array.isArray(value)) return value.forEach((v, i) => this.row(String(i), v, path));
		if (value instanceof Map) return value.forEach((v, k) => this.row(String(k), v, path));
		if (value instanceof Set) return [...value].forEach((v, i) => this.row(String(i), v, path));
		return this.properties(value, path);
	}

	/* One line for a value that ISN'T being expanded: the value itself for a
	 * primitive, else how many things are inside, so an unopened row still says
	 * something ("Array(3)", "Map(12)") rather than nothing at all. */
	describe(value){
		if (value === undefined) return "undefined";
		if (value === null) return "null";
		if (typeof value === "string") return this.cut(JSON.stringify(value));
		if (typeof value === "number" || typeof value === "boolean") return String(value);
		if (Array.isArray(value)) return `Array(${value.length})`;
		if (value instanceof Map) return `Map(${value.size})`;
		if (value instanceof Set) return `Set(${value.size})`;
		if (typeof value === "object")
			return value.constructor && value.constructor !== Object ? `${value.constructor.name} {…}` : "{…}";
		return this.cut(String(value));
	}

	cut(text, max = 64){ return text.length <= max ? text : text.slice(0, max - 1) + "…"; }
}

/* `view(thing)` — the one call most code should use instead of `new DefaultView(…)`
 * directly: it picks `thing.constructor.View` when that class (or one it extends)
 * declares one, else falls back to this plain, best-guess tree.
 *
 * ⚠ `Viewer.prototype instanceof View`, not just "is it truthy" — `View` (this
 * codebase's own base class) is imported above already, so this costs nothing
 * extra. A bare `Klass.View` check would also fire for some OTHER static
 * someone names `View` for an unrelated job (this framework's own "parts are
 * static subclasses" pattern makes that a real, if unlikely, future collision)
 * and try to instantiate it as a `subject`-taking view, which it isn't. */
export function view(thing){
	const Klass = thing?.constructor;
	const Viewer = Klass?.View;
	return Viewer?.prototype instanceof View ? new Viewer({ subject: thing }) : new DefaultView({ subject: thing });
}

export { DefaultView };
