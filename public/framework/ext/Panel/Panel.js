import Item from "/framework/core/Item/Item.js";

/* One class. A panel holding items is a split (`dir`); a panel holding none is a leaf
   that renders `template`. Structure changes only through these verbs.

   ⚠ Nothing else in this directory may be named `panel.js` — Windows folds it into
   this file. The old widget file split into `workspace.js` + `PanelDrag.js` for
   exactly this reason. Record: readme.md. */
export class Panel extends Item {

	// Defaults live here, not in `data`, so only what somebody chose ever serializes.
	get(key){ return this.data[key] ?? Panel.defaults[key]; }

	leaf(){ return !this.items.length; }

	/* Split beside me. My parent already runs this way → a new sibling, which is what a
	   second click on the same icon does. Otherwise I become the split and my content
	   moves down to a first child. `before` puts the arrival on my low side. */
	divide(dir, made = new Panel(), before = false){
		const up = this.parent;

		if (up && up.get("dir") === dir){
			const kids = up.items.children;
			return made.move(up, before ? this : kids[kids.indexOf(this) + 1] ?? null);
		}

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

		only.remove();
		return this;
	}
}

/* ⚠ `template: "blank"`, not `"random"`. A split hands its new sibling a fresh Panel,
   and a default of "random" made every split roll a random sub-arrangement — one click
   for three columns. "random" is what SEEDING asks for, and panel.js asks explicitly. */
Panel.defaults = { dir: "row", template: "blank", align: "cc", tone: "surface", mode: "fill", grow: 1 };

export default Panel;

Item.register(Panel, "Panel");
