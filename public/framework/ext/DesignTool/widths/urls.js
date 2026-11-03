import { Page } from "/app.js";
import specs from "../../../styles/layouts/400/specs.js";

const TIER = "/framework/styles/layouts/400/";
const LIBRARY = "/framework/ext/DesignTool/library/";

/* Five width-tier entries + the band they're built from, each a bare `/full/`
 * url; the four library arrangements they cite, read at their own root.
 * `specs` is P1's — this derives rows, never re-lists the slugs by hand. */
const tier = specs.map(spec => ({
	label: spec.title,
	url: `${TIER}${Page.slug(spec.title)}/full/`,
	root: ".layout-full",
}));

const cited = ["Rail and content", "Tile wall", "Dashboard row", "Section band"].map(title => ({
	label: title,
	url: `${LIBRARY}${Page.slug(title)}/`,
	root: ".dt-case-body",
}));

export const urls = [
	...tier,
	{ label: "Sections", url: "/framework/styles/sections/full/", root: ".layout-full" },
	...cited,
];

export default urls;
