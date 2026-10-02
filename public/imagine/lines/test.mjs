import assert from 'node:assert/strict';
import { lines } from './lines.js';
function image(w, h, pixel){
	const data = new Uint8ClampedArray(w * h * 4);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data.set([...pixel(x, y), 255], (y * w + x) * 4);
	return { width: w, height: h, data };
}
const on = Array.from({ length: 60 }, (_, j) => [63, j + 18]);
const mean = scores => on.reduce((sum, [x, y]) => sum + scores[y * 128 + x], 0) / on.length;
assert.ok(lines(image(64, 64, () => [200, 200, 200])).every(x => x === 0));
const seam = lines(image(128, 96, x => x < 64 ? [200, 200, 200] : [204, 204, 204]));
assert.ok(mean(seam) > 0.35);
assert.ok(seam.every(x => Number.isFinite(x) && x >= 0 && x <= 1));
let seed = 42;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const texture = lines(image(128, 96, () => { const v = 160 + Math.round(random() * 80); return [v, v, v]; }));
const noise = texture.reduce((sum, x) => sum + x, 0) / texture.length;
assert.ok(mean(seam) > noise * 5);
assert.ok(mean(lines(image(128, 96, x => x < 64 ? [200, 0, 0] : [0, 200, 0]))) > 0.5);
assert.ok(lines(image(128, 96, (_, y) => y < 48 ? [200, 200, 200] : [204, 204, 204]))[47 * 128 + 64] > 0.35);
assert.ok(Math.max(...lines(image(128, 96, (x, y) => x === 64 && y === 48 ? [0, 0, 0] : [200, 200, 200]), { length: 41 })) < 0.1);
assert.equal(lines(image(1, 1, () => [0, 0, 0]))[0], 0);
console.log(JSON.stringify({ pass: true, faintSeam: mean(seam), randomTexture: noise, ratio: mean(seam) / noise }));
