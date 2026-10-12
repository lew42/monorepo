/* Diff.mjs — cell-by-cell comparison of two decoded images (plan.md "The diff"). Pure JS, no
 * dependency on PNG.mjs: callers decode, Diff only ever sees {width, height, data} RGBA. */

const CELL = 16;
const THRESHOLD = 24;     // mean per-channel colour move, 0-255, before a cell counts as "changed"
const FADE = 0.35;        // the AFTER picture's own brightness in the overlay, outside red cells

export class Diff {

	/** Diff.compare(before, after, {cell, threshold}) → {changed, regions, overlay, height}.
	 * `before`/`after` are decoded images ({width, height, data}, RGBA). Both are cut to the
	 * SHORTER height before comparing (plan.md) — `height` reports [before.height, after.height]
	 * so a caller can tell a layout grew or shrank even when nothing else moved.
	 * `overlay` is a decoded image ({width, height, data}) the same size as the cut area —
	 * PNG.encode() turns it into a file; Diff never touches PNG itself. */
	static compare(before, after, { cell = CELL, threshold = THRESHOLD } = {}){
		const width = Math.min(before.width, after.width);
		const height = Math.min(before.height, after.height);
		const cols = Math.ceil(width / cell), rows = Math.ceil(height / cell);
		const cellChanged = new Float64Array(cols * rows);   // amount, 0 when unchanged
		let changed = 0;

		for (let cy = 0; cy < rows; cy++){
			for (let cx = 0; cx < cols; cx++){
				const x0 = cx * cell, y0 = cy * cell;
				const x1 = Math.min(x0 + cell, width), y1 = Math.min(y0 + cell, height);
				let sum = 0, n = 0;
				for (let y = y0; y < y1; y++){
					for (let x = x0; x < x1; x++){
						const bi = (y * before.width + x) * 4, ai = (y * after.width + x) * 4;
						sum += Math.abs(before.data[bi] - after.data[ai]) + Math.abs(before.data[bi + 1] - after.data[ai + 1]) + Math.abs(before.data[bi + 2] - after.data[ai + 2]);
						n++;
					}
				}
				const amount = n ? sum / (n * 3) : 0;
				if (amount > threshold){ cellChanged[cy * cols + cx] = amount; changed++; }
			}
		}

		const regions = merge_regions(cellChanged, cols, rows, cell, width, height);
		const overlay = make_overlay(after, width, height, cellChanged, cols, cell, regions);

		return {
			changed,
			regions,
			overlay,
			height: [before.height, after.height],
		};
	}
}

// Flood-fill 4-connected changed cells into rectangular regions, largest (by total changed
// amount) first — plan.md: "[x, y, w, h, amount]".
function merge_regions(cellChanged, cols, rows, cell, width, height){
	const seen = new Uint8Array(cols * rows);
	const regions = [];
	for (let cy = 0; cy < rows; cy++){
		for (let cx = 0; cx < cols; cx++){
			const i = cy * cols + cx;
			if (seen[i] || !cellChanged[i]) continue;
			// BFS over 4-connected changed, unseen cells
			let minX = cx, maxX = cx, minY = cy, maxY = cy, amount = 0;
			const queue = [i]; seen[i] = 1;
			while (queue.length){
				const q = queue.pop();
				const qx = q % cols, qy = Math.floor(q / cols);
				amount += cellChanged[q];
				minX = Math.min(minX, qx); maxX = Math.max(maxX, qx);
				minY = Math.min(minY, qy); maxY = Math.max(maxY, qy);
				const neighbors = [[qx + 1, qy], [qx - 1, qy], [qx, qy + 1], [qx, qy - 1]];
				for (const [nx, ny] of neighbors){
					if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
					const ni = ny * cols + nx;
					if (!seen[ni] && cellChanged[ni]){ seen[ni] = 1; queue.push(ni); }
				}
			}
			const x = minX * cell, y = minY * cell;
			const w = Math.min((maxX - minX + 1) * cell, width - x);
			const h = Math.min((maxY - minY + 1) * cell, height - y);
			regions.push([x, y, w, h, Math.round(amount)]);
		}
	}
	regions.sort((a, b) => b[4] - a[4]);
	return regions;
}

// The AFTER picture faded to FADE brightness, changed cells tinted red by how much they
// changed, each merged region boxed in solid red (plan.md "The diff").
function make_overlay(after, width, height, cellChanged, cols, cell, regions){
	const data = new Uint8Array(width * height * 4);
	for (let y = 0; y < height; y++){
		for (let x = 0; x < width; x++){
			const ai = (y * after.width + x) * 4, oi = (y * width + x) * 4;
			const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
			const amount = cellChanged[cy * cols + cx] || 0;
			const tint = Math.min(1, amount / 128);   // how red this cell gets, capped at full red
			const base = FADE;
			data[oi] = Math.round(after.data[ai] * base * (1 - tint) + 255 * tint);
			data[oi + 1] = Math.round(after.data[ai + 1] * base * (1 - tint));
			data[oi + 2] = Math.round(after.data[ai + 2] * base * (1 - tint));
			data[oi + 3] = 255;
		}
	}
	for (const [rx, ry, rw, rh] of regions) draw_box(data, width, height, rx, ry, rw, rh);
	return { width, height, data };
}

function draw_box(data, width, height, x, y, w, h){
	const set = (px, py) => {
		if (px < 0 || py < 0 || px >= width || py >= height) return;
		const i = (py * width + px) * 4;
		data[i] = 255; data[i + 1] = 40; data[i + 2] = 40; data[i + 3] = 255;
	};
	for (let px = x; px < x + w; px++){ set(px, y); set(px, y + h - 1); }
	for (let py = y; py < y + h; py++){ set(x, py); set(x + w - 1, py); }
}

export default Diff;
