import Item from "/framework/core/Item/Item.js";
import Socket from "/framework/dev/Socket/Socket.js";
import FileSaver from "/framework/ext/Saver/FileSaver.js";
import LocalStorageSaver from "/framework/ext/Saver/LocalStorageSaver.js";
import { Flex, Box } from "./items.js";

/* Documents are FILES: one Saver per slug, an index the app writes itself — no server
 * route, the same mechanism dev and static (design.md §2). Not the directory listing:
 * `Server/plugins/Directory.js:21` ignores every `.json`, so a fresh save never reaches
 * `directory.json` — and a static host has no listing at all. The idiom, verbatim from
 * `ext/Saver/doc/backends.md`. */
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");

// Baseline bug: FileSaver.write() awaits Socket.ready with no timeout — "New Document" hung
// forever with the dev server down. Race it ~2s, ONCE, here; every save below reads this
// verdict and never awaits the live socket again (doc/decisions.md, pg-save).
export const local = dev && !await Promise.race([
	Socket.singleton().ready.then(() => true), new Promise(r => setTimeout(r, 2000)),
]);

const store = (path, key) => dev && !local ? new FileSaver({ path }) : new LocalStorageSaver({ key });

const index = store("/data/playground/index.json", "playground:index");

// A doc's Saver stamps every fallback write with a save time — `reconcile()` (below) is
// what a `.local` key's timestamp is for. Distinct key, nothing overwrites the real one.
const StampedLocal = class extends LocalStorageSaver {
	write(item){ return super.write({ ...(item?.toJSON?.() ?? item), saved_at: Date.now() }); }
};
const doc_saver = slug => dev && !local
	? new FileSaver({ path: `/data/playground/${slug}.json` })
	: new StampedLocal({ key: `playground:${slug}${local ? ".local" : ""}` });

// The list IS a document too — an Item whose children carry `{name, slug}`, the same
// four-key envelope as everything else, so there is no second format to keep in sync.
export async function list(){
	const doc = Item.hydrate(await index.load() ?? {});
	return doc.items.toJSON().map(kid => kid.data);
}

async function reindex(slug){
	const found = await list();
	if (found.some(d => d.slug === slug)) return;

	const doc = Item.hydrate({ items: found.map(data => ({ data })) }).assign({ saver: index });
	doc.add(new Item({ data: { name: slug, slug } }));
	await doc.save();
}

/* A new document opens on the holy grail (pg-model — the owner: "start with a page with
 * surface bg, and start with a holy grail layout … i don't feel like this helps me learn
 * flex or grid"). The old seed was one fixed 10em box and one grow:1 box, and the ux
 * research measured that fixed box costing 8 of 38 gestures across five canonical layouts:
 * every one of them began by undoing it.
 *
 * The page is a plain Box that hugs — default div behavior, no flex, no height (the owner,
 * 2026-08-29; a fixed 24em Flex column was the previous seed). Blocks stack; the whole
 * document is as tall as its content and grows as you add. The pre-set `gap` draws nothing
 * on a Box — it is the first lesson: flip the page's type to FLEX and the gap appears
 * (gap survives convert(), items.js's own rule). Only the rails carry a length; nothing in
 * the seed declares a height at all. Labels are semantic, so the tree reads as a page and
 * not as "box, box, box". */
const box = (label, data) => new Box({ data: { label, ...data } });

export function seed(){
	const page = box("page", { bg: "var(--surface)", padding: "1em", gap: "1em" });
	const body = new Flex({ data: { label: "body", gap: "1em" } });

	body.add(box("nav", { width: "10em" }), box("main", { width: "fill" }), box("aside", { width: "8em" }));
	page.add(box("header"), body, box("footer"));
	return page;
}

// "untitled-2", "untitled-3", … — the first unused suffix, never a name already in the index.
export async function mint_slug(){
	const used = new Set((await list()).map(d => d.slug));
	let n = 2;
	while (used.has(`untitled-${n}`)) n++;
	return `untitled-${n}`;
}

// `saver.delete()` + drop the index entry — but NEVER the last document (the brief's own
// rule): a Playground with no document left to open is a Playground that cannot open.
export async function del(slug){
	const found = await list();
	if (found.length <= 1) return false;

	await doc_saver(slug).delete();
	const doc = Item.hydrate({ items: found.filter(d => d.slug !== slug).map(data => ({ data })) }).assign({ saver: index });
	await doc.save();
	return true;
}

/* Existing file → hydrate it, unchanged. Missing → seed, index it, save it. `load()`
 * resolves `null` only for "not saved yet" (panel-insight §Carry) — never seed on a
 * rejection, which throws instead and is this function's caller's problem. */
export async function open(slug){
	const saver = doc_saver(slug);
	const json = (!local && await reconcile(slug, saver)) || await saver.load();
	if (json) return Item.hydrate(json).assign({ saver });

	const root = seed().assign({ saver });
	await reindex(slug);
	await root.save();
	return root;
}

// Newest save time wins, nothing deleted: a `.local` fallback outlives the session that
// wrote it, so the next server-up `open()` is what folds it back in. `saver` is injectable
// so this is eval-drivable without a live server (port 80 stays down either way).
export async function reconcile(slug, saver = doc_saver(slug)){
	const key = `playground:${slug}.local`;
	const raw = localStorage.getItem(key);
	if (!raw) return;

	const fallback = JSON.parse(raw);
	const server = await saver.load();
	if (server && (server.saved_at ?? 0) >= fallback.saved_at) return;

	const parked = `playground:${slug}.superseded.${server?.saved_at ?? Date.now()}`;
	if (server) localStorage.setItem(parked, JSON.stringify(server));
	localStorage.removeItem(key);
	await saver.save(fallback);
	console.log(`Playground: "${slug}" recovered a locally-saved copy newer than the server's — parked the server copy under "${parked}".`);
	return fallback;
}

// design §6: paste strips every id first — `Item.hydrate` KEEPS ids, and its `seen` set
// only dedups WITHIN one call, so re-inserting the same subtree twice would collide.
export function strip_ids(json){
	const { id, items, ...rest } = json;
	if (items) rest.items = items.map(strip_ids);
	return rest;
}

/* A layout IS a document (design §7) — same four-key envelope, its own index, at
 * `/data/playground/layouts/`. `save_as_layout` strips ids on the way out (a template's
 * own ids are meaningless); `insert` (Playground.js's `paste()`) strips again on the way
 * in, which is what makes a second insert of the same layout collide-free. */
const layouts_index = store("/data/playground/layouts/index.json", "playground:layouts:index");
const layout_saver = name => store(`/data/playground/layouts/${name}.json`, `playground:layout:${name}`);

export async function list_layouts(){
	const doc = Item.hydrate(await layouts_index.load() ?? {});
	return doc.items.toJSON().map(kid => kid.data);
}

export async function load_layout(name){
	return layout_saver(name).load();
}

export async function save_as_layout(item, name){
	if (!item || !name) return false;

	await layout_saver(name).save(strip_ids(item.toJSON()));

	const found = await list_layouts();
	if (!found.some(d => d.name === name)){
		const doc = Item.hydrate({ items: found.map(data => ({ data })) }).assign({ saver: layouts_index });
		doc.add(new Item({ data: { name } }));
		await doc.save();
	}
	return true;
}
