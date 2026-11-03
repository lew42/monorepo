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
	check("Diff: changed_regions is the same array as regions", result.changed_regions === result.regions);
}

// ---- Diff: moved vs changed — one block shifts by (10, 20), another is recoloured ----------
{
	const width = 256, height = 192;
	const base = () => {
		const data = new Uint8Array(width * height * 4);
		for (let i = 0; i < data.length; i += 4){ data[i] = 180; data[i + 1] = 180; data[i + 2] = 180; data[i + 3] = 255; }
		return { width, height, data };
	};
	const before = base();
	// A distinctive block in BEFORE, at (80, 64), 48x48 — a diagonal gradient, not a flat colour,
	// so every 16px cell inside it is unique and a shift can't alias onto a neighbouring cell.
	const MOVED = { x: 80, y: 64, w: 48, h: 48 };
	for (let y = MOVED.y; y < MOVED.y + MOVED.h; y++){
		for (let x = MOVED.x; x < MOVED.x + MOVED.w; x++){
			const i = (y * width + x) * 4;
			before.data[i] = 10; before.data[i + 1] = 40 + (x - MOVED.x) * 3; before.data[i + 2] = 40 + (y - MOVED.y) * 3;
		}
	}
	const after = base();
	const DX = 10, DY = 20;
	for (let y = MOVED.y; y < MOVED.y + MOVED.h; y++){
		for (let x = MOVED.x; x < MOVED.x + MOVED.w; x++){
			const i = ((y + DY) * width + (x + DX)) * 4;
			after.data[i] = 10; after.data[i + 1] = 40 + (x - MOVED.x) * 3; after.data[i + 2] = 40 + (y - MOVED.y) * 3;
		}
	}
	// A second, unrelated block that is recoloured in place — must land as CHANGED, not moved.
	const CHANGED = { x: 160, y: 16, w: 32, h: 32 };
	for (let y = CHANGED.y; y < CHANGED.y + CHANGED.h; y++){
		for (let x = CHANGED.x; x < CHANGED.x + CHANGED.w; x++){
			const i = (y * width + x) * 4;
			after.data[i] = 220; after.data[i + 1] = 10; after.data[i + 2] = 10;
		}
	}
	const result = Diff.compare(before, after, { cell: 16 });
	check("Diff: finds one moved region", result.moved.length === 1);
	const [, , , , mdx, mdy] = result.moved[0] || [];
	check("Diff: moved region reports the right offset", mdx === DX && mdy === DY);
	// The recoloured block must show up as a changed region — plus, honestly, the strip the
	// moved block uncovered (no longer overlapped by its new position) is a real "gone" area,
	// so a second changed region there is correct, not a bug (doc/moved-vs-changed.md).
	const foundChanged = result.regions.some(([x, y, w, h]) => x === CHANGED.x && y === CHANGED.y && w === CHANGED.w && h === CHANGED.h);
	check("Diff: finds the recoloured block as a changed region", foundChanged);
}

// ---- PNG.trim + PNG.scale: a known content rectangle inside a flat background ------------
{
	const width = 120, height = 80;
	const data = new Uint8Array(width * height * 4);
	for (let i = 0; i < data.length; i += 4){ data[i] = 240; data[i + 1] = 240; data[i + 2] = 240; data[i + 3] = 255; }
	const CONTENT = { x: 20, y: 10, w: 60, h: 40 };
	for (let y = CONTENT.y; y < CONTENT.y + CONTENT.h; y++){
		for (let x = CONTENT.x; x < CONTENT.x + CONTENT.w; x++){
			const i = (y * width + x) * 4;
			data[i] = 10; data[i + 1] = 100; data[i + 2] = 200;
		}
	}
	const trimmed = PNG.trim({ width, height, data });
	check("PNG.trim: crops to the content rectangle", trimmed.width === CONTENT.w && trimmed.height === CONTENT.h && trimmed.x === CONTENT.x && trimmed.y === CONTENT.y);
	check("PNG.trim: cropped pixels are the content colour", trimmed.data[0] === 10 && trimmed.data[1] === 100 && trimmed.data[2] === 200);

	const scaled = PNG.scale(trimmed, 120, 80);
	check("PNG.scale: reports the requested size", scaled.width === 120 && scaled.height === 80);
	check("PNG.scale: a pixel near the middle keeps the content colour", scaled.data[((40 * 120 + 60) * 4)] === 10);
}

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
