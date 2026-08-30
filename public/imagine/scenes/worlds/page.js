import { md } from "/app.js";
import { Scene, THREE } from "../Scene.js";

/* GRAIN 1 — THE FULL SCENE SWAP. Every land here claims slot `world`, and the
   deeper page wins its slot, so arriving in one deletes the last one whole:
   floor, sky, fog, weather. The crossroads below is a land too. */

const LANDS = [
	{
		name: "dawn", title: "Dawn",
		tint: "#efe3d4", ground: "#e2d0ba", stone: "#c9b6a1", accent: "#ff8f5e", sun: 0xfff0d6,
		high: "#b6c5de", shadow: 30,
		count: 46, wide: 0.34, tall: [3, 10], fog: 52, at: [-9, 7, 12], seed: 11,
		eye: [0, 2.2, 12], aim: [0, 3.4, 0],
		note: "A pale morning of thin stones. This whole world — floor, fog, painted sky, the one light that casts — is `build()` on slot `world`.",
	},
	{
		name: "dusk", title: "Dusk",
		tint: "#241a2e", ground: "#181022", stone: "#0e0916", accent: "#ff6157", sun: 0xffb27a,
		high: "#0a0513",
		count: 26, wide: 0.9, tall: [4, 15], fog: 58, at: [0, 5, -26], disc: "#ff7a45", seed: 23,
		eye: [0, 2.8, 13], aim: [0, 4.2, 0],
		note: "The same builder, a different row of numbers. Nothing of Dawn survived the swap.",
	},
	{
		name: "deep", title: "Deep",
		tint: "#0a2a33", ground: "#06202a", stone: "#0c3a44", accent: "#59e0d0", sun: 0x8fe6dc,
		high: "#02101a",
		count: 30, wide: 0.7, tall: [1, 4], fog: 30, at: [2, 16, 4], motes: 420, seed: 37,
		eye: [0, 3.2, 11], aim: [0, 3.2, 0],
		note: "Fog pulled in to 30 and the light dropped overhead. Same eleven lines, a different place.",
	},
];

// One builder, three moods — the spec IS the difference.
function land(stage, spec, url, label){
	const world = new THREE.Group();
	const stone = new THREE.Color(spec.stone);
	const random = stage.rand(spec.seed);
	const stones = new THREE.Group();

	stage.sky(world, { tint: spec.tint, high: spec.high, sun: spec.sun, fog: spec.fog, at: spec.at, power: spec.disc ? 1.6 : 2.4, shadow: spec.shadow });
	stage.floor(world, spec.ground, 60);

	if (spec.disc){
		// ⚠ `fog: false` — a sun 34 units out is 70% of the way through Dusk's haze,
		//   and fogging it to the sky colour is the same as not drawing it.
		const sun = new THREE.Mesh(new THREE.CircleGeometry(4.6, 64), new THREE.MeshBasicMaterial({ color: spec.disc, fog: false, toneMapped: false }));

		sun.position.set(0, 3.6, -34);
		world.add(sun);
	}

	for (let i = 0; i < spec.count; i++){
		const angle = random() * Math.PI * 2;
		const far = 7 + random() * 22;
		const height = spec.tall[0] + random() * (spec.tall[1] - spec.tall[0]);
		const pillar = stage.mesh(new THREE.BoxGeometry(spec.wide, height, spec.wide), stone.clone().lerp(new THREE.Color(spec.ground), random() * 0.5));

		pillar.position.set(Math.sin(angle) * far, height / 2, Math.cos(angle) * far - 4);
		pillar.rotation.y = random() * 0.6;
		stones.add(pillar);
	}

	// ⚠ `casts()` on the STONES, never on `world` — the sky dome is 150 units across
	//   and would happily cast a shadow over the entire land.
	world.add(spec.shadow ? stage.casts(stones) : stones);

	if (spec.motes){
		const at = new Float32Array(spec.motes * 3);

		for (let i = 0; i < spec.motes; i++)
			at.set([(random() - 0.5) * 44, random() * 16, (random() - 0.5) * 44 - 4], i * 3);

		const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(at, 3));

		world.userData.motes = new THREE.Points(geometry, new THREE.PointsMaterial({ color: spec.accent, size: 0.13, transparent: true, opacity: 0.75 }));
		world.add(world.userData.motes);
	}

	world.add(gate(stage, spec.accent, url, label));
	return world;
}

/* The one object that swaps the whole world. An arch, lit, with a veil in it — and
   its destination written across the veil, because a door you cannot read is a
   guess. ⚠ The plate goes INSIDE the linked group: a Sprite raycasts, so there it is
   part of the link; hung beside it, it would be a dead patch over the target. */
function gate(stage, accent, url, label){
	const arch = new THREE.Group();
	// ⚠ `depthWrite: false`. A translucent veil that writes depth CUTS the name in
	//   half: the plate faces the camera, the veil is turned 47° at the crossroads,
	//   so the two planes cross and the far half of the word is depth-tested away.
	const veil = new THREE.Mesh(
		new THREE.CircleGeometry(1.44, 48),
		new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })
	);

	const plate = stage.label(label, { size: 0.42 });

	plate.position.z = 0.03;
	arch.add(stage.mesh(new THREE.TorusGeometry(1.5, 0.17, 20, 64), accent, { roughness: 0.4, metalness: 0.05 }), veil, plate);
	arch.position.set(0, 1.6, 3.4);
	return stage.link(arch, url, label);
}

const HERE = "/imagine/scenes/worlds/";

export default new Scene({
	meta: import.meta,
	title: "Worlds",
	description: "Full scene swap — a child replaces the whole world.",
	classes: "scene-note",

	camera: { eye: [0, 3, 10.5], aim: [0, 1.9, 0] },

	content(){ md("**Full scene swap.** Three arches, three worlds. Click one and floor, fog, light and weather all go — the child claims the same `world` slot, and the deeper page wins it."); },

	// The crossroads is a world too: no tint, so it keeps the page's own theme.
	build(stage, theme){
		const world = new THREE.Group();

		stage.sky(world, { fog: 24, near: 0.5, at: [6, 9, 8], shadow: 9 });
		stage.floor(world, theme.sky.clone().lerp(theme.ink, theme.dark ? 0.26 : 0.15), 20);

		// ⚠ 0.82 rad apart, not 0.55: at 5.2 out the old spacing put the rings 2.7
		//   apart when each is 3.34 across, so every arch ate the next one's name.
		LANDS.forEach((spec, i) => {
			const angle = (i - 1) * 0.82;
			const arch = gate(stage, spec.accent, HERE + spec.name + "/", spec.title);

			arch.position.set(Math.sin(angle) * 5.2, 1.6, Math.cos(angle) * 5.2 - 3.4);
			arch.rotation.y = -angle;
			world.add(stage.casts(arch));
		});

		return world;
	},

	// The door-sign the foyer hangs over my post: the crossroads in miniature, each
	// little arch ringed in its land's accent and veiled in its land's sky. What is
	// behind the door is what is on it.
	sign(stage){
		const group = new THREE.Group();

		LANDS.forEach((spec, i) => {
			const angle = i * Math.PI * 2 / 3;
			const arch = new THREE.Group();

			arch.add(stage.mesh(new THREE.TorusGeometry(0.3, 0.045, 12, 40), spec.accent, { roughness: 0.35 }));
			arch.add(new THREE.Mesh(
				new THREE.CircleGeometry(0.28, 24),
				new THREE.MeshBasicMaterial({ color: spec.ground, side: THREE.DoubleSide })
			));

			arch.position.set(Math.sin(angle) * 0.33, 0, Math.cos(angle) * 0.33);
			arch.rotation.y = angle;
			group.add(arch);
		});

		return group;
	},

	children: LANDS.map((spec, i) => new Scene({
		name: spec.name,
		title: spec.title,
		description: spec.note,
		classes: "scene-note",
		slot: "world",
		camera: { eye: spec.eye, aim: spec.aim },
		spec,
		next: LANDS[(i + 1) % LANDS.length],

		content(){ md(this.spec.note); },

		build(stage){ return land(stage, this.spec, HERE + this.next.name + "/", "To " + this.next.title); },

		tick(dt, world){
			const motes = world.userData.motes;
			if (!motes) return;

			const at = motes.geometry.attributes.position;

			for (let i = 1; i < at.array.length; i += 3)
				at.array[i] = at.array[i] > 16 ? 0 : at.array[i] + dt * 0.5;

			at.needsUpdate = true;
		},
	})),
});
