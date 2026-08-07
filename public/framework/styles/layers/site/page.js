import { Page, md, code } from "/app.js";

/* No stylesheet — this page documents the one file that IS the layer. */

export default new Page({
	meta: import.meta,
	title: "site",
	description: "The site's own skin — /styles.css, above the framework and below the utilities.",
	icon: "format_paint",

	content(){

		code.css(`/* /styles.css */
@layer base, theme, site, util;

@layer site {
    .app { background: var(--wash); }
    .nav-link { color: var(--subtle); }
    .sidebar { --gutter: 1.75em; font-size: 0.8em; }
}`);

		md("**One file lives in this layer: `/styles.css`, the site's skin.** The framework says what a page *is*; this layer says what *this site* looks like — the chrome, the brand, the backgrounds, the tuning. Every rule in it beats `base` and `theme` at **any** specificity, which is the point: a site should never have to out-specify the framework it is skinning.");

		md("## What belongs here");

		md("Looks, and only looks that are *this site's opinion*:\n\n- **Chrome the site built** — the nav bar, the brand mark, the topic rows. `/app.js` emits `.nav` and `.brand`; this layer styles them.\n- **A theme's tuning** — the site wears `theme-lew42` and then retunes it: a smaller sidebar font, a padded code block.\n- **Overrides of the base theme** — allowed, and every one is a **bug report**. If the site has to win by layer, the framework is missing a token; the fix is to add the token upstream and turn the override into two *values*. That is the de-escalation rule, and `--code-bg`/`--code-ink` are the worked example: a site fight over dark code blocks became one token pair in `framework.css`.");

		md("What does **not** belong here: structure. Where a page mounts, what scrolls, how a tab bar works — that is the framework's, in `theme` (or, for the arrangement contract, `util`). A `site` rule about layout is a decision the next page can't see coming.");

		md("## Why between theme and util");

		md("The position is the design:\n\n- **Above `theme`**, so the site beats the framework and every component at any specificity — no climbing.\n- **Below `util`**, because a utility class is something you typed *on the element, on purpose*. A blanket `div { padding: 0 }` in the site has no business defeating `.pad`.\n\nAnd it is a **named layer rather than unlayered** on purpose: unlayered would beat `util` too, spend the last cheap rung of the ratchet, and — being unpositioned — foreclose ever placing anything above or below it.");

		md("## The one obligation");

		md("Restate the full order at the top, like every stylesheet:");

		code.css(`@layer base, theme, site, util;`);

		md("`site` is the name most at risk from a short list — a stylesheet that omits it gets it appended at the *end*, past `util`, and the site silently starts beating utility classes. See [Layers](/framework/styles/layers/) for why nothing warns you.");

		md("Next: [util](/framework/styles/layers/util/) — the one layer that outranks you, and why that's right.");
	}
});
