import PageMarkdown from "../../core/Page/Markdown.js";
import FsFile from "./FsFile.js";
import FsDir from "./FsDir.js";

/**
 * root() — the whole site as one `FsDir` tree, built ONCE from `/directory.json` (the
 * dev server's file list; `core/Page/Markdown.js`'s `tree()` is the one fetch, reused
 * here rather than fetched a second time) and cached for the life of the page.
 *
 *   const site = await root();       // FsDir, or null off the dev server
 *   site.find("framework/ext/filesystem/FsFile.js")   // an FsFile
 *   site.walk().filter(node => node instanceof FsFile)   // every real file
 *
 * `null` means there is no `/directory.json` at all — production, no dev server, same
 * as every other reader of this file list (`ext/files/fs.js`, `PageMarkdown` itself).
 *
 * `resolved()` is the SYNCHRONOUS half, for a caller that cannot itself be async
 * (`file_link.js`) — `undefined` until `root()` has settled at least once in this
 * tab, then the same value every `root()` call already resolves to. It is set INSIDE
 * `root()`'s own promise chain (not a caller's separate `.then()`), so any code that
 * has already `await root()`-ed is guaranteed `resolved()` is readable synchronously
 * from that point on — no second, racing fetch.
 */
export function root(){
	return FsDir.rooted ??= build().then(site => { FsDir.resolved = site; return site; });
}

export function resolved(){
	return FsDir.resolved;
}

async function build(){
	const tree = await PageMarkdown.tree();
	if (!tree) return null;
	return grow({ children: tree.files }, "", null);
}

function grow(node, path, parent){
	const dir = new FsDir({ name: node.name ?? "", path, parent, children: [] });
	dir.children = (node.children ?? []).map(child => {
		const childPath = path ? path + "/" + child.name : child.name;
		return child.type === "dir"
			? grow(child, childPath, dir)
			: new FsFile({ name: child.name, path: childPath, parent: dir });
	});
	return dir;
}
