// The page-type library: a small tree in types.json. Browser: read it. Node: bump it.
const url = new URL("./types.json", import.meta.url);

export class PageTypes {

	static async load(){
		return (await fetch(url)).json();
	}

	// every node in the tree, flat
	static flat(lib){
		return lib.types.flatMap(t => [t, ...(t.variants || [])]);
	}

	// most-used first: the feedback loop, in one sort
	static async sorted(){
		const lib = await PageTypes.load();
		const by = (a, b) => b.uses - a.uses;
		return lib.types.map(t => ({ ...t, variants: (t.variants || []).slice().sort(by) })).sort(by);
	}

	static async pick(id){
		return PageTypes.flat(await PageTypes.load()).find(n => n.id === id);
	}

	// bump(id) = read the file, uses + 1, write it back. Node side only (it writes).
	// A page made with a type calls this once. A variant bump also bumps its parent.
	static async bump(id){
		const fs = await import("node:fs"), { fileURLToPath } = await import("node:url");
		const file = fileURLToPath(url), lib = JSON.parse(fs.readFileSync(file, "utf8"));
		const hit = PageTypes.flat(lib).filter(n => n.id === id || id.startsWith(n.id + "."));
		if (!hit.length) throw new Error("no page type " + id);
		hit.forEach(n => n.uses++);
		fs.writeFileSync(file, JSON.stringify(lib, null, 1) + "\n");
		return hit.at(-1).uses;
	}

}

export default PageTypes;
