import { Post } from "../../Post.js";

/* Everything this post says about itself — title, date, description and the reading
 * order of its three parts — lives in ../../posts.js. One copy of every string, and the
 * same one `meta.mjs` stamps into index.html, feed.xml and words.js. */
export default new Post({ meta: import.meta });
