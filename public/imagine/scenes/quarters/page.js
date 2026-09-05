import { md } from "/app.js";
import { Scene, THREE } from "../Scene.js";

/* GRAIN 3 — THE REGION SWAP. One plate, four pads, and each child claims a slot
   named after its own corner. Only that corner is ever built or torn down; the
   plate, the other three pads and the beacon crossing the middle belong to this
   page's `world` slot and are never touched. */

const HERE = "/imagine/scenes/quarters/";

const QUARTERS = [
	{ name: "grove", title: "Grove", at: [-3.6, -3.6], tint: "#4f8a5b", note: "Slot `grove`. The plate, the other three pads and the beacon are the same objects — only this corner was built." },
	{ name: "dock", title: "Dock", at: [3.6, -3.6], tint: "#3d7ea6", note: "Slot `dock`. Leaving Grove disposed exactly one corner; nothing else was rebuilt." },
	{ name: "works", title: "Works", at: [-3.6, 3.6], tint: "#8a5a3c", note: "Slot `works`. The smoke starts from zero because this corner is new; the beacon does not, because it is not." },
	{ name: "court", title: "Court", at: [3.6, 3.6], tint: "#b0483f", note: "Slot `court`. Four corners, four slots, one plate underneath all of them." },
];

const BUILD = {

	grove(stage, tint, random){
		const group = new THREE.Group();

		for (let i = 0; i < 9; i++){
			const height = 1 + random() * 1.7;
			const tree = new THREE.Group();

			tree.add(stage.mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.5, 8), "#6b5340").translateY(0.25));
			tree.add(stage.mesh(new THREE.ConeGeometry(0.42, height, 9), new THREE.Color(tint).multiplyScalar(0.7 + random() * 0.6), { flatShading: true }).translateY(0.5 + height / 2));
			tree.position.set((random() - 0.5) * 3.6, 0, (random() - 0.5) * 3.6);
			group.add(tree);
		}

		return group;
	},

	dock(stage, tint, random){
		const group = new THREE.Group();
		const water = stage.mesh(new THREE.CircleGeometry(2.1, 48), tint, { roughness: 0.15, metalness: 0.5 });

		water.rotation.x = -Math.PI / 2;
		water.position.y = 0.03;
		group.add(water);

		for (let i = 0; i < 6; i++)
			group.add(stage.mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8), "#6b5340")
				.translateX(Math.cos(i * 1.05) * 1.9).translateY(0.55).translateZ(Math.sin(i * 1.05) * 1.9));

		group.userData.boat = stage.mesh(new THREE.BoxGeometry(1.2, 0.28, 0.5), "#e6ddd0");
		group.userData.boat.position.y = 0.2;
		group.add(group.userData.boat);
		return group;
	},

	works(stage, tint, random){
		const group = new THREE.Group();

		group.add(stage.mesh(new THREE.BoxGeometry(3.2, 0.5, 2.4), "#3a3238").translateY(0.25));

		for (let i = 0; i < 3; i++)
			group.add(stage.mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.6 + i * 0.4, 12), tint)
				.translateX(-0.9 + i * 0.9).translateY(0.5 + (1.6 + i * 0.4) / 2));

		group.userData.smoke = [0, 1, 2].map(i => {
			const puff = stage.mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 20), "#c9c3bd", { transparent: true, opacity: 0.55 });

			puff.rotation.x = Math.PI / 2;
			puff.position.set(-0.9 + i * 0.9, 1.9 + i * 0.35, 0);
			group.add(puff);
			return puff;
		});

		return group;
	},

	court(stage, tint, random){
		const group = new THREE.Group();

		group.add(stage.mesh(new THREE.CylinderGeometry(2, 2, 0.16, 40), "#e8e1d6").translateY(0.08));

		for (let i = 0; i < 8; i++)
			group.add(stage.mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.7, 12), "#efe9df")
				.translateX(Math.cos(i * 0.785) * 1.5).translateY(1).translateZ(Math.sin(i * 0.785) * 1.5));

		group.userData.canopy = stage.mesh(new THREE.ConeGeometry(2.1, 0.7, 8), tint, { flatShading: true });
		group.userData.canopy.position.y = 2.25;
		group.add(group.userData.canopy);
		return group;
	},
};

const TICK = {
	grove(dt, group, t){ group.children.forEach((tree, i) => tree.rotation.z = Math.sin(t + i) * 0.03); },
	dock(dt, group, t){ group.userData.boat.position.y = 0.2 + Math.sin(t * 1.4) * 0.05; group.userData.boat.rotation.z = Math.sin(t) * 0.06; },
	works(dt, group){ group.userData.smoke.forEach(puff => { puff.position.y += dt * 0.4; if (puff.position.y > 3.6) puff.position.y = 1.9; puff.scale.setScalar(1 + (puff.position.y - 1.9) * 0.7); }); },
	court(dt, group){ group.userData.canopy.rotation.y += dt * 0.3; },
};

export default new Scene({
	meta: import.meta,
	title: "Quarters",
	description: "Region swap — one zone changes, the rest of the world persists.",
	classes: "scene-note",

	camera: { eye: [0, 11, 15], aim: [0, 0.4, 0] },

	content(){ md("**Four pads on one plate — click a corner** and only that corner changes. The other three, and the beacon still crossing the middle, stay exactly as they were: this door swaps one region of the world, not the whole thing."); },

	build(stage, theme){
		const world = new THREE.Group();
		const plate = theme.sky.clone().lerp(theme.ink, theme.dark ? 0.22 : 0.15);

		/* ⚠ NO GROUND under the plate, tried and cut. From a camera 12 units up you
		   see forty units of it receding, and every one of them fades to the fog
		   colour — which in light mode is white, so the world wore a glowing halo.
		   The plate floats instead, and what shows past its corners is the CSS sky
		   through the transparent canvas, which is the point of this pair anyway. */
		stage.sky(world, { fog: 46, near: 0.45, power: 1.5, at: [8, 14, 7], rim: 0.45, shadow: 11 });

		const deck = stage.mesh(new THREE.BoxGeometry(16, 0.5, 16), plate).translateY(-0.25);

		deck.receiveShadow = true;
		world.add(deck);

		// The seam between the four regions, drawn once.
		[[16, 0.12], [0.12, 16]].forEach(([w, d]) =>
			world.add(stage.mesh(new THREE.BoxGeometry(w, 0.02, d), theme.line).translateY(0.011)));

		QUARTERS.forEach(quarter => {
			const pad = new THREE.Group();
			const label = stage.label(quarter.title, { size: 0.7 });
			const disc = stage.mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.08, 48), plate.clone().lerp(new THREE.Color(quarter.tint), 0.35)).translateY(0.04);

			disc.receiveShadow = true;

			// ⚠ On the NEAR edge of the pad, not over its middle: a corner that has
			//   been built puts nine trees exactly where a centred name would be.
			label.position.set(0, 0.75, 1.75);
			pad.add(disc, label, stage.mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), quarter.tint).translateY(0.3));
			pad.position.set(quarter.at[0], 0, quarter.at[1]);
			world.add(stage.link(pad, HERE + quarter.name + "/", quarter.title));
		});

		// The persistence proof: it crosses the plate whatever corner you are in.
		const beacon = new THREE.Group();
		beacon.add(stage.mesh(new THREE.SphereGeometry(0.26, 20, 14), theme.prim, { emissive: theme.prim, emissiveIntensity: 0.8 }).translateX(5.6));
		beacon.position.y = 2.2;
		world.userData.beacon = beacon;
		world.add(beacon);

		return world;
	},

	tick(dt, world){ world.userData.beacon.rotation.y += dt * 0.5; },

	// The door-sign the foyer hangs over my post: the plate in miniature, one corner
	// rising at a time — my grain, performing itself.
	sign(stage, theme){
		const group = new THREE.Group();

		group.add(stage.mesh(new THREE.BoxGeometry(0.94, 0.1, 0.94), theme.sky.clone().lerp(theme.ink, 0.32)).translateY(-0.22));

		group.userData.pads = QUARTERS.map(quarter => {
			const pad = stage.mesh(new THREE.BoxGeometry(0.4, 0.17, 0.4), quarter.tint, { flatShading: true });

			pad.position.set(Math.sign(quarter.at[0]) * 0.23, -0.08, Math.sign(quarter.at[1]) * 0.23);
			group.add(pad);
			return pad;
		});

		group.userData.tick = (dt, self) => {
			const at = Math.floor((self.userData.age = (self.userData.age ?? 0) + dt) / 1.4) % QUARTERS.length;

			self.userData.pads.forEach((pad, i) => pad.position.y = i === at ? 0.1 : -0.08);
		};

		return group;
	},

	children: QUARTERS.map(quarter => new Scene({
		name: quarter.name,
		title: quarter.title,
		description: quarter.note,
		classes: "scene-note",
		slot: quarter.name,      // ⚠ the slot is the CORNER — that is the whole region grain
		quarter,
		camera: { eye: [quarter.at[0] * 0.45, 11.6, 17 + quarter.at[1] * 0.3], aim: [quarter.at[0] * 0.6, 0.5, quarter.at[1] * 0.6] },

		content(){ md(this.quarter.note); },

		build(stage){
			const group = BUILD[this.quarter.name](stage, this.quarter.tint, stage.rand(this.quarter.name.length * 97 + 5));

			group.position.set(this.quarter.at[0], 0.08, this.quarter.at[1]);
			this.age = 0;
			return stage.casts(group);
		},

		tick(dt, group){ TICK[this.quarter.name](dt, group, this.age += dt); },
	})),
});
