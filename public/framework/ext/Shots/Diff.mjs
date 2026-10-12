/* Diff.mjs — cell-by-cell comparison of two decoded images (plan.md "The diff"). Pure JS, no
 * dependency on PNG.mjs: callers decode, Diff only ever sees {width, height, data} RGBA.
 *
 * build-a2: a changed cell is tested for a MOVE before it is called "changed" — padding that
 * pushes everything below it down should read as "this block moved by (0, +48)", not as one
 * giant red smear. See doc/moved-vs-changed.md for the search and the near-perfect threshold.
 */

const CELL = 16;
const THRESHOLD = 24;     // mean per-channel colour move, 0-255, before a cell counts as "changed"
const FADE = 0.35;        // the AFTER picture's own brightness in the overlay, outside red cells
const MOVE_RANGE = 64;    // search this far in every direction for a match elsewhere
const COARSE_STEP = 4;    // coarse search step AND downsample factor (plan.md step 1)
const REGION_CAP = 8;     // keep at most this many of each kind in the log (build-a2 step 2)
const MIN_MOVED_CELLS = 2; // a one-cell "move" is too likely to be an alias; needs a neighbour too

export class Diff {

	/** Diff.compare(before, after, {cell, threshold}) → {changed, regions, regionsMore,
	 * moved, movedMore, changed_regions, overlay, height}.
	 * `before`/`after` are decoded images ({width, height, data}, RGBA). Both are cut to the
	 * SHORTER height before comparing (plan.md) — `height` reports [before.height, after.height]
	 * so a caller can tell a layout grew or shrank even when nothing else moved.
	 * `regions` = [x, y, w, h, amount] — truly changed cells (new/gone content), red in the
	 * overlay. `moved` = [x, y, w, h, dx, dy] — cells whose content is found elsewhere in the
	 * BEFORE image, blue in the overlay. Both are sorted largest-area first and capped at
	 * REGION_CAP, with a `*More` count of whatever didn't fit.
	 * `changed_regions` is the same array as `regions` (build-a2 brief: "diff gains moved and
	 * changed_regions; rename nothing else, keep regions = the red ones for the view").
	 * `overlay` is a decoded image ({width, height, data}) the same size as the cut area —
	 * PNG.encode() turns it into a file; Diff never touches PNG itself. */
	static compare(before, after, { cell = CELL, threshold = THRESHOLD } = {}){
		const width = Math.min(before.width, after.width);
		const height = Math.min(before.height, after.height);
		const cols = Math.ceil(width / cell), rows = Math.ceil(height / cell);
		const cellChanged = new Float64Array(cols * rows);   // amount, 0 when unchanged
		const changedCells = [];                             // indices flagged above threshold

		for (let cy = 0; cy < rows; cy++){
			for (let cx = 0; cx < cols; cx++){
				const x0 = cx * cell, y0 = cy * cell;
				const x1 = Math.min(x0 + cell, width), y1 = Math.min(y0 + cell, height);
				const amount = cell_diff(before, after, x0, y0, x1, y1, 0, 0);
				if (amount > threshold){ cellChanged[cy * cols + cx] = amount; changedCells.push(cy * cols + cx); }
			}
		}

		// Per-cell displacement search (build-a2 step 1): does this changed cell's AFTER content
		// appear, near-perfectly, somewhere else in BEFORE? If so it moved; if not it changed.
		// A real page has plenty of small REPEATING tiles (whitespace, a recurring icon, a line
		// of body text) that can alias onto each other within ±64px by pure chance, so a single
		// cell's good match is not trusted alone: it must also agree with its grouped neighbours
		// on a sizeable area (merge_moved_regions below drops anything under MIN_MOVED_CELLS).
		const movedCells = new Float64Array(cols * rows);
		const changedOnly = new Float64Array(cols * rows);
		const offsetOf = new Map();   // cell index -> [dx, dy]
		for (const i of changedCells){
			const cx = i % cols, cy = Math.floor(i / cols);
			const x0 = cx * cell, y0 = cy * cell;
			const x1 = Math.min(x0 + cell, width), y1 = Math.min(y0 + cell, height);
			// A near-flat cell (background showing through where content left, say) matches
			// ANY equally flat patch elsewhere — that's not a move, there's nothing to match on.
			if (!has_texture(after, x0, y0, x1, y1)){ changedOnly[i] = cellChanged[i]; continue; }
			const found = find_move(before, after, x0, y0, x1, y1, width, height, cellChanged[i], threshold);
			if (found){ movedCells[i] = cellChanged[i]; offsetOf.set(i, found); }
			else changedOnly[i] = cellChanged[i];
		}

		// Reclassify tiny "moved" groups (noise — an isolated cell that happened to alias onto
		// a lookalike elsewhere) back to changed, before the final region lists are built.
		const movedGroups = merge_moved_regions(movedCells, offsetOf, cols, rows, cell, width, height);
		for (const group of movedGroups){
			if (group.cells.length >= MIN_MOVED_CELLS) continue;
			for (const i of group.cells){ changedOnly[i] = cellChanged[i]; movedCells[i] = 0; offsetOf.delete(i); }
		}

		const changedRegions = merge_regions(changedOnly, cols, rows, cell, width, height);
		const movedRegions = movedGroups.filter(g => g.cells.length >= MIN_MOVED_CELLS).map(g => g.region);

		const { kept: regions, more: regionsMore } = cap_by_area(changedRegions, REGION_CAP);
		const { kept: moved, more: movedMore } = cap_by_area(movedRegions, REGION_CAP);

		const overlay = make_overlay(after, width, height, changedOnly, cols, cell, regions, moved);

		return {
			changed: changedCells.length - offsetOf.size,   // truly-changed cells, not moved ones
			regions, regionsMore,
			moved, movedMore,
			changed_regions: regions,
			overlay,
			height: [before.height, after.height],
		};
	}
}

// Mean per-channel colour move between AFTER's cell at (x0,y0)-(x1,y1) and BEFORE's cell at the
// same box shifted by (dx, dy). Returns a huge number (never a match) if the shifted box falls
// outside BEFORE. Shared by the initial scan (dx=dy=0) and the move search below.
function cell_diff(before, after, x0, y0, x1, y1, dx, dy){
	const bx0 = x0 + dx, by0 = y0 + dy;
	if (bx0 < 0 || by0 < 0 || bx0 + (x1 - x0) > before.width || by0 + (y1 - y0) > before.height) return Infinity;
	let sum = 0, n = 0;
	for (let y = y0; y < y1; y++){
		const by = by0 + (y - y0);
		for (let x = x0; x < x1; x++){
			const bx = bx0 + (x - x0);
			const bi = (by * before.width + bx) * 4, ai = (y * after.width + x) * 4;
			sum += Math.abs(before.data[bi] - after.data[ai]) + Math.abs(before.data[bi + 1] - after.data[ai + 1]) + Math.abs(before.data[bi + 2] - after.data[ai + 2]);
			n++;
		}
	}
	return n ? sum / (n * 3) : Infinity;
}

// Coarse-then-fine search for a near-perfect match elsewhere in BEFORE (build-a2 step 1):
// step COARSE_STEP over ±MOVE_RANGE, sampling only every COARSE_STEP-th pixel for speed, then
// refine with a full-resolution comparison in a small window around the coarse winner.
// Returns [dx, dy] (never [0, 0]) if the refined match is at or under `threshold` AND clearly
// better than the cell's own amount (ownAmount, at offset 0 — a real page has plenty of small
// repeating tiles, whitespace and recurring glyphs especially, that tie or barely beat the
// cell's own mismatch by chance; requiring a real improvement keeps those out), else null.
function find_move(before, after, x0, y0, x1, y1, width, height, ownAmount, threshold){
	let bestDx = 0, bestDy = 0, bestAmount = Infinity;
	for (let dy = -MOVE_RANGE; dy <= MOVE_RANGE; dy += COARSE_STEP){
		for (let dx = -MOVE_RANGE; dx <= MOVE_RANGE; dx += COARSE_STEP){
			if (dx === 0 && dy === 0) continue;   // that's the already-known "changed" case
			const amount = coarse_diff(before, after, x0, y0, x1, y1, dx, dy);
			if (amount < bestAmount){ bestAmount = amount; bestDx = dx; bestDy = dy; }
		}
	}
	if (bestAmount === Infinity) return null;

	// Refine at full resolution within COARSE_STEP of the coarse winner.
	let fineDx = bestDx, fineDy = bestDy, fineAmount = cell_diff(before, after, x0, y0, x1, y1, bestDx, bestDy);
	for (let dy = bestDy - COARSE_STEP; dy <= bestDy + COARSE_STEP; dy++){
		for (let dx = bestDx - COARSE_STEP; dx <= bestDx + COARSE_STEP; dx++){
			if (dx === 0 && dy === 0) continue;
			const amount = cell_diff(before, after, x0, y0, x1, y1, dx, dy);
			if (amount < fineAmount){ fineAmount = amount; fineDx = dx; fineDy = dy; }
		}
	}
	// cell_diff's (dx, dy) locates the match INSIDE before relative to the cell — the content's
	// own displacement (what the overlay draws, and what a caller reads as "moved by") is the
	// opposite: it travelled FROM (x0+dx, y0+dy) TO (x0, y0).
	const good = fineAmount <= threshold && fineAmount <= ownAmount * 0.5;
	return good ? [-fineDx, -fineDy] : null;
}

// True if this AFTER cell has enough internal variation that a match elsewhere is meaningful —
// a flat cell (plain background showing through where content left) matches any equally flat
// patch and would read as a bogus "move".
const TEXTURE_MIN = 10;
function has_texture(after, x0, y0, x1, y1){
	let min = Infinity, max = -Infinity;
	for (let y = y0; y < y1; y++){
		for (let x = x0; x < x1; x++){
			const i = (y * after.width + x) * 4;
			const v = after.data[i] + after.data[i + 1] + after.data[i + 2];
			if (v < min) min = v;
			if (v > max) max = v;
		}
	}
	return max - min >= TEXTURE_MIN;
}

// Downsampled version of cell_diff for the coarse search — every COARSE_STEP-th pixel only.
function coarse_diff(before, after, x0, y0, x1, y1, dx, dy){
	const bx0 = x0 + dx, by0 = y0 + dy;
	if (bx0 < 0 || by0 < 0 || bx0 + (x1 - x0) > before.width || by0 + (y1 - y0) > before.height) return Infinity;
	let sum = 0, n = 0;
	for (let y = y0; y < y1; y += COARSE_STEP){
		const by = by0 + (y - y0);
		for (let x = x0; x < x1; x += COARSE_STEP){
			const bx = bx0 + (x - x0);
			const bi = (by * before.width + bx) * 4, ai = (y * after.width + x) * 4;
			sum += Math.abs(before.data[bi] - after.data[ai]) + Math.abs(before.data[bi + 1] - after.data[ai + 1]) + Math.abs(before.data[bi + 2] - after.data[ai + 2]);
			n++;
		}
	}
	return n ? sum / (n * 3) : Infinity;
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

// Same flood-fill, but neighbouring moved cells only merge when their offsets agree within
// ±2px (build-a2 step 2) — two unrelated shifts never get glued into one region.
// Returns [{region: [x,y,w,h,dx,dy], cells: [index, ...]}] — the caller (Diff.compare) drops
// any group smaller than MIN_MOVED_CELLS, since a single aliased cell is noise, not a move.
function merge_moved_regions(movedCells, offsetOf, cols, rows, cell, width, height){
	const seen = new Uint8Array(cols * rows);
	const groups = [];
	for (let cy = 0; cy < rows; cy++){
		for (let cx = 0; cx < cols; cx++){
			const i = cy * cols + cx;
			if (seen[i] || !movedCells[i]) continue;
			const [dx0, dy0] = offsetOf.get(i);
			let minX = cx, maxX = cx, minY = cy, maxY = cy, sumDx = 0, sumDy = 0, n = 0;
			const cells = [];
			const queue = [i]; seen[i] = 1;
			while (queue.length){
				const q = queue.pop();
				cells.push(q);
				const qx = q % cols, qy = Math.floor(q / cols);
				const [qdx, qdy] = offsetOf.get(q);
				sumDx += qdx; sumDy += qdy; n++;
				minX = Math.min(minX, qx); maxX = Math.max(maxX, qx);
				minY = Math.min(minY, qy); maxY = Math.max(maxY, qy);
				const neighbors = [[qx + 1, qy], [qx - 1, qy], [qx, qy + 1], [qx, qy - 1]];
				for (const [nx, ny] of neighbors){
					if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
					const ni = ny * cols + nx;
					if (seen[ni] || !movedCells[ni]) continue;
					const [ndx, ndy] = offsetOf.get(ni);
					if (Math.abs(ndx - dx0) > 2 || Math.abs(ndy - dy0) > 2) continue;
					seen[ni] = 1; queue.push(ni);
				}
			}
			const x = minX * cell, y = minY * cell;
			const w = Math.min((maxX - minX + 1) * cell, width - x);
			const h = Math.min((maxY - minY + 1) * cell, height - y);
			groups.push({ region: [x, y, w, h, Math.round(sumDx / n), Math.round(sumDy / n)], cells });
		}
	}
	groups.sort((a, b) => b.region[2] * b.region[3] - a.region[2] * a.region[3]);
	return groups;
}

// Sort by area (w*h), largest first, keep the first `cap`; `more` is a count of the rest.
function cap_by_area(regions, cap){
	const sorted = [...regions].sort((a, b) => b[2] * b[3] - a[2] * a[3]);
	return { kept: sorted.slice(0, cap), more: Math.max(0, sorted.length - cap) };
}

// The AFTER picture faded to FADE brightness, TRULY-CHANGED cells tinted red by how much they
// changed (moved cells stay at the fade — they didn't change, they relocated), each changed
// region boxed in red, each moved region boxed in blue with a line from its old top-left to its
// new one (plan.md "The diff"; build-a2 step 3 — no font, so a line stands in for the label).
function make_overlay(after, width, height, changedOnly, cols, cell, regions, moved){
	const data = new Uint8Array(width * height * 4);
	for (let y = 0; y < height; y++){
		for (let x = 0; x < width; x++){
			const ai = (y * after.width + x) * 4, oi = (y * width + x) * 4;
			const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
			const amount = changedOnly[cy * cols + cx] || 0;
			const tint = Math.min(1, amount / 128);   // how red this cell gets, capped at full red
			const base = FADE;
			data[oi] = Math.round(after.data[ai] * base * (1 - tint) + 255 * tint);
			data[oi + 1] = Math.round(after.data[ai + 1] * base * (1 - tint));
			data[oi + 2] = Math.round(after.data[ai + 2] * base * (1 - tint));
			data[oi + 3] = 255;
		}
	}
	for (const [rx, ry, rw, rh] of regions) draw_box(data, width, height, rx, ry, rw, rh, 255, 40, 40);
	for (const [mx, my, mw, mh, dx, dy] of moved){
		draw_box(data, width, height, mx, my, mw, mh, 60, 120, 255);
		draw_line(data, width, height, mx - dx, my - dy, mx, my, 60, 120, 255);
	}
	return { width, height, data };
}

function draw_box(data, width, height, x, y, w, h, r, g, b){
	const set = (px, py) => {
		if (px < 0 || py < 0 || px >= width || py >= height) return;
		const i = (py * width + px) * 4;
		data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
	};
	for (let px = x; px < x + w; px++){ set(px, y); set(px, y + h - 1); }
	for (let py = y; py < y + h; py++){ set(x, py); set(x + w - 1, py); }
}

// A plain line (the "arrow shaft" — no font to draw a head or a label) from (x0,y0) to (x1,y1).
function draw_line(data, width, height, x0, y0, x1, y1, r, g, b){
	const set = (px, py) => {
		if (px < 0 || py < 0 || px >= width || py >= height) return;
		const i = (py * width + px) * 4;
		data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
	};
	let x = x0, y = y0;
	const dx = x1 - x0, dy = y1 - y0;
	const steps = Math.max(Math.abs(dx), Math.abs(dy));
	if (!steps){ set(x, y); return; }
	for (let s = 0; s <= steps; s++){
		set(Math.round(x0 + (dx * s) / steps), Math.round(y0 + (dy * s) / steps));
	}
}

export default Diff;
