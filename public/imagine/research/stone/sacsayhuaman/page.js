import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Sacsayhuamán",
	description: "Cusco's interlocking polygonal walls — hammerstone replication versus the plant-softening legend, and the real logistics gap nobody has fully closed.",
	icon: "square_foot",
	width: "large",

	content(){ return md.file(import.meta, "../sacsayhuaman.md", { h1: false }); },
});
