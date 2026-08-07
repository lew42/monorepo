/* Heading text -> fragment id. ONE definition, deliberately in its own module.
 *
 * The id written onto a heading and the href that points at it must be derived
 * the same way, or a shared url quietly stops meaning what it meant. Two copies
 * of four characters of regex is exactly the drift that put source() in util/.
 *
 * Its own file rather than an export from toc/page.js, because importing a page
 * module to borrow a function also constructs that page — a module fetch and a
 * Page nobody asked for, paid on every route that wants a slug.
 */
export const slug = text => text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");

export default slug;
