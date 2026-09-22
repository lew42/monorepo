# card-word — a `card` class that is padded by definition, and the one-line rule for who uses which spacing

Load the `minion` skill first. Then this brief. Model: Sonnet. Small: one word in `framework.css`, one rule in three skills, one live example, two lint checks.

**Three laws.** Less is more (ONE new word; nothing restyled today). Clear beats brief by far. Prioritize (the word and the rule first; the lint second).

## Why — read the audit first

`/framework/ai/2026-09-19/padding-audit/` (its `task.jsonl` has four `decision` lines; the mastermind has decided all four — build them). The owner, 2026-09-19: "It should be ultra simple: a `card` class that carries the default pad, so a card is by definition padded." The audit's measurements: `--pad` is a percentage of the containing block and suits page REGIONS (14 → 70 px across 400 → 3440) but leaves any nested card on its 1em floor at every width (15–18 px); `framework.css` has NO card word (`.surface` = ground + hairline + radius, no padding); 180 hand-rolled card/tile classes exist; no skill says what a card's padding is.

## Build

1. **The word, in `public/framework/framework.css`** (beside `.surface` / `.pad`, in the same layer they use): `.card` = what `.surface` is (ground, hairline, radius — reuse its declarations, do not fork the look) **plus padding from a card-pad token**. The token: the audit proposed `clamp(0.5em, 2.6%, 2em)`; the mastermind saw 16 px on a 739 px V3 card an hour later and the owner called it too small — so test BOTH that and a container-unit form (`clamp(0.75em, 1.6cqi + 0.4em, 2em)`-ish) on cards of 250 / 480 / 740 / 1400 px inside a container and inside NO container (cqi then reads the viewport — show that case honestly), at 400 / 1920 / 3440, and choose by the table and by looking. Name it in the size standard's family (`--pad-card`, multiplied by `--size` like its siblings, so `.card.size-small` is the dense form — no `.tight` word). ⚠ ADDITIVE ONLY: nothing on the site wears `.card` today, so nothing may move — prove it (a before/after screenshot diff of five busy pages: zero changed pixels).
2. **The rule, one line, in the three places an agent meets it** — `css` skill, `layout` skill, `new-css-class` skill (replace or merge with whatever they say now; do not append a fourth paragraph): **a page region → `.pad` · a framed box → `.card` · a control or a row → its own `em`**, with the one-sentence why for each (a region's pad scales with the page; a card's with itself; a control's with its text). And one line in `ui/readme.md`.
3. **The live example** on the design system page (`public/framework/styles/system/` — find the section where `.pad` and the grounds are shown): three boxes side by side — a region, a card, a control row — each printing its own computed padding live as you resize (⚠ a `%` inside `calc()` makes `getComputedStyle().paddingLeft` a calc string — read the geometry instead: `getBoundingClientRect` of the box minus its content box; the audit's `css/caveats.md` line says how).
4. **Two lint checks in the page-health watcher** (`Server/health.mjs`, landed today — read `public/framework/ai/health/doc/decisions.md` first): as WARNINGS, never errors, on the pages it already loads: (a) an element with a visible border or a ground different from its parent's AND under 8 px of padding on any side while it holds text; (b) a list of more than eight sibling rows whose pitch is over 40 px. Each warning names the element's classes and the measured number. Keep them cheap (one `evaluate` per page) and capped (ten per page). Prove each on a scratch page that violates it and on five real pages (report what they flag — that list is a deliverable for the mastermind, not something for you to fix).
5. **Do NOT migrate anything.** No existing card moves to `.card` in this task (V3's tiles and the dev bar's log cards will, in their own next tasks). One page, one minion.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/card-word/`); `css`, `new-css-class`, `documentation`, `ui-test`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `public/framework/framework.css` (the `.card` block and its token ONLY), `public/framework/styles/system/**` (the example), `public/framework/styles/css-scopes.txt` if needed, `.claude/skills/css/**`, `.claude/skills/layout/**`, `.claude/skills/new-css-class/**`, `public/framework/ui/readme.md` (one line), `Server/health.mjs` + `public/framework/ai/health/**`, your task dir. Not `public/framework/ai/v/**`, not `dev/DevBar/**` (a sibling is there), not `core/**`.
- `framework.css` is loaded by every page of the owner's live site: take the reload hold (`node Server/hold.mjs on "card-word — framework.css"`), make the ONE write, load three pages headless with zero errors, then `off`. `Server/health.mjs` is a standalone script — editing it restarts nothing, but the mastermind has a copy running; say in your landing that it must be restarted to pick up the lint.
- **Never kill or restart the owner's dev server (port 80) or the mastermind's (8123) or the running health watcher, never stop whisper-server, never drive the owner's tabs.** Private server: `PORT=8145 node server.js`, killed by real Windows PIDs at landing. Never `git stash`, never `find /`, never commit. Write files with the Write or Edit tool, never a bash heredoc. Do not write the owner's name anywhere.
- Post to the owner's log at start and landing, SHORT: `node .claude/skills/assistant/say.mjs say "<about five words>" "<two sentences>" --as card-word --id card-word --status working --icon crop_square` (then `--status done`).
- Landing `outcome`: one screen — the token chosen with its table, the zero-pixel proof, the rule as written, what the two lint checks flag on real pages, what was left and why.

## Mid-task addition — the owner, 2026-09-19

From the owner, on cards: "Is there a border-radius token? I think there should be; if not, add
one and put it INTO the framework card class. The V3 tile class should just BE the card class
from framework.css; no separate tile CSS. The CSS system is being broken by creating far too
much CSS. No display:flex / flex-direction:column on cards unless truly needed (fixed height,
centering); the flow system already gives vertical rhythm."

For the minion: (1) `--radius` exists (framework.css ~line 197, 0.5em) — `.card` must carry it
(`border-radius: var(--radius)`), along with the ground, the hairline and the card pad, so that
a plain `div.card` with a heading and a paragraph inside looks finished with ZERO extra CSS.
(2) `.card` must NOT set `display: flex` — it is a block whose children get their vertical
rhythm from the framework's flow (check how `.flow` / the default child rhythm reaches a card's
children; if a card needs `.flow` as a second word to get rhythm, say so in the rule and in the
example: `div.c("card flow", …)` — or make `.card` include that rhythm itself if that is the
smaller honest thing; decide by trying both on the example). (3) Two states the owner just asked
for on V3, which belong in the word so nobody hand-rolls them again: a STATUS edge (`.card` + a
modifier or a custom property for the left edge colour — e.g. `--card-edge`, drawn as a 3px
inline-start border only when set) and a SELECTED look that is unmistakable without an orange
outline on an off-white ground — the owner: "selected cards get an orange border and the
background looks odd; selection is not clear; white card with brown left border is fine."
Propose the selected look by showing three candidates side by side in the live example (a
stronger ground step such as `--darken-1` with the edge kept; an inset ring in `--ink` at low
alpha; a raised shadow) and choose by looking; keep contrast ≥ 4.5:1. (4) In the landing, write
the exact class list a V3 card should wear (e.g. `card flow` + `style="--card-edge: var(--warn)"`
+ `.selected`), so the V3 minion can delete its tile CSS against it.
