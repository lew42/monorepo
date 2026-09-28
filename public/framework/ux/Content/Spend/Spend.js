import ContentModule from "../ContentModule.js";

/**
 * class Spend extends ContentModule — dollars over time as bars in inline SVG. No library.
 * The data is static: the `spend.json` that Server/task-cost.mjs writes beside a task's task.jsonl.
 *
 *   new Spend({ task: "2026-09-25/css-audit" })                one task
 *   new Spend({ tasks: ["2026-09-25/a", "2026-09-25/b"] })     several, summed
 *   new Spend({ points: [{ t, usd }], from, to })              points you already have
 *
 * `from` / `to` (ISO) scope it; without them it spans the first to the last point.
 * It fills its width and is 12em tall; it redraws when the width changes.
 */
export default class Spend extends ContentModule {

	render(){
		this.points = this.points || [];
		this.draw(720);
		if (this.task || this.tasks) this.load().then(() => this.draw());
		new ResizeObserver(() => this.draw()).observe(this.el);
	}

	async load(){
		const list = this.tasks || [this.task];
		const all = await Promise.all(list.map(t =>
			fetch(`/framework/ai/${t}/spend.json`).then(r => r.ok ? r.json() : { points: [] }).catch(() => ({ points: [] }))));
		this.points = all.flatMap(x => x.points);
	}

	/* Bars: the range cut into equal bins, each bin the dollars spent in it. */
	bins(n){
		const pts = this.points.map(p => ({ t: Date.parse(p.t), usd: p.usd })).filter(p => p.t);
		if (!pts.length) return null;
		const ts = pts.map(p => p.t);
		const from = this.from ? Date.parse(this.from) : Math.min(...ts);
		const to = Math.max(this.to ? Date.parse(this.to) : Math.max(...ts), from + 6e4);
		const step = (to - from) / n, sums = new Array(n).fill(0);
		let total = 0;
		for (const p of pts){
			if (p.t < from || p.t > to) continue;
			sums[Math.min(n - 1, Math.floor((p.t - from) / step))] += p.usd; total += p.usd;
		}
		return { from, to, step, sums, total };
	}

	/* A nice round step (1, 2, 5 × 10ⁿ) for about `count` ticks. */
	nice(max, count){
		const raw = max / count, mag = 10 ** Math.floor(Math.log10(raw || 1)), r = raw / mag;
		return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * mag;
	}

	label(t, span){
		const d = new Date(t);
		return span < 2 * 864e5
			? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
			: d.toLocaleDateString([], { month: "short", day: "numeric" }) + (span < 6 * 864e5 ? " " + d.toLocaleTimeString([], { hour: "numeric" }) : "");
	}

	draw(w){
		w = w || this.el.clientWidth;
		if (!w) return;
		if (w === this.w && this.points === this.drawn) return;
		this.w = w; this.drawn = this.points;
		const H = 190, L = 52, R = 12, T = 26, B = 26, iw = w - L - R, ih = H - T - B;
		const d = this.bins(Math.max(12, Math.floor(iw / 8)));
		if (!d) { this.el.innerHTML = `<p class="ux-content-hint">No spend recorded yet.</p>`; return; }

		const max = Math.max(...d.sums), yStep = this.nice(max, 3), yMax = Math.ceil(max / yStep) * yStep || 1;
		const y = v => T + ih - v / yMax * ih, bw = iw / d.sums.length;
		let s = `<svg viewBox="0 0 ${w} ${H}" width="${w}" height="${H}" role="img" aria-label="Spend over time, total $${d.total.toFixed(2)}">`;
		for (let v = 0; v <= yMax + 1e-9; v += yStep)
			s += `<line class="g" x1="${L}" x2="${w - R}" y1="${y(v)}" y2="${y(v)}"/><text class="t" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">$${+v.toFixed(2)}</text>`;
		d.sums.forEach((v, i) => { if (v > 0) s += `<rect x="${L + i * bw + .5}" y="${y(v)}" width="${Math.max(1, bw - 1)}" height="${T + ih - y(v)}"><title>${this.when(new Date(d.from + i * d.step).toISOString())} — $${v.toFixed(2)}</title></rect>`; });
		const span = d.to - d.from, nt = Math.max(2, Math.floor(iw / 110));
		for (let i = 0; i <= nt; i++){
			const t = d.from + span * i / nt, x = L + iw * i / nt;
			s += `<text class="t" x="${x}" y="${H - 6}" text-anchor="${i == 0 ? "start" : i == nt ? "end" : "middle"}">${this.label(t, span)}</text>`;
		}
		s += `<text class="total" x="${L}" y="16">$${d.total.toFixed(2)} spent</text></svg>`;
		this.el.innerHTML = s;
	}
}

Spend.prototype.classes = "ux-content-spend";
export { Spend };
