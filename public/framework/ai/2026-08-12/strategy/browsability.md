# Browsability — strategy (2026-08-12)

Lens: the prime objective — find any thing by clicking through previews in the
fewest clicks; every thing has its own `/path/` with full docs. Verdict up front:
**the machinery is already converged and good.** The 08-09→08-11 sessions did the
hard part — one card (`Page.preview()`/`previews()`), one viewport (`demo.stage()`),
one control surface (`ext/Layout` panel), `catalog()` rails, `walls()` landing.
Click depth is 1–2 to almost anything. What remains is not new machinery: it is
**unlinking the process tier, making cards legible, and closing three known
open items.** Everything below was verified against the files named.

---

## Move 1 — Unlink `ai` from the employer-facing tree (the single loudest fix)

**What.** `public/framework/page.js` line 12:
`children: "start faq versus core styles ui ext util dev ai"` — drop `ai`.
One word. `walls()` and `sections()` both derive from `children`, so the AI rung
vanishes from the landing wall and the sidebar in the same edit. Also remove the
`ai` grep-visible cross-links: `ui/page.js` links `/framework/ai/2026-08-09/`
("independent review") — repoint that sentence at `ui/readme.md` or drop the link.

**Why.** An employer clicking `/framework/` today scrolls a landing wall whose
last rung is "AI: 2026-08-12, 2026-08-11, …" — agent daily journals full of
"Opus minions", budget protocol, task tallies (`framework/ai/2026-08-09/proposal.md`
et al.). It is the one section that reads as *mess by construction*. The pages
stay on disk and stay URL-reachable — `Page.child()` falls through to the
filesystem probe (`core/Page/readme.md`, "a child nobody declared still
resolves") — so the team loses nothing but the nav entry.

**Effort:** minutes. **Risk:** near zero; verify the landing renders and no
`nav_for("ai")` caller exists (none found outside `framework/page.js`).

## Move 2 — Render `description:` on cards (or delete all of them)

**What.** `description:` is declared on essentially every page and read by
**nothing live** — the only readers are `core/legacy/Page/Page.class.js:177,197`
(`.page-preview-desc`), i.e. the old Page already solved this and the lesson was
dropped in the rewrite. Lift it: carry `description` through `nav()`/`nav_for()`
(`core/Page/Page.class.js`), render one clamped line in the **plain**
(no-thumb) card in `preview_card()`, style `.page-preview-desc` in
`core/Page/Page.css` (2-line clamp; hide it in the `<64em` catalog strip the
same way group headings already hide — `ext/catalog/catalog.css`).

**Why.** This is the highest-leverage browse upgrade left. The landing `walls()`
and every icon-card wall are currently **label-only** — "Router", "Util",
"Sidebar" — and the descriptions that would make them scannable are already
written, one per page, going to waste. `core/Page/readme.md` Proposed #2 already
demands "pick one and write it down"; picking *render* serves the prime
objective, picking *delete* is the fallback — either way stop carrying dead API.

**Effort:** small (one method, one CSS block). **Risk:** card-height variance on
mixed walls — clamp handles it; thumbed cards stay bare (add nothing there).

## Move 3 — Close the catalog's known deep-link gap (`reveal()`)

**What.** `ext/catalog/readme.md` "Open": a deep link to a card far down a long
rail arrives with the rail scrolled to its top — the lit card is below the fold,
so a shared link to `/framework/ui/timeline/` looks unselected. `tabs()` already
solved reveal-on-activate; port it into `ext/catalog/catalog.js` (rail is its own
scroll container: `sticky` + `overflow-y`, so `scrollIntoView({ block: "nearest" })`
on the lit card at activate time is the whole fix).

**Why.** Six catalogs (ui — 19 cards, layouts — 11, sections — 15, elements/forms,
Page overview — 14, every classdoc Overview) are the site's main detail-browsing
surface, and this is the one interaction that makes them feel unfinished exactly
when someone is *sent a link* — Mike's employer scenario verbatim.

**Effort:** small, path already named in the readme. **Risk:** low; test the
classdoc variant (rail inside a tab panel, different `top` inset).

## Move 4 — Delete the orphans and settle the dead trees

Deletion is the recommendation, in two tiers:

- **Delete now, no approval needed:** `public/path-1/`, `public/path-2/`,
  `public/test.html` — router-era scratch at the *deployable root*; nothing
  references them (grep confirmed only self-references). Also
  `public/framework/core/legacy/` — CLAUDE.md already calls it "the dead Pager
  tier", nothing imports it, and it is where the only `description` readers hide
  (harvest Move 2's two lines first).
- **Propose to Mike, do not execute:** `public/framework/core/new/` (with
  `legacy/`, ~768 files of unlinked sketches). CLAUDE.md protects `new/1/` as
  "where the shipping design was proved" — so the proposal is: keep
  `core/new/1/readme.md` (the record), delete the rest. An employer browsing the
  *repo* (they will) finds 5× more dead pages than live ones; an employer
  browsing the *site* never sees them. Repo cleanliness is why this makes the
  browsability list at all.

**Effort:** minutes + one question. **Risk:** only the `new/1` call, which is
explicitly Mike's.

## Move 5 — Front doors: cross-link `/web/`, sober up `/`

**What.** (a) `/web/` (the guide tier — 11 nav patterns, 7 layout principles,
`public/web/page.js`) is linked only from the root homepage; `/framework/` never
mentions it. Add one line to `public/framework/page.js`'s closing prose ("the
guide: /web/") or a sidebar entry. (b) `public/page.js` — the site root — is
titled "Nice work, everyone", a team note listing five personal sandboxes
(which error by design when crawled). If the employer trims the URL to `/`,
that is what they meet. Rewrite the root as a two-card front door (Framework /
Web) and move the team note + sandbox links below the fold or into `/notes/`.

**Why.** `/web/` is the strongest portfolio material on the site (live,
clickable pattern studies) and it is invisible from the link Mike would send.

**Effort:** small. **Risk:** none; root page is hand-rolled, no `children`.

---

## Explicitly NOT recommended

- **No new preview/catalog/doc machinery.** The five-block system is done and
  self-consistent; every gap above is a link, a line of CSS, or a deletion.
- **No mass "full docs" rewrite.** The leaf rubric (basic usage → variants as
  child pages → source → panel) is already met by the shared templates —
  `styles/layouts/word.js`, `demo.page()` (`ext/demo`), the sections `band`
  spread (`styles/sections/page.js`), `classdoc`. The one missing rubric item,
  **overrides**, should be added to those 3–4 *templates* (one "what to override,
  where" line each), never page-by-page.
- **Don't touch `versus`, `faq`, `start`, `dev`, `util`** — short, honest,
  employer-safe as they are.

## Suggested order

1 (unlink ai) → 4a (delete orphans + legacy) → 2 (descriptions on cards) →
3 (reveal) → 5 (front doors) → 4b (ask Mike about `core/new/`).
Then re-run the crawl (`/framework/` + `/web/`, per site-crawl memory) at
1600/900/400 before calling it employer-ready.
