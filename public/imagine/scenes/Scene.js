import { Page, View, div, a, el, span, is } from "/app.js";
import * as THREE from "/fly/three.js";

View.stylesheet(import.meta, "scenes.css");

export { THREE };

/* A SCENE PAGE. The tree is the scene graph: every page owns one `slot` of the
   world and `build()`s it, and the ACTIVE CHAIN is the composition — walk it root
   to leaf, the deeper page wins its slot, and whatever nobody claims is gone. That
   one rule is all three swap grains:

     slot: "world"   a child replaces the whole world       full scene swap
     slot: "focus"   one mesh changes, the room persists    single object swap
     slot: "north"   one zone changes, the rest persists    region swap

   Because the world is DERIVED from the chain rather than accumulated by clicks, a
   cold load of a deep url and a walk down to it land in the same state. doc/slots.md */
export class Scene extends Page {

	// The nearest page up the chain (me included) that owns the canvas.
	stage_host(){ return this.chain().find(page => page.scenic); }

	/* ⚠ `/imagine/` IS A COLUMNS HOST, and a columns host claims its whole subtree.
	   Left alone, every scene below would render as another column in that row —
	   and a `full` one would collapse the very column the canvas lives in. A scene
	   subtree is one canvas with a tree of states behind it, not a row, so
	   everything BELOW the host opts out of both halves of the columns contract:
	   the shape here, the mount below. The host itself stays a column, because that
	   is how it takes its place in `/imagine/`. */
	column_host(){ return this === this.stage_host() ? super.column_host() : undefined; }

	container(){
		const host = this.stage_host();
		return host && host !== this ? this.mounts_in(host.$notes, "the scene notes") : super.container();
	}

	// ⚠ BOTH hooks. Going UP the chain activates nothing — Router.activate() only
	//   touches what changed — so a world refreshed from activate() alone would keep
	//   the departed leaf's objects forever. Same trap core/Page hit with its crumbs.
	activated(){ this.stage_host()?.recompose(); }
	deactivated(){ this.stage_host()?.recompose(); }

	// ════ THE HOST'S CHROME — 2D around, over and under the 3D ═══════════════
	// Called from the host's own content(), synchronously: the views exist here,
	// their boxes do not, and the Stage's ResizeObserver is what waits for them.
	staging(){
		this.$bar = div.c("scene-bar");

		// ⚠ `bleed`, the one word that reaches the edge of BOTH containers this page
		//   can find itself in: the column's inset, or the page grid's gutters.
		const box = div.c("scene-stage bleed", () => {
			this.$canvas = el("canvas").ac("scene-canvas");
			this.$tip = div.c("scene-tip");
			div.c("scene-hint", "Click anything that lights up.");
		});

		this.$nav = div.c("scene-nav");
		// ⚠ NOT `$pages`: render_column() assigns its own `$pages` AFTER content()
		//   runs, so a region parked there would be silently replaced. container()
		//   above is what routes the children here instead.
		this.$notes = div.c("scene-notes");

		this.stage = new Scene.Stage({ page: this, box, canvas: this.$canvas, tip: this.$tip });
		return this;
	}

	/* Rebuilt after EVERY navigation in the subtree, from `router.active` — never
	   from whichever page happened to call. One rAF of debounce, because deactivate()
	   runs before activate() and only after both does the router know where you are. */
	recompose(){
		if (this.pending) return this;

		this.pending = requestAnimationFrame(() => {
			this.pending = null;

			const page = this.app.router.active;
			if (!page?.chain().includes(this)) return this.stage.stop();

			this.stage.compose(page.chain());
			this.$bar.empty(() => page.crumbs(this));
			this.$nav.empty(() => this.nav_row(page));

			// ⚠ Router.mark() ran a frame ago, before these links existed — without
			//   this the row never shows where you are. It is callable bare for
			//   exactly this case (Router.mark_links).
			this.app.router.mark_links();
			this.stage.start();
		});

		return this;
	}

	/* The 2D half of the navigation. The arrangement contract shows ONE note at a
	   time — a marked ancestor with a marked later sibling is hidden — so this row
	   is the one place a reader can always see the doors out of where they are. */
	nav_row(page){
		const from = page.children.size ? page : page.parent;

		span.c("scene-nav-label", from === page ? "Enter" : "Switch");

		if (from !== page) a.c("scene-nav-link", from.title).href(from.url);

		[...from.children.keys()].forEach(name => {
			const nav = from.nav_for(name);
			a.c("scene-nav-link", nav.label).href(nav.url);
		});
	}
}

Scene.prototype.slot = "world";   // ⚠ prototype, never a class field: a field initialises AFTER super() and would clobber what assign() set.

/* THE STAGE — one renderer, one canvas, one loop, for the whole subtree. */
Scene.Stage = class Stage {

	constructor(...args){ this.assign(...args); this.boot(); }
	assign(...args){ return Object.assign(this, ...args); }

	boot(){
		this.slots = new Map();      // slot name -> { page, group }
		this.frames = 0;             // the proof that the loop stopped
		this.clock = new THREE.Clock();

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
		this.camera.position.set(0, 3, 10);
		this.aim = new THREE.Vector3(0, 1, 0);
		this.want = { eye: this.camera.position.clone(), aim: this.aim.clone() };

		// alpha, and never a clear COLOUR: the canvas is transparent and the CSS box
		// behind it is the sky, so light and dark come free from the theme.
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.el, alpha: true, antialias: true });
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		this.renderer.setClearAlpha(0);

		// Highlights roll off instead of clipping to white, which is what a plain
		// key light over a pale theme does to every pale material in front of it.
		this.renderer.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;

		// Contact, not float. Enabled once here; a scene opts in by asking sky() for a
		// `shadow`, and only ONE light per scene ever casts. doc/atmosphere.md
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();

		// ⚠ A page is BUILT DETACHED — every rect here is 0, and no number of frames
		//   fixes that. The observer fires the moment the box has a size, and again on
		//   every resize, which is exactly when the camera needs its aspect back.
		new ResizeObserver(() => this.resize()).observe(this.box.el);

		this.canvas.on("pointermove", e => this.hover(e));
		this.canvas.on("pointerleave", () => this.hover(null));
		this.canvas.on("click", e => this.pick(e));
		return this;
	}

	/* The palette, read back RESOLVED. `getPropertyValue("--ink")` hands back the
	   literal `light-dark(…)` text, which no colour parser takes — so scenes.css
	   spends four real properties on the stage box and we read those instead. */
	theme(){
		const css = getComputedStyle(this.box.el);
		const sky = new THREE.Color(css.backgroundColor || "#ffffff");

		this.painted = this.signature(css);

		return {
			sky,
			ink: new THREE.Color(css.color || "#333333"),
			line: new THREE.Color(css.borderTopColor || "#dddddd"),
			prim: new THREE.Color(css.outlineColor || "#ff6157"),
			dark: sky.getHSL({}).l < 0.5,
		};
	}

	signature(css = getComputedStyle(this.box.el)){ return css.backgroundColor + "|" + css.color + "|" + css.outlineColor; }

	/* ⚠ THE PALETTE ARRIVES LATE AND CAN CHANGE UNDER YOU. The stylesheet is a
	   <link>, so the first build can read an unstyled box — and every colour comes
	   back white with only a console *warning*. The mode pill does the same thing on
	   purpose. So the signature is checked, and a world built from the wrong colours
	   rebuilds itself from the right ones. */
	check_theme(){
		if (this.signature() === this.painted) return this;

		const was = [...this.slots.entries()];

		was.forEach(([name]) => this.drop(name));
		was.forEach(([name, slot]) => this.put(name, slot.page));
		return this;
	}

	// ════ COMPOSITION ════════════════════════════════════════════════════════
	// Root to leaf, deeper wins. A slot whose page did not change is NEVER rebuilt
	// — which is what makes "the rest persists" true rather than merely redrawn.
	compose(chain){
		const want = new Map();
		chain.forEach(page => is.fn(page.build) && want.set(page.slot, page));

		for (const name of [...this.slots.keys()])
			if (want.get(name) !== this.slots.get(name).page) this.drop(name);

		// Back to a transparent canvas over the themed box. A world that wants its
		// own weather paints over it again in sky({ tint }); one that does not gets
		// light and dark mode back for free.
		this.renderer.setClearAlpha(0);

		for (const [name, page] of want)
			if (!this.slots.has(name)) this.put(name, page);

		const framed = chain.findLast(page => page.camera);
		if (framed){
			this.want.eye.fromArray(framed.camera.eye);
			this.want.aim.fromArray(framed.camera.aim);
		}

		this.hovered = null;
		if (!this.running) this.frame();
		return this;
	}

	put(name, page){
		this.palette = this.theme();

		const group = page.build(this, this.palette) ?? new THREE.Group();

		group.name = name;
		this.scene.add(group);
		this.slots.set(name, { page, group });
		return group;
	}

	drop(name){
		const slot = this.slots.get(name);

		this.slots.delete(name);
		this.scene.remove(slot.group);
		Stage.dispose(slot.group);
		return this;
	}

	// Every geometry, material and texture under it. GL memory is not garbage
	// collected — a world swapped fifty times leaks fifty worlds without this.
	static dispose(root){
		root.traverse(node => {
			// ⚠ EVERY Sprite in three shares ONE geometry, lazily made on the first one.
			//   Disposing it here frees the buffers of every label still on screen.
			if (!node.isSprite) node.geometry?.dispose();

			// ⚠ A LIGHT OWNS A TEXTURE TOO. Its shadow map is a render target with no
			//   material and no geometry, so the loop below never sees it — forty
			//   swaps leaked twenty of them, measured. `Light.dispose()` frees it.
			if (node.isLight) node.dispose?.();

			for (const material of [node.material].flat()){
				if (!material) continue;
				for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
				material.dispose();
			}
		});
	}

	// ════ THE LOOP ═══════════════════════════════════════════════════════════
	start(){
		if (this.running) return this;

		this.running = true;
		this.clock.getDelta();   // drain: a delta banked while paused would teleport everything
		this.renderer.setAnimationLoop(() => this.frame());
		return this;
	}

	// Nothing is scheduled while the page is off screen — `frames` stops counting.
	stop(){
		this.running = false;
		this.renderer.setAnimationLoop(null);
		return this;
	}

	frame(){
		const dt = Math.min(this.clock.getDelta(), 0.1);

		this.frames++;
		if (this.frames % 8 === 0) this.check_theme();

		// The camera stands further back on a narrow canvas — see resize().
		this.step ??= new THREE.Vector3();
		this.step.copy(this.want.eye).sub(this.want.aim).multiplyScalar(this.dolly ?? 1).add(this.want.aim);

		this.camera.position.lerp(this.step, 0.07);
		this.aim.lerp(this.want.aim, 0.07);
		this.camera.lookAt(this.aim);

		this.slots.forEach(slot => slot.page.tick?.(dt, slot.group, this));
		this.renderer.render(this.scene, this.camera);
	}

	resize(){
		const w = this.box.el.clientWidth, h = this.box.el.clientHeight;
		if (!w || !h) return;

		this.camera.aspect = w / h;

		// ⚠ A 45° VERTICAL fov crops the world sideways the moment the canvas stops
		//   being wide — at 400 the stage is taller than it is wide and the scene
		//   loses its edges. Widen until the HORIZONTAL view is back.
		// ⚠ Floored, not just capped: holding the horizontal view CONSTANT at 400
		//   turns the whole vertical fov into empty sky and the subject shrinks. A
		//   floor of 0.72 trades a mild side crop for a scene you can see.
		const squeeze = Math.min(Math.max(this.camera.aspect / 1.6, 0.72), 1);

		this.camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(45) / 2) / squeeze));
		// And stand back, so the edges of the scene stay in frame.
		// ⚠ 1.25, was 0.65: at 400 the widened fov still only bought back a third of
		//   the horizontal view, and the outermost door of the hub — and the outermost
		//   picture in the gallery — were cut off the sides of the canvas entirely.
		this.dolly = 1 + (1 - squeeze) * 1.25;

		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h, false);   // `false`: CSS owns the box, this owns the buffer
		if (!this.running) this.frame();
	}

	dispose(){
		this.stop();
		[...this.slots.keys()].forEach(name => this.drop(name));
		this.renderer.dispose();
		return this;
	}

	// ════ CLICKING THE WORLD ═════════════════════════════════════════════════
	// What makes an object a LINK: a url in userData and an emissive it can raise.
	// ⚠ The material is CLONED — a shared one would light every mesh that borrowed it.
	link(group, url, label){
		group.userData.url = url;
		group.userData.label = label;

		group.traverse(node => {
			if (!node.material?.emissive) return;

			node.material = node.material.clone();
			node.material.emissive.copy(node.material.color);
			node.material.emissiveIntensity = 0;
		});

		return group;
	}

	// The nearest hit whose object — or any ancestor of it — carries a url.
	hit(e){
		const box = this.canvas.el.getBoundingClientRect();
		if (!box.width) return null;

		this.pointer.set((e.clientX - box.left) / box.width * 2 - 1, 1 - (e.clientY - box.top) / box.height * 2);
		this.raycaster.setFromCamera(this.pointer, this.camera);

		for (const found of this.raycaster.intersectObjects(this.scene.children, true))
			for (let node = found.object; node; node = node.parent)
				if (node.userData.url) return node;

		return null;
	}

	hover(e){
		const target = e && this.hit(e);
		if (target === this.hovered) return;

		this.lit(this.hovered, 0);
		this.lit(this.hovered = target, 0.45);

		this.canvas.el.style.cursor = target ? "pointer" : "";
		this.tip.el.textContent = target?.userData.label ?? "";
		this.tip.el.classList.toggle("scene-tip-on", !!target);

		if (!this.running) this.frame();
	}

	lit(target, amount){
		target?.traverse(node => { if (node.material?.emissive) node.material.emissiveIntensity = amount; });
		target?.scale.setScalar(amount ? 1.05 : 1);
	}

	pick(e){
		const target = this.hit(e);
		if (target) this.page.app.router.go(target.userData.url);
	}

	// ════ A SMALL KIT, so a scene file is scenery and nothing else ═══════════
	mat(color, more){ return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...more }); }

	// ⚠ A world must look the SAME cold-loaded as it does when you walk to it, so
	//   nothing that scatters anything may call Math.random(). Seed it.
	rand(seed){
		let s = seed >>> 0;
		return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
	}

	mesh(geometry, color, more){ return new THREE.Mesh(geometry, this.mat(color, more)); }

	// ════ THE 2D KIT — a <canvas> IS a texture, and that is the whole marriage ══
	/* Every flat thing in these worlds is drawn with the browser's ordinary 2D
	   context and handed to a material: the name plates, the gradient skies, the
	   pictures in the gallery. One idea, three uses, no image files and no fetches.
	   ⚠ Linear filtering and no mipmaps — a bitmap shown at the size it was drawn
	   gains nothing from them and loses its edges. */
	paint(w, h, draw){
		const canvas = Object.assign(document.createElement("canvas"), { width: w, height: h });

		draw(canvas.getContext("2d"), w, h);

		const map = new THREE.CanvasTexture(canvas);

		map.colorSpace = THREE.SRGBColorSpace;
		map.minFilter = map.magFilter = THREE.LinearFilter;
		map.generateMipmaps = false;
		return map;
	}

	/* A NAME, IN THE WORLD — in the theme's own font, on the ink/surface pair
	   `.scene-tip` uses in 2D. That pair is the only one that reads on a cream world
	   and a near-black one alike, so one plate works everywhere without a branch.

	   ⚠ A Sprite, not a plane: it faces the camera from any angle for free, and it
	   raycasts — so a plate inside a linked group is part of the link, not a dead
	   patch in front of it. */
	label(text, { size = 0.32, ink, paper, alpha = 0.88 } = {}){
		const font = `600 44px ${getComputedStyle(this.box.el).fontFamily || "system-ui, sans-serif"}`;
		const gauge = document.createElement("canvas").getContext("2d");

		gauge.font = font;

		const h = 96, w = Math.ceil(gauge.measureText(text).width) + 72;
		const back = "#" + (paper ?? this.palette.ink).getHexString();
		const letters = "#" + (ink ?? this.palette.sky).getHexString();

		const map = this.paint(w, h, (ctx) => {
			ctx.globalAlpha = alpha;
			ctx.fillStyle = back;
			ctx.beginPath();
			ctx.roundRect(2, 2, w - 4, h - 4, (h - 4) / 2);
			ctx.fill();

			ctx.globalAlpha = 1;
			ctx.font = font;
			ctx.fillStyle = letters;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, w / 2, h / 2 + 3);
		});

		const plate = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, toneMapped: false, fog: false }));

		plate.scale.set(size * w / h, size, 1);
		return plate;
	}

	/* THE SKY, PAINTED — a vertical ramp on the inside of a dome, from the same 2D
	   kit. `fog: false` so it never dissolves into itself, `depthWrite: false` and
	   `renderOrder: -1` so it is behind everything without occluding anything. */
	dome(horizon, high){
		const map = this.paint(4, 256, (ctx, w, h) => {
			const ramp = ctx.createLinearGradient(0, 0, 0, h);

			ramp.addColorStop(0, "#" + high.getHexString());
			ramp.addColorStop(0.62, "#" + high.clone().lerp(horizon, 0.7).getHexString());
			ramp.addColorStop(1, "#" + horizon.getHexString());
			ctx.fillStyle = ramp;
			ctx.fillRect(0, 0, w, h);
		});

		const shell = new THREE.Mesh(
			new THREE.SphereGeometry(150, 24, 16),
			// ⚠ `dithering` — a two-stop ramp across a whole sky bands visibly in 8 bits,
			//   and on a dark world the bands read as horizontal stripes.
			new THREE.MeshBasicMaterial({ map, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false, dithering: true })
		);

		shell.renderOrder = -1;
		return shell;
	}

	/* A key light, a rim, a bounce, and fog that dissolves the far edge into whatever
	   the sky is — the seam between the 2D box and the 3D world, hidden.

	   `tint` is the world's own weather: it paints the canvas opaque and fogs to the
	   same colour; `high` hangs a painted gradient above it. Leave `tint` out and the
	   canvas stays transparent over the themed CSS box, which is what makes the hub
	   light- and dark-aware for nothing.

	   ⚠ The rim is not decoration. One key over a pale world leaves every silhouette
	   the same value as its background — that is exactly what "gray and reserved"
	   looks like. A second directional from behind costs no shadow map and gives
	   every form an edge. Set `rim: 0` for a world that wants to read as flat.

	   `shadow` is the half-width of the shadow camera, and the ONLY thing in this kit
	   that ever casts: one light, one map, opted into per scene.

	   ⚠ `fill` is the hemisphere bounce, and 0.5 is a DAYLIT number. A night world at
	   0.5 reads as an overcast afternoon however low its key is — the observatory runs
	   at 0.2 in dark mode. Lower it before reaching for a darker key.

	   ⚠ `near` is the fraction of `fog` at which the haze STARTS, and it is not a
	   detail: at the default 0.3 a scene whose subject stands nine units out is
	   already fading, which is what washed the hub's portals into its own sky. Push
	   it past the subject and pull `fog` in to just past the floor's edge instead. */
	sky(group, { sun = 0xffffff, bounce, fog = 40, near = 0.3, power = 1.35, tint, high, at = [7, 13, 9], rim = 0.4, fill = 0.5, shadow } = {}){
		const air = tint ? new THREE.Color(tint) : this.palette.sky;
		const key = new THREE.DirectionalLight(sun, power);
		const back = new THREE.DirectionalLight(sun, power * rim);

		if (tint) this.renderer.setClearColor(air, 1);
		if (high) group.add(this.dome(air, new THREE.Color(high)));

		key.position.set(...at);
		back.position.set(-at[0], Math.abs(at[1]) * 0.55, -at[2]);

		if (shadow){
			const frame = key.shadow.camera;

			key.castShadow = true;
			key.shadow.mapSize.set(1024, 1024);
			key.shadow.bias = -0.0012;
			key.shadow.normalBias = 0.04;
			frame.left = frame.bottom = -shadow;
			frame.right = frame.top = shadow;
			frame.near = 0.5;
			frame.far = 140;
		}

		group.add(key, back, new THREE.HemisphereLight(sun, bounce ?? air, fill));
		this.scene.fog = new THREE.Fog(air, fog * near, fog);
		return group;
	}

	/* Opt a group into the shadow pass — call it on the SUBJECT, never on a whole
	   world, or the 150-unit sky dome casts too. ⚠ Transparent materials are skipped
	   on purpose: a name plate casting a rectangle on the floor is not a shadow. */
	casts(object){
		object.traverse(node => { if (node.isMesh && !node.material.transparent) node.castShadow = true; });
		return object;
	}

	// Always receives: harmless when nothing casts, and the one surface that makes a
	// scene read as a place rather than a diagram when something does.
	floor(group, color, radius = 30){
		const disc = this.mesh(new THREE.CircleGeometry(radius, 64), color, { roughness: 1 });

		disc.rotation.x = -Math.PI / 2;
		disc.receiveShadow = true;
		group.add(disc);
		return disc;
	}
};
