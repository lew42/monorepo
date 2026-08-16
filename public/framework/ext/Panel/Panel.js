import Item from "/framework/core/Item/Item.js";

/* One class. A panel holding items is a split (`dir`); a panel holding none is a leaf
   that renders `template`. Structure changes only through these verbs.

   ⚠ Nothing else in this directory may be named `panel.js` — Windows folds it into
   this file. The old widget file split into `workspace.js` + `PanelDrag.js` for
   exactly this reason. Record: readme.md. */
export class Panel extends Item {

	/* Defaults live here, not in `data`, so only what somebody chose ever serializes — and a
	   MIRROR reads its master for the keys it shares. ⚠ `?? this` is the dangling guard: a
	   master that has been closed leaves an id pointing at nothing, and a mirror that read
	   through it would break the moment any panel was deleted. It falls back to its own
	   data, so a widowed mirror simply becomes an ordinary panel holding what it last had. */
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
		return made.move(this, before ? mine : null);
	}

	// Remove me — and a container left holding one child is not a split any more.
	close(){
		const up = this.parent;
		if (!up) return this;

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

		// ⚠ I now wear its content, so a selection on it is a selection on me — the id
		// leaves the tree but nothing left the screen. `focus` is workspace.js's, and it
		// must move BEFORE the remove that would otherwise find it gone and clear it.
		const root = this.root();
		if (root.focus === only.id) root.focus = this.id;

		only.remove();
		return this;
	}
}

/* ⚠ `template: "blank"`, not `"random"`. A split hands its new sibling a fresh Panel,
   and a default of "random" made every split roll a random sub-arrangement — one click
   for three columns. "random" is what SEEDING asks for, and panel.js asks explicitly. */
Panel.defaults = { dir: "row", template: "blank", align: "cc", tone: "surface", mode: "fill", grow: 1, display: "block" };

/* What a mirror takes from its master: WHAT it holds and HOW it looks. Its size and its
   place in its own row stay its own — a duplicate dropped into a narrow column is still
   that column's width, and `dir`/`grow`/`mode` are answers about a slot, not about content. */
Panel.shared = ["template", "tone", "align", "display", "seed"];

export default Panel;

Item.register(Panel, "Panel");
