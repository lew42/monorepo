import { View, div, p } from "/app.js";
import { d3 } from "./d3.js";

/* css: .chart, .chart-plot, .chart-line, .chart-note, .chart-note-error */
View.stylesheet(import.meta, "chart.css");

/* An svg line chart drawn by d3. Everything hard about it is WHEN, not d3: the
 * library loads after the box exists, and the width is delivered by an observer
 * because a page can never measure itself. Explained on this folder's page.js. */
export class Chart extends View {

	/* NO class fields — View's constructor calls render(), and a subclass's
	 * fields initialize after super() returns. Defaults are on the prototype. */

	render(){
		this.$plot = div.c("chart-plot");
		this.$note = p.c("chart-note", "loading d3…");
		this.watch();
	}

	watch(){
		this.observer = new ResizeObserver(([{ contentRect }]) => this.resized(contentRect.width));
		this.observer.observe(this.$plot.el);
	}

	resized(width){
		if (!width || width === this.width) return;   // 0 is display:none — nobody is looking
		this.width = width;
		this.draw();
	}

	async draw(){
		let lib;

		try { lib = await (this.loading ??= d3()); }
		catch (error){ return this.failed(error); }

		this.$note.hide();

		// after an await, so it HAS to go in a callback — empty(fn) re-captures
		this.$plot.empty(() => this.plot(lib));
	}

	plot({ scaleLinear, line, curveMonotoneX }){
		const x = scaleLinear().domain([0, this.data.length - 1]).range([0, this.width]);
		const y = scaleLinear().domain([Math.min(...this.data), Math.max(...this.data)])
			.range([this.height - 3, 3]);

		const path = line().x((d, i) => x(i)).y(d => y(d)).curve(curveMonotoneX);

		svg("svg", () => {
			svg("path").ac("chart-line").attr("d", path(this.data));
		})
			.attr("viewBox", `0 0 ${this.width} ${this.height}`)
			.attr("height", this.height);
	}

	failed(error){
		console.warn("Chart: d3 did not load —", error.message);
		this.loading = null;   // a rejected promise kept here is a chart that never comes back
		this.$note.show().ac("chart-note-error")
			.text("d3 could not be loaded. The page is fine; the chart is not.");
	}
}

/* The same chart with a timer in it. A timer on a page you navigated away from
 * is the classic leak: the page is display:none, so nothing looks wrong. */
export class LiveChart extends Chart {

	render(){
		super.render();
		this.born = Date.now();
		this.$count = p.c("chart-note");
	}

	resized(width){
		super.resized(width);
		width ? this.start() : this.stop();
	}

	start(){ this.timer ??= setInterval(() => this.tick(), 500); }

	stop(){
		clearInterval(this.timer);
		this.timer = null;
	}

	tick(){
		this.points = (this.points ?? 0) + 1;
		this.data = [...this.data.slice(1), next(this.data)];
		this.draw();

		const elapsed = Math.round((Date.now() - this.born) / 500);
		this.$count.text(`${this.points} points drawn · ${elapsed} half-seconds since this chart was built`);
	}
}

/* View builds with document.createElement, which is HTML-only — an <svg> made
 * that way never paints. Handing View an element it did not create is the fix. */
export function svg(tag, ...args){
	return new View({ el: document.createElementNS("http://www.w3.org/2000/svg", tag) }).append(...args);
}

// deterministic, so the page looks the same on every reload
export function series(n = 48, seed = 7){
	const out = [];
	for (let i = 0, x = seed; i < n; i++){
		x = (x * 1103515245 + 12345) % 2147483648;
		out.push(50 + 30 * Math.sin(i / 6) + (x / 2147483648) * 16);
	}
	return out;
}

function next(data){
	return Math.max(10, Math.min(100, data.at(-1) + (Math.random() - 0.5) * 14));
}

Chart.prototype.height = 160;
Chart.prototype.data = [];
