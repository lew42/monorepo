import DefaultView, { view } from "./DefaultView.js";

/* ⚠ Deprecated (2026-10-28): `object()`, the small card, is the default view now — one view, not three
 * (law 6). Use `view(x, { open: 1 })` from DefaultView.js. This file keeps old imports working; the old card's
 * code is in git history (`git log -- public/framework/ux/Content/Object/Object.js`). Nothing outside this
 * module imported it.
 *
 * `properties` passes through; `methods` names a class's methods; `doc` and `api` (links from names to doc
 * pages) are dropped. */
export function object(subject, { methods, doc, api, ...opts } = {}){
	return view(subject, { open: 1, ...(methods ? { method_names: methods } : {}), ...opts });
}

/** @deprecated The default view; `ObjectCard` is kept as a name for old imports. */
export class ObjectCard extends DefaultView {}

export default ObjectCard;
