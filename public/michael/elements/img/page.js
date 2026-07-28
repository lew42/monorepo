import { Page, p, img, figure, figcaption } from "/app.js";

// a tiny inline SVG so this page needs no asset file
const swatch = "data:image/svg+xml;utf8," + encodeURIComponent(
	`<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'>
	   <rect width='320' height='180' fill='#5a57ff'/>
	   <text x='50%' y='50%' fill='white' font-family='sans-serif' font-size='20'
	         text-anchor='middle' dominant-baseline='middle'>320 x 180</text>
	 </svg>`
);

export default new Page({
	meta: import.meta,
	title: "Image",
	description: "img is display:block, max-width:100% by default.",
	content(){
		p("The reset makes `img` `display: block` with `max-width: 100%`, so images never overflow their container or leave inline-gap artifacts. Resize the column to see it scale.");

		img().attr("src", swatch).attr("alt", "placeholder swatch");

		p("Wrapped in a `figure` with a `figcaption`:");

		figure(() => {
			img().attr("src", swatch).attr("alt", "placeholder swatch");
			figcaption("A placeholder swatch, 320×180.");
		});
	}
});
