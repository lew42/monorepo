import { Post } from "../../Post.js";

// The whole file. Title, date, description live in ../../posts.js, the prose in post.md.
export default new Post({ meta: import.meta });
