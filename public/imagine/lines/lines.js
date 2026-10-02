// A DOM-free line-confidence map. Scores are in [0, 1]; gamma belongs to the display.
export function lines(image, opts = {}){
	const { width: w, height: h, data } = image;
	if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || data.length !== w * h * 4)
		throw new TypeError("Expected RGBA ImageData with positive integer dimensions.");
	const n = w * h, radius = Math.round(clamp(opts.window ?? 5, 3, 21) / 2 - 0.5);
	const length = Math.round(clamp(opts.length ?? 17, 3, 61) / 2);
	const floor = clamp(opts.noise ?? 0.006, 0.0001, 1);
	const hue = new Float32Array(n), sat = new Float32Array(n), val = new Float32Array(n);
	for (let i = 0; i < n; i++){
		const alpha = data[i * 4 + 3] / 255;
		const r = data[i * 4] / 255 * alpha + 1 - alpha;
		const g = data[i * 4 + 1] / 255 * alpha + 1 - alpha;
		const b = data[i * 4 + 2] / 255 * alpha + 1 - alpha;
		const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
		val[i] = max; sat[i] = max ? d / max : 0;
		let angle = !d ? 0 : max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
		hue[i] = ((angle / 6) % 1 + 1) % 1;
	}
	const xx = new Float32Array(n), xy = new Float32Array(n), yy = new Float32Array(n), mag = new Float32Array(n);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
		const i = y * w + x, l = y * w + Math.max(0, x - 1), r = y * w + Math.min(w - 1, x + 1);
		const t = Math.max(0, y - 1) * w + x, b = Math.min(h - 1, y + 1) * w + x;
		// Hue wraps at red. Achromatic pixels have no meaningful hue.
		const hx = circular(hue[r] - hue[l]) * Math.min(sat[l], sat[r]);
		const hy = circular(hue[b] - hue[t]) * Math.min(sat[t], sat[b]);
		const sx = (sat[r] - sat[l]) / 2, sy = (sat[b] - sat[t]) / 2;
		const vx = (val[r] - val[l]) / 2, vy = (val[b] - val[t]) / 2;
		xx[i] = hx * hx + sx * sx + vx * vx;
		xy[i] = hx * hy + sx * sy + vx * vy;
		yy[i] = hy * hy + sy * sy + vy * vy;
		mag[i] = Math.sqrt(xx[i] + yy[i]);
	}
	const a = average(xx, w, h, radius), b = average(xy, w, h, radius), c = average(yy, w, h, radius);
	const coherence = new Float32Array(n), angle = new Float32Array(n), response = new Float32Array(n);
	for (let i = 0; i < n; i++){
		const trace = a[i] + c[i], gap = Math.hypot(a[i] - c[i], 2 * b[i]);
		coherence[i] = trace > 1e-12 ? Math.min(1, gap / trace) : 0;
		angle[i] = Math.atan2(2 * b[i], a[i] - c[i]) / 2;
		const noise = Math.sqrt(Math.max(0, trace - gap));
		response[i] = mag[i] / (mag[i] + floor + noise);
	}
	const result = new Float32Array(n);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
		const i = y * w + x;
		if (!mag[i] || coherence[i] < 0.05) continue;
		const dx = -Math.sin(angle[i]), dy = Math.cos(angle[i]);
		let support = 0, count = 0;
		for (let step = -length; step <= length; step++){
			const px = x + dx * step, py = y + dy * step;
			if (px < 0 || py < 0 || px > w - 1 || py > h - 1) continue;
			const j = Math.round(py) * w + Math.round(px);
			const aligned = Math.max(0, Math.cos(2 * (angle[j] - angle[i])));
			support += coherence[j] * aligned * Math.min(1, mag[j] / mag[i]);
			count++;
		}
		result[i] = coherence[i] * response[i] * (count ? support / count : 0);
	}
	return result;
}
function circular(value){ return ((value + 0.5) % 1 + 1) % 1 - 0.5; }
function clamp(value, min, max){ return Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : min; }

// Summed-area tables make every tensor window constant-time.
function average(values, w, h, radius){
	const stride = w + 1, sum = new Float64Array(stride * (h + 1)), out = new Float32Array(w * h);
	for (let y = 0; y < h; y++){
		let row = 0;
		for (let x = 0; x < w; x++){
			row += values[y * w + x];
			sum[(y + 1) * stride + x + 1] = sum[y * stride + x + 1] + row;
		}
	}
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
		const x0 = Math.max(0, x - radius), x1 = Math.min(w, x + radius + 1);
		const y0 = Math.max(0, y - radius), y1 = Math.min(h, y + radius + 1);
		out[y * w + x] = (sum[y1 * stride + x1] - sum[y0 * stride + x1] - sum[y1 * stride + x0] + sum[y0 * stride + x0]) / ((x1 - x0) * (y1 - y0));
	}
	return out;
}
