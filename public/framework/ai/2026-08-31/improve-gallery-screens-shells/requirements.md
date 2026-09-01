# Requirements (verbatim ask)

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more - build the top 2-3, roadmap the rest. 2. Clarity is the one exception. 3. Prioritize. Final report <=10 lines. Read CLAUDE.md. HARD RULES: never kill/restart the :80 dev server (private $env:PORT='8097'; node server.js, torn down after); never drive owner tabs; never stash; never commit; search with Glob/rg scoped to the repo, never `find /`. Run `new-task` first (slug improve-gallery-screens-shells, group pages).

TASK - the improve pass three /imagine/ labs never got: look, brainstorm, build. LOOK first (drive each live, all three resolutions): /imagine/gallery/ (browsable lists of all things - cross-page previews), /imagine/screens/ (the 400/1920/3440 screenshot brainstorm lab), /imagine/shells/ (app layouts: sidebars, footers, canvas, inner chrome). BRAINSTORM 8-12 ranked improvements as log lines across the three, then BUILD the top 2-3 S/M total (not per lab). Candidates to weigh, or beat with your own from the look: gallery - a filter/search box over the previews (client-side, over titles it already has), or read-state marks via core's page.store() (in core since 08-31 - this.store(), get/patch/clear); screens - whatever its own notes say round 2 should be, or wire its brainstorm outputs to link the pages they discuss; shells - keyboard toggles for the chrome regions (never stealing from focused inputs), or one composed "everything shell" example that names which lab page each region came from. Controls and data, never a new page per state.

FENCE - public/imagine/gallery/**, public/imagine/screens/**, public/imagine/shells/**. Nothing else.

VERIFY: every built feature headless-proven (screenshots; store round-trips through a real reload where used), zero console errors, 400/1920/3440 on changed pages. Docs: one readme line per touched lab. Keepers + links. Report: built (one line + proof each), roadmap left, cuts.

## Scope / file ownership
- Only touch files under public/imagine/gallery/**, public/imagine/screens/**, public/imagine/shells/**.
- No new npm deps, no build step, no server restart.
