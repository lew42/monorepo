import { Template } from "../Template.js";
import { div, h1, h2, h4, p } from "../../../View/View.js";
import { View } from "../../../View/View.js";

View.stylesheet(import.meta, "../../../../ext/Figma/palette/palette.css");

const FILLER = {
	mark: true,
	heading: "THE PALETTE",
	lead: "Three solid bases. A fixed set of approved tints. Every stack is explicit.",
	columns: [
		{ ground: "bg-white", label: "WHITE BASE", title: "White", text: "Primary text on white." },
		{ ground: "bg-prime", label: "PRIME BASE", title: "Prime", text: "Primary text on the approved prime tint." },
		{ ground: "bg-dark", label: "DARK BASE", title: "Dark", text: "Primary text on dark." },
	],
};

// The big white card of ext/Figma/palette: a mark, a heading, a lead line and a grid of column cards.
export class BigCard extends Template {

	static FILLER = FILLER;

	constructor(data = FILLER, ...args){ super(data, { name: "big-card" }, ...args); }

	// columns: [{label,title,text,ground}] become flat keys columns.0.title ...
	expand(data = {}){
		const { columns, ...rest } = data;
		const flat = { ...rest };
		if (columns){
			columns.forEach((c, i) => Object.entries(c).forEach(([k, v]) => { flat[`columns.${i}.${k}`] = v; }));
			flat["columns.count"] = columns.length;
		}
		return flat;
	}

	draw(){
		div.c("card wide", () => {
			div.c("flex v gap v-center", () => {
				if (this.get("mark")) div.c("pal-square");
				h1(() => this.show("heading"));
				p(() => this.show("lead"));
			});
			div.c("grid gap auto", () => {
				for (let i = 0; i < this.get("columns.count"); i++){
					div.c(`card ${this.get(`columns.${i}.ground`) ?? ""}`, () => {
						h4.c("muted", () => this.show(`columns.${i}.label`));
						h2(() => this.show(`columns.${i}.title`));
						p(() => this.show(`columns.${i}.text`));
					});
				}
			}).style("--column", "16em");
		});
	}
}

export default BigCard;
