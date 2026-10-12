# Brief — cap the browse-band card max

One small fix from the site study's stage verdict (`public/framework/ai/2026-09-18/site-study/study.md`,
the stage section, and its `decision` line in `site-study/task.jsonl`).

**The owner's words (2026-09-18):** "a lot of times we go full bleed and on 3440 a thing that
should have been maximum 1000 pixels is spread to 3000 and looks funny."

**The finding:** `ext/demo`'s stage has no cap and multi-card walls reflow fine; the one real
stretch is a short band (2–3 cards) inside a `browse()` wall — `public/framework/ext/catalog/browse.css`'s
own comment says "a band of three on a 2750px wall draws three cards a thousand pixels wide".
The proposed fix: cap the per-card max in `.browse-band > .page-previews` — `min(28em, 1fr)` in
place of a bare `1fr`, the same shape `wall()` already uses — leaving the band's outer width
uncapped (capping the band only wins when it is guaranteed a near-full row; write that
alternative in the doc).

**Do:** read `browse.css` and `wall()`'s css; make the one change (in the layer it lives in; the
`em` is the site's fluid measure — say what it resolves to at 1280 and 3440); verify headless on
your private server (`PORT=8132 node server.js`, background, killed by its real Windows PID) on
three pages that draw short bands (the study names them; `/framework/` and `/imagine/` are
likely) at 1280 and 3440: the widest card in a short band before and after, in px (two numbers
per page), no band narrower than before at 1280, zero console errors; one before/after shot pair
at 3440. Docs: one line in `ext/catalog/readme.md` Watch out and a dated line in its
`doc/decisions.md`.

**Fence:** `public/framework/ext/catalog/**`, your task dir. The owner's dev server on port 80 is
running: never touch it; one write, verify within a minute. Never `git stash`, never `find /`,
never drive the owner's tabs. Final message: five lines — the change, the em in px at both
widths, the before/after card widths per page, the shot pair path, the link.
