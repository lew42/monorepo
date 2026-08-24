import { css } from "../parts.js";

/* THE CONFIG WORDS. A class on a section, and every ui template inside it re-skins.
 *
 * The whole contract is one sentence: **a word sets custom properties and nothing
 * else.** No element selectors, no component classes, no `!important`. That is what
 * makes a word cost each of the twenty components exactly zero lines, makes two
 * words compose (they inherit, they never collide), and makes a word safe to put on
 * `<html>`, on `.app`, on one card — the mechanism is inheritance, not specificity.
 *
 * The precedent is the dev rail (dev/DevBar/devbar.css): one state class remaps one
 * property and everything inside reads it. The consequence is the same too — a value
 * a word cannot reach is a value the framework never tokenized. See page.js.
 *
 * `theme`, not `util`: a custom property never fights a utility, because the utility
 * READS it (`.pad { padding: var(--pad, 1em) }`), so there is no specificity war to
 * win — and a site theme loading later should still be able to beat a word. */
css(`@layer theme {

	/* ---- ui-contrast ---------------------------------------------------
	   The same section, readable. It names no hue: every value is an alpha bump
	   on the pair framework.css already declared, the far end of the ink axis, or
	   a mix of two existing tokens. So one word covers light AND dark, and a theme
	   that retints --prim gets a matching contrast word for free. */
	.ui-contrast {
		--ink:    light-dark(#000, #fff);
		--subtle: light-dark(rgba(0,0,0,0.8), rgba(255,255,255,0.85));
		--line:   light-dark(rgba(0,0,0,0.45), rgba(255,255,255,0.5));
		--wash:   light-dark(rgba(0,0,0,0.14), rgba(255,255,255,0.16));
		--tint:   light-dark(rgba(0,0,0,0.07), rgba(255,255,255,0.08));

		/* framework.css declares --prim-ink for exactly this case: an accent picked
		   to be seen as a FILL measures 2.25:1 as text. Mixed toward the ink, which
		   is itself a light-dark pair, so one line darkens it in light mode and
		   lightens it in dark. */
		--prim-ink: color-mix(in oklab, var(--prim) 70%, var(--ink));
	}

	/* ---- ui-compact ----------------------------------------------------
	   Less space at the SAME text size. Density is not zoom: shrinking font-size
	   shrinks the reading too, and that word already exists (.zoom-75, frozen at
	   eight rungs in framework.css).

	   --density is the knob, which is why there is no ladder of micro/mini/small
	   class names to argue about: .ac("ui-compact").style("--density", "0.7") is
	   the half step, 0.25 is a rail. One word, one number.

	   ⚠ --radius is NOT here, and the reason generalises: a word can only REPLACE a
	     token, never SCALE one — calc(var(--radius) * …) is a self-reference and CSS
	     drops it. --pad, --gap and --flow are safe to replace because nothing declares
	     them (their use sites carry the 1em/2em fallback), but --radius belongs to the
	     THEME: lew42 says 0.25em and terminal says 0. Restating 0.5em * 0.5 measured
	     3.76px against the theme's own 3.76px — a no-op that would have overruled a
	     theme's corner language the day one of them changed.

	   --pad-cell and --pad-control are the same shape: framework.css carries the old
	   literal as the use-site fallback (padding: var(--pad-cell, 0.25em 0.75em)), so
	   nothing declares them and a word may state them. Reading --density is NOT the
	   banned scale — the ban is on self-reference; a value computed off a DIFFERENT
	   token is ordinary CSS. Each keeps its own default ratio, so --density: 1 lands
	   back on the framework's number. */
	.ui-compact {
		--density: 0.5;
		--pad: calc(1em * var(--density));
		--gap: calc(1em * var(--density));

		/* the two the 2026-08-21 tokenize pass opened up: a table's cells and every
		   control. ⚠ button and input share --pad-control, so under a word they agree
		   — that is the point of one token, and it is why the horizontal baseline is
		   the field's 0.6em rather than the button's 1em: compact takes the smaller. */
		--pad-cell:    calc(0.25em * var(--density)) calc(0.75em * var(--density));
		--pad-control: calc(0.25em * var(--density)) calc(0.6em * var(--density));
	}

	/* ⚠ --flow is the one token an ancestor cannot set. framework.css declares it
	     ON the flow root itself — :where(.flow, blockquote) { --flow: 2em } — so an
	     inherited value is overwritten at every flow on the page and a compact
	     section kept 2em prose rhythm with nothing in the console. (0,1,0) beats
	     that (0,0,0); the second selector is the section that IS a flow. */
	.ui-compact :where(.flow, blockquote),
	.ui-compact:where(.flow, blockquote) { --flow: calc(2em * var(--density)); }
}`);
