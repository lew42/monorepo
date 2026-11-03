import { demo } from "/app.js";
import full from "../full.js";

/* One spec → one twin-card layout page, wired for a bare `/full/` url so
 * `ext/DesignTool`'s `frame()` can measure it in a real viewport.
 * ⚠ `default` — the nested `.page` `layout()` returns is never Router-marked,
 * so Page.css hides it and nothing throws (CLAUDE.md, "traps that never throw"). */
export const entry = spec => demo.layout({
	...spec,
	twin: true,
	route(name){ return name === "full" && full(this, () => this.layout().ac("default")); },
});

export default entry;
