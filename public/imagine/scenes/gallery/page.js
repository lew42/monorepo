import { md } from "/app.js";
import { Scene, THREE } from "../Scene.js";

/* GRAIN 4 — THE CAMERA SWAP, and the 2D×3D marriage. Every picture in this room is
   an ordinary `<canvas>` drawn with the 2D API and hung on a plane: no image files,
   no fetches, the same `stage.paint()` that writes the name plates and the skies.

   And nothing in the room is rebuilt when you click one. A painting's page claims
   slot `spot` — which is a LIGHT, not scenery — and declares a `camera` two metres
   off the wall. The world is untouched; the deepest camera in the chain wins; the
   picture fills the view. doc/atmosphere.md */

const HERE = "/imagine/scenes/gallery/";

// Three painters, so a work below is a picture and nothing else.
const band = (ctx, x, y, w, h, stops) => {
	const ramp = ctx.createLinearGradient(0, y, 0, y + h);

	stops.forEach((color, i) => ramp.addColorStop(i / (stops.length - 1), color));
	ctx.fillStyle = ramp;
	ctx.fillRect(x, y, w, h);
};

const disc = (ctx, x, y, r, color) => {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
};

const hex = color => "#" + color.getHexString();

/* ⚠ `random` is `stage.rand(seed)`, never `Math.random()` — a painting has to look
   the same cold-loaded as it does when you walk in, like everything else here. */
export const WORKS = [
	{
		name: "stones", title: "Thin Stones", seed: 11,
		note: "Dawn, flattened. A `<canvas>` gradient, thirty seeded rectangles, one warm disc — hung on a plane in a room that is lit by the page's own theme.",
		draw(ctx, w, h, random){
			band(ctx, 0, 0, w, h, ["#c6d0e0", "#f1e4d3", "#f8efe1"]);
			disc(ctx, w * 0.73, h * 0.54, w * 0.075, "#ffcb9c");

			for (let i = 0; i < 30; i++){
				const tall = h * (0.14 + random() * 0.46);

				ctx.globalAlpha = 0.3 + random() * 0.55;
				ctx.fillStyle = "#a68e75";
				ctx.fillRect(random() * w, h * 0.66 - tall, w * (0.006 + random() * 0.012), tall);
			}

			ctx.globalAlpha = 1;
			band(ctx, 0, h * 0.66, w, h * 0.34, ["#e2d0ba", "#cbb499"]);
		},
	},
	{
		name: "disc", title: "The Disc", seed: 23,
		note: "Dusk, flattened — the same three colours the land is built from. The frame is lit by the room; the picture is not, so it reads the same in a bright gallery and a dark one.",
		draw(ctx, w, h, random){
			band(ctx, 0, 0, w, h, ["#0c0716", "#241a2e", "#5a3040"]);
			ctx.globalAlpha = 0.92;
			disc(ctx, w * 0.5, h * 0.63, h * 0.3, "#ff7a45");
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#0b0713";

			for (let i = 0; i < 15; i++){
				const tall = h * (0.22 + random() * 0.55);

				ctx.fillRect(random() * w, h * 0.73 - tall, w * (0.018 + random() * 0.05), tall);
			}

			band(ctx, 0, h * 0.73, w, h * 0.27, ["#181022", "#090610"]);
		},
	},
	{
		name: "motes", title: "Motes", seed: 37, tall: true,
		note: "Deep, flattened. A hundred and fifty seeded dots — the cheapest weather there is, and the only thing in the room that is taller than it is wide.",
		draw(ctx, w, h, random){
			band(ctx, 0, 0, w, h, ["#03121a", "#0a2a33", "#0d4450"]);

			for (let i = 0; i < 150; i++){
				ctx.globalAlpha = 0.15 + random() * 0.6;
				disc(ctx, random() * w, random() * h, w * (0.004 + random() * 0.009), "#59e0d0");
			}

			ctx.globalAlpha = 1;

			for (let i = 0; i < 12; i++){
				const tall = h * (0.05 + random() * 0.16);

				ctx.fillStyle = "#06202a";
				ctx.fillRect(random() * w, h * 0.87 - tall, w * (0.05 + random() * 0.1), tall);
			}
		},
	},
	{
		name: "chain", title: "The Chain", seed: 5, tall: true,
		note: "The mechanism, as a picture — four pages deep, the last one lit. The only work painted in the *page's* own colours, so it turns over with light and dark while the other three do not.",
		// The one picture that is not a land, and the only one that is theme-anchored.
		draw(ctx, w, h, random, theme){
			band(ctx, 0, 0, w, h, [hex(theme.sky), hex(theme.sky.clone().lerp(theme.ink, 0.14))]);

			ctx.strokeStyle = hex(theme.ink);
			ctx.globalAlpha = 0.3;
			ctx.lineWidth = w * 0.014;
			ctx.beginPath();
			ctx.moveTo(w / 2, h * 0.2);
			ctx.lineTo(w / 2, h * 0.8);
			ctx.stroke();

			[0.2, 0.4, 0.6, 0.8].forEach((at, i, all) => {
				const last = i === all.length - 1;

				ctx.globalAlpha = last ? 1 : 0.34;
				disc(ctx, w / 2, h * at, w * (0.13 - i * 0.012), last ? hex(theme.prim) : hex(theme.ink));
			});
		},
	},
];

const AT = i => (i - (WORKS.length - 1) / 2) * 3.35;   // where work `i` hangs on the wall
const WALL = -5.18;

export default new Scene({
	meta: import.meta,
	title: "Gallery",
	description: "2D in 3D — canvas paintings on a wall, each one a url.",
	classes: "scene-note",

	camera: { eye: [0, 2.15, 1.2], aim: [0, 2.05, WALL] },

	content(){ md("**Four paintings on a wall — click one to walk up and look at it close.** Nothing else in the room moves; only the light and the camera change to frame that one picture. (The paintings are drawn live with plain 2D canvas code, not image files.)"); },

	build(stage, theme){
		const world = new THREE.Group();
		const wall = theme.sky.clone().lerp(theme.ink, theme.dark ? 0.09 : 0.04);

		stage.sky(world, { fog: 22, power: 1.1, at: [5, 9, 8], rim: 0.5, shadow: 11 });

		// ⚠ The floor is darker than the wall in BOTH modes, which is not one lerp:
		//   in dark mode `ink` is nearly white, so `wall.lerp(ink)` lit the floor up
		//   and the room grew a bright bar along its bottom edge.
		const ground = stage.mesh(new THREE.BoxGeometry(18, 0.4, 16), theme.sky.clone().lerp(theme.ink, theme.dark ? 0.03 : 0.2));

		ground.position.set(0, -0.2, -1);
		ground.receiveShadow = true;
		world.add(ground);

		// The wall wash is the 2D kit again: a painted ramp multiplied over the wall
		// colour, so the room falls off toward the floor instead of reading as one
		// flat slab. Grayscale on purpose — the colour is still the theme's.
		const wash = stage.paint(4, 128, (ctx, w, h) => {
			const ramp = ctx.createLinearGradient(0, 0, 0, h);

			ramp.addColorStop(0, "#ffffff");
			ramp.addColorStop(0.55, "#d8d8d8");
			ramp.addColorStop(1, "#9a9a9a");
			ctx.fillStyle = ramp;
			ctx.fillRect(0, 0, w, h);
		});

		// A back wall and two returns — enough room to be in, and the fog eats the rest.
		[[0, 3.2, -5.4, 15, 0.3], [-7.35, 3.2, -0.2, 0.3, 11], [7.35, 3.2, -0.2, 0.3, 11]].forEach(([x, y, z, w, d]) => {
			const slab = stage.mesh(new THREE.BoxGeometry(w, 6.4, d), wall, { map: wash });

			slab.position.set(x, y, z);
			slab.receiveShadow = true;
			world.add(slab);
		});

		WORKS.forEach((work, i) => {
			const hung = this.hang(stage, theme, work);

			hung.position.set(AT(i), 2.15, WALL);
			stage.casts(hung);
			world.add(stage.link(hung, HERE + work.name + "/", work.title));
		});

		return world;
	},

	/* A picture: 2D art on a plane, a frame around it, a caption under it.
	   ⚠ The art is `MeshBasicMaterial` and `toneMapped: false` on purpose — unlit, so
	   a drawing reads exactly as drawn in a bright room and a dim one, and so
	   `stage.link()` skips it (no `emissive`) and the hover glow lands on the FRAME,
	   which is what a picture lighting up actually looks like. */
	hang(stage, theme, work){
		const group = new THREE.Group();
		const w = work.tall ? 1.55 : 2.35, h = work.tall ? 2.2 : 1.6;
		const map = stage.paint(work.tall ? 384 : 512, work.tall ? 545 : 349, (ctx, cw, ch) => work.draw(ctx, cw, ch, stage.rand(work.seed), theme));
		const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, toneMapped: false }));
		const plaque = stage.label(work.title, { size: 0.22 });

		group.add(stage.mesh(new THREE.BoxGeometry(w + 0.18, h + 0.18, 0.09), theme.ink.clone().lerp(theme.sky, theme.dark ? 0.3 : 0.1)));
		art.position.z = 0.05;
		plaque.position.set(0, -h / 2 - 0.3, 0.06);
		group.add(art, plaque);
		return group;
	},

	// The door-sign the foyer hangs over my post: three of my own pictures, framed,
	// turning. What is behind the door is literally what is painted on it.
	sign(stage, theme){
		const group = new THREE.Group();

		WORKS.slice(0, 3).forEach((work, i) => {
			const angle = i * Math.PI * 2 / 3;
			const card = new THREE.Group();
			const map = stage.paint(128, 88, (ctx, w, h) => work.draw(ctx, w, h, stage.rand(work.seed), theme));
			const art = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.38), new THREE.MeshBasicMaterial({ map, toneMapped: false, side: THREE.DoubleSide }));

			card.add(stage.mesh(new THREE.BoxGeometry(0.63, 0.45, 0.035), theme.ink.clone().lerp(theme.sky, 0.25)));
			art.position.z = 0.025;
			card.add(art);
			card.position.set(Math.sin(angle) * 0.36, 0, Math.cos(angle) * 0.36);
			card.rotation.y = angle;
			group.add(card);
		});

		return group;
	},

	children: WORKS.map((work, i) => new Scene({
		name: work.name,
		title: work.title,
		description: work.note,
		classes: "scene-note",
		slot: "spot",              // ⚠ a slot that holds ONE LIGHT — the room is the parent's, untouched
		work,
		// ⚠ Aimed BELOW the picture's middle, and one step further back than "fills
		//   the frame": at 2.4 the work filled the view and cropped its own caption.
		camera: { eye: [AT(i), 1.95, WALL + (work.tall ? 3.4 : 2.8)], aim: [AT(i), 1.95, WALL] },

		content(){ md(this.work.note); },

		// ⚠ `spot.target` has to be IN the graph or its world matrix is never updated
		//   and the cone points at the origin.
		build(){
			const group = new THREE.Group();
			const spot = new THREE.SpotLight(0xfff2e0, 30, 11, 0.45, 0.6, 1.5);

			spot.position.set(AT(i), 5.1, WALL + 2.1);
			spot.target.position.set(AT(i), 2.15, WALL);
			group.add(spot, spot.target);
			return group;
		},
	})),
});
