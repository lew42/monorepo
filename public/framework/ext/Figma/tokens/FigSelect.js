// Behaviour for the opt-in `.fig-select` <details> (styled in tokens.css): doc/controls.md.
// Same recipe as ux/Menu (native <details>, outside-click bound only while open), but one
// delegated listener set serves every .fig-select on the page, so the markup stays plain.
export default class FigSelect {
	static rows(sel){ return [...sel.querySelectorAll(".fig-select-row")]; }

	static pick(sel, row){
		FigSelect.rows(sel).forEach(r => r.setAttribute("aria-selected", r === row));
		sel.querySelector("summary > :first-child").textContent = row.firstElementChild.textContent;
		sel.open = false;
		sel.querySelector("summary").focus();
		sel.dispatchEvent(new CustomEvent("fig-select", { bubbles: true, detail: { value: row.firstElementChild.textContent, row } }));
	}

	static move(sel, step){
		const rows = FigSelect.rows(sel), at = rows.indexOf(document.activeElement);
		rows[at < 0 ? (step > 0 ? 0 : rows.length - 1) : Math.min(rows.length - 1, Math.max(0, at + step))]?.focus();
	}

	// The chosen row scrolls into view inside the panel only; scrollIntoView also scrolled the page (it opened at the demo's bottom).
	static reveal(sel, row){
		const panel = sel.querySelector(".fig-select-panel");
		if (!row || !panel) return;
		const p = panel.getBoundingClientRect(), r = row.getBoundingClientRect();
		if (r.top < p.top) panel.scrollTop -= p.top - r.top;
		else if (r.bottom > p.bottom) panel.scrollTop += r.bottom - p.bottom;
	}

	static install(){
		if (FigSelect.installed) return;
		FigSelect.installed = true;
		// Rows become keyboard targets. One-open-at-a-time is enforced by the click and key handlers, not here,
		// so a demo may start with several open (it used to close all but one on load).
		document.addEventListener("toggle", e => {
			const sel = e.target;
			if (!sel.matches?.(".fig-select") || !sel.open) return;
			const rows = FigSelect.rows(sel);
			sel.querySelector(".fig-select-panel")?.setAttribute("role", "listbox");
			rows.forEach(r => { r.setAttribute("role", "option"); r.tabIndex = -1; });
			FigSelect.reveal(sel, rows.find(r => r.getAttribute("aria-selected") === "true") ?? rows[0]);
		}, true);
		document.addEventListener("click", e => {
			if (e.target.matches?.(".fig-select[open]")) { e.target.open = false; return; }   // the phone sheet's scrim is the details itself
			const row = e.target.closest?.(".fig-select-row");
			if (row) return FigSelect.pick(row.closest(".fig-select"), row);
			const inside = e.target.closest?.(".fig-select");   // outside click closes the rest
			document.querySelectorAll(".fig-select[open]").forEach(o => { if (o !== inside) o.open = false; });
		});
		document.addEventListener("keydown", e => {
			const sel = e.target.closest?.(".fig-select");
			if (!sel) return;
			const key = e.key;
			if (key === "Escape" && sel.open){ sel.open = false; sel.querySelector("summary").focus(); e.preventDefault(); }
			else if ((key === "ArrowDown" || key === "ArrowUp") && !sel.open){ document.querySelectorAll(".fig-select[open]").forEach(o => { o.open = false; }); sel.open = true; e.preventDefault(); requestAnimationFrame(() => FigSelect.move(sel, key === "ArrowDown" ? 1 : -1)); }
			else if (key === "ArrowDown" || key === "ArrowUp"){ e.preventDefault(); FigSelect.move(sel, key === "ArrowDown" ? 1 : -1); }
			else if (key === "Enter" && e.target.matches(".fig-select-row")){ e.preventDefault(); FigSelect.pick(sel, e.target); }
		});
	}
}
