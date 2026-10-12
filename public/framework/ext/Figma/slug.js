/* A Figma name, made safe for a url: lowercase, dashes, nothing else. Two siblings
   that slugify to the same word keep the first's plain slug; every later one gets
   its own id appended, so a collision never shadows the thing that got there first. */
export function slugify(name){
	return String(name ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

export function unique_slug(item, list){
	const base = slugify(item.name);
	const dupes = list.filter(x => slugify(x.name) === base);
	return dupes.length > 1 && dupes.indexOf(item) > 0 ? `${base}-${String(item.id ?? item.key).replace(/[^a-z0-9]/gi, "")}` : base;
}
export default slugify;
