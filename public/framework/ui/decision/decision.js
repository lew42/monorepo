import { css } from "../parts.js";

/* A decision, shown as the choice it actually was: the question, then every
 * option side by side with a ground of its own, the chosen one marked, and the
 * reason underneath.
 *
 * The rule this is built on (the owner, 2026-09-17): "options and alternatives
 * get a box each, their own background, so the set reads as a choice; siblings
 * that are roughly equal get nothing." A plain list of sentences cannot say
 * "these are alternatives" — boxes can, and that is the whole component.
 *
 * ⚠ THE CHOSEN CARD IS MARKED THREE WAYS ON PURPOSE, and none of them is the
 *   accent carrying text. `--prim` is #FF6157, which is 2.96:1 on white — under
 *   the 3:1 a UI shape needs and far under text's 4.5:1. So: a warm ground the
 *   others don't have (9.6:1 for `--ink`), a 2px accent border (a shape, not
 *   text), and the word "chosen" in ordinary ink (10.5:1). Any one of the three
 *   can be missed without losing which card won.
 *
 * ⚠ AND THE UNCHOSEN CARDS ARE `--surface`, NOT `--wash`. In the lew42 theme
 *   `--wash` IS the app's own ground (`.app { background: var(--wash) }`,
 *   styles.css) and both are #f2f2f2 — a wash box on a page paints nothing at
 *   all, and the first build of this component shipped three invisible options
 *   that measured rgb(242,242,242) against a rgb(242,242,242) page. A box that
 *   must read as a box takes `--surface` plus a real border, which is exactly
 *   what framework.css's own `.surface` does.
 */
css(`@layer theme {

	.ui-decision { display: flex; flex-direction: column; gap: var(--gap-50); }
	.ui-decision > * { margin: 0; }

	.ui-decision-ask { font-weight: 700; }

	/* A wall, so auto-fit across two, three or four options and one column at
	   400. 15em is the floor a two-line option label survives; it is a rem-class
	   length in em on purpose here, because the card holds TEXT and should wrap
	   with it. */
	.ui-decision-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(15em, 100%), 1fr));
		gap: var(--gap-50);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/* A box with a background needs padding, or the fill is a stain (the owner,
	   2026-09-17). --pad resolves to its 1em floor in a box this narrow. */
	/* The border is 2px on BOTH so the chosen card does not resize when it wins —
	   only its colour changes. An outline would avoid the reflow too, but then
	   the box would wear two rings. */
	.ui-decision-option {
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: .4em;
		padding: var(--pad);
		display: flex;
		flex-direction: column;
		gap: var(--gap-25);
		min-width: 0;
	}
	.ui-decision-option > * { margin: 0; }

	.ui-decision-option.chosen {
		background: color-mix(in srgb, var(--prim) 8%, var(--surface));
		border-color: var(--prim);
	}

	.ui-decision-say { font-weight: 600; }
	.ui-decision-why { color: var(--subtle); }

	/* The mark is a word, not a colour: "chosen" reads in a screenshot, in dark
	   mode and to a reader who cannot tell #FF6157 from #1a1a1a. The ✓ is
	   decoration in front of it. */
	.ui-decision-mark { font-size: .8em; letter-spacing: .04em; text-transform: uppercase; font-weight: 700; }
	.ui-decision-mark::before { content: "✓ "; color: var(--prim); }

	/* One sentence, under the options it explains — so it reads as the reason
	   for the set rather than as a fifth option. */
	.ui-decision-because { border-inline-start: 2px solid var(--prim); padding-inline-start: .75em; }

	/* A nested set: an option that was itself a choice. Inside a white card the
	   step is DOWNWARD — --tint (#f8f8f8) is the one rung between --surface and
	   --wash — so two levels never paint the same colour twice.
	   (No backticks in here: one inside a css template kills every page.) */
	.ui-decision-option .ui-decision-options { margin-block-start: var(--gap-25); }
	.ui-decision-option .ui-decision-option { background: var(--tint); }
}`);
