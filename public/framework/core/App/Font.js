export class Font {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// ⚠ Both halves are required: `FontFace.load()` fetches the file,
	// `document.fonts.add()` is what makes the family usable in CSS.
	async load(){
		this.face = new FontFace(this.name, `url(${this.url})`, this.options);
		document.fonts.add(await this.face.load());
		return this;
	}

	// Memoized — two pages asking for Montserrat share one fetch.
	static load(name){
		if (!Font.fonts[name]) throw new Error(`unknown font "${name}" — add it to Font.fonts`);
		return Font.loading[name] ??= new Font(Font.fonts[name]).load();
	}
}

// A site adds its own with `Font.fonts.Inter = { name, url, options }`.
// ⚠ Fetched from Google's CDN at runtime, not vendored — offline these silently
// fall back. readme.md and doc/fonts.md say why that trade stands.
Font.fonts = {
	Montserrat: {
		name: "Montserrat",
		url: "https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2",
		options: { weight: "100 900" },   // one VARIABLE file, not a lie
	},

	"Material Icons": {
		name: "Material Icons",
		url: "https://fonts.gstatic.com/s/materialicons/v145/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
		options: { style: "normal", weight: "400" },
	},
};

Font.loading = {};   // name → promise

export default Font;
