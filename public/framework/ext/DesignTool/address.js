/* A finding's address, resolved. `path` is a `:nth-child()` chain from the analysis
   root; an empty one IS the root. Record: doc/addressing.md.

   ⚠ `:scope >`, or the chain FLOATS. `el.querySelector()` matches its selector
   against the whole tree and only then keeps descendants, so a bare `:nth-child()`
   chain finds the first element of that shape ANYWHERE under the root — 5 findings
   in 209 on this site, including the top one on `/framework/`, which resolved to
   the site's sidebar and captioned it a padding fault. */
export const locate = (root, path) => (path ? root.querySelector(`:scope > ${path}`) : root);

export default locate;
