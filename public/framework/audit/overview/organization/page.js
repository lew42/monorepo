import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Organization",
	description: "Are Editor, Panel, ext/layout, DevBar and demo one thing? Twenty-nine independent answers.",

	content(){

		md("The brief asked every agent the same question without telling any of them who else was being asked: **which other module does yours overlap, and could they be one thing?** Nine of them were pointed at the specific suspicion — that `ext/editor`, `ext/Panel`, `ext/layout`, `dev/DevBar` and `ext/demo` are five names for one idea.");

		md("## The answer: no, and the reason is worth keeping");

		md("**They split cleanly into two families, and the split is real.**");

		md(`| | ephemeral simulation | persisted structure |
|---|---|---|
| **what it holds** | a thing being *shown*, thrown away on reload | a tree the user *owns*, saved |
| **modules** | \`ext/demo\`'s stage, \`ext/layout\`'s bar + drawer | \`ext/Panel\`, and \`ext/editor\`'s shell |
| **already unified?** | yes — \`demo.exhibit()\` hard-imports \`ext/layout\` | yes — \`ext/editor\`'s shell **is** \`workspace({ saver, templates, seed })\` |`);

		md("Both families are *already* unified internally, by import rather than by resemblance. `ext/demo`'s auditor put the objection precisely: merging the two would need a flag meaning **\"is this drag real or simulated\"** — and an option like that is API surface forever, which is the thing CLAUDE.md exists to prevent.");

		md("## `ext/layout` is two things, and only one of them is a product");

		md("Its auditor found the split inside the module: `words.js` + `controls.js` are a **reusable control vocabulary** — already imported directly by `ext/Panel` and `ext/editor` — and the bar-plus-drawer is **one product built from it**. That is the unification working. Nobody noticed because the module has one name for both halves.");

		md("## `ext/editor` is not a module");

		md("**Zero lines of code anywhere in the framework import anything it exports.** Its only integration is a word in `ext/page.js`'s `children:` string, which makes it a route. It is an application shelved under a directory CLAUDE.md defines as *opt-in addons*. Same charge, weaker, against `ext/DesignTool`: 26 files of browser tooling that looks a lot more like `dev/` than `ext/`.");

		md("## What the audit actually found: four small duplications");

		md("Asked for big merges, twenty-nine readers found small ones — which are the ones worth doing, because each is an afternoon and none needs a decision:");

		md("1. **The dev/localStorage saver chooser**, byte-identical in three files. One helper in `ext/Saver`.\n2. **`coalesce()`**, rAF drag throttling, lifted verbatim between `ext/Panel`'s `grip.js` and `ext/demo` — and `dev/DevBar/grip.js` *declines the same pattern in a comment*, which is three independent encounters with one missing utility. One `raf_drag()` in `framework/util/`.\n3. **The three-clause drag cycle guard**, hand-written in three files because `Draggable.registry` is one document-wide `WeakMap`. Belongs in the base class's `drop_check`.\n4. **Sticky-rail CSS, four times with unexplained drift** — `scrollbar-width: none` here, `thin` there.");

		md("That fourth one is the strongest finding on this page, because **two auditors reached it independently** — `ext/toc`'s and `ext/Doc`'s — each counting the same four implementations (`Sidebar`, `Doc`'s member rail, `ext/toc`, `ext/files`' tree) without knowing the other existed. Nobody argues the components should merge; the \"which one is current\" logic genuinely differs per source. The CSS does not, and it drifted.");

		md("## Where the framework should shed weight");

		md("Pruning, in order of how little argument it needs:");

		md("- **`core/new/0/` and `core/new/starter/` — delete the code, keep the readmes.** Its auditor read all 425 files and reports their value is *already fully extracted into prose*. Keep `new/1/` whole: it is the shipping design's proof, and three core readmes cite its measurements rather than repeating them.\n- **The verified-dead members** on the [Priorities](/framework/audit/overview/priorities/) page — `append_pojo`, `html()`, `App.log_label()`, `is.proto`, `is.mobile`, `md.c()`, three Sidebar handles. Each confirmed by grep, not by eye.\n- **`core/List`** — one caller in the whole framework, and that caller is `Item.js`. Not obviously deletable (it is a load-bearing seam for three modules) but the question is now on the record with evidence.");

		md("## The honest limit of this exercise");

		md("Each agent saw **one** module. They agreed with each other more than that should allow — three found the same `patched()` bug, two found the same rail duplication, three converged on the same base-class-plus-subclass workaround. That convergence is the audit's strongest signal, and it is also the reason to distrust any finding only **one** agent reached, including the confident ones.");

		md("Back to [Priorities](/framework/audit/overview/priorities/), or the **Docs** tab for the module-by-module reports.");
	}
});
