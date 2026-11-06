import PageContent from "/framework/core/Page/PageContent.js";
import List from "/framework/core/List/List.js";

/* What a LivePage keeps when something leaves: a card removed from `content`, everything a clear takes, and a saved
 * screen removed from `screens` all move into the page's `removed` List instead of vanishing. The log line is still the
 * plain `{"remove": id}` / `{"clear": true}`, so the move happens on replay too, and `removed` is part of the page's
 * saved shape (toJSON): a snapshot of the page keeps them. `{"restore": "<id>"}` brings one back (LivePage.restore).
 * A second removal under the same id replaces the first in `removed` (the older one is still in the log). */
export default class LiveContent extends PageContent {

	remove(idOrX){ return keep(this, idOrX, () => super.remove(idOrX)); }

	// A clear keeps what it takes, except while the page saves a screen (those cards went into the screen).
	clear(){
		const bin = this.owner?.removed, gone = this.items.filter(x => this.clearable(x));
		super.clear();
		if (bin && !this.owner.saving) gone.forEach(x => into(bin, x));
		return this;
	}
}

// A saved screen removed from the list is kept the same way.
export class LiveScreens extends List {
	remove(idOrX){ return keep(this, idOrX, () => super.remove(idOrX)); }
}

// Take the member out (the list's own remove: one quiet release, one "remove" event), then put it in the bin quietly.
function keep(list, idOrX, remove){
	const made = typeof idOrX === "object" && idOrX !== null ? idOrX : list.find(idOrX);
	const bin = list.owner?.removed;
	remove();
	if (made && bin && bin !== list && !made.transient && !list.items.includes(made)) into(bin, made);
	return list;
}

function into(bin, made){
	const had = bin.find(bin.key(made));
	if (had && had !== made) bin.release(had);
	bin.insert(made);
}
