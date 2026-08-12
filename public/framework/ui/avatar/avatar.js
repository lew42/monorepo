import { css } from "../parts.js";

css(`@layer theme {
	.ui-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--avatar, 2.5em);
		height: var(--avatar, 2.5em);
		flex: 0 0 auto;
		border-radius: 999px;

		/* Inverted, from the pair the theme already guarantees contrast between.
		   It said white over --bg: a literal, which a component may not name. */
		background: var(--ink);
		color: var(--surface);
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
