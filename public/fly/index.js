import View, { div, a, is } from "/framework/core/View/View.js";
import * as THREE from "./three.js";
import { GLTFLoader } from "./GLTFLoader.js";
import joystick from "./joystick.js";

View.body().init();

const control = { roll: 0, pitch: 0, boost: false };
let ship, paused = false;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xdddddd, 1000, 3000);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100000);
camera.offset = new THREE.Vector3(0, 2, 10);
camera.position.copy(camera.offset);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

world();
hud();
joystick(control);
keys();

/* ⚠ NOT `addEventListener("resize")` alone. A phone applies its device metrics
   after the script runs and does not always fire `resize` for it, so the one-shot
   sizing here sticks at whatever the viewport was mid-boot — and framework.css's
   `max-width: 100%` then squeezes the canvas without touching its inline height,
   which reads as a squished view with the ship far below centre. The observer
   catches every settle, including a phone's URL bar collapsing. */
new ResizeObserver(resize).observe(document.documentElement);

// ⚠ The loop starts with the ship, not before it — `animate` reads `ship.quaternion`
// on its first frame.
new GLTFLoader().load("./spaceship.glb", gltf => {
	scene.add(ship = bake(gltf.scene.children[0]));
	renderer.setAnimationLoop(animate);
});

const clock = new THREE.Clock();
const forward = new THREE.Vector3();
const target = new THREE.Vector3();
const turn = new THREE.Quaternion();
const ROLL_AXIS = new THREE.Vector3(0, 0, -1);
const PITCH_AXIS = new THREE.Vector3(1, 0, 0);

function animate(){
	// ⚠ Drain the clock BEFORE the pause check — a delta that accumulated across a
	// paused minute would teleport the ship on the frame you unpause.
	const dt = clock.getDelta();

	if (paused) return;

	forward.set(0, 0, -1).applyQuaternion(ship.quaternion);
	ship.position.addScaledVector(forward, (control.boost ? 500 : 100) * dt);
	ship.updateMatrixWorld();

	ship.quaternion.multiply(turn.setFromAxisAngle(ROLL_AXIS, control.roll * 2 * dt));
	ship.quaternion.multiply(turn.setFromAxisAngle(PITCH_AXIS, control.pitch * dt));

	// Lerp, not copy: the camera lags the ship, which is what reads as speed.
	camera.position.lerp(target.copy(camera.offset).applyMatrix4(ship.matrixWorld), 0.05);
	camera.quaternion.slerp(ship.quaternion, 0.05);

	renderer.render(scene, camera);
}

/* The model is authored facing +Z and sitting half a unit high. Baking that
   correction into the GEOMETRY (rather than leaving it on the transform) frees
   the ship's own position/quaternion to be pure flight state. */
function bake(ship){
	ship.rotation.y = Math.PI;
	ship.position.y -= 0.5;
	ship.updateMatrix();

	for (const child of ship.children) child.geometry.applyMatrix4(ship.matrix);

	ship.position.set(0, 0, 0);
	ship.rotation.set(0, 0, 0);
	ship.updateMatrix();

	return ship;
}

function world(){
	scene.add(new THREE.Mesh(
		new THREE.PlaneGeometry(10000, 10000),
		new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
	).rotateX(Math.PI / 2));

	// One draw call for a thousand towers.
	const towers = new THREE.InstancedMesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshStandardMaterial({ color: 0x444444 }),
		1000
	);
	const matrix = new THREE.Matrix4();

	for (let i = 0; i < towers.count; i++){
		const height = Math.random() * 1000;

		matrix.makeScale(Math.random() * 100, height, Math.random() * 100);
		matrix.setPosition(Math.random() * 10000 - 5000, height / 2 + 0.1, Math.random() * 10000 - 5000);
		towers.setMatrixAt(i, matrix);
	}

	const sun = new THREE.DirectionalLight(0xffffff, 10);
	sun.position.set(500, 1500, 200);

	scene.add(towers, sun, new THREE.GridHelper(1000, 10), new THREE.AmbientLight(0xffffff, 0.5));
}

function hud(){
	div.c("hud", () => {
		// No spacebar on touch, so the stick boosts on its own (joystick.js).
		div(is.mobile()
			? "Drag the circle to fly"
			: "Drag the circle to fly · Space to boost · P to pause");
		a("← lew42").href("/");
	});
}

function keys(){
	addEventListener("keydown", e => {
		if (e.code === "Space") control.boost = true;
		if (e.code === "KeyP") paused = !paused;
	});

	addEventListener("keyup", e => {
		if (e.code === "Space") control.boost = false;
	});

	// A phone's on-screen chrome eats a third of the viewport; the game wants it back.
	if (is.mobile())
		document.documentElement.addEventListener("click", function full(){
			document.documentElement.requestFullscreen?.();
			document.documentElement.removeEventListener("click", full);
		});
}

function resize(){
	renderer.setSize(innerWidth, innerHeight);
	camera.aspect = innerWidth / innerHeight;
	camera.updateProjectionMatrix();
}
