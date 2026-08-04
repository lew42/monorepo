/* A typeface the app waits for.
 *
 * Next to App because App is the only thing that constructs one: `app.font()`
 * pushes the load promise onto `loaders`, and instantiate() awaits those before
 * inject(). So the first paint is already in the right face — without it every
 * cold load flashes the fallback, which on a 900-weight display face is not a
 * subtle flicker.
 */
export class Font {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* Both halves are required and neither is obvious: FontFace.load() fetches
	 * the file, document.fonts.add() is what makes the family usable in CSS.
	 * Do only the first and you download a font the page never uses. */
	async load(){
		this.face = new FontFace(this.name, `url(${this.url})`, this.options);
		document.fonts.add(await this.face.load());
		return this;
	}

	/* By name, and memoized — two pages asking for Montserrat share one fetch.
	 * The registry lookup lives here rather than in App because Font owns what a
	 * font name means; App only owns when to wait for it. */
	static load(name){
		if (!Font.fonts[name]) throw new Error(`unknown font "${name}" — add it to Font.fonts`);
		return Font.loading[name] ??= new Font(Font.fonts[name]).load();
	}
}

/* The faces this framework knows by name, so a site writes `app.font("Montserrat")`
 * and never a url. A plain object on purpose — a site adds its own with
 * `Font.fonts.Inter = { name, url, options }` and needs nothing from here.
 *
 * Both are Google's woff2, fetched at runtime rather than vendored. That is a
 * CDN dependency and it is a real one: offline, these silently fall back. It
 * stays because a webfont is a look, and looks belong to a theme that a site
 * may never load — vendoring would put ~166KB in the repo for everyone.
 *
 * The latin Montserrat file is VARIABLE (wght 100–900 in one 38KB file), which
 * is why `weight: "100 900"` is not a lie: the design leans on 900 Black and a
 * static 400 file would have the browser fake it. */
Font.fonts = {
	Montserrat: {
		name: "Montserrat",
		url: "https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2",
		options: { weight: "100 900" },
	},

	/* Ligature-based: `icon("dashboard")` renders the WORD dashboard and the
	 * font's `liga` feature swaps it for the glyph. So an unloaded Material
	 * Icons doesn't show a blank — it shows the word, which is the friendlier
	 * failure and also how you notice you forgot to load it. */
	"Material Icons": {
		name: "Material Icons",
		url: "https://fonts.gstatic.com/s/materialicons/v145/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
		options: { style: "normal", weight: "400" },
	},
};

Font.loading = {};   // name → promise

export default Font;
