import { div, span } from "../../core/View/View.js";
import { component, css } from "../parts.js";

css(`@layer theme {
	.ui-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--avatar, 2.5em);
		height: var(--avatar, 2.5em);
		flex: 0 0 auto;
		border-radius: 999px;
		background: var(--bg);
		color: white;
		font-weight: 700;
		font-size: 0.8em;
		letter-spacing: 0.02em;
		overflow: hidden;
	}
	.ui-avatar > img { width: 100%; height: 100%; object-fit: cover; }
	.ui-avatar.accent { background: var(--prim); }
	.ui-avatar.wash { background: var(--wash); color: var(--ink); }

	/* The ring is the surface colour, so an overlap reads as a hole onto whatever
	   the stack sits on and retints with the theme. */
	.ui-avatars { display: flex; align-items: center; }
	.ui-avatars > .ui-avatar { border: 2px solid var(--surface); }
	.ui-avatars > .ui-avatar + .ui-avatar { margin-inline-start: -0.6em; }
}`);

/**
 * avatar("ML") — initials in a circle. `--avatar` is the size, so one function
 * serves a 1.75em chip and a 3.5em profile header:
 *
 *     ui.avatar("ML").style("--avatar", "3.5em")
 *     ui.avatar(() => img().attr("src", src))
 *
 * Variants: `accent` `wash`.
 */
export const avatar = component((...args) => span.c("ui-avatar", ...args));

// avatars(…) — the overlapped stack. One class instead of a margin per circle.
export const avatars = component((...args) => div.c("ui-avatars", ...args));

export default avatar;
