import { md } from "/app.js";
import { Scene, THREE } from "./Scene.js";
import worlds from "./worlds/page.js";
import plinth from "./plinth/page.js";
import quarters from "./quarters/page.js";
import gallery from "./gallery/page.js";
import observatory from "./observatory/page.js";
import tour from "./tour/page.js";

/* THE FOYER — the hub, and the artistic half of the brief: a lit rotunda with four
   doors in it, wrapped in ordinary 2D chrome (a path bar, a row of text links, a
   note). The canvas is TRANSPARENT and the CSS box behind it is the sky, so the
   gradient overhead is a stylesheet and the room under it is three.js.

   ⚠ EVERY DOOR IS DRAWN BY THE WORLD BEHIND IT. Each child owns a `sign(stage,
   theme)` returning a live miniature of its own grain — three arches, a plinth
   swapping its mesh, a plate lifting a corner, three of the gallery's own pictures
   — so a portal cannot go stale or lie about what it opens. The four are imported
   statically for exactly that reason: `children:` alone resolves them one dynamic
   import later, and the first build would have nothing to ask. */
export default new Scene({
	meta: import.meta,
	title: "Scenes",
	description: "A 3D pager: the page tree is the scene graph. Click an object to navigate.",
	icon: "3d_rotation",
	children: "worlds plinth quarters gallery observatory tour",

	/* ⚠ THE DOORS, NOT THE CHILDREN — and that one word is what lets a child exist
	   without a post in the colonnade. `tour` is a way of MOVING through these worlds,
	   not a sixth world, so it takes a chip in the text row (which is derived from
	   `children`) and stays out of the room. A sixth post would also have said, wrongly,
	   that there is a fifth grain of swap. */
	doors: { worlds, plinth, quarters, gallery, observatory },

	// Scene.nav_row() asks this for its controls while a tour is running — the tour is
	// deactivated by its own first waypoint, so the host is what keeps it on screen.
	tour,

	// I own the canvas — Scene.stage_host() looks for this word, and everything
	// below me opts out of `/imagine/`'s columns because of it.
	scenic: true,

	// A canvas is the "swap into the correct area" case, which is what `full` is
	// for: `/imagine/`'s rail collapses into the crumb strip above the row.
	width: "full",
	classes: "scene-page",

	camera: { eye: [0, 2.8, 6.6], aim: [0, 2.3, 0] },

	content(){
		md("**A 3D showroom of five small worlds.** Click an object in the room below — or a name in the list underneath it — to step inside one and look around.\n\nEach door swaps a different piece of the shared room instead of rebuilding the whole thing: a whole world, one object, one region, or one light. The fifth door, Observatory, uses all four at once. [How the swap actually works](./readme/), or [take the tour](/imagine/scenes/tour/) and let a clock walk you through all five doors.");
		this.staging();
	},

	build(stage, theme){
		const world = new THREE.Group();
		const ground = theme.sky.clone().lerp(theme.ink, theme.dark ? 0.3 : 0.17);

		// A low key so the posts throw long shadows across the floor, and a rim from
		// behind so every silhouette has an edge against a pale sky.
		stage.sky(world, { fog: 25, near: 0.5, power: 1.5, at: [6, 8, 7], rim: 0.55, shadow: 10 });
		stage.floor(world, ground, 21);
		world.add(this.pool(stage, theme));

		// Three quiet rings, so the floor reads as a place rather than a plane.
		[3.4, 6, 8.4].forEach(r => {
			const ring = new THREE.Mesh(
				new THREE.RingGeometry(r - 0.012, r + 0.012, 128),
				new THREE.MeshBasicMaterial({ color: theme.line, transparent: true, opacity: 0.8 })
			);

			ring.rotation.x = -Math.PI / 2;
			ring.position.y = 0.01;
			world.add(ring);
		});

		const doors = Object.keys(this.doors);

		world.userData.portals = doors.map((name, i) => this.portal(stage, theme, ground, name, i, doors.length));
		world.add(...world.userData.portals);
		return world;
	},

	// The one warm thing on the floor, and the seam back to the 2D half: the accent
	// blooming up from behind the horizon is a `background-image` in scenes.css, and
	// this is the same bloom lying on the ground, painted with the same 2D kit.
	pool(stage, theme){
		const map = stage.paint(128, 128, (ctx, w) => {
			const glow = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);

			glow.addColorStop(0, "#" + theme.prim.getHexString());
			glow.addColorStop(1, "rgba(0, 0, 0, 0)");
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, w, w);
		});

		const disc = new THREE.Mesh(
			new THREE.PlaneGeometry(20, 20),
			new THREE.MeshBasicMaterial({ map, transparent: true, opacity: theme.dark ? 0.3 : 0.22, depthWrite: false, toneMapped: false })
		);

		disc.rotation.x = -Math.PI / 2;
		disc.position.set(0, 0.02, -1);
		return disc;
	},

	/* A post, the world's own sign turning above it, and its name. All three are in
	   the linked group — a Sprite raycasts, so the plate is part of the door.
	   ⚠ A colonnade, not a ring: on an arc of any radius worth having, the outer
	   doors sit far closer to the camera than the inner ones and read twice the size.
	   Spread across x, bowed back a little, and all five are the same door.
	   ⚠ The gap is DERIVED, not the flat 3.5 four doors were built with: at 400 the
	   widened fov and the dolly leave about ±6.3 units of world in frame, and a fifth
	   door at 3.5 would have stood at 7. The colonnade keeps its total width instead. */
	portal(stage, theme, ground, name, i, count){
		const door = this.doors[name];
		const spread = i - (count - 1) / 2;
		const gap = 13.2 / count;
		const post = new THREE.Group();
		const sign = door.sign(stage, theme);
		const plate = stage.label(door.title, { size: 0.34 });

		const stem = ground.clone().lerp(theme.ink, 0.62);

		post.add(stage.mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.5, 24), stem).translateY(0.75));
		post.add(stage.mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 32), stem).translateY(1.53));
		sign.position.y = 2.3;
		plate.position.y = 3.2;
		post.add(sign, plate);

		post.position.set(spread * gap, 0, 0.6 - Math.abs(spread) * 0.7);
		post.userData.sign = sign;
		post.userData.phase = i * 1.7;

		stage.casts(post);
		return stage.link(post, this.nav_for(name).url, door.title);
	},

	// Each sign turns; one that wants more than turning hangs its own `tick` on
	// itself when it is built, and this calls it.
	tick(dt, world){
		world.userData.portals?.forEach(post => {
			const sign = post.userData.sign;

			sign.rotation.y += dt * 0.45;
			sign.position.y = 2.3 + Math.sin(post.userData.phase += dt) * 0.08;
			sign.userData.tick?.(dt, sign);
		});
	},
});
