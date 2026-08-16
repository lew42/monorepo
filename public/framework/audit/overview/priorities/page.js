import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Priorities",
	description: "Every recommendation across 29 modules, ranked simple + important first.",

	content(){

		md("Ranked across all 29 reports. **Simple + important first** — the ordering is the deliverable, because an unranked list of a hundred findings is a hundred decisions handed back.");

		md("## 0 — Not a doc problem, and it outranks everything");

		md("**`ext/Panel` and `ext/editor` have never been committed.** 972 lines, no `git log` entry, working tree only. Verified: `git log -- public/framework/ext/Panel` returns nothing. Every other item on this page is moot if that tree is lost — a stray `git clean`, a disk fault, or the Claude Janitor killing the wrong process at the wrong moment. **This is a five-second fix and it is first for a reason.**");

		md("## 0.5 — The other thing that isn't a doc problem");

		md("**`ext/Ask`'s two production chat surfaces pass no `tools` restriction at all.** The dev rail and the task chat both call `ask()` / `chat()` in the default permission mode, while `start()` — the same module, the same author — deliberately floors itself at `acceptEdits`. So the *deliberate* path is the restricted one and the two paths people actually use every day are not.");

		md("The blast radius is bounded: the bridge is localhost-only by construction and that is a `CLAUDE.md` constraint, not an accident. But the inconsistency is inside one module, and it reads as an oversight rather than a decision. Worth a deliberate call either way — recorded in `ext/Ask`'s readme Open section with the call sites.");

		md("## 1 — Real bugs, one line each");

		md(`| module | the bug | why it hides |
|---|---|---|
| \`core/App\` | \`instantiate()\` has no \`.catch()\` — a throw in \`config()\` or \`render()\` leaves \`app.ready\` pending forever | the page just never finishes loading; no error anywhere |
| \`ext/Saver\` | \`drain()\` doesn't catch a rejecting \`write()\`, so \`this.writing\` is never reset — every later \`save()\` returns the same dead promise | silent from the first quota error onward |
| \`ext/Draggable\` | \`destroy()\` never cancels an in-flight gesture, leaking a \`Sortable\`'s ghost and placeholder into the DOM permanently | nothing else ever tears them down |
| \`ext/Panel\` | a **failed** \`Saver.load()\` is indistinguishable from an absent one, so \`workspace()\` seeds and overwrites \`/data/panels.json\` | a read error silently destroys the user's layout |
| \`ext/editor\` | opening the page rewrites \`/data/editor.json\` even untouched — \`changed()\` runs purely so a badge has a value | writes look like saves |`);

		md("Each was found by reading the code beside the prose, which is the only way any of them surface. None were applied: the fences made every agent's code change a recommendation, and that was the right call for twenty-eight parallel writers.");

		md("## 2 — Silence that costs debugging time");

		md("Four independent agents flagged the same class of thing without being asked about each other:");

		md("- **`ext/toc` + a `Doc` `overview:` renders nothing at all** — the catalog mounts its child one DOM level deeper than `toc.css`'s selector reaches, so the rail builds, scans and scroll-spies entirely inert. Latent today (no page does both), loud tomorrow.\n- **`ext/layout` fails silently by design** — an unregistered word, an unresolvable target. Its auditor flagged it in four separate doc files it was writing, which is itself the evidence.\n- **`ext/tabs`' `filling` promise has no `.catch()`** — a throwing child `content()` leaves the bar blank with no console trace.\n- **`ext/doc`'s `api_section()` guard defeats an `api()` override** — a subclass whose members come entirely from `members()` calls gets no tab, and nothing warns.");

		md("## 3 — Duplication small enough to actually fix");

		md("The audit was asked to find big merges. It found small ones, which are the ones worth doing:");

		md(`| duplicated | where | the fix |
|---|---|---|
| the dev/localStorage saver chooser, byte-identical | \`ext/Panel/workspace.js\`, \`ext/editor/page.js\`, \`dev/DevBar/settings.js\` | one helper in \`ext/Saver\` |
| \`coalesce()\` — rAF drag throttling, lifted verbatim | \`ext/Panel\`'s \`grip.js\`, \`ext/demo\`'s \`stage\`; \`dev/DevBar/grip.js\` declines it in a comment | one \`raf_drag()\` in \`framework/util/\` |
| the three-clause drag cycle guard | \`ext/Draggable\`'s demo, \`PanelDrag\`, \`ext/editor\` | the base class's \`drop_check\` should carry it |
| sticky-rail CSS, four times with unexplained drift | \`Sidebar\`, \`Doc\`'s member rail, \`ext/toc\`, \`ext/files\` | one shared rail stylesheet |`);

		md("That last one is the closest thing to a real unification finding, and **two auditors reached it independently** — `ext/toc`'s and `ext/doc`'s — counting the same four implementations without knowing about each other. Nobody thinks the components should merge; the \"current\" logic genuinely differs. The CSS does not.");

		md("## 4 — Dead code, verified by grep");

		md("- `core/View` — `append_pojo` / `append_prop`, zero callers, and the collision guard walks the prototype chain so `append({ text: \"hi\" })` is silently dropped.\n- `core/View` — `html()` downgrades markup to literal text on browsers with no Sanitizer API, with **zero live callers**. Fix or delete.\n- `core/App` — `log_label()`, zero callers (the docs claimed seven).\n- `core/Sidebar` — three of four `$`-handles assigned and never read anywhere in the repo.\n- `ext/markdown` — `md.c()` has no callers; `marked` is re-exported by `app.js` to nobody.\n- `core/List` — **one caller in the entire framework: `Item.js` itself.**");

		md("## 5 — Naming collisions that will bite");

		md("- `List.find(fn)` is flat and one-level; `Item.find(id)` is recursive. Same name, unrelated contracts, and `List.find` has no real callers — free to rename **today**.\n- `Router.root()` collides with `app.root` (a Page vs an Element). The readme already proposes `scope()`; two call sites.");

		md("## 6 — Structural, and needing Mike");

		md("These are the \"propose before major surgery\" cases. Each is written up in full in its module's report; none should be started without a decision.");

		md("- **`ext/editor` is an application, not a module** — zero code callers, integrated only by being a route. Its auditor wants `page.js` split into `Editor.js` plus a thin page, which is the prerequisite for the `ext/Editor` rename a prior review already ruled for.\n- **`core/List` may be one idea wearing two names** — its readme overruled a bare-Array dissent on \"adopt/owner have to live somewhere\", which is true, but that somewhere did not have to be a class, a file, a readme and a doc tree. Two private methods on `Item` would do it. It is a load-bearing seam for three modules, so this is Mike's call.\n- **`ext/LayoutTool` may belong in `dev/`, not `ext/`** — 26 files of browser tooling under a directory CLAUDE.md defines as *opt-in addons the site imports*.\n- **`core/new` is 425 files of dead sketches** — a large fraction of the framework by file count, none of it importable by rule.");

		md("Next: [Organization](/framework/audit/overview/organization/) — the question this audit was really for.");
	}
});
