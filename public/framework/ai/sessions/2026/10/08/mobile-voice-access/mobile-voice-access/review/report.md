verdict: fix
1. [fix] At 400 the works/doesn't-work table overflows the right edge: the "Why" column is entirely off screen and "On the phone (LAN address)" is cut mid-word ("silentl…", "brows…"), with no scrollbar to reach it. This is the page's own first screen, on the exact device (a phone) the page is about. shots/127-0-0-1-61496-framework-dev-mobile/400.png; layout.json 400.overflow_x false (nothing scrolls it into view).
2. [fix] public/framework/dev/mobile/readme.md ships as an empty skeleton — only the headings Index, Use, Watch out, More, no text under any of them. CLAUDE.md: a readme is the reader's index, not blank. diff.patch lines 64-78.
3. [note] Two paragraphs run past the 60-word cap: "1. Find the address, and open it" (~72 words, one block) and "Why .localhost fails on the phone" (~71 words). Splitting each into two short paragraphs would read faster. diff.patch mobile.md.
4. [note] This task's own log files (findings.md, task.jsonl, files.jsonl, review.md, review.jsonl, review/) are still untracked in the main tree (`git status`), and the mobile.md page itself lives on an unmerged branch (worktree/mobile-voice-fix). Expected to land at finish-task / merge — flagging so it isn't forgotten.
5. [note] h2 headings wrap to 4 lines at 400 ("2. Fix the microphone: three options, one recommended", "What's hard-coded to localhost (checked, not assumed)") — layout.json 400.wraps. Shorter headings would sit in 1-2 lines on a phone.
6. [note] widest_text at 1200/1920 is raw page.jsonl JSON ("{\"title\":\"Mobile\",\"icon\"…", 1128-1210px) — looks like the page's own source/file view further down the page, not page prose. Worth a glance that it's the intended files display and not a stray dump.

## Requirements
- Q1 "How does the phone reach the site today?" — yes — findings.md §1: `Server/server.js` binds 0.0.0.0 (netstat confirms), Servex's proxy binds loopback only, firewall rule already exists.
- Q2 "Hard-coded hosts" — yes — findings.md §2: grep results per file, each resolved against `location.origin`/`import.meta`, or a documented deliberate exception (frozen v1 snapshot, dev Socket's localhost-only rule).
- Q3 "Microphone" — yes — findings.md §3: `getUserMedia` needs a secure context; a phone's `http://<LAN-IP>` isn't one; three ranked options with mkcert recommended, linking ux/Dictate/doc/https-lan.md.
- Q4 "Whisper" — yes — findings.md §4: tested live with a real clip, 0.77s direct / 0.48s via the site's own `/whisper` proxy, both correct, no failure mode found; mic block in §3 is the real cause, not Whisper.
- Deliverable 1 "a Mobile setup page, one screen" — yes, with the note above (#1) that the one screen breaks at 400 — shots/…-mobile/sheet.png; table-first, how-to-open, fix options, in priority order.
- Deliverable 2 "findings.md, answers 1-4 + ranked fix list" — yes — findings.md has all four answers and a ranked fix list (mkcert the one real gap).
- Deliverable 3 "fix what's small and safe" — yes — findings.md documents the grep found nothing live to fix (everything was already fixed by `ai/sessions/2026/09/29/mobile-nav/mobile-nav/`); a documented "nothing to do" is a valid answer, not a skip.
- Deliverable 4 "owner-contingent items → a Note card + a line in findings.md" — yes — findings.md names the card `2026/10/08/mobile-mic-needs-an-https-choice-mkcert` for the HTTPS decision.
- Rule "commit your own work, no loose files" — no — see finding #4: the task's log files and the page itself are not yet in the main tree.

## Page structure
- 1 — yes — "Mobile" title + page.jsonl description say what it is.
- 2 — yes — the works/doesn't-work table is the first thing under the title, a structured compare list rather than prose.
- 3 — yes — table (state) → how to open it → fix the mic → why `.localhost` fails → what's hard-coded, top to bottom in that priority.
- 4 — n/a — not a task-tracking page.
- 5 — yes — `dev/page.js` children: now names `mobile/page.jsonl`; the Mobile card appears in `/framework/dev/`'s preview wall. shots/…-dev/1200.png.
- 6 — n/a — one page, no sub-views or tabs.
- 7 — yes — standard docs page (markdown + rail nav), an approved type, no page-specific CSS.
- 8 — yes — every row label and ✅/❌ is self-evident without reading further.
- 9 — yes — no repeated or orphaned small controls; see finding #1 for the one place content is lost rather than wasted.
- 10 — yes — a compare table instead of a paragraph of prose is the better form here.
- 11 — yes — "1. Find the address, and open it", "2. Fix the microphone…" each state their section's point.
- 12 — n/a — new page, nothing restructured.

## Navigation
- Identify: a left rail (site nav, collapses to a hamburger under 1200) and a bottom rail at 400 (✦AI / ⋯More) — both standard site chrome, unchanged by this diff.
- 2-4 (tabs) — n/a — no tabs on this page.
- 5 (rail/sidebar beside centred main) — yes — the rail sits beside the centred article at every width shown. shots/…-mobile/sheet.png.
- 6 (rail stays still) — yes — same rail, same position, across all four widths.
- 7 (bottom rail leaves room) — yes — the 400 shot's bottom rail sits below the last visible content, not over it.
- 8-9 (sheet/modal, full screen) — n/a — none on this page.
- 10 (selected item own view) — n/a — nothing expands in place here.

## Layout
- 1 — yes — at 3440 the rail sits beside a centred main column (not one narrow column adrift). shots/…-mobile/3440.png.
- 2 — yes — standard Docs-style page (rail + content), an approved layout.
- 3 — no at 400, yes at 1200/1920/3440 — the table's width is wrong for its content at 400 (finding #1); it fits cleanly at the wider widths. shots/…-mobile/1200.png.
- 4 — yes — standard `.pad` region, nothing padded without reason.
- 5 — no at 400 — the table's "Why" column text runs off the right edge, touching no ground, reachable by nothing (finding #1).
- 6 — n/a — the table is one region, not two side-by-side content columns.
- 7 — yes — layout.json bands show no band both big and empty (`big_empty: false` throughout); the long `flow` band matches a long docs page.
- 8 — n/a — no side-by-side columns of content on this page.
- 9 — yes — the large empty% at 1920/3440 (0.73-0.84) is the normal reading-column gutter for a prose page, not dead space.
- 10 — yes outside the table; no inside it — the table doesn't scale to the 400 box (finding #1).
- 11 — n/a — no card wall on this page itself (the Mobile *preview* card sits in the parent's existing wall, unchanged pattern).
- 12 — n/a — no rounded-card stack here.

## Sizing
- 13 — yes — nothing suggests a fixed-height box; the page is plain flow.
- 14 — n/a — no previews on this page itself.
- 15 — no — the table doesn't say what happens to overflow content at 400; it just loses it (finding #1).
- 16 — no — the clipped "Why" column is an unintended, unlabelled scroll/clip, not a decided one.
- 17 — n/a — no band above the first nav item.
- 18 — no at 400 — layout.json's `overflow_x: false` means the page itself doesn't scroll, but that's exactly how the table's right column disappears rather than being reachable (finding #1).
- 19 — not measured — needs source, not shots.

## Wrapping
- 20 — n/a for this page (no tab bar/button row of its own); the existing site chrome's rail buttons don't wrap.
- 21 — yes — the same two h2s wrap the same way (2 lines) at both 1200 and 1920; no new wrap appears specifically at 1200.
- 22 — n/a — no control row (chip/button row) on this page.
- 23 — no — at 400 the table does not stack into one column; it stays in its grid and loses a column instead (finding #1).
- 24 — n/a — the Mobile preview card on `/framework/dev/` truncates the same way its siblings (Socket, DevBar, Dev shell, Claim) do — existing, consistent component behaviour, not page-specific.

## Spacing and padding
- 33 — yes — left_stack h1/p total 28px at 400, well under 3em (48px). layout.json 400.left_stack.
- 34 — yes — a single `page` layer, no nested padding stack. layout.json left_stack.layers.
- 35-42 — not measured — need the CSS source, not the shots, to check class-by-class; nothing visible in the screenshots suggests a violation beyond finding #1.
- 36 — no at 400 — the table's "Why" text sits against (past) the viewport edge rather than keeping room from it (same evidence as finding #1).

## Colour and contrast
- 1-2 — yes, by eye — body text and the green/red check icons read clearly against the light ground in every shot; no ratio measured.
- 3 — not measured — needs CSS source.
- 4 — yes — the table's header row and body rows read as distinct boxes against the page ground.
- 5 — not measured — only light-mode shots were taken.
- 6 — n/a — one ground throughout this page.
- 7 — n/a — no repeated anchor mark on this page.
- 8 — not measured — needs CSS source.

## Flow
- 25 — yes — table (what works) first, then how-to, then the fix, then the why — most important first.
- 26 — no — the table's "Why" column and part of "On the phone" are hidden past the right edge at 400 with no way to reach them (finding #1).
- 27 — yes — the page reads as one `.flow` rhythm of prose and headings throughout.
- 28 — yes — each table row's cells sit closer to each other than to the next row.
- 29 — n/a — not a live-updating page.
- 30 — yes outside the table — widest_text at 400 is 340px, inside the 400 viewport; the table's own overflow is a different problem (finding #1).
- 31 — not measured — needs CSS source.
- 32 — not measured — needs CSS source.

## Words
- 1 — yes — the compare table shows the work-vs-doesn't-work state rather than describing it in prose.
- 2 — yes — row grouping and the ✅/❌ column carry the structure; no sentence re-explains the table.
- 3 — no — two paragraphs run 70+ words each (finding #3).
- 4 — yes — the table alone gives the page's point in under ten seconds.
- 5 — yes — "Mobile", "1. Find the address, and open it", etc. each say exactly what follows.
- 6 — n/a — no captioned pictures on this page.
- 7 — yes — "phone", "LAN address", "secure context" are each named once and reused consistently.
- 8 — yes — `ux/Dictate/doc/https-lan.md`, `dev/Socket/doc/localhost.md` and `findings.md` are linked where mentioned.
- 9 — n/a — this page's own content IS the widget (the table); nothing here is a bare file of prose needing a picture beside it.
- 10 — yes — the table leads; the why/detail sections come after, one scroll down.
- 11 — yes — full plain sentences throughout, no clipped fragments.
