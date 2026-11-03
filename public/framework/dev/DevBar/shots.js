import { section } from "./parts.js";
import { ShotsView } from "../../ext/Shots/ShotsView.js";

/**
 * The dev bar's Screenshots tab — the active page's own shots
 * (`node Server/shots.mjs <url>` fills `runs.jsonl`; this just reads it).
 * Same `ShotsView` the module page renders at `/framework/ext/Shots/`, so a
 * fix here is a fix everywhere (CLAUDE.md law 6).
 */
export default function shots(app){
	const page = app?.router?.active;
	const url = (page?.url ?? location.pathname).endsWith("/") ? (page?.url ?? location.pathname) : (page?.url ?? location.pathname) + "/";

	section("screenshots", () => {
		new ShotsView({ url });
	});
}
