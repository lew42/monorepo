/* The report's copy, so page.js stays the SHAPE of the report.
   Prose is markdown — every claim carries a number, an image or a link. */

export const NEEDS = [
	["Rank the 18 shots — five minutes",
		"[**Open the duel**](/framework/ai/2026-08-17/human-ranking/rank/) — two screenshots, click the better one, 59 times. "
		+ "**No tier is ground truth.** The Opus baseline does not reproduce itself (ρ **+0.507** against its own blind second pass, ICC **0.510**), "
		+ "and Sonnet reproduces better (**0.711**) than the reference does. Your order is the only thing that can anchor any of them."],
	["`frame-gap` is measuring your sidebar on 87 pages",
		"**94 of 141** pages take their 10th percentile from *outside* the content region — **87** of them from the same box, `div.sidebar`, at exactly **1.400** — "
		+ "so the band pays full credit to **138 of 141**. Fixing it contradicts its deliberate root scope, which is a design call, not a bug fix. "
		+ "[The derivation](/framework/ext/DesignTool/knowledge/)"],
	["Masonry — you asked for it by name",
		"[The layouts wall](/framework/styles/layouts/) got one grid **per band** instead. The reasoning: after consolidation every card in a band is the same height, "
		+ "and masonry of uniform children is a grid with extra steps — while CSS-columns masonry would put a band heading *inside* a column and break reading order. "
		+ "Yours to overrule."],
	["`session_id` is in 87 published log files",
		"In plain text, in `task.jsonl`, served by `express.static` and deployed as static assets. The `/ai-logs/` route that read them is now loopback-guarded "
		+ "([ai-logs-guard](/framework/ai/2026-08-17/ai-logs-guard/)); the files themselves are still readable by anyone with the url."],
	["`SubagentStop` is not registered",
		"So worker agents have **never** had the unfinished-ledger gate — a cost that was reported to you as real and was not. "
		+ "The machinery supports it correctly now ([ledger-attribution](/framework/ai/2026-08-17/ledger-attribution/)); turning it on changes every session, so it is yours."],
];

export const WEAK = [
	"**Ragged rows.** On the component wall a short card leaves 100–200px of white beside a tall one. The fix is a uniform thumb height, not masonry — `wall-polish` is on it right now.",
	"**Four near-empty previews** — tooltip, menu, crumbs, pagination. The component genuinely *is* small; it is a demo-body problem, the same one that made two layout cards weak this morning.",
	"**Two bands are still not trusted.** `measure` and `contrast` were re-derived today but `audit/taste.json` stores `scale` as counts against a share band — distrust that column until the sweep runs. `frame-gap` is item 2 above.",
	"**The baseline sweep is still owed.** The committed baselines predate the `ui/` wall, the five tier fixes, the three re-derived bands and the single-screen rebuild — every number on those audit pages is from before today.",
	"**The layout tab got denser on the one axis you named.** 8 → 10 visible controls, because the four width presets moved in beside the number they promise. The *screen* went 3 → 2. Surfaced, not defended.",
	"**Two cards are correct and still undramatic.** `stack` and `sidebar` show their `.measure` content as an island at 3440 — true to each layout's own lesson, but not a wall-to-wall image the way Landing and Pricing are.",
	"**21 historical links are knowingly dead** after the `LayoutTool → DesignTool` rename, and ~116 task pages still fire one 404 apiece for a legacy `session.json`. Both left rather than falsify the record.",
	"**This page is reading in 506px of your 1280.** Everything under `/framework/ai/` mounts beside the task rail, which takes `min(34em, 45%)` — which is why the before/after pairs stack at a laptop width instead of sitting side by side. Second sighting today; `--rail` and `container()` are both real seams, and both change every task page.",
];

export const REST = [
	["The vision record", "[Every screenshot and how the AI responded](/framework/ai/2026-08-17/vision-browse/) — all 18 scored shots, each beside its five axis scores and the full sentence behind every one. Two caveats sit above the list rather than buried: only **contrast** and **density** beat a best-constant control, and **18 of ~169** of today's screenshots were scored at all."],
	["Renames, both atomic", "`ext/LayoutTool` → [`ext/DesignTool`](/framework/ext/DesignTool/) (98 files, 7 real external imports, 61 emitted classes identical before and after) and `ext/doc` → [`ext/Doc`](/framework/ext/Doc/) (144 references). 938 files re-scanned for case: **zero miscased**, so LAW#2 holds on case-sensitive hosting."],
	["Mobile", "[`/framework/ai/`](/framework/ai/) at 390 went **48/F → 84/B** — a `1fr` track that should have been `minmax(0, 1fr)` overflowed 15 of 107 cards by 36% of their own width. The 336px tab-bar band was a class-name collision, not a tabs flaw."],
	["Portfolio", "[`/fly/`](/fly/) — the three.js flight sim ported standalone, linked from the home page's sidebar and card wall."],
	["Instructions", "A 36-line `CLAUDE.md` draft (183 today) with 9 decisions waiting for you, plus the new [`css`](/framework/styles/) and `new-css-class` skills."],
	["The ledger", "105 action lines were being filed into one unrelated task, because subagents inherit the parent's `session_id`. Attribution now walks up from the edited file's own path — ground truth, no heuristic."],
];
