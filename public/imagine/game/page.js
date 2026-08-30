import { Page, div, span, a, button, md, icon } from "/app.js";
import { store } from "../store.js";

/* Container: /imagine/'s column row — there is no page grid here, so `wide` means
   nothing and only `bleed` reaches an edge. Size: `small` 14em rails — the run, the
   realm — and a `large` room at the end (28em floor, 64em cap). Own layout: `flex v`
   stacks inside each column, one 3-column grid for the map, and ONE capped centred
   composition (`.imagine-open`) for the two written screens. Regions: core's, one per
   column. Preview: the default card.

   THE NAVIGATION IS THE GAME. There is no canvas and no loop: a realm is a page, a
   room is a page, an exit is a link to a SIBLING — so walking sideways swaps the
   deepest column in place while the rails to its left hold still, and walking down
   opens one. Nothing here knows it is a game except the words.

   THE STATE IS THE URL'S. Where you have been, what you carry and what you gave away
   live in this page's store, keyed on `/imagine/game/` (../store.js), so a cold load
   three columns deep after a reload finds a lit lamp and an unlocked cistern. The lock
   is what makes that visible: the Cistern needs the lamp, the Vault needs the key the
   Cistern holds, the gate shuts for the sigil the Vault holds — one chain, and it is
   only interesting because it survives.

   ROUND 2 — THE LOOP CLOSES. Three additions, each a rail row that changes state:
     · THE GATE (`end/`) is a real page and the run's ending. Locked while you have no
       sigil, and the only place that can erase a run.
     · THE TRADE. The Keeper in the Long Gallery wants a light and holds a ground lens.
       It is the only move that takes something OUT of the pack — one click shuts the
       Cistern behind you and opens the Lantern Room ahead of you, two rail rows moving
       in opposite directions. She will not deal until you carry the key, which is what
       makes the trade safe: the win chain is already complete when the lamp is spent.
     · THE MAP, in the run rail, always on screen. A walked room is a link; an unwalked
       one is an unlinked silhouette. It is drawn from `found`, so it cannot disagree
       with the HUD above it.

   ⚠ A room id is `realm/room`, not `room`. Names are only unique among siblings, and
     a bare name would have two realms sharing one visited mark. */

const WORLD = [
	{
		name: "verge", title: "The Verge", blurb: "Wind, and a gate nobody shut.",
		rooms: [
			{ name: "gate",   title: "Iron Gate",  scene: "The gate stands open on its own rust. There is a socket in the near post, the size of a coin, and nothing in it. Beyond, the path forks: down to the workings, up along the cliff." },
			{ name: "quarry", title: "Old Quarry", scene: "Cut stone, stacked and abandoned. A brass lamp hangs on a spike at head height, still full.", item: "lamp" },
			{ name: "steps",  title: "Wind Steps", scene: "Two hundred steps cut into the face. Halfway up, a door into the hill — the Hollow starts here." },
		],
	},
	{
		name: "hollow", title: "The Hollow", blurb: "Under the hill. Bring a light.",
		rooms: [
			{ name: "stair",   title: "Root Stair", scene: "Roots have taken the stair one step at a time. Something below is dripping on a long, patient interval." },
			{ name: "cistern", title: "Cistern",    scene: "Black water, waist deep and dead still. An iron key sits on the lip of the overflow, above the line.", item: "key", needs: "lamp",
			  shut: "Pitch dark, and the water is deeper than it looks. Come back with a light." },
			{ name: "kiln",    title: "Bone Kiln",  scene: "A firing chamber gone cold centuries back. The flue runs up and up — all the way to the Spire, by the draught." },
		],
	},
	{
		name: "spire", title: "The Spire", blurb: "Above the hill. Bring a key.",
		rooms: [
			{ name: "gallery", title: "Long Gallery", scene: "Windows on one side, doors on the other, all of them locked but one. A woman sits in the open doorway with a book she cannot read in this light, and a ground lens she is using as a paperweight.",
			  trade: { wants: "lamp", gives: "lens", after: "key" } },
			{ name: "vault",   title: "The Vault",    scene: "The lock turns like it was oiled last week. Inside, on a plain stand: a sigil of hammered tin, the size of a coin.", item: "sigil", needs: "key",
			  shut: "Locked, and the lock is good. Whatever opens it is down in the Hollow, under the water." },
			{ name: "lantern", title: "Lantern Room", scene: "The top. Glass on all four sides, the whole Verge below, and the gate a bright seam in the dark once the lens is back in its frame.", needs: "lens",
			  shut: "The Keeper's chair is across the door. She will move it for a light of her own." },
		],
	},
];

/* Four things, and the pack never holds more than three: the lamp buys the lens. A
   `carrying 3/4` line would be a target nobody can reach, so the HUD counts what you
   have and the chips say which — carried, given away, or not yet found. */
const ITEMS = { lamp: "Brass lamp", key: "Iron key", lens: "Ground lens", sigil: "Tin sigil" };

// The spine of the run, drawn on both written screens.
const CHAIN = [
	{ item: "lamp",  where: "Old Quarry" },
	{ item: "key",   where: "Cistern" },
	{ item: "sigil", where: "The Vault" },
];

// The ending — a real page at `end/`, cold-loadable, and a row in the rail from the
// first paint so the run always has somewhere to be going.
const GATE = {
	name: "end",
	title: "The Gate, Again",
	needs: "sigil",
	shut: "The gate stands open, the way it always has. The socket in the post is the size of a coin, and the only coin-sized thing in this place is in the Vault, at the top of the Spire.",
};

const ROOMS = WORLD.flatMap(realm => realm.rooms.map(room => realm.name + "/" + room.name));

export default new Page({
	meta: import.meta,
	title: "Game",
	description: "Three realms, nine rooms, a trade and a way out — a world walked entirely as columns and links.",
	icon: "explore",

	width: "small",
	classes: "imagine-game",

	is: "topic",

	initialize(){
		const saved = store(this).get({ found: [], carried: [], traded: [] });

		this.found = new Set(saved.found);
		this.carried = new Set(saved.carried);
		this.traded = new Set(saved.traded);
	},

	watch(fn){ (this.watchers ??= []).push(fn); fn(); },
	bump(){ this.watchers?.forEach(fn => fn()); },

	save(){ store(this).set({ found: [...this.found], carried: [...this.carried], traded: [...this.traded] }); },

	// Every write goes through the store, so there is no such thing as unsaved progress.
	enter(id){ if (this.found.has(id)) return; this.found.add(id); this.save(); this.bump(); },
	take(item){ this.carried.add(item); this.save(); this.bump(); },

	/* The one move that SPENDS. `take` only ever grows the pack; this shrinks it, and
	   the thing you gave up is remembered separately so a chip can say "gone" rather
	   than quietly reverting to "never had". */
	trade(gave, got){
		this.carried.delete(gave);
		this.traded.add(gave);
		this.carried.add(got);
		this.save();
		this.bump();
	},

	carrying(item){ return !item || this.carried.has(item); },
	won(){ return this.carried.has(GATE.needs); },

	seen(realm){ return [...this.found].filter(id => id.startsWith(realm + "/")).length; },
	finished(){ return WORLD.filter(realm => this.seen(realm.name) === realm.rooms.length).length; },

	/* THE ONLY ERASER, and it lives on the finale — one run, one way to end it. It
	   `clear()`s the key instead of writing an empty one: the next move re-creates it,
	   and until then the browser holds nothing about this game at all. `/imagine/team/`
	   keys on its own url and is untouched. */
	reset(){
		this.found.clear();
		this.carried.clear();
		this.traded.clear();
		store(this).clear();
		this.bump();
	},

	/* THE RUN RAIL, by hand — core's `column()` draws one flat label per child and a
	   realm row has to carry how much of it you have walked. Three parts, each its own
	   seam and its own watcher; everything inside one is a redraw, because 4 rows and
	   9 cells are not worth a diff. */
	hud(){
		return div.c("imagine-hud", $hud => this.watch(() => $hud.empty(() => {
			div.c("imagine-hud-line", () => {
				span("found");
				span.c("imagine-hud-n", this.found.size + "/" + ROOMS.length);
			});

			div.c("imagine-hud-line", () => {
				span("carrying");
				span.c("imagine-hud-n", this.carried.size + "");
			});

			div.c("imagine-items flex wrap gap", () => Object.entries(ITEMS).forEach(([id, label]) =>
				span.c("imagine-item")
					.ac(this.carried.has(id) && "imagine-have")
					.ac(this.traded.has(id) && "imagine-gone")
					.append(label)));
		})));
	},

	rail(){
		return div.c("imagine-rows", $rows => this.watch(() => {
			$rows.empty(() => {
				WORLD.forEach(realm => a.c("imagine-row").href(this.url + realm.name + "/").append(() => {
					span.c("imagine-row-name", realm.title);
					span.c("imagine-row-meta", () => {
						span(realm.blurb);
						span.c("imagine-load", this.seen(realm.name) + "/" + realm.rooms.length);
					});
				}));

				// The way out — the one row whose state IS the run's, from the first paint.
				a.c("imagine-row imagine-place")
					.ac(this.won() ? "imagine-seen" : "imagine-locked")
					.href(this.url + GATE.name + "/")
					.append(() => {
						span.c("imagine-row-name", GATE.title);
						span.c("imagine-row-meta", () => {
							span(this.won() ? "the way out" : "needs the " + ITEMS[GATE.needs].toLowerCase());
							icon(this.won() ? "flag" : "lock");
						});
					});
			});

			this.app?.router?.mark_links();
		}));
	},

	/* THE MAP. Nine cells and three labels in one grid, drawn from `found` — so it can
	   never disagree with the HUD one box above it. A walked room is an `<a>`; an
	   unwalked one is a `<span>` and cannot be clicked, which is the whole rule: the
	   map shows you the shape of the place without walking it for you. */
	map(){
		return div.c("imagine-map", $map => this.watch(() => {
			$map.empty(() => WORLD.forEach(realm => {
				span.c("imagine-label", realm.title);

				realm.rooms.forEach(room => {
					const id = realm.name + "/" + room.name;

					if (this.found.has(id)) a.c("imagine-map-cell imagine-map-on", room.name).href(this.url + id + "/");
					else span.c("imagine-map-cell", room.name).ac(!this.carrying(room.needs) && "imagine-map-shut");
				});
			}));

			this.app?.router?.mark_links();
		}));
	},

	column(host){
		return div.c("page-column-body page-column-small", () => {
			div.c("page-column-head", () => span.c("page-column-title", this.title));

			this.hud();
			this.rail();
			this.map();
		});
	},

	children: [

		/* THE ARRIVAL COLUMN. Without it /imagine/game/ is one 224px rail in a 1920
		   row and 88% of the screen is a grey field. It is a LEAF on purpose — a
		   `default` page that is itself routed into hides its own subtree (Page.css),
		   so an arrival column may never be a parent.

		   It opens with a composition, not a paragraph: eyebrow, display line, one
		   accent rule, one lede. The room chips it used to draw are gone — the map in
		   the rail owns room-level state now, and two devices saying one thing is how
		   a screen stops meaning anything. */
		{
			title: "Field notes",
			width: "large",
			classes: "default",

			content(){
				const run = this.topic();

				div.c("imagine-open", () => {
					span.c("imagine-eyebrow", "three realms · nine rooms · one chain");
					div.c("imagine-display", "The gate is open.");
					div.c("imagine-rule");
					div.c("imagine-lede", "Every room is a page and every exit is a link to the room beside it, so walking sideways swaps the column you are standing in while the rails behind you hold still. Where you have been is remembered against this page's own address — closing the tab loses nothing.");
				});

				div.c("imagine-notes flex v gap", $notes => run.watch(() => $notes.empty(() => {
					div.c("imagine-chain flex v-center wrap gap", () => CHAIN.forEach((step, index) => {
						if (index) span.c("imagine-arrow", "→");

						span.c("imagine-item")
							.ac(run.carried.has(step.item) && "imagine-have")
							.ac(run.traded.has(step.item) && "imagine-gone")
							.append(ITEMS[step.item] + " · " + step.where);
					}));

					WORLD.forEach(realm => div.c("imagine-note", () => {
						div.c("imagine-note-head flex v-center split", () => {
							a.c("imagine-exit", realm.title).href(this.parent.url + realm.name + "/");
							span.c("imagine-load", run.seen(realm.name) + "/" + realm.rooms.length + " walked");
						});

						span(realm.blurb);
					}));

					div.c("imagine-scene", run.won()
						? "The sigil is in your pack. The gate has been waiting for it."
						: run.carrying("key")
							? "You have the key. The Vault is the second door in the Long Gallery."
							: run.carrying("lamp")
								? "You have a light. The Hollow will let you in."
								: "Dark below. Something in the Old Quarry would help.");

					div.c("imagine-exits flex wrap gap", () => {
						a.c("imagine-exit", "Walk in — the Iron Gate").href(this.parent.url + "verge/gate/");
						if (run.won()) a.c("imagine-exit", GATE.title).href(this.parent.url + GATE.name + "/");
					});

					this.app?.router?.mark_links();
				})));

				md("Nine rooms, one chain, one trade and one way out — [how it is built](/imagine/game/readme/).");
			},
		},

		...WORLD.map(realm => ({
		name: realm.name,
		title: realm.title,
		blurb: realm.blurb,
		description: realm.blurb,

		/* `small`, and `hug` was TRIED here — it is the obvious candidate, three short
		   room names in a fixed 14em track. Measured at 1920: The Verge hugged to
		   128px and The Hollow to 183px, because one of its rows says "needs the brass
		   lamp". A rail whose width depends on which sibling you opened MOVES the
		   column beside it — 55px, every time you change realm. `hug` is for a column
		   whose content width is a constant (a legend, a keypad, a set of chips); a
		   nav rail is not one. */
		width: "small",

		// The realm rail: one row per room, marked visited, marked locked.
		column(host){
			const run = this.topic();

			return div.c("page-column-body page-column-small", () => {
				div.c("page-column-head", () => span.c("page-column-title", this.title));

				div.c("imagine-rows", $rows => run.watch(() => {
					$rows.empty(() => realm.rooms.forEach(room => {
						const id = realm.name + "/" + room.name, locked = !run.carrying(room.needs);

						a.c("imagine-row imagine-place")
							.ac(run.found.has(id) && "imagine-seen")
							.ac(locked && "imagine-locked")
							.href(this.url + room.name + "/")
							.append(() => {
								span.c("imagine-row-name", room.title);
								span.c("imagine-row-meta", () => {
									// The trade, said in the nav: the Gallery's line changes the
									// moment the Keeper has something to say to you.
									span(locked ? "needs the " + ITEMS[room.needs].toLowerCase()
										: room.trade && !run.carried.has(room.trade.gives) && run.carried.has(room.trade.after) ? "someone is waiting"
										: run.found.has(id) ? "walked" : "unwalked");

									if (room.item) icon(run.carried.has(room.item) ? "check" : "star");
								});
							});
					}));

					this.app?.router?.mark_links();
				}));
			});
		},

		// ⚠ The first room is the realm's arrival column, so a realm is never a 224px
		//   rail beside an empty row. A `default` page is BUILT, not activated, so it
		//   is readable without counting as walked — the honest reading: you are
		//   looking in from the stair, not standing in it.
		children: realm.rooms.map((room, index) => ({
			name: room.name,
			title: room.title,
			description: room.scene.split(".")[0] + ".",
			width: "large",
			classes: index === 0 ? "default" : undefined,

			content(){
				const run = this.topic(), id = realm.name + "/" + room.name;

				div.c("imagine-room flex v gap", $room => run.watch(() => $room.empty(() => {
					// A shut room says why in its OWN words; the rail says it in three.
					if (!run.carrying(room.needs)){
						div.c("imagine-shut", () => {
							icon("lock");
							span(room.shut);
						});
						return;
					}

					div.c("imagine-scene", room.scene);

					if (room.item) div.c("imagine-take flex v-center gap wrap", () => {
						span.c("imagine-item").ac(run.carried.has(room.item) && "imagine-have").append(ITEMS[room.item]);

						if (run.carried.has(room.item)) span.c("imagine-took", "in your pack");
						else div.c("imagine-seg flex", () => button.c("imagine-seg-btn", "take it").click(() => run.take(room.item)));
					});

					/* THE TRADE — same box as `take`, one more chip and an arrow, because
					   it is the same gesture with a price. The `after` guard is fiction
					   doing load-bearing work: she wants proof you have been down, which
					   is also the only thing standing between a player and a run that
					   cannot be finished. */
					if (room.trade) div.c("imagine-take flex v-center gap wrap", () => {
						const deal = room.trade;

						if (run.carried.has(deal.gives)){
							span.c("imagine-item imagine-have", ITEMS[deal.gives]);
							span.c("imagine-took", "she reads by your lamp now");
						} else if (run.carried.has(deal.wants) && run.carried.has(deal.after)){
							span.c("imagine-item imagine-have", ITEMS[deal.wants]);
							span.c("imagine-arrow", "→");
							span.c("imagine-item", ITEMS[deal.gives]);
							div.c("imagine-seg flex", () => button.c("imagine-seg-btn", "trade").click(() => run.trade(deal.wants, deal.gives)));
						} else {
							span.c("imagine-item", ITEMS[deal.gives]);
							span.c("imagine-took", "she will not deal with someone who has not been down");
						}
					});

					// Exits are links to SIBLINGS, so the column swaps where it stands —
					// plus the way out, once there is one, from wherever you are standing.
					div.c("imagine-exits flex wrap gap", () => {
						realm.rooms.filter(other => other !== room).forEach(other =>
							a.c("imagine-exit", other.title).href(this.parent.url + other.name + "/"));

						if (run.won()) a.c("imagine-exit", GATE.title).href(run.url + GATE.name + "/");
					});

					this.app?.router?.mark_links();
				})));

				md("*" + realm.title + "* · room " + (realm.rooms.indexOf(room) + 1) + " of 3 · walked " + "`" + id + "`");
			},

			// The one line that makes progress real. It runs on a cold load too, so
			// arriving straight at this url is walking here — unless the room is shut,
			// which is why the guard is here and not in the rail that drew the row.
			activated(){
				const run = this.topic();
				if (run.carrying(room.needs)) run.enter(realm.name + "/" + room.name);
			},
		})),
	})),

		/* THE ENDING. A real page, so it is cold-loadable and has a url a rail row can
		   point at from the first paint — and it is the same page in both states: shut
		   while the sigil is in the Vault, and the finale once it is in your pack. The
		   numbers are read off the store, never counted a second way. */
		{
			name: GATE.name,
			title: GATE.title,
			description: "The way out — it shuts for the tin sigil and nothing else.",
			width: "large",

			content(){
				const run = this.topic();

				div.c("imagine-room flex v gap", $end => run.watch(() => $end.empty(() => {
					if (!run.won()){
						div.c("imagine-shut", () => {
							icon("lock");
							span(GATE.shut);
						});

						div.c("imagine-exits flex wrap gap", () => a.c("imagine-exit", "The Spire").href(run.url + "spire/"));
						this.app?.router?.mark_links();
						return;
					}

					div.c("imagine-open", () => {
						span.c("imagine-eyebrow", "the run is closed");
						div.c("imagine-display", "The gate is shut.");
						div.c("imagine-rule");
						div.c("imagine-lede", "The sigil drops into the socket in the post and the leaves swing to on their own rust, for the first time in a long while. Behind you: the workings, the water under the hill, and a light in the lantern room if you left one there.");
					});

					div.c("imagine-chain flex v-center wrap gap", () => CHAIN.forEach((step, index) => {
						if (index) span.c("imagine-arrow", "→");

						span.c("imagine-item")
							.ac(run.carried.has(step.item) && "imagine-have")
							.ac(run.traded.has(step.item) && "imagine-gone")
							.append(ITEMS[step.item] + " · " + step.where);
					}));

					div.c("imagine-numbers flex wrap gap", () => [
						["rooms walked",    run.found.size + "/" + ROOMS.length],
						["realms finished", run.finished() + "/" + WORLD.length],
						["carried out",     run.carried.size + ""],
						["given away",      run.traded.size + ""],
						["the lantern",     run.found.has("spire/lantern") ? "lit" : "dark"],
					].forEach(([label, value]) => div.c("imagine-num", () => {
						span.c("imagine-hud-n", value);
						span.c("imagine-label", label);
					})));

					// ⚠ The caption that was here read as a SECOND segment of the control —
					//   `.imagine-took` is small caps by design and sat inside the same
					//   bordered box. What it said is in the line below the fold instead.
					div.c("imagine-seg flex", () => button.c("imagine-seg-btn", "start over").click(() => run.reset()));

					div.c("imagine-exits flex wrap gap", () => a.c("imagine-exit", "The Verge").href(run.url + "verge/"));
					this.app?.router?.mark_links();
				})));

				md("Everything above is three arrays under **one key** — " + "`" + "lew42:/imagine/game/" + "`" + ". *Start over* removes that key and nothing else; the team's board two columns away keys on its own url and never notices.");
			},
		},
	],
});
