/* The three looks the components share, as token-valued style objects.
 *
 * Not a stylesheet: a fill, a border and a radius are a LOOK, and rung 4 of the
 * ladder is layout only. `layouts/parts.js` and `styles/layers/util/page.js` tint their
 * boxes exactly this way, so this is the house answer rather than a new one — and
 * it is why this section ships one stylesheet, for one component.
 *
 * Every value is a token. Nothing here names a colour.
 */

export const surface = {
	background: "var(--surface)",
	border: "1px solid var(--line)",
	borderRadius: "var(--radius)",
};

export const pill = {
	background: "var(--wash)",
	borderRadius: "999px",
	padding: "0.15em 0.7em",
};

/* `.btn` gives an <a> a button's padding and cursor and stops there — the
 * underline and the UA link colour survive it. Two declarations every
 * link-as-button has to write; see readme.md §5. */
export const btn = { textDecoration: "none", color: "inherit" };
