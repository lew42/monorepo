import { md } from "/app.js";
import { Scene, THREE } from "../Scene.js";

/* GRAIN 2 — THE SINGLE OBJECT SWAP. The room is built once, by this page, on slot
   `world`. Every child claims slot `focus` and builds one mesh, so navigating
   between them rebuilds exactly that mesh and nothing else.

   The proof is the ring overhead: it keeps turning through the swap because its
   group was never touched, and no child declares a `camera`, so the view does not
   move either. Only the thing on the plinth changes. */

const HERE = "/imagine/scenes/plinth/";

const PIECES = [
	{ name: "torus", title: "Torus", accent: "#ff6157", note: "One mesh changed. The apse, the plinth, the ring overhead and the camera are the same objects they were a moment ago." },
	{ name: "knot", title: "Knot", accent: "#4c9aff", note: "Slot `focus`, second occupant. The room's group was never rebuilt, so the ring did not restart." },
	{ name: "prism", title: "Prism", accent: "#f2c14e", note: "A flat-shaded octahedron, lit by the room it did not build." },
];

const SHAPES = {
	torus: () => new THREE.TorusGeometry(0.58, 0.21, 24, 72),
	knot: () => new THREE.TorusKnotGeometry(0.46, 0.16, 140, 20),
	prism: () => new THREE.OctahedronGeometry(0.82, 0),
};

export default new Scene({
	meta: import.meta,
	title: "Plinth",
	description: "Single object swap — one mesh changes, the room persists.",
	classes: "scene-note",

	camera: { eye: [0, 3.9, 10.4], aim: [0, 1.7, 0] },

	content(){ md("**Click a swatch on the floor** and only the shape on the plinth changes. The room, the light and the ring turning overhead stay exactly as they were — this door swaps one object, nothing more."); },

	build(stage, theme){
		const world = new THREE.Group();
		const wall = theme.sky.clone().lerp(theme.ink, theme.dark ? 0.10 : 0.11);

		// Low key, low fill: the ring's own point light is meant to be the source you
		// can see, and at 1.5 the daylight drowned it and the room read as white paper.
		stage.sky(world, { fog: 34, power: 1.05, at: [6, 11, 8], rim: 0.5, shadow: 7 });
		stage.floor(world, wall.clone().lerp(theme.ink, 0.14), 15);

		// An apse, not a back wall: a cylinder turned inside out has no corners to
		// give the room a size, so the fog can do the whole job.
		const apse = stage.mesh(new THREE.CylinderGeometry(13, 13, 11, 64, 1, true), wall, { side: THREE.BackSide, roughness: 1 });
		apse.position.y = 5.5;
		world.add(apse);

		// ⚠ The plinth casts; the apse must NOT — an inside-out cylinder around the
		//   whole room shadows everything in it.
		world.add(stage.casts(stage.mesh(new THREE.CylinderGeometry(0.85, 1.05, 1.15, 48), wall.clone().lerp(theme.ink, 0.3)).translateY(0.575)));

		// The persistence proof, and the room's key light in one object.
		const ring = new THREE.Group();
		ring.add(stage.mesh(new THREE.TorusGeometry(2.6, 0.05, 12, 96), theme.prim, { emissive: theme.prim, emissiveIntensity: 0.6 }).rotateX(Math.PI / 2));
		ring.add(new THREE.PointLight(0xfff0e0, 34, 24));
		ring.position.y = 4.6;
		world.userData.ring = ring;
		world.add(ring);

		// ⚠ A key straight overhead leaves every FRONT face in shadow — the gold
		//   prism read as olive until this fill existed. Gallery lighting, not sun.
		const fill = new THREE.DirectionalLight(0xffffff, 0.85);
		fill.position.set(-2, 3, 9);
		world.add(fill);

		PIECES.forEach((piece, i) => {
			const puck = new THREE.Group();
			const plate = stage.label(piece.title, { size: 0.26 });

			puck.add(stage.mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.22, 40), piece.accent).translateY(0.11));
			plate.position.y = 0.52;
			puck.add(plate);
			puck.position.set((i - 1) * 1.9, 0, 3.6);
			world.add(stage.link(stage.casts(puck), HERE + piece.name + "/", piece.title));
		});

		return world;
	},

	tick(dt, world){ world.userData.ring.rotation.y += dt * 0.55; },

	// The door-sign the foyer hangs over my post: my own grain, performing itself —
	// one plinth, one mesh at a time, the mesh swapping and nothing else.
	sign(stage, theme){
		const group = new THREE.Group();

		group.add(stage.mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.18, 24), theme.ink.clone().lerp(theme.sky, 0.45)).translateY(-0.42));

		group.userData.pieces = PIECES.map((piece, i) => {
			const mesh = stage.mesh(SHAPES[piece.name]().scale(0.44, 0.44, 0.44), piece.accent, { roughness: 0.3, flatShading: piece.name === "prism" });

			mesh.visible = i === 0;
			mesh.position.y = -0.06;
			group.add(mesh);
			return mesh;
		});

		group.userData.tick = (dt, self) => {
			const at = Math.floor((self.userData.age = (self.userData.age ?? 0) + dt) / 2.2) % PIECES.length;

			self.userData.pieces.forEach((mesh, i) => mesh.visible = i === at);
		};

		return group;
	},

	children: PIECES.map(piece => new Scene({
		name: piece.name,
		title: piece.title,
		description: piece.note,
		classes: "scene-note",
		slot: "focus",           // ⚠ the whole difference between this grain and the last one
		piece,

		content(){ md(this.piece.note); },

		build(stage){
			const group = new THREE.Group();

			// ⚠ Low metalness on purpose: a metal with no environment map has nothing
			//   to reflect, so `metalness: 0.45` rendered the gold prism near black.
			group.add(stage.mesh(SHAPES[this.piece.name](), this.piece.accent, { roughness: 0.35, metalness: 0.05, flatShading: this.piece.name === "prism" }));
			group.position.y = 2.05;
			return stage.casts(group);
		},

		tick(dt, group){
			group.rotation.y += dt * 0.6;
			group.rotation.x += dt * 0.22;
		},
	})),
});
