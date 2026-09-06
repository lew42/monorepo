import { View, div, span, select, option, input, icon } from "/app.js";
import { BLOCKS, SURFACES, controls_of, is_url, is_off_site } from "./blocks.js";
import { PRESETS, preset_of, preset_url } from "./presets.js";
import { fill_drawer, copy_chip } from "./config.js";

/* ── THE TOOLBAR ───────────────────────────────────────────────────────────────

   The control surface of the realm: every word this page is made of, as a labelled
   group of chips, sitting ABOVE the stage. Click a chip and the page under it
   changes; the caption under the stage says what that did, in pixels.

   ⚠ IT SITS ABOVE THE STAGE, IN THE FLOW — it does not float over it. It used to:
     the bar was `position: absolute` at the stage's top edge, and it appeared on
     hover, which meant that on the realm's own front page it covered the demo's tab
     strip. Moving the mouse toward a tab made the bar appear ON the tab, so the tab
     could not be clicked with a mouse at all, at any width — the headline gesture of
     the realm, unreachable (paging-audit-2, break #1; measured again here: a
     Playwright click on "Pricing" timed out at 1280 and at 3440). A control that
     covers the thing it controls is not a control. It now reserves its own height.

   ⚠ ONE DROPDOWN PER WORD, NOT A ROW OF CHIPS. Seven words means 40 values, and as
     chip groups that was a sprawling bar three and four rows deep (the owner,
     2026-09-05: *"if there are button groups, just make them a dropdown to save
     space"*). Seven labelled dropdowns fit one row at 3440 and two at 1280.

   ⚠ AND NOTHING CLIPS. The bar HAD native selects until this morning and they were
     80–111px wide, cutting their own values off ("Top tabs" read "Top tab") — because
     a `<select>` in a flex row shrinks below its content like any other flex item.
     `flex: none` on the control and `width: auto` on the select is the whole fix: the
     browser then sizes each one to its longest option. There is no width in this file.

   ⚠ THE LABEL SITS ABOVE THE SELECT, not beside it. Beside, seven labelled controls
     are ~1190px and wrap to three rows in a 1040px middle at 1280; above, they are
     ~770px and fit one row, and the bar is two lines tall instead of four.

   ⚠ A COLOUR YOU CAN SEE. `surface` and `background` are the two controls whose value
     is a thing rather than a word, so each keeps one dot beside its dropdown painted
     in the colour it is currently set to. A dropdown alone cannot show you `prim`.  */

// The two words whose current value is painted beside the dropdown.
const COLOURS = ["surface", "background"];

/* The `content` dropdown's ninth entry. It is not a content word — it is the way to
   type one, and the value the select shows while `content` is holding a url. */
const ADDRESS = "…url";

const press = ($el, act) => $el
	.attr("role", "button").attr("tabindex", "0")
	.click(act)
	.on("keydown", event => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		act();
	});

export class PagingToolbar extends View {

	// ⚠ Before `super.initialize()`, which IS the render (View.initialize calls
	//   `append(this.render)`) — a hook registered after it would miss nothing today,
	//   but the field order is the one this class must not get wrong twice.
	initialize(){
		// The stage tells me when anything changed it — a chip here, a control in the
		// drawer, or the library's own dropdown. One hook, one direction.
		this.stage.changed = () => this.sync();
		super.initialize();
	}

	// ⚠ The class NAME is the css class: `View.classify()` lowercases every
	//   constructor in the chain, so `PagingToolbar` is `.paging-toolbar` and a class
	//   called `Toolbar` would have worn the framework's own `.toolbar`.
	render(){
		this.picks = new Map();
		this.dots = new Map();

		div.c("paging-toolbar-row", () => {
			this.shape();

			/* ⚠ ONE GROUP PER BUILDING BLOCK, not one per word. The rail says six
			     blocks; the bar used to say seven labels, three of which were Skin —
			     so a newcomer counted three sets of names for one realm
			     (paging-audit-4). Now the bar's labels ARE the rail's, in the rail's
			     order, and SKIN holds its three controls under one heading. */
			BLOCKS.forEach(block => this.block_group(block));

			div.c("paging-group paging-toolbar-outs", () => {
				this.code();
				this.more();
			});

			/* ⚠ THE ADDRESS IS ITS OWN LINE, UNDER THE SEVEN WORDS. It used to sit
			     inside the `content` dropdown's own group, which made that ONE group
			     106px tall against its four siblings' 57, pushed its label 50px above
			     theirs and wrapped `Draw it` onto a second line — so the moment you
			     typed an address the row of seven words stopped looking like a row
			     (paging-audit-6, item 1). A full-width line under them costs the bar
			     nothing when it is hidden, and gives the field the whole row when it
			     is not. */
			this.address();
		});

		// The values are written by the same call an external change uses, so there is
		// one place that decides what the bar is showing.
		this.sync();
	}

	/* ── THE EIGHTH CONTROL: WHICH READY-MADE PAGE ────────────────────────────
	   On the twelve library pages, the one thing you change that is not a single word
	   is WHICH ready-made page you are looking at — so it belongs in the bar, in the
	   same shape as the other seven, showing the name of the page that is running.

	   It used to be a grey chip-button sitting ABOVE the bar reading "Pick one of
	   twelve" — an eighth control in a ninth style, and it read as UNSET while the
	   blog preset was already running underneath it (paging-audit-3, item 5).

	   ⚠ ONLY WHERE THERE IS ONE. A page says which ready-made page it is by carrying
	     a `shape` (`library/page.js`); every other page in the realm has none, and
	     gets the seven words alone — a control that navigates has no business in the
	     bar of a page it cannot name. */
	shape(){
		const here = this.page?.shape;
		if (!here) return null;

		return div.c("paging-group").append(() => {
			span.c("paging-pick-label", "page shape");

			div.c("paging-pick", () => {
				const $select = select(() => PRESETS.forEach(preset => option(preset.title).attr("value", preset.id)))
					.attr("title", "page shape")
					.attr("aria-label", "page shape")
					.on("change", event => this.go_to(event.target.value));

				$select.el.value = here.id;
			});
		});
	}

	// A real navigation, through core's own Router — so the address changes, the back
	// button works, and the page you land on is the preset's own url with its own words.
	go_to(id){
		this.page?.app?.router?.go(preset_url(preset_of(id)));
		return this;
	}

	/* ── ONE BUILDING BLOCK'S CONTROLS ────────────────────────────────────────
	   Five of the six blocks own exactly one word, so the block's name and the
	   control's label are the same thing and there is one dropdown under it. SKIN
	   owns three — the content's colour, the page's colour and the type size — so its
	   heading is SKIN and each dropdown keeps its own small caption underneath it.
	   STAGE owns none: it is the box the other five words act on, so it has nothing
	   in the bar and its own page says so. */
	block_group(block){
		const controls = controls_of(block.id);
		if (!controls.length) return null;

		if (controls.length === 1) return this.group(controls[0], controls[0].label);

		return div.c("paging-group paging-group-many").append(() => {
			span.c("paging-pick-label", block.title);
			div.c("paging-group-row", () => controls.forEach(control => this.group(control, control.label, true)));
		});
	}

	// ── one labelled dropdown ────────────────────────────────────────────────
	group({ axis, label, values }, heading, small){
		return div.c("paging-group").ac(small && "paging-group-small").append(() => {
			span.c("paging-pick-label", heading);

			div.c("paging-pick", () => {
				if (COLOURS.includes(axis)) this.dots.set(axis, span.c("paging-dot"));

				const $select = select(() => {
					values.forEach(value => option(value.title).attr("value", value.id).attr("title", value.means));

					// ⚠ ONE WORD HAS A NINTH ANSWER. See `address()` below.
					if (axis === "content") option("A page or file…").attr("value", ADDRESS)
						.attr("title", "the address of a page, or of a .md file — it is fetched and drawn in the box");
				})
					.attr("title", label)
					.attr("aria-label", label)
					.on("change", event => this.chose(axis, event.target.value));

				this.picks.set(axis, $select);
			});

		});
	}

	// Picking a value sets the word. Picking "A page or file…" is not a value — it
	// opens the field where you type one, which is the next thing your eye needs.
	chose(axis, value){
		if (value !== ADDRESS) return this.stage.set(axis, value);

		this.show_address(true);
		this.$address_field?.el?.focus();
		return this;
	}

	/* ── THE NINTH ANSWER TO "WHAT IS IN THE BOX": AN ADDRESS ─────────────────
	   Eight canned samples were the last CLOSED list in the realm — every one of its
	   ~100,000 configurations held one of eight things, which is what kept *infinite
	   potential* off full marks for five audits (paging-audit-5). `content` takes a
	   url now, exactly the way `nest` does: a PAGE's address is fetched as its
	   `page.json` and run inside the box, and a `.md` address is fetched and rendered
	   as prose (`stage.js`). This is where you type one.

	   ⚠ HIDDEN UNTIL IT IS WANTED. Seven dropdowns already fit one row at 3440 and two
	     at 1280; a permanent text field under one of them would add a row to the bar
	     over every page in the realm for a control most readers never touch. */
	address(){
		return this.$address = div.c("paging-address paging-address-off", () => {
			span.c("paging-pick-label", "the address in the box");

			this.$address_field = input().ac("paging-address-field").attr("type", "text")
				.attr("aria-label", "the address of a page or a .md file")
				.attr("placeholder", "/imagine/paging/make/notes/   or   /notes/auth/readme.md");

			const put = () => {
				const url = (this.$address_field.el.value || "").trim();
				if (url) this.stage.set("content", url);
			};

			this.$address_field.on("keydown", event => {
				if (event.key !== "Enter") return;
				event.preventDefault();
				put();
			});

			press(span.c("paging-act").attr("title", "read that address and draw it in the box")
				.append(() => { icon("open_in_new"); span("Draw it"); }), put);

			/* ⚠ A GETTER, NOT THE STRING. The field is typed in, so a value captured
			     here would copy whatever the box held when the page loaded
			     (`config.js` `copy_chip`). 56 characters in a 153px field is a thing
			     you cannot read, and it was the second half of item 2. */
			copy_chip(() => this.$address_field.el.value, "Copy",
				() => this.$address_field.el.select(),
				said => this.$address_said?.empty(said));

			this.$address_said = span.c("paging-said-ok");

			// The one address this box will not read, said where you typed it.
			this.$address_note = span.c("paging-address-note");
		});
	}

	/* AN ADDRESS THIS BOX WILL NOT READ, SAID AT THE FIELD. `https://…` is a legal
	   thing to type and this site cannot fetch it (`blocks.js` `is_off_site`), so the
	   value is kept, shown and refused — rather than silently dropped while the url
	   went on carrying it (paging-audit-6, item 4). */
	note_address(url){
		this.$address_note?.empty(() => {
			if (!is_off_site(url)) return;
			span("Off-site — not read. An address here starts with / : a page you made, a ready-made page, or a .md file.");
		});

		return this;
	}

	show_address(on){ this.$address?.[on ? "rc" : "ac"]("paging-address-off"); return this; }

	/* ── THE WAY OUT ──────────────────────────────────────────────────────────
	   Seven words are a page, and a page has to be able to stop being seven words.
	   This opens the same drawer `More` does, and it is labelled for the one thing a
	   reader goes looking for: the `page.js` this configuration would be, ready to
	   copy into a directory of your own. (Build has printed its nodes since it
	   shipped; the stage had no way out at all until now.) */
	code(){
		/* ⚠ NOT ON A PAGE THAT ALREADY PRINTS ITS OWN. Build shows the `page.js` for the
		     node you are building, full-width, as its fourth control — so this button
		     would open a drawer to show you a second copy of a box already on screen
		     (paging-audit-7b, fix 4). One code box per screen. */
		if (this.page?.prints_own_file) return null;

		return press(span.c("paging-more paging-more-quiet")
			.attr("title", "the page.js this page would be, ready to copy")
			.append(() => { icon("code"); span("Code"); }),
			() => fill_drawer(this.stage, this.page, "code"));
	}

	// ── everything else lives in the drawer ──────────────────────────────────
	// The whole form with its sentences, the JSON, the page.js, the link to this
	// exact configuration, `nest`, and "make this a page".
	more(){
		return press(span.c("paging-more")
			.attr("title", "the whole configuration, the code, and the link to this page")
			.append(() => { icon("tune"); span("More"); }),
			() => fill_drawer(this.stage, this.page));
	}

	/* ⚠ SYNC, NEVER REBUILD. A `<select>` fires `change` while it still has focus, and
	     emptying this view from inside that handler would delete the element the reader
	     is standing on. So the controls are built once and only their VALUES are
	     written back — which is also what keeps an external change (the drawer, the
	     library's own menu, a url) showing up here. */
	sync(){
		// ⚠ A URL IS NOT ONE OF THE EIGHT OPTIONS, so writing it into the select would
		//   leave the dropdown blank. It shows "A page or file…", and the field under it
		//   shows the address itself — which is the honest pair.
		/* ⚠ `stage.word(axis)`, NEVER `stage.config[axis]`. Six of the seven words belong
		     to the whole demo and the seventh — `content` — belongs to the page at the
		     CURRENT PATH, so with a child open this dropdown is editing that child and
		     has to show that child's word. `word()` is the one reader (`stage.js`). */
		this.picks?.forEach(($select, axis) => {
			const value = this.stage.word(axis);
			$select.el.value = is_url(value) ? ADDRESS : value;
		});

		const content = this.stage.word("content");
		if (is_url(content)){
			if (this.$address_field) this.$address_field.el.value = content;
			this.show_address(true);
			this.note_address(content);
		}

		this.dots?.forEach(($dot, axis) => {
			$dot.rc(...SURFACES.map(surface => "page-surface-" + surface.id))
				.ac("page-surface-" + this.stage.word(axis));
		});

		return this;
	}
}

export const Toolbar = PagingToolbar;
export default PagingToolbar;
