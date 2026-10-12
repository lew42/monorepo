// Shots.test.mjs — PNG round-trip and Diff region-finding, no browser involved.
// Run: node public/framework/ext/Shots/Shots.test.mjs
import { PNG } from "./PNG.mjs";
import { Diff } from "./Diff.mjs";

const results = [];
function check(name, ok){ results.push([name, ok]); console.log(`${ok ? "PASS" : "FAIL"} — ${name}`); }

// ---- PNG round-trip: a synthetic RGBA image, encode then decode, bytes must match -------
{
	const width = 37, height = 23;   // odd sizes on purpose — no accidental alignment with 16px cells
	const data = new Uint8Array(width * height * 4);
	for (let y = 0; y < height; y++){
		for (let x = 0; x < width; x++){
			const i = (y * width + x) * 4;
			data[i] = (x * 7) % 256; data[i + 1] = (y * 11) % 256; data[i + 2] = (x + y) % 256; data[i + 3] = 255;
		}
	}
	const buf = PNG.encode({ width, height, data });
	const back = PNG.decode(buf);
	check("PNG round-trip: dimensions match", back.width === width && back.height === height);
	check("PNG round-trip: pixels match", Buffer.from(back.data).equals(Buffer.from(data)));
}

// ---- Diff: two images identical except one known rectangle, region must land on it ------
{
	const width = 160, height = 128;
	const base = () => {
		const data = new Uint8Array(width * height * 4);
		for (let i = 0; i < data.length; i += 4){ data[i] = 200; data[i + 1] = 200; data[i + 2] = 200; data[i + 3] = 255; }
		return { width, height, data };
	};
	const before = base();
	const after = base();
	// A known changed rectangle: x 48..96 (3 cells wide), y 32..64 (2 cells tall) — bright red
	const KNOWN = { x: 48, y: 32, w: 48, h: 32 };
	for (let y = KNOWN.y; y < KNOWN.y + KNOWN.h; y++){
		for (let x = KNOWN.x; x < KNOWN.x + KNOWN.w; x++){
			const i = (y * width + x) * 4;
			after.data[i] = 250; after.data[i + 1] = 10; after.data[i + 2] = 10;
		}
	}
	const result = Diff.compare(before, after, { cell: 16 });
	check("Diff: finds exactly one region", result.regions.length === 1);
	const [rx, ry, rw, rh] = result.regions[0] || [];
	// Regions are cell-aligned (16px), so the found box must CONTAIN the known rectangle exactly,
	// cell-snapped: x 48→48 (cell 3), y 32→32 (cell 2), w 48 (cells 3), h 32 (cells 2) — no slack.
	check("Diff: region matches the known rectangle", rx === KNOWN.x && ry === KNOWN.y && rw === KNOWN.w && rh === KNOWN.h);
	check("Diff: overlay is the same size as the compared area", result.overlay.width === width && result.overlay.height === height);
	check("Diff: height report is [before, after]", result.height[0] === height && result.height[1] === height);
	check("Diff: unchanged image reports zero regions", Diff.compare(before, base()).regions.length === 0);
}

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
