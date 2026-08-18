import View, { div, p, pre, span, code, h3, mark, table, thead, tbody, tr, th, td } from "../../core/View/View.js";

/**
 * cssdoc(target) — every CSS rule the browser is ACTUALLY applying to `target`, read
 * out of the live CSSOM, and what every property those rules touch resolves to.
 *
 *     content(){ cssdoc("code"); }
 *
 * A block you call inside any `content()`, like `md()` and `demo()`. Nothing below is
 * typed by a human, so nothing below can be stale — that is the whole point; the four
 * wrong hand-copied rules it replaces are in `readme.md`.
 *
 * ⚠ `target` is an explicit string on purpose, NOT derived from the page slug: one
 * call site cannot rot, and a derivation would have to guess. readme.md.
 */
/* ⚠ `target` is the LABEL, not a selector. Both specimens are always a real `<code>`
   element — `cssdoc("blockquote")` would render `<code>blockquote</code>` and silently
   document `code`. v1 documents one element on purpose. Generalising is not a rename:
   the pair "inline vs inside a pre" is what makes the diff meaningful, and every other
   element needs its own two contexts chosen (`a` in prose vs in a nav, and so on).
   That choice is the v2 design — take a specimen-builder, not a tag string. */
export function cssdoc(target){
	// Two specimens, and the PAIR is the product: a declaration that one rule sets
	// and the next rule forgets to reset shows up as a diff between these columns.
	const specimens = [{ name: "inline" }, { name: "block" }];

	const $report = div.c("cssdoc-report wide flow", () => {
		p("Inline ", specimens[0].$ = code(target), " sits in a sentence.");
		pre(() => specimens[1].$ = code(target));
	});

	// ⚠ Filled in a callback, never after an `await` — View.captor is restored at the
	// first await and the tables would land somewhere else, silently.
	measured(specimens, () => {
		const rules = matching(specimens);

		// The one invariant everything here rests on, left where a test can read it.
		$report.attr("data-connected", specimens.every(s => s.$.el.isConnected));

		$report.append(() => {
			rule_table(rules, target);
			prop_table(rules, specimens);
		});
	});

	return $report;
}

/**
 * ⚠ `getComputedStyle` on a DETACHED element returns "" for every property and throws
 * nothing — and on a COLD load a page renders before `App.inject()`, so `$app` is still
 * out of the document and neither a microtask nor `activated()` is late enough.
 *
 * So wait for the two real preconditions: the sheets settled (one that has not loaded
 * is not in `document.styleSheets` at all, so its rules are invisible here), then the
 * specimen actually IN the document. A MutationObserver, never rAF — a hidden tab
 * never animates, and this repo's MCP eval always runs in one. readme.md.
 */
function measured(specimens, fn){
	const el = specimens[0].$.el;

	Promise.allSettled(View.stylesheets).then(() => {
		if (el.isConnected) return fn();

		const seen = new MutationObserver(() => {
			if (!el.isConnected) return;
			seen.disconnect();
			fn();
		});

		seen.observe(document.documentElement, { childList: true, subtree: true });
	});
}

/* Every style rule in the document, in document order, tagged with the layer and the
 * conditions it sits under. @layer/@media/@container/@supports all GROUP, so recurse —
 * and only a layer block names a layer (@keyframes has a `.name` too; it is animation).
 * ⚠ A cross-origin sheet throws on `.cssRules`; skip it rather than lose the walk. */
function all_rules(){
	const out = [];

	const walk = (list, layer, when) => {
		for (const rule of list){
			if (rule.selectorText) out.push({ n: out.length + 1, layer, when, rule });
			else if (rule.cssRules) walk(rule.cssRules,
				rule instanceof CSSLayerBlockRule ? [layer, rule.name].filter(Boolean).join(".") : layer,
				rule.conditionText ? when.concat(rule.conditionText) : when);
		}
	};

	for (const sheet of document.styleSheets){
		try { walk(sheet.cssRules, "", []); } catch { /* cross-origin */ }
	}

	return out;
}

/* ⚠ Split on commas at paren depth 0 ONLY: `:where(p, li, td) a:visited` is one part,
 * and `.split(",")` shreds it into fragments that match the wrong elements — nothing
 * throws and the output stays plausible. ⚠ Strip the pseudo-element AFTER the split:
 * `el.matches("code::before")` is false and never throws, so a `::before` rule would
 * otherwise vanish with no error. Both measured; readme.md. */
function parts(selector){
	const out = [];
	let depth = 0, part = "";

	for (const ch of selector){
		if (ch === "(") depth++;
		else if (ch === ")") depth--;

		if (ch === "," && depth === 0){ out.push(part); part = ""; }
		else part += ch;
	}

	out.push(part);

	return out.map(one => one.replace(/::[\w-]+(\([^()]*\))?/g, "").trim() || "*");
}

// The filter is the whole product: 8 rules out of ~1300 land on one `code`.
function matching(specimens){
	return all_rules().filter(row => {
		const sels = parts(row.rule.selectorText);

		row.on = specimens.filter(s => sels.some(sel => {
			try { return s.$.el.matches(sel); } catch { return false; }
		}));

		// The CSSOM expands shorthands, so this is longhands — and it must be, because
		// computed style answers a shorthand with "". `padding` is four rows here.
		row.props = [...row.rule.style];

		return row.on.length > 0;
	});
}

/* ⚠ There is no line-number API on a rule, and `cssText` is normalised, so grepping the
 * source for it is unreliable too: name the FILE, never a line. 14 of 72 sheets have no
 * href at all — `ui/parts.js` appends a bare `<style>`. */
const file = rule => rule.parentStyleSheet?.href?.split("/").pop() ?? "<style>";

const decls = rule => rule.cssText.slice(rule.cssText.indexOf("{") + 1, -1).trim();

function rule_table(rows, target){
	h3(rows.length + " rules land on ", code(target));
	p.c("muted", "Read out of the stylesheets this page is using right now, in document order. Nothing here is typed.");

	// A plain `table` and no stylesheet: framework.css already gives one `max-content`
	// under a `max-width: 100%` ceiling with its own `overflow-x: auto` — right for a
	// column that is 288px on a phone and 2428px at 3440. (`.ui-table` is `width: 100%`,
	// which stretched this to the full 2428.)
	table.c("cssdoc-rules", () => {
		thead(() => tr(() => { th("#"); th("layer"); th("file"); th("selector"); th("declarations"); th("on"); }));

		tbody(() => rows.forEach(row => tr(() => {
			td(String(row.n));
			td(row.layer || "—");
			td(file(row.rule));
			td(() => {
				code(row.rule.selectorText);
				// A rule whose @media does not match right now STAYS — that variant is
				// exactly what you need while you edit. It is labelled, not hidden.
				row.when.forEach(cond => span.c("muted", " only when (" + cond + ")"));
			});
			td(() => code(decls(row.rule)));
			td(row.on.map(s => s.name).join(" · "));
		})));
	});
}

/* The winner is `getComputedStyle`, not a specificity calculator: on a live specimen
 * the computed value IS the resolved cascade, layers and all, with nothing to drift. */
function prop_table(rows, specimens){
	const props = [...new Set(rows.flatMap(row => row.props))].sort();
	const styles = specimens.map(s => getComputedStyle(s.$.el));

	const set_by = (prop, specimen) => rows
		.filter(row => row.on.includes(specimen) && row.props.includes(prop))
		.map(row => row.rule.selectorText).join(" · ") || "—";

	h3("What each of those properties resolves to");
	p.c("muted", "A marked property is one the two specimens disagree about — the row that catches a declaration one rule set and the next forgot to reset.");

	table.c("cssdoc-props", () => {
		thead(() => tr(() => { th("property"); specimens.forEach(s => { th(s.name); th("set by"); }); }));

		tbody(() => props.forEach(prop => {
			const values = styles.map(cs => cs.getPropertyValue(prop));
			const differs = new Set(values).size > 1;

			tr(() => {
				td(differs ? mark(prop) : prop);

				specimens.forEach((specimen, i) => {
					td(() => code(values[i] || "—"));
					td(set_by(prop, specimen));
				});
			});
		}));
	});
}
