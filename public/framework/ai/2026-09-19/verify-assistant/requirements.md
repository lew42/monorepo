# verify-assistant - verify, for real, whether these requests were met

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

Your topic is: **The assistant tiers, the relay, and how fast the process moves**

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
`"group": "ai-ops"` and `"session_id": "a1c1d1e1-0003-4a19-9b01-000000000003"` exactly. Findings go in it as `log` lines as you
go, never into a separate findings.md. Land with the `finish-task` skill.

## Length budget

The page is one screen. Your landing `outcome` is a headline plus at most five sentences with
links. Everything longer lives in `verify.jsonl` and your log lines.

## Fences - the files you own, which nobody else touches

You own, exclusively: `public/framework/ai/2026-09-19/verify-assistant/**`

You may also add exactly one line to `public/framework/ai/2026-09-19/page.js` `children:` (your own
page), and append to `public/framework/ai/2026-09-19/day.jsonl`. Nothing else, anywhere.

Four sibling minions are verifying four other topics at the same time, each owning its own dir. If
you believe a finding belongs to another topic, write it in your log and leave it alone.

If a skill misleads you, or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`; the `skill-improvement` skill is the thirty-second
version.

## Your rows - 14 of the 53

### `assistant-mode` - earlier verdict: **done**

**Asked for:** An assistant mode: a light, fast session (Sonnet, low effort) whose sole job is to answer the owner at once and relay their words to the mastermind, so the mastermind keeps working with a lean context.

**The owner's words:** as the mastermind, you need to keep your context minimal. [...] I want to create an assistant mode. The assistant basically just relays exactly what I say to another mastermind [...] Claude Code, once it gets working, is not very good at stopping and responding immediately; that's where the assistant might be able to respond faster [...] a faster model, like a Sonnet, and turn down the effort level pretty low so that it responds like instantly. [...] what would I need to give it, in order to send you a message?

**The earlier audit's reasoning:** The assistant answers you at once and rings the mastermind directly. You used it all afternoon.

**Tasks that claim to cover it:** none named

### `mastermind-log` - earlier verdict: **partly**

**Asked for:** Explain how the assistant passes messages (real time or a polled log); the dev bar log's cards should evolve in place rather than only append; rename the title to the mastermind log.

**The owner's words:** explain how the assistant is passing these messages along [...] is it using a session ID, does it happen in real time. I thought it was just writing to a log that the mastermind has to check, but that is way too slow. [...] these log messages should evolve rather than only append to this mastermind log in the dev bar. [...] call it the mastermind log instead of the mastermind says.

**The earlier audit's reasoning:** You got the explanation you asked for. The other two parts of the same sentence - the log cards evolving in place rather than only appending, and the rename to 'the mastermind log' - were handed to another minion and are not visibly done.

**Tasks that claim to cover it:** devbar-chat

### `prompt-relay` - earlier verdict: **differs**

**Asked for:** The assistant relays every prompt automatically and is reminded who it is on every prompt; use hooks for it.

**The owner's words:** the assistant should automatically relay everything I say to the mastermind. In fact, the assistant skill should be used for every prompt, so it refreshes its understanding of who it is [...] aren't there skill hooks where every time a skill is used we can fire something programmatically on the server? [...] the log will evolve: the log items turn from the primitive prompt, all my ramblings, into something more refined. In fact my words should probably be transcribed in real time into the log, time stamped, author me, verbatim. Maybe record the audio [...] every item could have a little play button when you hover it, you click play and it reads it out loud.

**The earlier audit's reasoning:** The hook that relays every prompt mechanically is built and tested - and switched OFF. Your sentence was 'the assistant should automatically relay everything I say'; today that happened because a Sonnet session remembered to, not because the machine did it. One settings line from you turns it on.

**Tasks that claim to cover it:** prompt-relay

### `assistant-cards` - earlier verdict: **done**

**Asked for:** The assistant, being fast, should be the one that updates the live dashboard: the prompt shows at once and turns into its summary card right away; decide how it gets write access; color-code the cards.

**The owner's words:** The assistant should be the one that updates the live dashboard, because it must be fast: no 12-second lag; the prompt shows immediately and converts into the proper UI (the summary) right away. Decide how the assistant gets write access to the dashboard cards. Color-code the dashboard cards.

**The earlier audit's reasoning:** Decided and in use: the assistant writes each card itself with one command, reusing a topic id so the card evolves.

**Tasks that claim to cover it:** none named

### `multi-level-assistants` - earlier verdict: **done**

**Asked for:** A multi-tier design: a fast Sonnet assistant acts at once and can spawn Opus masterminds; each mastermind owns a worktree and spawns minions into it; sub-worktrees; run several masterminds toward one target, compare the versions, the owner picks. Worry: masterminds coordinated by a lesser model lose understanding. Wanted: feasibility, the coordination design, and cost.

**The owner's words:** a fast Sonnet-medium assistant acts the instant anything arrives; it can spawn Opus masterminds because the Fable mastermind is slow and does one task at a time. Concern: two masterminds coordinated by a lesser model may lose understanding (left hand / right hand). Worktrees may solve it: each mastermind owns a worktree and spawns minions into it [...] run, say, nine masterminds toward one target, each deciding its own minions, then compare the resulting versions and let the owner pick.

**The earlier audit's reasoning:** You asked for the design and the feasibility, and got both with a number: nine masterminds is possible but wastes about thirty task-units to throw eight versions away. The two-tier assistant you described was then actually built (see every-prompt and skill-roles).

**Tasks that claim to cover it:** worktree-study

### `assistant-channel` - earlier verdict: **partly**

**Asked for:** The owner still did not know how the assistant talks to the mastermind (poll? watch?) and asked for one big card explaining the pathway and the real delay; could not find the two needs-you cards; meaningful card icons should be much bigger.

**The owner's words:** The owner STILL does not know how the assistant talks to the mastermind (poll? watch?) and has asked several times: make a big card on the dashboard [...] Where is the card 'padding audit prompt hook, needs your eyes'? [...] Card icons should be much bigger when meaningful.

**The earlier audit's reasoning:** The big card explaining the pathway landed - a direct session-to-session message, about a second, no polling. The other half of the same breath, 'card icons should be way bigger when they mean something', was pushed to a later pass.

**Tasks that claim to cover it:** none named

### `answer-cards` - earlier verdict: **partly**

**Asked for:** When the owner asks a question the answer appears at once as a big visual card; card size follows current focus; the assistant's card can be marked as the focus.

**The owner's words:** When the owner asks a question, the answer must appear instantly on the dashboard in a visual card, and that card should be big, since it is what they are asking about right now. Card size should follow current focus.

**The earlier audit's reasoning:** A card can be marked as the current focus and the assistant marks its answers that way. The part you can actually see - the dashboard drawing the focus card BIG - was handed to the V3 minion and is not done.

**Tasks that claim to cover it:** devbar-chat

### `every-prompt` - earlier verdict: **done**

**Asked for:** Rename the assistant skill to every-prompt (re-invoked on every prompt), updating every reference; add the two-tier design: a fast Sonnet assistant and a master assistant that receives every prompt after the relay.

**The owner's words:** RENAME the assistant skill to 'every-prompt' (same content and setup carried over; the skill is meant to re-invoke on every prompt). [...] Add a two-tier design to the skill: a FAST assistant (Sonnet) that echoes, writes cards and relays instantly, and a MASTER assistant (Fable) that receives every prompt after the fast one relays it.

**The earlier audit's reasoning:** Renamed, both tiers defined, every reference updated, and the old command path kept as a forwarder so nothing in flight broke. Checked: the skill exists and the old assistant skill is gone.

**Tasks that claim to cover it:** none named

### `skill-roles` - earlier verdict: **done**

**Asked for:** Skill shape and roles: every-prompt stays minimal and names load-this-if sub-readmes; a master assistant skill that only supervises, answers the fast assistant with short opinions, documents how the process is going on a page, and doubles as the system auditor; assistants sort, log and route to the proper independent mastermind; masterminds do the deep work and spawn minions in parallel.

**The owner's words:** the every-prompt skill stays minimal and re-reads on every prompt; long detail lives in sub-readmes it names with 'load this if you need X' [...] A separate MASTER ASSISTANT skill or sub-skill: it only supervises and knows what is going on; the fast assistant can ask it for feedback, and it can reply automatically with opinions [...] It documents the whole process and how it is going on a page, and doubles as the SYSTEM/skill auditor. [...] Assistants do no deep reasoning; they sort, log everything that can be logged, and relay each prompt to the proper independent mastermind.

**The earlier audit's reasoning:** every-prompt is a third of its old size with load-this-if files, and a master-assistant skill exists that supervises, opines, documents the process and audits. Checked: both skills are on disk.

**Tasks that claim to cover it:** skill-roles

### `dashboard-first` - earlier verdict: **partly**

**Asked for:** The owner wants to leave the VS Code chat and live in the AI dashboard: the assistant and the every-prompt skill should lean into dashboard cards as interactive UI - things shown as they are designed, revisable - instead of chat text; the owner reads none of the chat.

**The owner's words:** Owner wants to leave the VS Code chat and live in the AI dashboard: the assistant and every-prompt skill should lean into dashboard cards as interactive UI (things shown as they are designed, revisable) instead of chat text; the owner reads none of the chat.

**The earlier audit's reasoning:** The direction is written down for the next mastermind and some of it is already true - every answer is a card. Nothing new was built for it today, and the interactive part you want (things shown as they are designed, revisable) is still the in-flight card-with-buttons work.

**Tasks that claim to cover it:** none named

### `process-redesign` - earlier verdict: **done**

**Asked for:** Everything is slow: fix the process, or shut down and restart? And: can a new mastermind pick up where this one left off - exact steps to restart without losing anything.

**The owner's words:** Everything is still really slow to update. [...] should we fix this whole assistant-mastermind process to work better in parallel, because you are not going fast enough? Should we shut it all down and restart? How would you design it better?

**The earlier audit's reasoning:** You got a direct answer in three steps, and the handover to write it down. Everything said today is on disk, so a fresh mastermind loses nothing.

**Tasks that claim to cover it:** none named

### `speed-and-reuse` - earlier verdict: **partly**

**Asked for:** Changes arrive slowly: a one-line change should never queue; keep minions alive and reuse them for follow-ups; consider a worktree per minion; requests must be documented less wordily on the dashboard; V3 full bleed with the timeline and the usage bars in a footer.

**The owner's words:** The one-line fix they asked for is still not done [...] a one-line change should never queue. Parallelism: keep minions alive and reuse them for small follow-up tasks (same session id); consider a worktree per minion [...] Requests from the owner must be documented better on the dashboard; it is still confusing and wordy. V3 page: whole page full bleed with zero padding [...] Bring the usage progress bars from the old default timeline onto this page.

**The earlier audit's reasoning:** The one-line CSS fix was done and 'a one-line change never queues' is now the rule; landed minions are woken again for follow-ups. The V3 half of the same message - full bleed, the timeline, the usage bars in a footer - was briefed and not built.

**Tasks that claim to cover it:** none named

### `timing-audit` - earlier verdict: **not**

**Asked for:** Measure timing end to end - prompt arrival, echo, card, relay, mastermind pickup, UI update - and show it visually on the timeline.

**The owner's words:** Measure timing end to end: prompt arrival, echo, card, relay, mastermind pickup, UI update; show it visually on the timeline.

**The earlier audit's reasoning:** Not started. Two of the six hops you named are measured (the echo about 3 s, file to screen 13 ms); prompt arrival, card, relay and mastermind pickup are not, and none of it is on the timeline.

**Tasks that claim to cover it:** timing-audit

### `asks-log` - earlier verdict: **differs**

**Asked for:** Handover task: one log of everything the owner asked for this session, with status (done, in flight, open), where the new mastermind reads it first.

**The owner's words:** write ONE log of everything the owner has asked for this session (all the dashboard, V3, timeline, padding/CSS, worktree, Servex, timing, assistant-tier and restart requests, with status: done, in flight or open) so the new masterminds pick it all back up. Put it where the new mastermind reads it first and add it to the handover.

**The earlier audit's reasoning:** asks.md exists beside the handover and is generated from the record, so it cannot drift - that is what you asked for. One thing to know: the 'quote' under each entry is often the mastermind's paraphrase written in the third person, not your words. Your actual words are on the board, and this audit reads them from there.

**Tasks that claim to cover it:** none named
