import Item from "./Item.js";
import Store from "./Store.js";

/* Ref — a small Item that points at an item living somewhere else, instead of holding a copy (ids-and-paths.md §6).
   It stores WHERE the target is, never its title or state, so it cannot drift:
     {"type":"Ref","path":"tasks.ui.tasks.c3"}                                  the same file
     {"type":"Ref","url":"/framework/ai/sessions/…/v-7k2q/","path":"tasks.ui"}  another file (a folder url opens its record)

   Replay makes the Ref and nothing more. It is resolved when first needed (`resolve()`, or drawn by RefView):
     1. the root: its own file's root (`this.root()`), or `Item.open(url)`, one root per url, the same live object everywhere;
     2. `root.get(path)`; on a miss, the path's last part (the id) through `root.find(id)`, whose index is built on that first
        miss and never saved (Item.find);
     3. a target holding `{moved_to: {url, path}}` is a forward left at the old place: followed, and this Ref quietly takes the
        new address (one line), so the next load goes straight there;
     4. nothing found: `target` is null and RefView draws a visible "gone" row naming the path. Never silently empty.
   Within one file, `Ref.backlinks(root)` is a Map from each path to the Refs pointing at it, computed in memory (never saved);
   `Ref.shown(item)` answers "where is this shown", and `Ref.repath(item, old_path)` re-paths every Ref after a move, one line per Ref.
   Node: Item.open fetches the url, so an absolute http url resolves (Ref.test.mjs); a task's {"task":"<folder>"} keeps Task.resolver. */
export class Ref extends Item {

	static fields = ["url", "path"];
	static HOPS = 8;   // forwards followed before a chain is called a loop
	static changes = 0;   // bumped when any Ref changes its address: the backlinks are walked again

	put(key, value){ super.put(key, value); if (key === "path" || key === "url") Ref.changes++; }

	/** The resolved item: undefined until resolve() has run, null when it is gone. */
	get target(){ return this._target; }
	get gone(){ return this._target === null; }

	/** Resolve (again): find the root, the target, follow forwards; returns the target or null. A live root's change re-runs it. */
	async resolve(){
		const root = await this.root_of(this.url);
		return this.settle(root, this.url);
	}

	// Steps 2 to 4 above, from a root already open.
	async settle(root, url){
		let path = this.path ?? "", hit = Ref.lookup(root, path), hops = 0, moved = false, arrived = false;
		for (let to = Ref.forward_of(hit); to && hops < Ref.HOPS; to = Ref.forward_of(hit), hops++){
			if (to.url){ url = to.url; root = await this.root_of(url); }
			path = to.path ?? "";
			const next = Ref.lookup(root, path);
			moved = true;
			// The forward led back to the same item: it is already its new home's root. A handoff leaves a reference with the same id,
			// which in the browser loads the moved task from its new file into that very object (Task.open_ref), forward and all.
			if (next === hit){ arrived = true; break; }
			hit = next;
		}
		if (!arrived && Ref.forward_of(hit)){ hit = null; this._why = "the forwards loop"; }
		if (moved && hit) this.set(url && url !== this.url ? { url, path } : { path });   // the new address, one line: next load goes straight there
		this.watch(root);
		return this.found(hit ?? null, root);
	}

	// The root of `url` (its own file's when none), opened once per url.
	async root_of(url){
		if (!url) return this.root();
		return Item.open(await Ref.file_of(url));
	}

	found(hit, root){
		const was = this._target;
		this._target = hit;
		this._root_of_target = root;
		if (hit === null) this._why ??= `nothing at "${this.path ?? ""}"` + (this.url ? ` in ${this.url}` : "");
		else this._why = null;
		if (was !== hit){
			if (was) was.off?.("delta", this._on_target);
			if (hit) hit.on?.("delta", this._on_target ??= () => this.emit("target", this._target));
		}
		// Redraw only when what a row shows changed (the target, its title, its state): a replayed line fires no "delta" on the
		// item, so the root's "read" re-settles and this compares; a read that touched nothing shown emits nothing.
		const seen = hit ? `${hit.get_one?.("title")}|${hit.state}|${root?.get_one?.("title")}` : String(this._why);
		if (was !== hit || seen !== this._seen){ this._seen = seen; this.emit("target", hit); }
		return hit;
	}

	// A root that changes live (its Store read a line) may have gained or lost the target: look again, once per batch.
	watch(root){
		if (this._watched === root) return;
		if (this._watched) this._watched.off?.("read", this._on_root);
		this._watched = root;
		root.on?.("read", this._on_root ??= () => this.settle(this._watched, this.url));
	}

	/** Why it is gone, in words, for the "gone" row. */
	get why(){ return this._why ?? null; }

	/** The title a reader sees: the root's title, then the target's, as "session › task". */
	label(){
		const t = this._target, root = this._root_of_target;
		const name = x => x?.get_one?.("title") ?? x?.title ?? x?.id ?? "";
		return root && root !== t && this.url ? `${name(root)} › ${name(t)}` : name(t);
	}

	// ---- statics: lookup, files, backlinks ----

	/** The item at `path` under `root`; on a miss, the path's last part looked up as an id anywhere under it (Item.find). */
	static lookup(root, path){
		if (!root) return null;
		if (!path) return root;
		const hit = root.get(path);
		if (hit instanceof Item) return hit;
		const id = String(path).split(".").at(-1);
		return root.find?.(id) ?? null;
	}

	static forward_of(item){
		const to = item?.get_one?.("moved_to");
		return to && typeof to === "object" ? to : null;
	}

	/** A folder url opens the record it keeps (session.jsonl, else task.jsonl, else page.jsonl); a file url is itself. */
	static async file_of(url){
		if (/\.jsonl$/.test(url)) return url;
		const dir = String(url).replace(/\/?$/, "/");
		const names = typeof document !== "undefined" ? (await import("../Router/listing.js")).names(dir) : null;
		const order = ["session.jsonl", "task.jsonl", "page.jsonl"];
		if (names) return dir + (order.find(n => names.includes(n)) ?? order[0]);
		for (const n of order){
			const res = await fetch(dir + n, { method: "HEAD" }).catch(() => null);
			if (res?.ok && !res.headers.get("content-type")?.includes("html")) return dir + n;
		}
		return dir + order[0];
	}

	/** Every same-file Ref under `root`, by the path it names: computed by a walk, kept until any list changes (Item.generation),
	    never saved. A Ref to another file is not here: across files a move leaves a forward instead. */
	static backlinks(root){
		const had = root._backlinks;
		if (had && had.gen === Item.generation && had.changes === Ref.changes) return had.map;
		const map = new Map();
		root.walk(item => { if (item instanceof Ref && !item.url) (map.get(item.path ?? "") ?? map.set(item.path ?? "", []).get(item.path ?? "")).push(item); });
		Object.defineProperty(root, "_backlinks", { value: { gen: Item.generation, changes: Ref.changes, map }, writable: true, configurable: true, enumerable: false });
		return map;
	}

	/** Where is this shown: the Refs in its own file that point at it, by its path or, after a move, by its id. */
	static shown(item){
		const root = item.root(), path = Store.address(item, root), out = new Set(Ref.backlinks(root).get(path) ?? []);
		for (const [p, refs] of Ref.backlinks(root)) if (p !== path && String(p).split(".").at(-1) === item.id) refs.forEach(r => out.add(r));
		return [...out];
	}

	/** After `item` moved within its file: every Ref that named `old_path` (or found it by its id) takes the new path, one line each. */
	static repath(item, old_path){
		const root = item.root(), now = Store.address(item, root), refs = new Set(Ref.backlinks(root).get(old_path) ?? []);
		for (const r of Ref.shown(item)) refs.add(r);
		const moved = [...refs].filter(r => r.path !== now);
		for (const r of moved) r.set({ path: now });
		return moved;
	}

}

Item.register(Ref, "Ref");

// A live move to another list (List.move) re-paths the same-file Refs that named the old path, one line each. Not on replay:
// the file already holds those lines. Only while Ref is loaded: a page with no Refs pays nothing.
Item.moving = {
	before: item => item.root?.()?.store?.replaying || Store.muted ? undefined : Store.address(item, item.root()),
	after: (item, old_path) => { if (old_path && Ref.backlinks(item.root()).size) Ref.repath(item, old_path); },
};
export default Ref;
