# vision-sweep — every template page at three widths, and cards vs page compared

Laws: less is more · clarity · prioritize. **Deliverable: one browsable run covering the site's template pages, plus a numbers table answering Mike's card-vs-page question. Final message ≤ 20 lines.**

Mike: *"We want to analyze (screenshot) all the parts of all the pages. Not ALL the docs pages … as we fix some of the main template pages, it sort of automatically fixes all the derivations."* · *"if smaller screenshots are less costly, try doing ui card analysis first? trying to analyze the whole page could be trickier? you could compare both options, maybe doing it all at once pans out."* Measured so far: a region crop costs the same as a page ($0.068 vs $0.087); on the day cards a crop and the page gave the same verdict.

## Do

1. **The corpus** — template pages, not derivations: `/framework/`, `/framework/core/`, `/framework/core/Page/`, `/framework/styles/`, `/framework/styles/layouts/`, `/framework/styles/materials/` (or the live sibling), `/framework/ext/`, `/framework/ext/Panel/`, `/framework/ext/Doc/`, `/framework/ext/DesignTool/`, `/framework/ext/DesignTool/vision/?run=/framework/ai/2026-08-17/vision-pilot/`, `/framework/ui/`, `/framework/ai/`, `/framework/ai/2026-08-17/`, `/framework/ai/2026-08-17/layout-primitives/`, `/framework/ai/2026-08-17/mastermind-shots/`, `/web/`, one doc page (`/framework/core/Page/doc/` or the live sibling), `/notes/` if it exists. Verify each returns a real page (h1 not "404 — nothing matches"; log and drop 404s). ~18 pages × 390/1280/3440, page-level, Sonnet, `critique-full-v1` (the default; the sweep must be comparable to the pilot) → `--out public/framework/ai/2026-08-17/vision-sweep`. ~54 asks ≈ $4; `--dry` first; ceiling $6. Verify no agent is editing (`git status --short | wc -l` twice, a minute apart, equal) before you start.
2. **Cards vs page** — on `/framework/ui/` and `/framework/ai/2026-08-17/` at 1280: region shots of the cards (`--regions auto`, cap 6; if the picker grabs the sidebar, note it) with the same prompt. Table: level · shots · $ · findings · broken · findings **only** the card level found · findings **only** the page level found (judge by meaning, quote one of each). ~12 asks ≈ $1. Then one paragraph: which to run first, and when the other pays.
3. `note.md` here (≤ 30 lines): the corpus (with any 404 dropped), totals ($, shots, findings, broken), the top 5 most-repeated findings across pages (one line each — these are rules, not pages), and the cards-vs-page table. **No fixes** — an Opus harvest follows.

## Rules

- Files: this dir only (the runner writes `vision.jsonl`, `shots/`, `prompts.json` here). Log in `task.jsonl` (bash `printf`; timestamps from `date -Iseconds`); bump step; land per `finish-task` with the browse URL in `links`. Never Mike's live tabs.
