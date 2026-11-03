import { md, div, span } from "/app.js";
import { Scene, THREE } from "../Scene.js";
import { PLATES, VELA, rand, plate_canvas } from "./plates.js";

/* THE OBSERVATORY — the fifth door, and the one that uses all four grains at once.
   The other four doors each teach one size of swap; this one is a place where a
   region, an object, a camera and a light are four ways of looking through the same
   instrument, on the same night.

     Vela      slot `sky`     a patch of sky is built        REGION
     The Ring  slot `plate`   one plate stands on the easel  OBJECT
     Eyepiece  no slot        no build() at all              CAMERA
     Daybreak  slot `hour`    a warm light, and the stars go out   LIGHT

   And one new sentence about the mechanism, which is why this world exists: a
   persistent object can RESPOND to the chain without ever being rebuilt. The
   telescope belongs to this page's `world` slot and is never touched — it reads the
   deepest `look` in the active chain, exactly the way `compose()` reads the deepest
   `camera`, and turns. "The rest persists" and "the rest is inert" are not the same
   claim. doc/observatory.md */

const HERE = "/imagine/scenes/observatory/";

// Where the instrument parks, and the patch of sky the chart on plate 041 maps onto.
// ⚠ Parked OFF the axis, deliberately: aimed straight down -Z the tube points away
//   from the default camera and reads as a stub. A telescope wants a profile.
const REST = [-15, 7, -24];
const SKY = { x: 0, y: 17, z: -40, w: 30, h: 20 };
const MOUNT = 2.9;                               // the height of the fork's axis
const DESK = { at: [3.9, 0, 2.0], turn: -0.42 };

const BODY = "#2f3946", BRASS = "#9c7b4e", BENCH = "#39414f";

/* The two palettes, and the whole light/dark branch of this world. Both are mixed
   INTO the theme's own surface, so the mode still drives them: light is a pale dawn
   blue, dark is a night blue that the near-black surface swallows. */
const hue = (theme, night, dawn) => theme.sky.clone().lerp(new THREE.Color(theme.dark ? night : dawn[0]), theme.dark ? 0.82 : dawn[1]);

// Desk-local to world, so the easel a child builds lands on the desk this page built.
const on_desk = (x, y, z) => {
	const s = Math.sin(DESK.turn), c = Math.cos(DESK.turn);

	return [DESK.at[0] + x * c + z * s, y, DESK.at[2] - x * s + z * c];
};

const in_sky = star => [SKY.x + (star[0] - 0.5) * SKY.w, SKY.y + (0.5 - star[1]) * SKY.h, SKY.z];

/* ⚠ A star is round. `PointsMaterial` with no map draws each point as a screen-space
   QUAD, so at any size worth seeing every star is a domino — one 32px disc, painted
   with the same 2D kit as everything else, and they are stars again. */
const dot = stage => stage.paint(32, 32, (ctx, w) => {
	const glow = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);

	glow.addColorStop(0, "#ffffff");
	glow.addColorStop(0.4, "rgba(255, 255, 255, 0.9)");
	glow.addColorStop(1, "rgba(255, 255, 255, 0)");
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, w, w);
});

/* ⚠ `fog: false`, always. The haze runs to 78 units and the stars stand at 120 —
   fogged, they are the same as not drawn. Same reason Dusk's sun disc needs it. */
const points = (stage, at, { size, color, tone }) => {
	const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(at), 3));
	const material = new THREE.PointsMaterial({ size, map: dot(stage), sizeAttenuation: false, transparent: true, depthWrite: false, fog: false, toneMapped: false });

	// ⚠ Never pass an undefined `color` to a material — setValues warns and moves on.
	if (tone){
		geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(tone), 3));
		material.vertexColors = true;
	}
	else material.color.set(color);

	return new THREE.Points(geometry, material);
};

// ════ THE FOUR SIGHTINGS — the table IS the difference between them ══════════
const SIGHTINGS = [
	{
		plate: PLATES.vela,
		slot: "sky",
		blurb: "Region swap — one patch of sky is built; everything else is the same object.",
		camera: { eye: [2.4, 3.9, 8.8], aim: [0.5, 11.5, -20] },
		look: [SKY.x, SKY.y, SKY.z],

		/* The same nine stars as the plate in the rack, 40 units out. One Points, one
		   LineSegments, one name — three draw calls for a constellation.
		   ⚠ The one thing here that MUST turn over with the mode: white stars on a dawn
		   sky are not faint, they are absent. Ink at dawn, light at night. */
		build(stage, theme){
			const group = new THREE.Group();
			const seen = VELA.stars.flatMap(in_sky);
			const figure = VELA.lines.flatMap(([a, b]) => [...in_sky(VELA.stars[a]), ...in_sky(VELA.stars[b])]);
			const name = stage.label("Vela", { size: 2.6 });

			name.position.set(SKY.x, SKY.y - SKY.h * 0.44, SKY.z);
			group.add(
				points(stage, seen, { color: theme.dark ? "#eaf1ff" : "#22385c", size: 14 }),
				new THREE.LineSegments(
					new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(figure), 3)),
					new THREE.LineBasicMaterial({ color: theme.dark ? "#7fb6dd" : "#41618c", transparent: true, opacity: theme.dark ? 0.5 : 0.7, fog: false })
				),
				name
			);
			return group;
		},
	},
	{
		plate: PLATES.ring,
		slot: "plate",
		blurb: "Object swap — one plate leaves the rack and stands on the easel.",
		camera: { eye: on_desk(0.1, 2.05, 3.7), aim: on_desk(0, 1.62, 0.3) },
		look: [-17, 12, -30],

		// The plate the rack is missing — the SAME drawing, four times the size, on an
		// easel under its own lamp. The parent hides the rack's copy while this slot
		// is filled, which it reads from the slot map rather than from a click.
		build(stage){
			const group = new THREE.Group();
			const map = stage.paint(384, 512, (ctx, w, h) => this.plate.draw(ctx, w, h, rand(this.plate.seed)));
			const art = new THREE.Mesh(
				new THREE.PlaneGeometry(0.96, 1.28),
				new THREE.MeshStandardMaterial({ map, roughness: 0.55, side: THREE.DoubleSide })
			);
			const lamp = new THREE.SpotLight(0xfff2e0, 12, 5.5, 0.7, 0.6, 1.6);

			art.position.set(0, 1.78, 0);
			art.rotation.x = -0.16;
			group.add(art, stage.mesh(new THREE.BoxGeometry(1.15, 0.08, 0.44), BODY).translateY(1.13));

			lamp.position.set(0, 3.1, 1.3);
			lamp.target.position.set(0, 1.78, 0);
			group.add(lamp, lamp.target);

			group.position.fromArray(on_desk(0, 0, 0.42));
			group.rotation.y = DESK.turn;
			return group;
		},
	},
	{
		plate: PLATES.eyepiece,
		blurb: "Camera swap — no build(), no slot, nothing created or disposed.",
		camera: { eye: [-3.3, 2.5, 4.8], aim: [-0.1, 2.7, 0.2] },
		look: [8, 16, -28],
		// ⚠ No `build` and no `slot`, on purpose: `compose()` only asks pages that have
		//   a builder, so this page claims nothing. It is the smallest a page gets.
	},
	{
		plate: PLATES.daybreak,
		slot: "hour",
		blurb: "Light swap — a warm light claims the hour and the star field goes out.",
		camera: { eye: [1.2, 3.4, 10.6], aim: [-1.5, 3.2, -14] },
		look: [11, 3.5, -20],

		// A sun half-risen BEHIND the ridge, its glow painted with the same 2D kit as
		// everything else here. The stars fading are the parent's doing — see tick().
		build(stage){
			const group = new THREE.Group();
			const sun = new THREE.DirectionalLight(0xffd2a0, 1.15);
			/* ⚠ The bloom must FIT its canvas. A radial gradient whose radius runs past
			   the edge is clipped there, and the first pass hung a hard-edged rectangle
			   of light over the ridge — the gradient was the sky, and you could see the
			   frame of it. Square texture, radius inside the bounds. */
			const map = stage.paint(256, 256, (ctx, w, h) => {
				const bloom = ctx.createRadialGradient(w / 2, h * 0.6, 0, w / 2, h * 0.6, w * 0.46);

				bloom.addColorStop(0, "rgba(255, 218, 158, 0.95)");
				bloom.addColorStop(0.3, "rgba(243, 158, 88, 0.5)");
				bloom.addColorStop(1, "rgba(243, 158, 88, 0)");
				ctx.fillStyle = bloom;
				ctx.fillRect(0, 0, w, h);
			});
			const glow = new THREE.Mesh(
				new THREE.PlaneGeometry(44, 44),
				new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: false, toneMapped: false })
			);
			// Unlit and unfogged: a light source that its own haze can dim is not one.
			const disc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 48), new THREE.MeshBasicMaterial({ color: 0xffd39a, fog: false, toneMapped: false }));

			sun.position.set(-16, 4, -47);
			glow.position.set(-16, 6.5, -47);
			disc.position.set(-16, 6.2, -46.4);   // clear of the ridge, which runs to 9.8
			group.add(sun, glow, disc);
			return group;
		},
	},
];

export default new Scene({
	meta: import.meta,
	title: "Observatory",
	description: "All four grains at once — a region, an object, a camera and a light, as four ways of looking through one instrument.",
	classes: "scene-note",

	camera: { eye: [1.6, 3.0, 9.0], aim: [1.5, 2.1, 0.3] },
	look: REST,

	content(){ md("**This room combines all four kinds of swap from the other four doors.** Watch the telescope on the desk as you click through: a patch of sky, an object on the easel, a camera view of its own, and a change of light. The telescope never rebuilds — it just turns to keep tracking wherever you are."); },

	build(stage, theme){
		const world = new THREE.Group();

		/* Light mode is a pale dawn observatory, dark mode a deep night, and the whole
		   branch is six numbers: no `tint`, so the canvas stays transparent and the
		   themed CSS box behind it IS the sky. `fill` is the hemisphere bounce — at the
		   0.5 every other scene wants, a night reads as an overcast afternoon.
		   ⚠ A grey ground under a warm key is not "pale", it is sepia — the first pass
		   read as a mud flat. Both grounds are mixed toward a BLUE. */
		stage.sky(world, {
			fog: 78, near: 0.45, shadow: 9,
			sun: theme.dark ? 0xb8cdf2 : 0xfff4e4,
			power: theme.dark ? 0.62 : 1.05,
			rim: theme.dark ? 0.85 : 0.5,
			fill: theme.dark ? 0.2 : 0.6,
			// The bounce is the SKY's colour coming back up, and at dawn that is blue.
			bounce: theme.dark ? 0x0a1020 : 0x9db3d4,
			at: theme.dark ? [-11, 9, -7] : [9, 6, 11],
		});

		// ⚠ A hemisphere light hands its SKY colour to everything facing up, so a floor
		//   cannot be tinted from the bounce — the blue has to be in the material.
		stage.floor(world, hue(theme, "#0d1626", ["#4f6690", 0.55]), 52);
		world.add(this.ridge(stage, theme));
		world.add(world.userData.stars = this.field(stage, theme));
		world.add(stage.casts(this.instrument(stage, world)));
		world.add(this.rack(stage, theme, world));

		world.userData.look = new THREE.Vector3().fromArray(REST);
		return world;
	},

	/* THE HORIZON — one mesh. A ring of seeded hills written straight into a buffer as
	   triangles: fog eats its top edge into whatever the sky is, which in light mode is
	   a pale haze and in dark mode is nothing at all. Unlit on purpose — a ridge at
	   this distance is a silhouette, not a surface. */
	ridge(stage, theme, radius = 46, teeth = 112){
		const random = rand(19);
		const at = [];
		const rim = i => {
			const a = i / teeth * Math.PI * 2;
			const high = 2.2 + random() * 5.4 + Math.sin(a * 2.3) * 2.2;

			return [Math.sin(a) * radius, Math.max(high, 0.8), Math.cos(a) * radius];
		};

		let last = rim(0);

		for (let i = 1; i <= teeth; i++){
			const next = rim(i);

			at.push(last[0], 0, last[2], next[0], 0, next[2], next[0], next[1], next[2]);
			at.push(last[0], 0, last[2], next[0], next[1], next[2], last[0], last[1], last[2]);
			last = next;
		}

		return new THREE.Mesh(
			new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(at), 3)),
			new THREE.MeshBasicMaterial({ color: hue(theme, "#060b16", ["#5f6f8c", 0.58]), side: THREE.DoubleSide })
		);
	},

	/* THE STARS — 1,100 points, one draw call, seeded so a cold load and a walk down see
	   the same sky. `vertexColors` is what buys the variation a single material cannot;
	   the opacity is the whole light/dark story, and `tick()` fades it at daybreak. */
	field(stage, theme, count = 1100){
		const random = rand(7);
		const at = [], tone = [], color = new THREE.Color();
		const night = theme.dark ? 0.95 : 0.16;

		for (let i = 0; i < count; i++){
			const turn = random() * Math.PI * 2;
			// ⚠ Biased LOW, not high. A camera on the ground looks at the first twenty
			//   degrees of sky; an even shell puts nine tenths of the stars off frame.
			const y = Math.pow(random(), 1.4) * 105 + 3;
			const ring = Math.sqrt(Math.max(120 * 120 - y * y, 4));

			at.push(Math.sin(turn) * ring, y, Math.cos(turn) * ring);
			color.setHSL(0.57 + random() * 0.08, 0.28, 0.5 + random() * 0.5);
			tone.push(color.r, color.g, color.b);
		}

		const stars = points(stage, at, { size: theme.dark ? 3.2 : 2.6, tone });

		stars.material.opacity = stars.userData.night = night;
		return stars;
	},

	/* THE INSTRUMENT — a pier, a fork, and an alt-azimuth head that the chain aims.
	   ⚠ `rotation.order = "YXZ"`, which is exactly what an alt-az mount is: swing
	   first, then lift. The default XYZ tips the tube sideways as it turns. */
	instrument(stage, world){
		const rig = new THREE.Group();
		const head = new THREE.Group();
		const tube = stage.mesh(new THREE.CylinderGeometry(0.26, 0.26, 3.4, 24), BRASS, { roughness: 0.42, metalness: 0.3 });
		const hood = stage.mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.5, 24), BODY);
		const eye = stage.mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.46, 16), BRASS, { roughness: 0.42, metalness: 0.3 });

		rig.add(stage.mesh(new THREE.CylinderGeometry(0.3, 0.5, 2.0, 24), BODY).translateY(1.0));
		[-0.5, 0.5].forEach(x => rig.add(stage.mesh(new THREE.BoxGeometry(0.14, 1.35, 0.3), BODY).translateX(x).translateY(2.42)));

		// The tube lies along the head's -Z, which is the direction `lookAt` maths and
		// every azimuth below agree on.
		[tube, hood, eye].forEach(part => part.rotation.x = -Math.PI / 2);
		hood.position.z = -1.85;
		eye.position.z = 1.9;

		head.rotation.order = "YXZ";
		head.position.y = MOUNT;
		head.add(tube, hood, eye);
		rig.add(head);

		world.userData.head = head;
		return rig;
	},

	/* THE RACK — four glass plates on the observing desk, each one a door. The plate's
	   own drawing is its face, so what is behind the door is literally what is on it,
	   and the name is written into the emulsion as well as worn on a plate above it. */
	rack(stage, theme, world){
		const desk = new THREE.Group();

		desk.position.set(DESK.at[0], DESK.at[1], DESK.at[2]);
		desk.rotation.y = DESK.turn;
		desk.add(stage.mesh(new THREE.BoxGeometry(3.2, 0.09, 1.15), BENCH).translateY(1.02));
		desk.add(stage.mesh(new THREE.BoxGeometry(0.42, 1.0, 0.6), BENCH).translateY(0.5));

		// The observer's lamp: no mesh, no shadow, no draw call — and the only reason
		// four plates are readable on a moonless night.
		desk.add(new THREE.PointLight(0xffd9a8, theme.dark ? 7 : 2.5, 4.4).translateY(2.1).translateZ(0.7));

		world.userData.rack = Object.values(PLATES).map((plate, i) => {
			const card = new THREE.Group();
			const map = stage.paint(256, 341, (ctx, w, h) => plate.draw(ctx, w, h, rand(plate.seed)));
			// ⚠ A STANDARD material, not the gallery's unlit one: it has an `emissive`,
			//   so `stage.link()` finds something to raise and the plate itself lights
			//   up under the pointer instead of a frame around it.
			const glass = new THREE.Mesh(
				new THREE.PlaneGeometry(0.7, 0.93),
				new THREE.MeshStandardMaterial({ map, roughness: 0.5, side: THREE.DoubleSide })
			);
			const name = stage.label(plate.title, { size: 0.22 });

			glass.position.set(0, 0.5, 0);
			glass.rotation.x = -0.24;
			name.position.y = 1.13;
			card.add(glass, name);
			card.position.set((i - 1.5) * 0.79, 1.08, -0.14);
			card.userData.plate = plate.name;
			desk.add(stage.link(card, HERE + plate.name + "/", plate.title));
			return card;
		});

		return desk;
	},

	/* THE INSTRUMENT RESPONDS — and this is the point of the world. Nothing here is
	   rebuilt: the head, the stars and the rack are the same objects for the whole
	   visit. They read the ACTIVE CHAIN and the slot map, which is the same source
	   `compose()` derives the world from, so a cold url and a walk down settle the
	   same way. */
	tick(dt, world, stage){
		const { head, stars, rack, look } = world.userData;
		const page = this.app.router.active;

		// The deepest `look` in the chain wins — the rule `camera` already follows.
		if (page !== world.userData.at){
			world.userData.at = page;
			look.fromArray(page?.chain().findLast(step => step.look)?.look ?? REST);
		}

		const ease = Math.min(1, dt * 2.4);

		head.rotation.y += (Math.atan2(-look.x, -look.z) - head.rotation.y) * ease;
		head.rotation.x += (Math.atan2(look.y - MOUNT, Math.hypot(look.x, look.z)) - head.rotation.x) * ease;

		// The stars were never rebuilt; they simply go out when a page claims the hour.
		const want = stage.slots.has("hour") ? 0.03 : stars.userData.night;

		stars.material.opacity += (want - stars.material.opacity) * Math.min(1, dt * 0.9);

		// A plate on the easel is a plate out of the rack — read from the slot map.
		const lifted = stage.slots.get("plate")?.page.plate.name;

		rack.forEach(card => card.visible = card.userData.plate !== lifted);
	},

	/* The door-sign the foyer hangs over my post: Vela's own nine stars — the same
	   list the plate and the sky are drawn from — inside the instrument's brass ring.
	   ⚠ The stars are given depth. Flat, they vanish edge-on as the foyer turns the
	   sign; scattered through z they read as a cluster from every angle. */
	sign(stage, theme){
		const group = new THREE.Group();
		const random = rand(41);
		const at = VELA.stars.flatMap(star => [(star[0] - 0.5) * 0.66, (0.5 - star[1]) * 0.56, (random() - 0.5) * 0.3]);
		const figure = VELA.lines.flatMap(([a, b]) => [at[a * 3], at[a * 3 + 1], at[a * 3 + 2], at[b * 3], at[b * 3 + 1], at[b * 3 + 2]]);
		const ring = stage.mesh(new THREE.TorusGeometry(0.46, 0.038, 12, 48), BRASS, { roughness: 0.3, metalness: 0.35 });

		// ⚠ A ring tilted past ~40 degrees is a STICK from a camera at eye level, and
		//   the foyer turns every sign on Y — so it never comes back round. Nod it.
		ring.rotation.x = 0.5;
		group.add(
			points(stage, at, { color: theme.dark ? "#eaf1ff" : "#1b2f52", size: 14 }),
			new THREE.LineSegments(
				new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(figure), 3)),
				new THREE.LineBasicMaterial({ color: theme.dark ? "#7fb6dd" : "#41618c", transparent: true, opacity: 0.6, fog: false })
			),
			ring
		);

		group.userData.tick = (dt, self) => {
			ring.rotation.x = 0.5 + Math.sin(self.userData.age = (self.userData.age ?? 0) + dt * 0.9) * 0.22;
		};

		return group;
	},

	children: SIGHTINGS.map(spec => new Scene({
		name: spec.plate.name,
		title: spec.plate.title,
		description: spec.blurb,
		classes: "scene-note",
		...spec,

		/* THE CAPTION CARD — the other half of the reading. The plate standing in the
		   rack and the picture in this card are the same `draw()` run twice, so the 2D
		   chrome under the stage and the 3D world above it are showing one thing. */
		content(){
			div.c("scene-card", () => {
				div.c("scene-plate", () => plate_canvas(this.plate));

				div.c("scene-card-body", () => {
					md(this.plate.note);
					div.c("scene-facts", () => this.plate.facts.forEach(fact => span.c("scene-fact", fact)));
				});
			});
		},
	})),
});
