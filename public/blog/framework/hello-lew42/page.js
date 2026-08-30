import { Post } from "../../Post.js";

/* Title, date and description live in ../../posts.js — one copy of every string, and the
 * same one `meta.mjs` stamps into index.html. `parts` is the reading order: each key is
 * the .md file beside this one, and each becomes a real page at /<key>/. */
export default new Post({
	meta: import.meta,

	parts: {
		"no-build": "No build step",
		"pages": "Pages are navigation",
		"open": "Built in the open",
	},
});
