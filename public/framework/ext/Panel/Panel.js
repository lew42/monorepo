import Item from "/framework/core/Item/Item.js";

/* One class. A panel holding items is a split (`dir`); a panel holding none is a leaf
   that renders `template`. Structure changes only through these verbs.

   ⚠ Nothing else in this directory may be named `panel.js` — Windows folds it into
   this file. The old widget file split into `workspace.js` + `PanelDrag.js` for
   exactly this reason. Record: readme.md. */
export class Panel extends Item {

	/* Defaults live here, not in `data`, so only what somebody chose ever serializes — and a
	   MIRROR reads its master for the keys it shares. ⚠ `?? this` is the guard for an id that
	   no longer resolves, and nothing more: a copy holds none of the shared keys itself, so
	   falling back reads BLANK, not "what it last had". Surviving a structural verb is
	   `bequeath()`'s job — every verb that stops holding what a copy reads hands it on first. */
	get(key){ return ((Panel.shared.includes(key) && this.master()) || this).data[key] ?? Panel.defaults[key]; }

	// Writing a shared key writes the MASTER, which is what makes every duplicate live.
	set(key, value){
		const to = Panel.shared.includes(key) && this.master();
		return to ? to.set(key, value) : super.set(key, value);
	}

	/* Who I copy. ⚠ One lookup, never a chain — `mirror()` collapses a mirror-of-a-mirror to
	   the original at creation, so the cycle that would hang `get()` cannot be built. */
	master(){ return this.data.mirror ? this.root().find(this.data.mirror) : null; }

	// Become a live duplicate of `of` — pointing at ITS master if it is itself a copy.
	mirror(of){
		const source = of.master() ?? of;
		if (source === this) return this;

		this.data = { ...this.data, mirror: source.id };
		return this.emit("change", "mirror", source.id);
	}

	// Everyone reading me. One hop is the whole set — `mirror()` allows no chain.
	copies(){ const found = []; this.root().walk(panel => { if (panel.data.mirror === this.id) found.push(panel); }); return found; }

	/* Mastership is inherited, never destroyed: before I stop holding what my copies read,
	   `heir` takes the shared keys it lacks and they all re-point at it — `split()` hands
	   down to the child my content just moved into, `close()` promotes a surviving copy.
	   ⚠ The early return is load-bearing: it is what stops splitting a MIRROR from deleting
	   the link that split is carrying down. */
	bequeath(heir){
		const copies = this.copies();
		if (!copies.length) return this;

		heir ??= copies[0];
		Panel.shared.forEach(key => { if (key in this.data) heir.data[key] = this.data[key]; });
		delete heir.data.mirror;
		copies.forEach(copy => { if (copy !== heir) copy.data.mirror = heir.id; });

		return this.emit("change", "mirror", heir.id);
	}

	leaf(){ return !this.items.length; }

	/* Split beside me. My parent already runs this way → a new sibling, which is what a
	   second click on the same icon does. Otherwise I become the split. `before` puts the
	   arrival on my low side. */
	divide(dir, made = new Panel(), before = false){
		const up = this.parent;

		if (up && up.get("dir") === dir){
			const kids = up.items.children;
			const ref = before ? this : kids[kids.indexOf(this) + 1] ?? null;

			// ⚠ The arrival is already in that slot — `move()` detaches first, so
			// `insert_before` would find no ref and push it to the row's far end.
			return ref === made ? made : made.move(up, ref);
		}

		return this.split(dir, made, before);
	}

	/* Become a container, whatever my parent runs: my content moves down to a first child
	   and `made` joins it beside. `divide()`'s else-branch, named — because dropping a panel
	   INTO another one is exactly this, where dropping it beside one is `divide`, and the
	   two were one verb only for as long as nothing could ask for the inside. */
	split(dir, made = new Panel(), before = false){
		// ⚠ `draw` is an instance property (panel(fn)'s content), so it moves by hand.
		const mine = new Panel({ data: { ...this.data, grow: 1 }, draw: this.draw });
		[...this.items].forEach(kid => kid.move(mine));

		this.data = { dir, grow: this.get("grow") };
		delete this.draw;

		this.add(mine);
		made.move(this, before ? mine : null);

		// ⚠ LAST, and after `made` is in the tree: the copy button on a root leaf splits the
		// very panel it just mirrored, so the arrival must be there for the walk to find.
		this.bequeath(mine);
		return made;
	}

	// Remove me — and a container left holding one child is not a split any more.
	close(){
		const up = this.parent;
		if (!up) return this;

		// ⚠ BEFORE the remove, which puts this subtree out of reach of the walk. Everything
		// leaving hands its copies down, not just me: closing a split takes its children too.
		this.walk(panel => panel.bequeath());

		this.remove();
		if (up.items.length === 1) up.absorb();
		return up;
	}

	// My only child takes my place: its content and its data, my share of the row.
	absorb(){
		const only = this.items.children[0];

		[...only.items].forEach(kid => kid.move(this));
		this.data = { ...only.data, grow: this.get("grow") };
		this.draw = only.draw;

		// I wear its content, so its copies read me — same handover as `focus` below.
		only.bequeath(this);

		// ⚠ I now wear its content, so a selection on it is a selection on me — the id
		// leaves the tree but nothing left the screen. `focus` is focus.js's, and it
		// must move BEFORE the remove that would otherwise find it gone and clear it.
		const root = this.root();
		if (root.focus === only.id) root.focus = this.id;

		only.remove();
		return this;
	}
}

/* ⚠ `template: "blank"`, not `"random"`. A split hands its new sibling a fresh Panel,
   and a default of "random" made every split roll a random sub-arrangement — one click
   for three columns. "random" is what SEEDING asks for, and panel.js asks explicitly.

   ⚠ `self: "tl"` and no other code: size.css's `var(--panel-self-*, start)` fallback is the
   `align-self: start` those rules hardcoded before `self` existed, and `tl` is the code that
   reads back as start/start — any other default silently moves every saved hugging panel. */
Panel.defaults = { dir: "row", template: "blank", align: "cc", self: "tl", tone: "surface", mode: "fill", grow: 1, display: "block", w: "fill", h: "fill", position: "static" };

/* What a mirror takes from its master: WHAT it holds and HOW it looks. Its size and its
   place in its own row stay its own — a duplicate dropped into a narrow column is still
   that column's width, and `dir`/`grow`/`mode` are answers about a slot, not about content.
   ⚠ `text` is the purest case of what it holds — a copy showing different words is not a
   copy — and it works only BECAUSE `template` is shared beside it: text.js keys its
   overrides by the drawing they belong to, so master and mirror share one key space. */
Panel.shared = ["template", "tone", "align", "display", "seed", "text"];

export default Panel;

Item.register(Panel, "Panel");
