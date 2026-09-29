// The page-type library: a small tree in types.json. Browser: read it. Node: bump it.
const url = new URL("./types.json", import.meta.url);

export async function load(){
	return (await fetch(url)).json();
}

// every node in the tree, flat
export const flat = lib => lib.types.flatMap(t => [t, ...(t.variants || [])]);

// most-used first: the feedback loop, in one sort
export async function sorted(){
	const lib = await load();
	const by = (a, b) => b.uses - a.uses;
	return lib.types.map(t => ({ ...t, variants: (t.variants || []).slice().sort(by) })).sort(by);
}

export async function pick(id){
	return flat(await load()).find(n => n.id === id);
}

// bump(id) = read the file, uses + 1, write it back. Node side only (it writes).
// A page made with a type calls this once. A variant bump also bumps its parent.
export async function bump(id){
	const fs = await import("node:fs"), { fileURLToPath } = await import("node:url");
	const file = fileURLToPath(url), lib = JSON.parse(fs.readFileSync(file, "utf8"));
	const hit = flat(lib).filter(n => n.id === id || id.startsWith(n.id + "."));
	if (!hit.length) throw new Error("no page type " + id);
	hit.forEach(n => n.uses++);
	fs.writeFileSync(file, JSON.stringify(lib, null, 1) + "\n");
	return hit.at(-1).uses;
}
