import PageFilesExplorer from "/framework/ext/files/explorer.js";

/**
 * Servex & Server source, on the v2 explorer (`ext/files/explorer.js`) — the
 * framework's own left nav stays, a tree plus code columns fill the rest, same as
 * every other `<dir>/fs/` page. Read-only, dev server only.
 *
 * Every OTHER `/fs/` page reads `ext/filesystem`'s shared tree, built from
 * `/directory.json` — but that only ever lists `public/`, and `Servex/`/`Server/` run
 * this site from OUTSIDE it. `Server/plugins/DevSource.js` (dev only) is the one small
 * route that fixes that for just these two folders: `/devsource.json` lists them, and
 * `GET /Servex/<path>` / `GET /Server/<path>` serve one file's real text at the SAME
 * path `list()` names — real paths, not a prefixed alias, because `explorer.js`'s
 * `render()` always fetches against `location.origin + "/"` with no way to point it
 * elsewhere from here.
 *
 * Only two things are overridden below — everything else (the tree, the code columns,
 * the line gutter, `#L42`, Back/Forward) is `PageFilesExplorer`'s, unmodified:
 *
 *   `list()`     — my two folders' listing instead of the site's `/directory.json`.
 *   `selected`   — `file_link()` (`ext/filesystem`) now sends a `Servex/`/`Server/`
 *                  path here as `?file=<path>` (there is no per-folder `/fs/` route
 *                  to select a trailing path segment the ordinary way — see
 *                  `file_link.js`'s own "Servex/ and Server/" note), so this reads
 *                  that query key instead of the `route()`-set property `fs.js`
 *                  ordinarily fills. The setter is a no-op fallback so nothing throws
 *                  on the rare case `route()` (inherited) still tries to set it.
 */
class ServexSource extends PageFilesExplorer {

	label = "Source";   // not "Files" — that already names the Doc's own Files tab (review finding 11)

	static async list(){
		const res = await fetch("/devsource.json").catch(() => null);
		if (!res?.ok) return null;
		return flatten((await res.json()).files);
	}

	get selected(){ return new URLSearchParams(location.search).get("file") ?? this._selected; }
	set selected(v){ this._selected = v; }
}

// `Page.load()` (core/Page/Page.class.js) imports this file's default export and uses
// it AS the page directly (`page instanceof Page`) — it wants a built instance, the
// same as every other page.js on the site, not the bare class.
export default new ServexSource({ meta: import.meta });

// The whole tree from /devsource.json, flattened to the flat path list `list()` (and
// `explorer()`, inside `PageFilesExplorer.render()`) wants — same shape `fs.js`'s own
// `list()` builds from the ordinary site tree.
function flatten(nodes, out = []){
	nodes.forEach(node => {
		if (node.type === "dir") flatten(node.children ?? [], out);
		else out.push(node.full);
	});
	return out;
}
