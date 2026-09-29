# overview.json — how it is built

`Server/ai2-overview.mjs` reads every task's `task.jsonl` (~800) plus the owner's own prompts in
`.claude/prompts/*.jsonl`, and writes `public/framework/ai2/overview/overview.json`. The Overview
tab's page reads that file straight off disk; it does no computing of its own.

**How a task joins a concept:** the seven concepts (Servex, Page, View, App, AI 2, Dictation,
Research & Collab), most important first, each list match words at the top of the script. A task
joins the FIRST concept whose word matches its slug or group as a whole word; only if neither
names one does its request text get tried too (request text is the noisiest of the three, so it
goes last). No match at all leaves the task out, counted in `unfiled`. View is deliberately the
strictest: its match list is small, and its one request-text word ("View") is checked
case-SENSITIVE, because the framework class is always capitalized while ordinary English ("a
context view", a slug like "days-view") is not.

**Each ASK's `owner` field says whether `quote` is really the owner's own words.** The best
signal is `session_id`: a task's `assign.session_id` is the same CLI session that logged the
owner's prompts, so the owner's words for a task are the LATEST owner prompt in that same
session, at or before the task's own `requested_at` (`owner: true`). Failing that, an older
text-overlap guess is tried (`owner: true` too — still a real prompt, just not proven to be
THIS task's own trigger). Only when neither finds anything does `quote` fall back to the task's
own `request` — a mastermind's paraphrase, not the owner's words (`owner: false`).

**Open vs. done:** unlanded and requested in the last 7 days = open; older unlanded = dropped,
counted in `stale_count`. Landed = done; newest 30 kept, `done_count` is the true total.

**To rerun it:** `node Server/ai2-overview.mjs` from the repo root, under a second.

**To change a concept:** edit `CONCEPTS` at the top of the script.

## The page

AI 2 has two tabs under its title, **Inbox** (`/framework/ai2/`, the rail and a card, as before)
and **Overview** (`/framework/ai2/overview/`). They are drawn with ext/Doc's well and ext/tabs'
folder look, by hand in `page.js`, because the panels are AI 2's own routed pages rather than a
`tabs()` set. A card url runs through the Inbox url, so the Inbox tab stays lit while a card is open.

The Overview (`overview.js`) draws one card per concept, in the json's order. The first card is
two grid tracks wide and has bigger type. Each card shows a big icon, the name, "N open · M done"
and the cost, then one row per open ask: the quote (linked to where it was said), a state word,
and "result →". At most three open rows show; the rest fold into "More open (n)", so no card
grows tall enough to leave a hole in the grid. The done asks fold into one "Completed (n)" line,
a native `<details>`. Both the count line and that summary say "· N in 24 h" (asks whose
`landed_at` is in the last 24 hours, not a calendar day, which reads 0 every morning; left out when none).

Each ask has a one-line timeline under it (asked → delivered, how long, cost, outcome), shown
on hover, or for every ask when the "timeline" box at the top is ticked (remembered in this
browser). A cost of $0 is left out, because it usually means "not tracked".

Watch out: the page is a flex column now (the band on top, the inbox or Overview under it), and
`.ai2-head` needs `margin: 0` because the page is `.flow` and the hidden h1 still counts as a sibling.
