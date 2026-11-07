import PageContent from "/framework/core/Page/PageContent.js";
import List from "/framework/core/List/List.js";
import PageLink from "/framework/core/Page/parts/PageLink.js";

/* What a LivePage keeps when something leaves: a card removed from `content`, everything a clear takes, and a saved
 * screen removed from `screens` all move into the page's `removed` List instead of vanishing. The log line is still the
 * plain `{"remove": id}` / `{"clear": true}`, so the move happens on replay too, and `removed` is part of the page's
 * saved shape (toJSON): a snapshot of the page keeps them. `{"restore": "<id>"}` brings one back (LivePage.restore).
 * A second removal under the same id replaces the first in `removed` (the older one is still in the log).
 *
 * EVERY CARD IS A PAGE: a card that joins this list gets a `content` list of its own (another LiveContent), so /live/foo/
 * takes {"content":{"add":…}} exactly like /live/ does, at any depth, all in the one page.jsonl. A card removed at any depth
 * goes into the nearest page's `removed`. A link (it opens a sub-page folder) and a saved screen keep the content they have. */
export default class LiveContent extends PageContent {

	remove(idOrX){ return keep(this, idOrX, () => super.remove(idOrX)); }

	// A clear keeps what it takes, except while the page saves a screen (those cards went into the screen).
	clear(){
		const bin = bin_of(this), gone = this.items.filter(x => this.clearable(x));
		super.clear();
		if (bin && !bin.owner?.saving) gone.forEach(x => into(bin, x));
		return this;
	}

	// Every card gets a `preview` list (what its card shows, LivePage.Preview), a link too; every card but a link also gets
	// a `content` list (what its own page shows).
	adopted(made){
		super.adopted?.(made);
		if (!made || Array.isArray(made.items) || made.transient) return;
		own_list(made, "preview");
		if (!(made instanceof PageLink)) own_list(made, "content");
	}
}

// Give `made` a LiveContent of its own under `name`; a saved shape's plain list (hydrate) becomes one, its members kept.
function own_list(made, name){
	const had = Object.hasOwn(made, name) ? made[name] : null;
	if (had instanceof LiveContent || (had && had.constructor.name === "LiveScreen")) return;
	const own = new LiveContent({ owner: made, name });
	if (Array.isArray(had?.items)) for (const kid of [...had.items]){ had.release(kid); own.insert(kid); }
	made[name] = own;
}

// A saved screen removed from the list is kept the same way.
export class LiveScreens extends List {
	remove(idOrX){ return keep(this, idOrX, () => super.remove(idOrX)); }
}

// The `removed` list of the nearest page above this list (a card's own content keeps its removals on the page that holds it).
function bin_of(list){
	for (let o = list.owner; o; o = o.parent) if (o.removed && o.removed !== list) return o.removed;
	return null;
}

// Take the member out (the list's own remove: one quiet release, one "remove" event), then put it in the bin quietly.
// `{"remove": ["a","b"]}` is each id in turn. Only a real member goes to the bin: an id that is not here (already
// removed, or moved to another page) is skipped, and keeping a card never throws, so a remove cannot blank the page.
function keep(list, idOrX, remove){
	if (Array.isArray(idOrX)){ idOrX.forEach(x => list.remove(x)); return list; }
	const key = typeof idOrX === "object" && idOrX !== null ? list.key(idOrX) : idOrX;
	const made = list.find(key);
	const bin = bin_of(list);
	remove();
	if (made && typeof made === "object" && bin && bin !== list && !made.transient && !list.items.includes(made)){
		try { into(bin, made); } catch (error){ console.warn(`LiveContent: "${key}" left the list but could not be kept in removed:`, error); }
	}
	return list;
}

function into(bin, made){
	const had = bin.find(bin.key(made));
	if (had && had !== made) bin.release(had);
	bin.insert(made);
}
