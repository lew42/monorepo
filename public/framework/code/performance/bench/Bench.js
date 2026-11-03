// The batching benchmark: one class, one strategy per static method. Doc: ../doc/batching.md
export default class Bench {
	static ROWS = 1000;
	static COLS = 5;
	static WRITES = 3; // an evented property fires more than once per change; the last value wins

	// A table-like grid of ROWS x COLS cells, plus the list of every cell.
	static build(host, rows = Bench.ROWS){
		const grid = document.createElement("div");
		grid.className = "bench-grid";
		const cells = [];
		for (let r = 0; r < rows; r++){
			const row = document.createElement("div");
			row.className = "bench-row";
			for (let c = 0; c < Bench.COLS; c++){
				const cell = document.createElement("span");
				cell.textContent = `r${r}c${c}`;
				row.append(cell);
				cells.push(cell);
			}
			grid.append(row);
		}
		host.replaceChildren(grid);
		return { grid, cells };
	}

	// One change to one cell: text plus a class (a style recalc), repeated WRITES times.
	static write(cell, n, layout_read){
		for (let w = 0; w < Bench.WRITES; w++){
			cell.textContent = `v${n}.${w}`;
			cell.classList.toggle("hot", (n + w) % 2 === 0);
			if (layout_read) cell.parentNode.offsetHeight; // a layout read between writes: the classic thrash
		}
	}

	static strategies = {
		"thrash": { label: "Loop with a layout read after every write (the bug)", run(t, n){ t.cells.forEach(c => Bench.write(c, n, true)); } },
		"loop": { label: "Plain sync loop, writes only", run(t, n){ t.cells.forEach(c => Bench.write(c, n, false)); } },
		"hide": { label: "display:none, update, show", run(t, n){
			t.grid.style.display = "none";
			t.cells.forEach(c => Bench.write(c, n, false));
			t.grid.style.display = "";
		} },
		"detach": { label: "Detach the grid, update, re-attach", run(t, n){
			const mark = document.createComment("grid");
			t.grid.replaceWith(mark);
			t.cells.forEach(c => Bench.write(c, n, false));
			mark.replaceWith(t.grid);
		} },
		"clone-swap": { label: "Owner's idea: swap a clone in, update the original detached, swap back", run(t, n){
			const placeholder = t.grid.cloneNode(true);
			t.grid.replaceWith(placeholder);
			t.cells.forEach(c => Bench.write(c, n, false));
			placeholder.replaceWith(t.grid);
		} },
		"fragment": { label: "Rebuild rows off-DOM in a DocumentFragment, replaceChildren once", run(t, n){
			const frag = document.createDocumentFragment();
			t.grid.querySelectorAll(".bench-row").forEach(row => {
				const copy = row.cloneNode(true);
				copy.childNodes.forEach(c => Bench.write(c, n, false));
				frag.append(copy);
			});
			t.grid.replaceChildren(frag);
			t.cells = [...t.grid.querySelectorAll("span")];
		} },
		"coalesce": { label: "Queue changes, dedupe by cell, one flush in requestAnimationFrame", run(t, n){
			const q = new Map();
			t.cells.forEach(c => { for (let w = 0; w < Bench.WRITES; w++) q.set(c, [n, w]); });
			return new Promise(done => requestAnimationFrame(() => {
				q.forEach(([n, w], c) => {
					c.textContent = `v${n}.${w}`;
					c.classList.toggle("hot", (n + w) % 2 === 0);
				});
				done();
			}));
		} },
	};

	// Run one strategy: ms until the next frame has painted, after the update call.
	static async time(name, t, n){
		await new Promise(r => requestAnimationFrame(() => setTimeout(r)));
		const t0 = performance.now();
		await Bench.strategies[name].run(t, n);
		const sync_ms = performance.now() - t0;
		await new Promise(r => requestAnimationFrame(() => setTimeout(r)));
		return { sync_ms, painted_ms: performance.now() - t0 };
	}
}
