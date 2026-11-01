import DefaultView, { view } from "./DefaultView.js";

/* ⚠ Deprecated (2026-10-28): `inspect()` is the default view now — one view, not three (law 6). Use
 * `view(x, { open: 1 })` from DefaultView.js. This file keeps old imports working; the old card's code is in
 * git history (`git log -- public/framework/ux/Content/Object/Inspect.js`).
 *
 * The old options map onto the default view: `variant: "minimal"` is the closed row, any other variant is
 * open one level; `properties` passes through; `methods` names a class's methods; `doc` and `api` are dropped
 * (no caller passed them). */
export function inspect(subject, { variant, methods, doc, api, ...opts } = {}){
	return view(subject, { open: variant === "minimal" ? 0 : 1, ...(methods ? { method_names: methods } : {}), ...opts });
}

/** @deprecated The default view; `InspectCard` is kept as a name for old imports. */
export class InspectCard extends DefaultView {}

export default InspectCard;
