import { Page, View, div, span, button, md } from "/app.js";

/* Ported from Codrops' "Type Shuffle Animation" (MIT) — three of its six effects
   (fx1 "cascade", fx3 "scramble", fx6 "glitch") — see type-shuffle.css for the licence
   note; the table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "type-shuffle.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep — see
   grid-hover/page.js's comment for the measurement). Own layout: prose, the shuffle
   stage (one phrase, split into per-character spans), a row of three trigger buttons.
   Regions: one. Preview: default card. */

const PHRASE = "Every character finds its place";
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*()-_+=/[]{};:<>,0123456789".split("");
const random_char = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
const random_color = () => ["#3e775d", "#61dca3", "#61b3dc", "#dc9d61", "#dc6187"][Math.floor(Math.random() * 5)];

export default new Page({
	meta: import.meta,
	title: "Type shuffle",
	description: "Three buttons, three ways the same phrase can scramble into place.",
	icon: "text_fields",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' Type Shuffle, rebuilt.** Press a button below and the phrase scrambles into place, letter by letter — three ways, chosen from the original's six.");

		div.c("codrops-shuffle-stage", ($stage) => {
			this.$shuffle_stage = $stage;
			PHRASE.split(" ").forEach(word => {
				span.c("codrops-shuffle-word", () => {
					[...word].forEach(ch => span.c("codrops-shuffle-char", ch));
				});
			});
		});

		div.c("flex wrap gap", () => {
			this.$btn_cascade = button.c("codrops-shuffle-btn", "Cascade").click(() => this.run_shuffle("cascade"));
			this.$btn_scramble = button.c("codrops-shuffle-btn", "Scramble").click(() => this.run_shuffle("scramble"));
			this.$btn_glitch = button.c("codrops-shuffle-btn", "Glitch").click(() => this.run_shuffle("glitch"));
		});

		md("**What carried over:** the three loops themselves, unchanged — `cascade` copies each cell's PREVIOUS value forward every tick (the trick that makes letters look like they slide in from the left), `scramble` staggers each cell's own random-then-settle loop by its position, `glitch` does the same while also randomizing colour. **What didn't:** Splitting.js, dropped — this page wraps each word and character in a `<span>` itself (`word => [...word].forEach(...)`), one call instead of a library. `prefers-reduced-motion` skips every loop: a button press jumps straight to the settled phrase, no scrambling frames at all.");
	},

	activate(){
		Page.prototype.activate.call(this);
		this.shuffle_cancelled = false;
		return this;
	},

	deactivate(){
		this.shuffle_cancelled = true;
		return Page.prototype.deactivate.call(this);
	},

	cells(){
		return [...this.$shuffle_stage.el.querySelectorAll(".codrops-shuffle-char")].map((el, i) => ({ el, i, original: el.textContent }));
	},

	set_buttons(disabled){
		[this.$btn_cascade, this.$btn_scramble, this.$btn_glitch].forEach($b => $b.el.disabled = disabled);
	},

	run_shuffle(effect){
		if (this.shuffle_running) return;
		const cells = this.cells();

		// Whole effect IS motion (`layout` skill / this realm's readme rule 5) — reduced
		// motion skips every scrambling frame and jumps straight to the settled phrase.
		if (matchMedia("(prefers-reduced-motion: reduce)").matches){
			cells.forEach(cell => cell.el.textContent = cell.original);
			return;
		}

		this.shuffle_running = true;
		this.set_buttons(true);

		const total = cells.length;
		let finished = 0;
		const done = () => {
			finished++;
			if (finished === total){
				this.shuffle_running = false;
				this.set_buttons(false);
			}
		};

		if (effect === "cascade") this.shuffle_cascade(cells, done);
		else if (effect === "glitch") this.shuffle_glitch(cells, done);
		else this.shuffle_scramble(cells, done);
	},

	// fx1 — clear every cell, then each cell's new value is the PREVIOUS cell's value from
	// one tick ago; the illusion is letters sliding in from the left, one cache-copy deep.
	shuffle_cascade(cells, done){
		const MAX = 30;
		cells.forEach(cell => cell.el.textContent = "");

		const loop = (cell, iteration = 0) => {
			if (this.shuffle_cancelled) return;
			cell.cache = cell.el.textContent;

			if (iteration === MAX - 1){
				cell.el.textContent = cell.original;
				done();
				return;
			} else if (cell.i === 0){
				cell.el.textContent = random_char();
			} else {
				cell.el.textContent = cells[cell.i - 1].cache;
			}

			setTimeout(() => loop(cell, iteration + 1), 20);
		};

		cells.forEach(cell => loop(cell));
	},

	// fx3 — every cell scrambles independently, staggered by a random start delay.
	shuffle_scramble(cells, done){
		const MAX = 10;

		const loop = (cell, iteration = 0) => {
			if (this.shuffle_cancelled) return;

			if (iteration === MAX - 1){
				cell.el.textContent = cell.original;
				done();
				return;
			}

			cell.el.textContent = random_char();
			setTimeout(() => loop(cell, iteration + 1), 80);
		};

		cells.forEach(cell => setTimeout(() => loop(cell), Math.random() * 400));
	},

	// fx6 — a random character AND a random colour every tick, staggered per position.
	shuffle_glitch(cells, done){
		const MAX = 14;

		const loop = (cell, iteration = 0) => {
			if (this.shuffle_cancelled) return;

			if (iteration === MAX - 1){
				cell.el.textContent = cell.original;
				cell.el.style.color = "";
				done();
				return;
			}

			cell.el.textContent = random_char();
			cell.el.style.color = random_color();
			setTimeout(() => loop(cell, iteration + 1), 40 + Math.random() * 40);
		};

		cells.forEach(cell => setTimeout(() => loop(cell), cell.i * 60));
	},
});
