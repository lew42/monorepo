/**
 * index.mjs — read every `site/*.json` and write `site/index.json`.
 *
 *     node public/websites/tools/index.mjs
 *
 * The manifest is what the PAGES read. They never list the directory, because
 * production is static: there is no server to ask "what files are in site/?", and
 * nothing on this site crawls the filesystem. `blog/posts.js` is the same call for
 * the same reason. Run this after any shoot, scan or hand-edit.
 *
 * It carries only what a CARD needs — name, title, url, category, the global layout
 * ids, the tags, one picture. A site's own page fetches that site's full json.
 *
 * `sections` is the one key nobody hand-writes: a site's `sections[].layout` names a
 * layout id (a modifier allowed, `2-sidebar right`) for a PART of the page, not the
 * whole of it — Wikipedia's infobox this way, on a page whose own layout is
 * `3-holy-grail`. This key gathers those separately from `tags`, keyed by the BARE
 * id (the modifier stripped, same as a layout chip already does), so `/layouts/<id>/`
 * and `/websites/tag/<id>/` can list "as a section, on:" as a second, honest list.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { read_record, record_names, site_dir } from "./lib.mjs";

const sites = [];
const tags = {};
const sections = {};

for (const name of await record_names()){
	const r = await read_record(name);
	if (!r) continue;

	sites.push({
		name,
		title: r.title ?? name,
		url: r.url,
		category: r.category ?? "uncategorised",
		layout: r.layout ?? {},
		tags: r.tags ?? [],
		shot: r.shots?.["1280"] ?? Object.values(r.shots ?? {})[0] ?? null,
	});

	for (const tag of r.tags ?? []) (tags[tag] ??= []).push(name);

	for (const section of r.sections ?? []){
		const id = section.layout?.split(" ")[0];
		if (id) (sections[id] ??= []).push(name);
	}
}

// Sorted so a rebuild with no change produces a byte-identical file — a diff then
// only ever shows a real edit.
const sort_map = map => {
	const out = {};
	for (const key of Object.keys(map).sort()) out[key] = [...new Set(map[key])].sort();
	return out;
};
const sorted = sort_map(tags);
const sorted_sections = sort_map(sections);

const manifest = {
	generated_at: new Date().toISOString(),
	sites: sites.sort((a, b) => a.name.localeCompare(b.name)),
	tags: sorted,
	sections: sorted_sections,
};

await writeFile(join(site_dir, "index.json"), JSON.stringify(manifest, null, "\t") + "\n");
console.log(`index: ${sites.length} sites, ${Object.keys(sorted).length} tags, ${Object.keys(sorted_sections).length} section layouts -> site/index.json`);
