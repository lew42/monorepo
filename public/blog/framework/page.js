import { Section } from "../Section.js";

// The whole file. The title, the blurb and this section's posts are in ../posts.js,
// and a post is a directory beside this one — undeclared, so the front never imports
// six post modules to print six titles. See ../Section.js.
export default new Section({ meta: import.meta });
