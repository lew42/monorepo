import { css } from "../parts.js";

/* `framework.css` has no rule for `a` at all, so a trail's links keep the UA
 * underline until something says otherwise — and that is a descendant rule, which
 * is the only reason this file exists. The markup is on the page. */
css(`@layer theme {
	.ui-crumbs a { text-decoration: none; }
}`);
