import { el } from "/app.js";

/* THE PLATES — the observatory's four records, and the furthest the 2D×3D marriage
   goes in this module. Each `draw()` runs TWICE, unchanged: once into a
   `CanvasTexture` on a glass plate standing in the rack, once into a `<canvas>` in
   the caption card under the stage. The same picture is the world's object and the
   page's illustration, so the two halves of the screen cannot drift apart.

   ⚠ Every plate is painted in its OWN colours, never the theme's. A photographic
   plate is a physical thing and does not turn over with the colour scheme — the same
   argument the gallery's pictures make, and the reason a plate needs no redraw when
   the mode pill flips.

   Four idioms on purpose, so the rack reads as a series and not as four buttons:
   a star chart, a photograph, an instrument diagram, a graph. */

/* The same LCG as `Stage.rand`, duplicated on purpose: this file may not know about
   three.js, and the two surfaces must draw the SAME picture — which means the same
   sequence, from the same seed, in both. */
export const rand = seed => {
	let s = seed >>> 0;
	return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

/* ONE LIST OF STARS, THREE RENDERINGS: the chart on plate 041, the figure hanging 40
   units out in the sky, and the cluster on the foyer's door. `[x, y, magnitude]`,
   normalised — the 3D side maps the same pairs onto a patch of sky. */
export const VELA = {
	stars: [[0.20, 0.27, 1], [0.37, 0.13, 0.6], [0.54, 0.30, 0.85], [0.72, 0.19, 0.48],
	        [0.81, 0.47, 0.72], [0.60, 0.57, 0.95], [0.40, 0.51, 0.55], [0.23, 0.71, 0.68], [0.53, 0.80, 0.42]],
	lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [6, 7], [7, 8], [8, 5]],
};

// ════ THE SHARED FURNITURE OF A PLATE ════════════════════════════════════════
// The emulsion (or the card stock), its grain, and the inscription along the bottom
// margin — a real plate is written on in china marker, so the name is IN the picture.

function sheet(ctx, w, h, random, { base, grain = 80, speck = "#dfe8fb" }){
	const ramp = ctx.createLinearGradient(0, 0, w * 0.4, h);

	ramp.addColorStop(0, base[0]);
	ramp.addColorStop(1, base[1]);
	ctx.fillStyle = ramp;
	ctx.fillRect(0, 0, w, h);

	for (let i = 0; i < grain; i++){
		ctx.globalAlpha = 0.04 + random() * 0.09;
		ctx.fillStyle = speck;
		ctx.fillRect(random() * w, random() * h, w * 0.007, w * 0.007);
	}

	ctx.globalAlpha = 1;
}

function mark(ctx, w, h, title, sub, tint){
	ctx.strokeStyle = tint;
	ctx.lineWidth = Math.max(1, w * 0.006);
	ctx.globalAlpha = 0.4;
	ctx.strokeRect(w * 0.055, h * 0.045, w * 0.89, h * 0.83);

	ctx.textAlign = "left";
	ctx.textBaseline = "alphabetic";
	ctx.fillStyle = tint;
	ctx.globalAlpha = 0.95;
	ctx.font = `700 ${Math.round(w * 0.082)}px ui-monospace, monospace`;
	ctx.fillText(title.toUpperCase(), w * 0.06, h * 0.935);

	ctx.globalAlpha = 0.55;
	ctx.font = `${Math.round(w * 0.055)}px ui-monospace, monospace`;
	ctx.fillText(sub, w * 0.06, h * 0.981);
	ctx.globalAlpha = 1;
}

// A star: a wide halo, a soft skirt, a hard core. Three discs, no gradient object.
function glint(ctx, x, y, r, color){
	ctx.fillStyle = color;

	[[3.4, 0.14], [1.8, 0.4], [1, 1]].forEach(([scale, alpha]) => {
		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.arc(x, y, r * scale, 0, Math.PI * 2);
		ctx.fill();
	});
}

function field(ctx, w, h, random, count, color){
	ctx.fillStyle = color;

	for (let i = 0; i < count; i++){
		ctx.globalAlpha = 0.12 + random() * 0.5;
		ctx.beginPath();
		ctx.arc(random() * w, random() * h, w * (0.003 + random() * 0.006), 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.globalAlpha = 1;
}

const EMULSION = "#dfe8fb", GRAPHITE = "#2b3244";

// ════ THE FOUR RECORDS ═══════════════════════════════════════════════════════
export const PLATES = {

	/* 041 — the chart. The same nine stars the sky is built from, so the plate is a
	   record of the sighting rather than an illustration of it. */
	vela: {
		name: "vela", title: "Vela", seed: 41,
		facts: ["plate 041", "38 min", "slot: sky"],
		note: "**Region swap.** Only the patch of sky is built. The star field, the ridge, the instrument and the rack are the same objects they were a moment ago — and the telescope, which nobody rebuilt, has turned to look at it.",

		draw(ctx, w, h, random){
			const at = star => [w * (0.16 + star[0] * 0.68), h * (0.13 + star[1] * 0.58)];

			sheet(ctx, w, h, random, { base: ["#0a1124", "#161f38"] });
			field(ctx, w, h, random, 150, EMULSION);

			ctx.strokeStyle = "#7fb6dd";
			ctx.globalAlpha = 0.5;
			ctx.lineWidth = w * 0.005;
			ctx.beginPath();
			VELA.lines.forEach(([a, b]) => { ctx.moveTo(...at(VELA.stars[a])); ctx.lineTo(...at(VELA.stars[b])); });
			ctx.stroke();
			ctx.globalAlpha = 1;

			VELA.stars.forEach(star => glint(ctx, ...at(star), w * (0.007 + star[2] * 0.015), "#eaf1ff"));
			mark(ctx, w, h, "Vela", "21h 40m  -47", EMULSION);
		},
	},

	/* 068 — the photograph. A ring nebula: one radial ramp, a field, and two
	   scratches in the emulsion, because a plate that has been handled has them. */
	ring: {
		name: "ring", title: "The Ring", seed: 68,
		facts: ["plate 068", "62 min", "slot: plate"],
		note: "**Object swap.** One plate leaves the rack and stands on the easel under its own lamp. Nothing else in the observatory is touched — and the picture you are reading is literally the plate that is missing from the rack.",

		draw(ctx, w, h, random){
			const cx = w * 0.5, cy = h * 0.42, r = w * 0.3;
			const halo = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);

			sheet(ctx, w, h, random, { base: ["#0b1020", "#121a2e"] });
			field(ctx, w, h, random, 90, EMULSION);

			halo.addColorStop(0, "rgba(24, 54, 86, 0.2)");
			halo.addColorStop(0.44, "rgba(96, 214, 200, 0.5)");
			halo.addColorStop(0.74, "rgba(146, 122, 208, 0.38)");
			halo.addColorStop(1, "rgba(10, 16, 32, 0)");
			ctx.fillStyle = halo;
			ctx.beginPath();
			ctx.arc(cx, cy, r, 0, Math.PI * 2);
			ctx.fill();

			glint(ctx, cx, cy, w * 0.008, "#eaf1ff");

			ctx.strokeStyle = EMULSION;
			ctx.lineWidth = w * 0.003;
			ctx.globalAlpha = 0.22;
			[[0.18, 0.2, 0.42, 0.68], [0.62, 0.12, 0.71, 0.46]].forEach(([x1, y1, x2, y2]) => {
				ctx.beginPath();
				ctx.moveTo(w * x1, h * y1);
				ctx.lineTo(w * x2, h * y2);
				ctx.stroke();
			});
			ctx.globalAlpha = 1;

			mark(ctx, w, h, "The Ring", "18h 53m  +33", EMULSION);
		},
	},

	/* 007 — the diagram, on card stock rather than emulsion: what the field of view
	   holds, and how wide it is. The one plate that is drawn in ink. */
	eyepiece: {
		name: "eyepiece", title: "Eyepiece", seed: 7,
		facts: ["card 007", "1.6 deg", "camera only"],
		note: "**Camera swap — the smallest page in the module.** It declares a camera and a direction to look, and no `build()` at all. Nothing is created and nothing is disposed; only where you stand has changed.",

		draw(ctx, w, h, random){
			const cx = w * 0.5, cy = h * 0.4, r = w * 0.31;

			sheet(ctx, w, h, random, { base: ["#efe8d7", "#e1d8c1"], grain: 40, speck: GRAPHITE });

			ctx.strokeStyle = GRAPHITE;
			ctx.lineWidth = w * 0.008;
			ctx.globalAlpha = 0.85;
			ctx.beginPath();
			ctx.arc(cx, cy, r, 0, Math.PI * 2);
			ctx.stroke();

			ctx.lineWidth = w * 0.004;
			for (let i = 0; i < 24; i++){
				const a = i * Math.PI / 12, long = i % 6 === 0;

				ctx.globalAlpha = long ? 0.8 : 0.3;
				ctx.beginPath();
				ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
				ctx.lineTo(cx + Math.cos(a) * r * (long ? 0.86 : 0.93), cy + Math.sin(a) * r * (long ? 0.86 : 0.93));
				ctx.stroke();
			}

			ctx.globalAlpha = 0.25;
			ctx.beginPath();
			ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
			ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
			ctx.stroke();

			glint(ctx, cx + r * 0.3, cy - r * 0.2, w * 0.015, GRAPHITE);

			// The scale bar, with its end caps — the one number a diagram owes you.
			ctx.globalAlpha = 0.8;
			ctx.lineWidth = w * 0.006;
			ctx.beginPath();
			ctx.moveTo(w * 0.24, h * 0.76); ctx.lineTo(w * 0.76, h * 0.76);
			ctx.moveTo(w * 0.24, h * 0.735); ctx.lineTo(w * 0.24, h * 0.785);
			ctx.moveTo(w * 0.76, h * 0.735); ctx.lineTo(w * 0.76, h * 0.785);
			ctx.stroke();

			ctx.fillStyle = GRAPHITE;
			ctx.textAlign = "center";
			ctx.font = `${Math.round(w * 0.058)}px ui-monospace, monospace`;
			ctx.fillText("1.6 deg", w * 0.5, h * 0.725);
			ctx.globalAlpha = 1;

			mark(ctx, w, h, "Eyepiece", "24mm  x 62", GRAPHITE);
		},
	},

	/* 003 — the graph. Sky brightness against the hour, with the moment the stars go
	   out marked on it: the only plate that is data. */
	daybreak: {
		name: "daybreak", title: "Daybreak", seed: 3,
		facts: ["chart 003", "04h - 06h", "slot: hour"],
		note: "**Light swap.** The hour claims a slot holding one warm light and a glow on the ridge — and the star field, which belongs to the parent and was never rebuilt, simply goes out. The instrument stows itself.",

		draw(ctx, w, h, random){
			const x0 = w * 0.12, x1 = w * 0.9, y0 = h * 0.12, y1 = h * 0.68;
			const curve = t => Math.pow(Math.max(t - 0.38, 0) / 0.62, 1.8);
			const warm = ctx.createLinearGradient(0, y0, 0, y1);

			sheet(ctx, w, h, random, { base: ["#f2ecdb", "#e5dbc3"], grain: 30, speck: GRAPHITE });

			ctx.strokeStyle = GRAPHITE;
			ctx.lineWidth = Math.max(1, w * 0.002);
			ctx.globalAlpha = 0.16;
			ctx.beginPath();
			for (let i = 0; i <= 8; i++){ ctx.moveTo(x0 + (x1 - x0) * i / 8, y0); ctx.lineTo(x0 + (x1 - x0) * i / 8, y1); }
			for (let i = 0; i <= 5; i++){ ctx.moveTo(x0, y0 + (y1 - y0) * i / 5); ctx.lineTo(x1, y0 + (y1 - y0) * i / 5); }
			ctx.stroke();

			warm.addColorStop(0, "rgba(231, 146, 62, 0.9)");
			warm.addColorStop(1, "rgba(231, 146, 62, 0.05)");
			ctx.fillStyle = warm;
			ctx.globalAlpha = 1;
			ctx.beginPath();
			ctx.moveTo(x0, y1);
			for (let i = 0; i <= 60; i++) ctx.lineTo(x0 + (x1 - x0) * i / 60, y1 - (y1 - y0) * curve(i / 60));
			ctx.lineTo(x1, y1);
			ctx.closePath();
			ctx.fill();

			ctx.strokeStyle = "#b4611f";
			ctx.lineWidth = w * 0.008;
			ctx.beginPath();
			for (let i = 0; i <= 60; i++) ctx.lineTo(x0 + (x1 - x0) * i / 60, y1 - (y1 - y0) * curve(i / 60));
			ctx.stroke();

			// The moment the stars go out.
			ctx.setLineDash([w * 0.022, w * 0.022]);
			ctx.strokeStyle = GRAPHITE;
			ctx.lineWidth = w * 0.005;
			ctx.globalAlpha = 0.7;
			ctx.beginPath();
			ctx.moveTo(x0 + (x1 - x0) * 0.38, y0);
			ctx.lineTo(x0 + (x1 - x0) * 0.38, y1);
			ctx.stroke();
			ctx.setLineDash([]);

			ctx.fillStyle = GRAPHITE;
			ctx.textAlign = "left";
			ctx.font = `700 ${Math.round(w * 0.05)}px ui-monospace, monospace`;
			ctx.fillText("FIRST LIGHT", x0 + (x1 - x0) * 0.42, y0 + h * 0.045);
			ctx.globalAlpha = 1;

			mark(ctx, w, h, "Daybreak", "sky brightness", GRAPHITE);
		},
	},
};

export const ORDER = ["vela", "ring", "eyepiece", "daybreak"];

/* The same drawing, on the page instead of in the world. Drawn at 2× and sized by
   CSS, because a bitmap shown larger than it was drawn is the one thing this kit
   cannot fix later. */
export function plate_canvas(plate, w = 216, h = 288){
	const view = el("canvas").ac("scene-plate-art");

	view.el.width = w * 2;
	view.el.height = h * 2;
	plate.draw(view.el.getContext("2d"), w * 2, h * 2, rand(plate.seed));
	return view;
}
