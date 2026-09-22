# verify-server - verify, for real, whether these requests were met

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.
You are read-only over the repo except for your own task dir - see the fence near the bottom.

## The three laws, short

1. **Less is more.** Fastest useful version first. A demo beats a description.
2. **Clear beats brief - by far.** Plain full sentences, basics first, written for a newcomer who
   is overwhelmed. Clipped fragments and jargon are a failure, not economy.
3. **Prioritize.** Most important first. Everything reads as a quick scan.

## Why you exist

Earlier today another agent audited 53 things the owner asked for and graded each one. The owner
has now said, in so many words: **find that report, work from it, but do not treat it as
thorough.** Your job is to be the second, harder look at ONE topic, so that you are not distracted
by the other 52 items.

Your topic is: **The server, reliability, and not breaking the live site**

## What "verify" means here, exactly

For each request below you decide one verdict, and you must be able to point at the evidence:

- `done` - the thing the owner asked for exists and works. You loaded the page, or ran the code,
  or read the file and can quote the lines that do it.
- `partly` - some of it exists. Say precisely which part is missing.
- `differs` - something was built, but not the thing that was asked for. Say what the difference is.
- `not` - nothing was built.
- `cannot-tell` - you could not establish it. Say what you would need. This is an honest answer and
  is much better than a guess.

**You may not take the earlier audit's word for anything.** Its verdict is a hypothesis. Where you
agree, say that you checked and how. Where you disagree, say so plainly and show the evidence - a
disagreement you can prove is the single most valuable thing you can produce today.

**The owner's own words are the standard, not a task's summary of them.** Each row below carries a
`quote`. Read it. A task that shipped something adjacent, or shipped the easy half, is not `done`
just because its own log says it landed.

## Where to look

- **The earlier audit, your starting point:** `public/framework/ai/2026-09-19/day-audit/audit.jsonl`
  - one JSON object per line, with `id`, `title`, `quote` (the owner's words), `verdict`, `why`,
  `done`, `tasks`, `links`. Read only the rows whose `id` is in your list below.
- **The owner's verbatim words from 15:36 onward:** the `chat` lines in
  `public/framework/ai/2026-09-17/mastermind-layout-browser/task.jsonl` - 53 of them, all today.
  **Before 15:36 there is no verbatim record** except the `quote` fields in the audit. That gap is
  itself worth reporting if it stops you deciding a row.
- **What each task claims it did:** `public/framework/ai/2026-09-19/<task-slug>/task.jsonl`. The
  slugs are in each audit row's `tasks` field, and the `landed_at` line's `outcome` is the claim.
- **The live site:** dev servers are already up on **port 80** (the owner's) and **8123**. Use them
  READ-ONLY - load a page and look. Do not start your own server; you do not need one.
- **Screenshots:** the `ui-test` skill drives a headless browser. Use it whenever a claim is visual
  ("the cards have no black border", "the columns are equal"). A visual claim you did not look at
  is `cannot-tell`, not `done`.

## What you must not do

- **Never kill or restart the dev server.** The owner is on the live site right now.
- **Never drive the owner's open browser tabs.** Headless only.
- **Never `git stash`, never commit, never push.** The tree is shared with other agents in flight.
- **Do not edit any file outside your own task dir.** You are a verifier, not a fixer. If you find
  a one-line fix, write it down as a finding with the exact file and line - do not apply it.
- **Do not search from the filesystem root.** Scope every search to the repo.

## Your deliverables - there are exactly three

**1. `verify.jsonl` in your task dir** - one line per request, using the same `id` as the audit row:

    {"verify": {"id": "<id>", "verdict": "done|partly|differs|not|cannot-tell", "agrees": true,
      "why": "<two or three plain sentences: what you checked and what you found>",
      "evidence": ["<file:line, a URL you loaded, a shot you took>"],
      "missing": "<what is still not there, in plain sentences - omit when nothing is>"}}

**2. `page.js` in your task dir** - ONE SCREEN, mostly above the fold. This is what the owner
reads, so it is held to the presentation rule hardest:

- The takeaway is a sentence at the top, in plain words - for example, "Nine of these twelve are
  genuinely done; two were graded done and are not."
- Then the disagreements with the earlier audit, first and biggest, because they are the news.
- Then the rest as a compact list, one line each, each linking to the task it came from.
- Detail goes one click down or into your `task.jsonl`, never onto this page.
- Do not tell the reader what you are about to show them. Show it.
- Run the `new-page` skill for the shape, and add your page to the day page's `children:` so it is
  reachable - nothing crawls, and a page nobody links to does not exist.

**3. Your `task.jsonl`** - open it with the `new-task` skill BEFORE your first write, with
`"group": "ai-ops"` and `"session_id": "a1c1d1e1-0004-4a19-9b01-000000000004"` exactly. Findings go in it as `log` lines as you
go, never into a separate findings.md. Land with the `finish-task` skill.

## Length budget

The page is one screen. Your landing `outcome` is a headline plus at most five sentences with
links. Everything longer lives in `verify.jsonl` and your log lines.

## Fences - the files you own, which nobody else touches

You own, exclusively: `public/framework/ai/2026-09-19/verify-server/**`

You may also add exactly one line to `public/framework/ai/2026-09-19/page.js` `children:` (your own
page), and append to `public/framework/ai/2026-09-19/day.jsonl`. Nothing else, anywhere.

Four sibling minions are verifying four other topics at the same time, each owning its own dir. If
you believe a finding belongs to another topic, write it in your log and leave it alone.

If a skill misleads you, or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`; the `skill-improvement` skill is the thirty-second
version.

## Your rows - 10 of the 53

### `reload-on-load` - earlier verdict: **done**

**Asked for:** Pages reload themselves right after loading; find what triggers it and stop it.

**The owner's words:** I'm getting a lot of reloads when I load a page. On a good number of pages, I'll load it up and it immediately refreshes. I'm not sure if something is writing something to the file system that causes the reload. [...] one of the needs you items on this AI dashboard is restarting the dev server. I think you need to figure out a way to run and manage the server by yourself. Even if I have one running, you should be able to spin up a second one that's just identical [...] look into whether Chokidar can allow multiple watchers at once. If it's easy to just spin up a second dev server on a different port, do that. [...] Somehow the sidebar got messed up. It doesn't look right. I'm not sure if I trust our layout and design system to try and fix it because it's just making blunders all over the place.

**The earlier audit's reasoning:** Pages stopped reloading themselves. The cause was real and named: on Windows, reading a file counts as a change. Proven, with shots.

**Tasks that claim to cover it:** server-self

### `server-self` - earlier verdict: **done**

**Asked for:** The mastermind runs and manages a dev server itself; a second identical server on another port; whether several watchers can coexist; no more 'restart the dev server' items for the owner.

**The owner's words:** I'm getting a lot of reloads when I load a page. On a good number of pages, I'll load it up and it immediately refreshes. I'm not sure if something is writing something to the file system that causes the reload. [...] one of the needs you items on this AI dashboard is restarting the dev server. I think you need to figure out a way to run and manage the server by yourself. Even if I have one running, you should be able to spin up a second one that's just identical [...] look into whether Chokidar can allow multiple watchers at once. If it's easy to just spin up a second dev server on a different port, do that. [...] Somehow the sidebar got messed up. It doesn't look right. I'm not sure if I trust our layout and design system to try and fix it because it's just making blunders all over the place.

**The earlier audit's reasoning:** The mastermind runs its own dev server on port 8123 and several watchers coexist. No 'restart the server' item came back to you for this.

**Tasks that claim to cover it:** server-self

### `reload-hold` - earlier verdict: **differs**

**Asked for:** A live reload blocker agents use around a batch of writes: hold every reload on every page, write, then one reload; written into CLAUDE.md; then look into hot module reloading.

**The owner's words:** Launch a minion and build a live reload blocker. And build into Claude MD that this block mechanism needs to block all live reloads across all pages. You would use it before making any edits [...] you do all the file writes and then wait, and once everything is ready then you're basically triggering a repaint or a reload. Also figure out how to maybe do something like hot module reloading.

**The earlier audit's reasoning:** The hold command shipped and is in CLAUDE.md, exactly as asked. The second half of your sentence - 'figure out how to maybe do something like hot module reloading' - was answered with 'CSS already repaints without a reload' rather than looked into for JavaScript.

**Tasks that claim to cover it:** reload-hold

### `page-health` - earlier verdict: **done**

**Asked for:** An is-it-working watcher: a hidden browser loads the pages being worked on after every change, and any error is passed at once to whoever made the edit; everything logged, with archiving; and stop the unknown verb note console errors.

**The owner's words:** I'm getting a ton of JSON-L unknown verb note errors. [...] the mastermind should probably spin up a minion to basically just be like an is-it-working minion. Just to run a browser to run the pages, especially pages that are being worked on. Whenever an error happens, we should know about it, and that feedback should immediately be passed to whoever's making those edits. [...] a log file that we dump all the data to [...] some sort of archiving process.

**The earlier audit's reasoning:** A hidden browser checks the pages each edit could break and tells the agent that broke one; the unknown-verb console errors are gone.

**Tasks that claim to cover it:** page-health

### `site-down-audit` - earlier verdict: **partly**

**Asked for:** The site went down: get it back up, find who or what broke it, file a report, and audit why it broke and how to stop it happening again.

**The owner's words:** The site is down. First get it back up. Then find who or what broke it (which minion or change), file a report, and run an audit of why it broke and how to stop it happening again. [...] Still no site. What's going on here?

**The earlier audit's reasoning:** The crash you reported was found, fixed and proven: a changed server is now tried on a spare port first. But the site went down again the same hour from a different cause - a bad import path in a shared module - so 'and not to do that again' has not held.

**Tasks that claim to cover it:** incident-site-down

### `fps-meter` - earlier verdict: **partly**

**Asked for:** Resizing columns spins the fans: investigate whether pages repaint too often (many resize listeners, container units everywhere); build a small frames-per-second meter in the dev bar; the owner remembers a layout where container units misbehaved.

**The owner's words:** many resize listeners, and container units used everywhere may be costly. Resizable columns reflow and repaint constantly, and the owner's fans spin up when resizing. Investigate whether it paints too often. Build a small frames-per-second meter in the dev bar.

**The earlier audit's reasoning:** The investigation was done and answered your worry with numbers: three seconds of resizing gave 181 frames, none over 50 ms, and the spacing tokens changed nothing. The thing you actually asked to be built - a small frames-per-second meter in the dev bar - was not built.

**Tasks that claim to cover it:** fps-meter

### `worktrees-and-cache` - earlier verdict: **done**

**Asked for:** Study git worktrees for parallel minions (so their writes do not reload the live site and they do not step on each other) and what the one-hour prompt cache changes; where is yesterday's worktree answer.

**The owner's words:** Spawn a minion to study our system for git worktrees and for prompt caching (the default cache TTL may now be one hour) [...] Why worktrees: minions build in their own git worktree, so their writes do not trigger live reload on the running site all the time, and they avoid conflicts and stepping on each other.

**The earlier audit's reasoning:** Studied and decided with evidence: worktrees work even with 1,500 uncommitted files, and they are to be used for server and shared-module edits - the two kinds that took the site down today.

**Tasks that claim to cover it:** worktree-study

### `change-shots` - earlier verdict: **done**

**Asked for:** Proposal, refined by the owner: a skill fires an already-running Playwright monitor per page on every change, all resolutions into a set folder; the picture goes to the minion who made the change; a git-like record and UI of changes as they land, committed last if checks pass; measure the loop time; folds into the worktree flow.

**The owner's words:** a monitor minion running Playwright screenshots a page on every change, using the live-reload message as the signal; the screenshot goes to the minion who made the change [...] A skill for making file-system changes, like a git commit, with a git-like UI for changes as they land [...] This may fold into the worktree skill. The owner asks for a PROPOSAL [...] written so the owner can just say 'do it'.

**The earlier audit's reasoning:** You asked for a proposal written so you could say 'do it', and that is what exists - four parts, each a sentence. It is waiting on one word from you.

**Tasks that claim to cover it:** none named

### `servex` - earlier verdict: **done**

**Asked for:** Study the Servex repo (a server manager that used PM2): structure, a probably stale server submodule, whether it works, and whether to move it in beside Server/ or rewrite it small with our own UI and config; one decision card.

**The owner's words:** launch a minion to study the Servex repo, somewhere in C:\Code [...] It is a server manager. [...] Judge moving its code into the monorepo beside Server/. [...] I do not want a sophisticated API: start it and it runs on its own; it used PM2, maybe overkill but with useful features. I lean toward rewriting it ourselves with our own UI and config.

**The earlier audit's reasoning:** Studied and decided in one card: rewrite it small here - each server registers itself in one file, one script lists or stops them, no PM2.

**Tasks that claim to cover it:** servex-study

### `never-break-the-page` - earlier verdict: **partly**

**Asked for:** Minions must not break the live page; audit mistakes as they happen with a minion that studies the skills - reshape or remove rules, not only add; a decision auditor, skill-use reports, a persistent auditor instance.

**The owner's words:** as the mastermind, you need to instruct your minions never to break the page. [...] you should be auditing any of these kind of mistakes as they happen. Spawn a minion, explain to it what went wrong, and ask it to look at the skills [...] it's not about adding new rules necessarily all the time. It might be about reshaping existing rules, maybe removing a rule if it's really bad. [...] we don't want to devolve into analysis paralysis. [...] maybe create an auditor skill, a decision auditor [...] a log for each skill [...] a persistent instance.

**The earlier audit's reasoning:** The alarm, the hook and the auditor skill all landed. But your sentence was 'never break the page', and the page broke twice more after this: tree.js twice at 14:51 and 15:05, and a bad import in compose.js blanked the whole site for about 80 seconds around 17:00. The system now catches breakage fast; it does not prevent it.

**Tasks that claim to cover it:** mistake-audit
