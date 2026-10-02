import { div, span, li, details, summary, icon } from "../../../core/View/View.js";
import { item } from "../../../ui/item/item.js";
import ObjectCard from "./Object.js";

/* Whether a property's object/array value is worth opening into its own nested
 * `inspect()` card: an Array with at least one item, or a plain object with at
 * least one own property worth showing (the same `undefined`/function/DOM-node
 * filter `ObjectCard.own_properties()` already applies). A Map or a Set is left
 * OUT on purpose — `own_properties()` reads `Object.keys()`, which sees none of
 * either one's real entries (the same pre-existing gap `object()`'s own card
 * has, not something new here), so opening one would show an empty card
 * promising content that isn't there. An empty array/object is excluded for
 * the same reason: nothing to open into. Either way, the plain `describe()`
 * text ("Map(12)", "Array(0)") still shows right there in the row — the size
 * is visible, just not a dead-end disclosure triangle. */
function nestable(value){
	if (value instanceof Map || value instanceof Set) return false;
	if (Array.isArray(value)) return value.length > 0;
	return Object.keys(value).some(key => {
		const v = value[key];
		return v !== undefined && typeof v !== "function" && !(v?.el || v instanceof Node);
	});
}

/**
 * class InspectCard extends ObjectCard — the "show me what you are" view the owner
 * asked for, kept SEPARATE from a class's own `render()` on purpose: `render()` stays
 * free for whatever real template a class already has (or none at all); `inspect()`
 * always exists, on every object, whether or not that object has a `render()`. It is
 * never the same method and it never touches `render()`.
 *
 *   inspect(somePage)                          // an instance card
 *   inspect(Page)                              // a class card — same icon, heavier frame
 *   inspect(somePage, { variant: "minimal" })  // icon + name only, an Inbox-style chip
 *   inspect(somePage, { variant: "full" })     // same as "card" today — see the note
 *                                               // on the `full` branch below
 *   inspect(Page, { doc: "/framework/core/Page/", properties: PAGE_PROPERTIES, methods: PAGE_METHODS })
 *
 * This reuses everything `ObjectCard` (`Object.js`, beside this file) already works
 * out: which properties/methods to show (`own_properties()`/`own_methods()`, or an
 * explicit `properties:`/`methods:` override — the SAME lists a module's own Doc
 * already names, so "core API first" is just passing that list, not a second
 * detector), each value's one-line description (`describe()`), and the class's own
 * icon (`icon_name()`, `static icon` on the class, `"data_object"` when absent).
 *
 * **The one new idea beyond `object()`:** a property whose value is itself an object
 * or array opens into its own NESTED `inspect()` card, not `Array(3)` on one line —
 * and that nested card nests its own object properties again, as deep as the real
 * data goes. It opens on CLICK, closed by default, exactly the way
 * `DefaultView.expandable()` already opens a `view()` row — reusing that exact
 * mechanism (the native `<details>`/`<summary>` toggle, the `item-node`/`item-caret`
 * classes and their rotation CSS, all already built) rather than drawing a second
 * one. This matters beyond style: a `Page`'s `.parent` points to another `Page`,
 * whose `.parent` points to another, and auto-opening the whole chain at once (an
 * earlier version of this file did exactly that) made a single property run
 * thousands of pixels tall before a reader could even take in the card it was
 * inside. A cycle (an ancestor object showing up again further down its own tree)
 * is caught the exact way `DefaultView.expandable()` already catches one: `path`, a
 * running Set of every object already open above this point on this branch — a
 * value already in it shows "↺ already open above" instead of recursing forever.
 */
export default class InspectCard extends ObjectCard {

	render(){
		const variant = this.variant ?? "card";
		const is_class = typeof this.subject === "function";

		// `path` starts empty at the top of a tree (`inspect(subject)` with no `path`
		// option) and grows by one ancestor each time `nested()` opens a property's
		// value — never shared backwards, so two unrelated branches never collide.
		this.path = this.path ?? new Set();

		this.ac(`ux-content-inspect-${variant}`);
		if (is_class) this.ac("ux-content-inspect-classcard");

		if (variant === "minimal") return this.minimal(is_class);

		this.head(is_class);

		// Arrays/Maps/Sets read better as "Items" than "Properties" — same list, a
		// truer label for what's actually inside.
		const props = this.own_properties();
		const label = Array.isArray(this.subject) ? "Items" : "Properties";
		if (props.length) this.group(label, "ux-content-inspect-properties", props, name => this.property_row(name));

		// Methods only ever show on a CLASS card. An instance's own methods are
		// behaviour, not state — the same reasoning `ObjectCard`/`DefaultView` already
		// use to skip functions everywhere else; a class card is the one place the
		// owner asked to see them, "properties AND methods together."
		//
		// `variant === "full"` falls through to here too: it renders identically to
		// "card" for now. The owner raised "full" as a name he expects to want but
		// hadn't decided what more it should show beyond "card" — more properties
		// uncapped, inline doc text, something else — logged as a decision in this
		// task's log rather than guessed here. Branch on `variant === "full"` right
		// here once that's decided.
		if (is_class){
			const methods = this.own_methods();
			if (methods.length) this.group("Methods", "ux-content-inspect-methods", methods, name => this.method_row(name));
		}
	}

	/* `minimal` — no card chrome at all, just icon + one name, the owner's own
	 * comparison point: "like an Inbox context card" (`ext/Mention`'s inline chip,
	 * `item({ icon, name }).ac("inline")`). Reusing `item()` directly, rather than
	 * drawing a second icon+name row by hand, is what makes this actually match that
	 * chip's size instead of a lookalike. */
	minimal(is_class){
		const klass = this.klass();
		const name = is_class ? (klass?.name ?? "Object") : (this.label_text() ?? klass?.name ?? "Object");
		item({ icon: this.icon_name(), name: String(name) }).ac("inline");
	}

	/* The card/full header: the icon (bigger than `object()`'s — "enough to read as a
	 * definition," the owner's own phrase), the instance's own name above the class
	 * name when it has one, or just the class name when the subject IS the class. */
	head(is_class){
		div.c("ux-content-inspect-head", () => {
			icon(this.icon_name()).ac("ux-content-inspect-icon");
			div.c("ux-content-inspect-titles", () => {
				const label = is_class ? null : this.label_text();
				if (label) span.c("ux-content-inspect-label", String(label));
				span.c("ux-content-inspect-classname", this.klass()?.name ?? "Object");
			});
		});
	}

	/* An instance's own name, the same three fields `object()`'s header already
	 * checks (`name`, else `path`, else `url` — whichever a class actually carries). */
	label_text(){
		return this.subject?.name ?? this.subject?.path ?? this.subject?.url;
	}

	/* A property row: `name = value` for a plain value, same as `object()` — but a
	 * value worth opening into (`nestable()`, above) becomes a closed disclosure row
	 * instead (`expandable_property()`), and a value that IS an object/array but has
	 * nothing worth opening into (empty, or a Map/Set) still shows its `describe()`
	 * text, just not as a dead-end click target. */
	property_row(name){
		const value = this.value_for(name);
		if (value !== null && typeof value === "object" && nestable(value)) return this.expandable_property(name, value);

		return li.c("ux-content-inspect-property", () => {
			this.name_span("ux-content-inspect-name", name, "property");
			if (value === undefined) return;
			span.c("ux-content-inspect-eq", "=");
			span.c("ux-content-inspect-value").attr("title", this.describe(value, true)).append(this.describe(value));
		});
	}

	/* A method row — a name only, same look `object()` already uses for methods; a
	 * method has no state of its own to nest into. */
	method_row(name){
		return li.c("ux-content-inspect-method", () => this.name_span("ux-content-inspect-link", name, "method"));
	}

	/* The recursive, lazy part: `value` is a real object/array worth opening into, so
	 * this row IS a disclosure — closed by default, its nested `inspect()` card built
	 * only the instant it's actually clicked open, never before. This is
	 * `DefaultView.expandable()`'s own mechanism, reused exactly: the same
	 * `item-node`/`item-caret` classes (so the same CSS already rotates the caret and
	 * already indents `.item-children`), the same "build once, on first toggle" guard,
	 * and the same cycle check — `this.path` is every ancestor already open above this
	 * row on this branch; `value` already in it shows "↺ already open above" instead
	 * of recursing forever. */
	expandable_property(name, value){
		if (this.path.has(value))
			return li.c("ux-content-inspect-property", () => {
				this.name_span("ux-content-inspect-name", name, "property");
				span.c("ux-content-inspect-eq", "=");
				span.c("ux-content-inspect-value muted", "↺ already open above");
			});

		return li.c("ux-content-inspect-expandable", () => {
			details.c("item-node", $node => {
				summary.c("item", () => {
					span.c("item-caret", "▸");
					this.name_span("ux-content-inspect-name", name, "property");
					span.c("ux-content-inspect-eq", "=");
					span.c("ux-content-inspect-value muted", this.describe(value));
				});

				const $body = div.c("item-children");
				let opened = false;
				$node.el.addEventListener("toggle", () => {
					if (opened || !$node.el.open) return;
					opened = true;
					$body.append(() => new InspectCard({ subject: value, variant: "card", path: new Set(this.path).add(value) }));
				});
			});
		});
	}
}

InspectCard.prototype.classes = "ux-content-inspect";

/* The one call: `inspect(instance)` or `inspect(Class)` — the same one-call shape as
 * `object()`/`view()` beside it, everything it needs arriving as one data object. */
export function inspect(subject, opts = {}){ return new InspectCard({ subject, ...opts }); }

export { InspectCard };
