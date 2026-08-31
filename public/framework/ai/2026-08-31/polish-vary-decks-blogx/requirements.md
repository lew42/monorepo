# Requirements — verbatim

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more — build the top 2-3, roadmap the rest. 2. Clarity is the one exception. 3. Prioritize. Final report <=12 lines. Read CLAUDE.md. HARD RULES: never kill/restart the :80 dev server (private $env:PORT='8099'; node server.js, torn down after); never drive owner tabs; never stash; never commit. Run new-task first (slug polish-vary-decks-blogx, group pages).

TASK -- polish three /imagine/ labs: look, brainstorm, build. LOOK first: /imagine/vary/colstyles/ (three looks: Finder/Cards/Ink), /imagine/decks/ (presentational slide-deck layouts), /imagine/blogx/ (blog layout explorations). BRAINSTORM 8-12 ranked improvements as log lines, then BUILD the top 2-3 S/M.

One SPECIFIC item first (measured by the generator improver 2026-08-31): colstyles' css dresses .page-column-item but the core generator draws .page-gen-item -- generalize colstyles' item selectors to cover both (:is(.page-column-item, .page-gen-item)), so the generator's finder/cards/ink switcher dresses nav items too. Verify on /framework/core/Page/generator/ (read-only visit -- do NOT edit generator files; its looks control already stamps the classes). Warning generator law: your css change must not alter its draws -- same-seed spec renders identical DOM before/after (paste one sha or serialized check).

Other candidates to weigh: decks keyboard navigation (arrows/space between slides) if missing; a decks index strip (where am I / how many); blogx variants cross-linked to the real /blog/ posts they inspired (or the reverse); colstyles page getting a fourth look ONLY if you find one that earns it (transparent black/white stacking rules -- see framework.css alpha ladder); your own better idea from the look. Controls and data, never a new page per state.

FENCE -- public/imagine/vary/**, public/imagine/decks/**, public/imagine/blogx/**. Nothing else.

VERIFY: headless screenshots of each built change at 1920 (+3440 where layout shifts), zero console errors on all touched pages, the generator cross-check above. Keepers + links. Report: built (one line + proof each), roadmap left, cuts.
