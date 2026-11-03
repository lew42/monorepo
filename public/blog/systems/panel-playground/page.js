import { Post } from "../../Post.js";

// The whole file. Title, date and description live in ../../posts.js, which is also
// what stamps this post's index.html — one copy of every string.
export default new Post({ meta: import.meta });
