verdict: fix
1. [fix] The shots do not show the change. They were taken at `monorepo.localhost`, which serves the main tree (`michael/dev`), and the work is still unmerged on `worktree/page-context-asks` (3fab1f0af). layout.json has 6 bands at every width (title, md, md, the nav card, h2 + md "Run it yourself"), with no band for the new "On any object" h2, its card or the weighted previews, and no open-work line. So nothing visual about #6 or #7 is proven yet: re-shoot from the worktree or after the merge (requirement 2, "Layout-check 400/1200/1920/3440 for any page change").
2. [fix] Requirement 2 asks for "smoke clean", and neither STATE.md nor task.jsonl shows a smoke run. The probes it does cite (horizontal scroll, the line on /framework/ai/) are described in words, with no output or shot saved in the task folder.
3. [note] `PageWeight.apply` moves every card to the end of the box (`box.el.append(el)`). On a list that uses `group`, the `h4.page-previews-group` headings stay at the top and the cards lose their groups (Previews.js `list`). The core/Page demo has no groups, so it only bites a grouped list.
4. [note] The open-work line only updates when someone runs `node Server/page-ai-cost.mjs --work` by hand. STATE.md says so honestly (blocked on the Servex tick and its restart), so #6 is really "partly", not "done" as asks.md now says.
5. [note] Ask #6 also says "defines pages vs embedded cards". Neither STATE.md nor the asks.md update mentions it. It was not in the old "Open" line, so it is probably covered elsewhere, but it is not ticked with proof.
6. [note] Existing page, not from this diff: at 1200 the Page tab bar wraps to 3 rows (layout.json `tab_rows 3`), and at 400 the drawer rail buttons wrap to 3.2 lines.

Widths given: 400, 1200, 1920, 3440 for /framework/core/Page/weight/ (sheet.png). All of them show the pre-change page (finding 1).

## Requirements
- 1 "Each open point is built (with a commit), or written up in STATE.md with the real blocker and the smallest next step" — yes — commits bb8d98c9f (#6) and 632aa94e1 (#7); STATE.md names the blocker (no timer for `--work`) and its next step
- 2 "Proof per point… Layout-check 400/1200/1920/3440 for any page change; smoke clean" — no — the shots are of the unmerged main tree (finding 1); no smoke output (finding 2)
- 3 "The entries in core/Page/doc/asks.md are updated (done / partly / open) with commit links" — yes — diff to asks.md #6 and #7 has commit links; #6 should read "partly" (finding 4)
- #6 "open tasks per page on every page" — yes in code — `PageWork.line` is called in `Page.render()` and in `Doc.render()`; not seen in any shot
- #6 "directory data still separate from page.jsonl" — yes — decided as by design and linked to doc/data.md and doc/jsonl.md
- #7 "usable on any object (Items, cards)" — yes — `PageWeight.of` takes a url, `{url}` or `{weight}`
- #7 "card size following module weight; weight filters" — yes in code — `previews(pages, {weight, min})` gives the w1–w3 and `weighty` classes, and `hidden` below `min`; not seen in any shot
- #7 "display A/B undecided" — yes — A is decided and B is named as the alternative in weight/doc/design.md
## Page structure
- page 1 (title says what it is) — yes — shots/…weight/1200.png, top band: "Weight" with the formula in the first sentence
- the new section's structure — not measured — absent from every shot (finding 1)
## Navigation
- navigation 1 (techniques used) — tabs, a sidebar, a drawer rail at 400
- tabs wrap — no — layout.json tab_rows 3 at 1200 and 2 at 1920 (an existing page, finding 6)
- route / back — n/a
## Layout
- layout 1 — yes — layout.json `layout: doc` at every width, and the reading column holds
- the new weighted wall and icards — not measured (finding 1)
## Sizing
- reading measure — yes — widest text 793 at 1200, 962 at 1920 and 1083 at 3440; the md paragraphs sit near 40em in shots/…/1200.png
- card sizes follow weight — not measured; the old nav card already shows Layout bigger in 1200.png, band 4
## Wrapping
- overflow_x — yes, none — false at all four widths
- headings — note — the h3 "1. Main navigation…" takes 3 lines at 400 and 2 at 1200 (layout.json wraps)
## Spacing and padding
- left stack — yes — the h1 and p share one left edge at every width (28, 38, 67 and 90 px)
- `.page-open` padding uses `--gutter-x` — not measured; the line is absent from the shots
## Colour and contrast
- new colours — n/a — the diff adds only `--muted` for the summary text, an existing token
## Flow
- flow — not measured for the new section; the existing bands run title → md → md → card → h2 → md with no big_empty
## Words
- content (page text) — yes — the new md opens with a bold one-line gist and links doc/design.md
- content (STATE.md) — yes — short, ✅/⬜ marks, links on every claim
- content (page-work-line.md) — yes — opens with "What you see", then explains where the data comes from in plain steps
