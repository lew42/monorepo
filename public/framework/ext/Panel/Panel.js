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
	get(key){
		// A document is rows. One answer, so `.panel-items.v`, `divide()`'s sibling test and
		// the inspector's own chip can never disagree about which way a document runs.
		if (key === "dir" && this.document()) return "col";

		return ((Panel.shared.includes(key) && this.master()) || this).data[key] ?? Panel.defaults[key];
	}

	/* Is this workspace a scrolling DOCUMENT rather than one screen? The root's word and only
	   the root's — `split()` hands a panel's data down to the first child, so a section can be
	   wearing `mode: document` and every reader here asks this instead of the key. */
	document(){ return !this.parent && this.get("mode") === "document"; }

	// Writing a shared key writes the MASTER, which is what makes every duplicate live.
	set(key, value){
		const to = Panel.shared.includes(key) && this.master();
		if (to) return to.set(key, value);

		super.set(key, value);

		/* ⚠ `mode` is the one word that changes the SHAPE of the tree rather than the look of
		   a panel — the root's axis, its column's `.v` class and every section's classes all
		   read it — so it announces itself as STRUCTURE and the workspace redraws. `change`
		   deliberately never does, which is why both control surfaces get this for free. */
		if (key === "mode" && !this.parent) this.emit("add");

		return this;
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

	/* The struck panel's LOOK, copied once — not shared live (`mirror()`). `Panel.shared`
	   minus what makes a copy a duplicate (`template seed text`), plus the struck panel's
	   own share of the row: `split.js`'s edge click reads this. design §5. */
	restyle(from){
		Panel.shared.filter(key => !["template", "seed", "text"].includes(key)).forEach(key => { this.data[key] = from.get(key); });
		this.data.grow = from.get("grow");
		return this;
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

		/* ⚠ `mode` is the ROOT's word about the whole workspace, so it stays with the panel
		   BECOMING the split — everything above is content, and content rides down. Without
		   this the first split of a document root hands `document` to its own first section
		   and the workspace snaps back to one screen. */
		if (mine.data.mode === "document"){ delete mine.data.mode; this.data.mode = "document"; }

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
/* ⚠ `h: "hug"` (2026-08-19) — a panel is a DIV in flow: its height is its content (never
   below `--panel-min`), its width fills. `fill` is still one click away, and a workspace
   that was handed a HEIGHT still divides it, because `hug` stretches on the cross axis
   when nothing chose a `self`. doc/sizing.md. */
Panel.defaults = { dir: "row", template: "blank", align: "cc", self: "tl", tone: "surface", mode: "fill", grow: 1, display: "block", w: "fill", h: "hug", position: "static",
	/* The flex and grid words (glyphs.js's `WORDS`). ⚠ Every default here is EXACTLY what
	   display.css hardcoded before they existed, so no saved document moves a pixel — and a
	   default that answers means every picker can show which chip is on. */
	gap: "0.5em", wrap: "nowrap", justify: "start", items: "stretch", cols: "auto", dense: "off" };

/* What a mirror takes from its master: WHAT it holds and HOW it looks. Its size and its
   place in its own row stay its own — a duplicate dropped into a narrow column is still
   that column's width, and `dir`/`grow`/`mode` are answers about a slot, not about content.
   ⚠ `text` is the purest case of what it holds — a copy showing different words is not a
   copy — and it works only BECAUSE `template` is shared beside it: text.js keys its
   overrides by the drawing they belong to, so master and mirror share one key space. */
/* ⚠ The flex and grid words join `display`, which they modify: a live duplicate showing
   the same content in a different arrangement is not a duplicate. `dir` deliberately does
   NOT — on a split it is the axis of a row of panels, which is an answer about a slot. */
Panel.shared = ["template", "tone", "align", "display", "seed", "text", "gap", "wrap", "justify", "items", "cols", "dense"];

export default Panel;

Item.register(Panel, "Panel");
