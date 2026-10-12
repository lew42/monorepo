# verify-design - verify, for real, whether these requests were met

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

Your topic is: **The design system, the sidebar, and how pages look**

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
`"group": "ai-ops"` and `"session_id": "a1c1d1e1-0005-4a19-9b01-000000000005"` exactly. Findings go in it as `log` lines as you
go, never into a separate findings.md. Land with the `finish-task` skill.

## Length budget

The page is one screen. Your landing `outcome` is a headline plus at most five sentences with
links. Everything longer lives in `verify.jsonl` and your log lines.

## Fences - the files you own, which nobody else touches

You own, exclusively: `public/framework/ai/2026-09-19/verify-design/**`

You may also add exactly one line to `public/framework/ai/2026-09-19/page.js` `children:` (your own
page), and append to `public/framework/ai/2026-09-19/day.jsonl`. Nothing else, anywhere.

Four sibling minions are verifying four other topics at the same time, each owning its own dir. If
you believe a finding belongs to another topic, write it in your log and leave it alone.

If a skill misleads you, or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`; the `skill-improvement` skill is the thirty-second
version.

## Your rows - 6 of the 53

### `sidebar-messed-up` - earlier verdict: **done**

**Asked for:** The site sidebar looks wrong: rows too roomy, the filter double-boxed, the footer a big white block instead of one button row, icons too high. Filter as a darken bar with a white field; icons in square frames sharing one centre line; an anonymous person in the avatar; find out whether anyone looked at it.

**The owner's words:** I'm getting a lot of reloads when I load a page. On a good number of pages, I'll load it up and it immediately refreshes. I'm not sure if something is writing something to the file system that causes the reload. [...] one of the needs you items on this AI dashboard is restarting the dev server. I think you need to figure out a way to run and manage the server by yourself. Even if I have one running, you should be able to spin up a second one that's just identical [...] look into whether Chokidar can allow multiple watchers at once. If it's easy to just spin up a second dev server on a different port, do that. [...] Somehow the sidebar got messed up. It doesn't look right. I'm not sure if I trust our layout and design system to try and fix it because it's just making blunders all over the place.

**The earlier audit's reasoning:** Rebuilt and photographed at every width, and a critic swept 60 pages. Your question 'did anyone look' was answered honestly: no, nobody had.

**Tasks that claim to cover it:** sidebar-repair, blunder-critic

### `run-page-compact` - earlier verdict: **done**

**Asked for:** The run page wastes space: compact it; look at the design system's scale controls; some text is already small.

**The owner's words:** on the mastermind layout browser page we're wasting way too much space. We need to compact this to make it smaller. Look into our design system if we have scale controls. I mean, some of the text on the screen here is pretty small.

**The earlier audit's reasoning:** The dense V2 board shipped with a density switch.

**Tasks that claim to cover it:** ai-v2

### `whisper-local` - earlier verdict: **done**

**Asked for:** Dictation shows nothing; set up whisper.cpp locally with large-v3-turbo outside the repo, wire it to the dictation UI, make that UI a proper ux component; words should appear while talking.

**The owner's words:** The microphone, it requested the permission. I granted it. I click the microphone and it appears to start recording [...] but nothing's transcribed on my screen. [...] Large V3 Turbo was a 1.6 gigabyte download [...] Get whisper.cpp to work locally and then wire that up to the dictation UI. [...] make sure that's properly encapsulated as a component in our UX. [...] it's not transcribing in real time.

**The earlier audit's reasoning:** Local Whisper runs and the server starts it by itself. You have not tried it with your own voice yet, so the thresholds are still guesses.

**Tasks that claim to cover it:** whisper-local

### `popover-system` - earlier verdict: **done**

**Asked for:** A dropdown on the AI page listing the versions as a tree; a proper tooltip, pop-up and menu system; explore both placements - all popups in one top element versus popups beside their content - and build both.

**The owner's words:** put a drop down on the framework slash AI page [...] it's going to list the tree. We might actually need to use a custom drop down so that we can put UI inside. [...] I don't think we have proper menu system. Get some minions building like a tooltip pop-up system. [...] it's really hard to get the Z indexes to work properly if the elements are nested [...] if you were to put the popovers nearby the content that it's for, it would automatically position itself properly in flow. So explore both those options, maybe build out both of them.

**The earlier audit's reasoning:** Both placements were built side by side and compared, which is exactly what you asked for; the top layer won.

**Tasks that claim to cover it:** popover-system

### `background-layer` - earlier verdict: **done**

**Asked for:** A modular, swappable background layer: a div with class background, inset 0, behind the content - a colour, a design, a repeated icon as texture, scattered icons, vectors and shapes; maybe wrap the content out of habit.

**The owner's words:** Launch a minion to design a background layer system. So we have a div probably with a class of background, inset zero. It's basically a modular swappable background [...] an icon as like texture, repeating icons, or a collection of icons that are kind of just scattered [...] if you just absolutely position the background element, you might not need to wrap all the content, but it might not be a bad idea just out of habit.

**The earlier audit's reasoning:** One line puts a swappable background behind any box, ten kinds, no images.

**Tasks that claim to cover it:** background-layer

### `sidebar-designs` - earlier verdict: **not**

**Asked for:** Work on sidebar UI designs (the dictation was cut off after this sentence).

**The owner's words:** first, let me tell you, I want you to work on sidebar UI designs.

**The earlier audit's reasoning:** Never started. Your dictation was cut off mid-sentence and it was queued behind the sidebar repair, which has since landed - so nothing is blocking it now.

**Tasks that claim to cover it:** sidebar-designs
