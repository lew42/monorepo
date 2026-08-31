import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Depictions",
	description: "Ancient art rumored to show aliens or anomalous craft — the artifact, the culture's own reading, the alien claim and who made it, and what a fair reader keeps as genuinely open.",

	content(){

		md("Famous claims that ancient art depicts visitors or their machines, read against what archaeologists, art historians and the cultures themselves actually say. Every subject gets both readings, each sourced and labeled **established** / **contested** / **fringe** / **speculation** — and ends with what would settle it. Raw research trail: [`log.jsonl`](./log.jsonl), 71 entries, 55 sources.");

		md.details(import.meta, "val-camonica.md", "Val Camonica — the 'astronauts' of the Camunian rock art");
		md.details(import.meta, "wandjina.md", "Wandjina — the Kimberley sky-beings");
		md.details(import.meta, "star-beings.md", "Hopi & Anasazi star-beings — Sego Canyon and the Blue Star Kachina");
		md.details(import.meta, "saqqara-bird.md", "The Saqqara Bird — model glider or bird figurine?");
		md.details(import.meta, "dendera-light.md", "The Dendera reliefs — 'light bulb' or lotus-birth?");
		md.details(import.meta, "pacal-rocket.md", "Pacal's sarcophagus — astronaut or World Tree?");
		md.details(import.meta, "renaissance-ufos.md", "Renaissance 'UFOs' — Madonna with Saint Giovannino");
		md.details(import.meta, "nazca-lines.md", "The Nazca lines — who were they for?");
		md.details(import.meta, "invented-traditions.md", "The recency signature — Dogon Sirius, Emerald Tablets, Kolbrin (round 2)");
		md.details(import.meta, "tassili-najjer.md", "Tassili n'Ajjer — the 'Great Martian God' of Sefar (round 2)");
		md.details(import.meta, "sky-iconography.md", "Why the shapes recur — the comparative art-history frame (round 2)");

		md("The pattern across the original eight: the alien reading is almost always older folk observation (an odd shape, a real ambiguity) plus a single 20th-century popularizer — usually Erich von Daniken — read back onto it. The scholarship rarely needs to argue hard against it; it mostly just finishes reading the object. Round 2 dug three more threads: claimed-ancient traditions with the same recency signature as the Blue Star Kachina, the ethnographic record on Wandjina repainting, an honest hunt for the one depiction that's still genuinely open (the Nazca 'Astronaut' figure), and what art history says about why the same shapes recur everywhere. Ongoing research program — [/imagine/research/](/imagine/research/).");
	},
});
