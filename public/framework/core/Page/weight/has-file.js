// has_file(page_url, name) — is `name` a real file right beside `page_url`?
// true/false from the live folder names (/api/folder-names, core/Router/listing.js) on the dev server;
// off it, from the old /directory.json tree when there is one, else undefined ("can't know": callers fetch blind).
// Imports only Router/listing.js, so weight.js, ai-cost.js and settings.js can all use it without a cycle.

import { fetch_names } from "../../Router/listing.js";

let tree;
function directory_tree(){
	return tree ??= fetch("/directory.json").then(res => res.ok ? res.json() : null).catch(() => null);
}

export async function has_file(page_url, name){
	const listed = await fetch_names(page_url.endsWith("/") ? page_url : page_url + "/");
	if (listed) return listed.includes(name);

	const data = await directory_tree();
	if (!data) return undefined;

	let node = { children: data.files };
	for (const part of page_url.split("/").filter(Boolean)){
		node = node.children?.find(child => child.name === part);
		if (!node) return false;
	}
	return !!node.children?.some(child => child.type === "file" && child.name === name);
}

export default has_file;
