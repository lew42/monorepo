# system-eval — look at all the skills, evaluate the system, say what to change and what to cut

You are a minion. Load the `minion` skill first. Model: Fable, max effort — the owner's choice
for this role (below): you are doing the **system architect's** job, the observing half of the
master assistant. You watch the skill system and what is being done with it; you do not get
pulled into any coding task.

**You are the first minion spawned the way the owner wants from now on: a real `claude` CLI
session with its own id.** Your session id is `8b6bbbe8-3f32-4e8d-a497-9b6192b9c757`. Write exactly
that as `session_id` in your `task.jsonl` launch line (do not trust `CLAUDE_CODE_SESSION_ID` — you
were launched from inside another session and may have inherited its value; say in a `log` line
which value the variable really held, it is a finding). Anyone can reopen you later with
`claude --resume 8b6bbbe8-3f32-4e8d-a497-9b6192b9c757`, so expect follow-up questions.

## The owner's ask, verbatim (dictated, 2026-09-19 about 17:43)

> Okay, so what does how look at all the mastermind skills? Uh, all all the skills really, and kind
> of evaluate the system. What improvements should be made, or subtractions, or like where are we
> at on this? We definitely want to use session IDs. Um, I kind of think each path could have, I
> don't know, explain to me how the session IDs are referenced. Like, aren't they stored in like
> the Claude folder outside of the repo?

And a few minutes earlier, the correction that frames it:

> the fork Claude session is exactly, when I say spawn minions, that's what I mean. And I thought
> that's what we were doing, but apparently you've been taking that to mean just […] use the spawn
> tool to create sub agents that way. The reason why we use the session ID is so that we can
> restart, we can identify any session by path or ID or whatever and reaccess it later so that we
> can resume multiple sessions. Right now all the Claude tabs in the VS Code sidebar, these
> sessions just get lost into the ether […] if we can create these sessions and track them then we
> should be able to reload them at any point.

And while this brief was being written, the role you are filling, in the owner's words:

> I've created this assistant. […] it's supposed to be a fast assistant. Hopefully the skill
> system talks about that. […] describing the fast assistant and the master assistant — the
> master assistant could use Fable at its highest settings as like the system architect, to just
> kind of observe and not actually get bogged down in working on any specific coding tasks but
> simply just monitor the skills system and what is being done, and when the system fails try to
> update it to improve — basically what we're doing right now.

So check this too, and say it plainly on the page: **do the skills describe that design?** Today
`master-assistant/SKILL.md` says "Opus; Fable for an architecture question" and that it never
edits a skill; the owner describes Fable at its highest setting, observing, and updating the
system when it fails. `every-prompt` is the fast assistant; there is also an `assistant` skill dir
— say what it is and whether two assistant skills is one too many. Name every gap between what
the owner just said and what the skills say, and which side should move.

## The three laws, and the length budget

Less is more. Clear beats brief, by far. Prioritize. The owner has said reports with detail they
cannot follow do not help at all. The page is **one screen first**; your report to me is one
screen. Subtraction is the preferred kind of improvement: the score is mistakes prevented and
lines removed, never rules added.

## Deliverables — each is checked against the owner's sentence above

1. **Where we are — the system on one screen.** The roles as they really run today (fast
   assistant, master assistant, mastermind, minion, auditor), what each reads at start and what
   that costs in lines, how a request travels from the owner's voice to a landed page, and where
   a session's identity lives at each hop. A picture or a small table, not prose.
2. **Every skill, evaluated.** All of `.claude/skills/*/` (about 2,700 lines with their side
   files) and the two user-level ones (`~/.claude/skills/check-claude-usage`, `fans`). One line
   each: what it is for, its size, is it earning its lines, and a verdict — *keep · shrink ·
   merge into X · split · delete*. Hunt for: the same rule stated in several skills (say where
   it should live once), rules that contradict each other or contradict `CLAUDE.md`, dated
   incident stories that could be a link, steps every agent pays for that rarely matter,
   suggestions written as laws (the owner has objected to that twice), and anything that a
   mechanical check would do better than a sentence. Read each skill's `improvements.md` — a
   recurring unapplied line is evidence. Today's related work, to build on rather than redo:
   `ai/2026-09-19/skill-roles/`, `ai/2026-09-19/mistake-audit/`, `ai/2026-09-19/blunder-critic/`,
   and the four `process-redesign` cards on the board (`ai/v/3/board.jsonl`) that still wait on
   the owner.
3. **The ranked list: at most seven changes**, most valuable first, each with the evidence, the
   exact edit (file and section, what goes, what replaces it), lines added and removed, and what
   it would have prevented. Then a plain list of **subtractions** — what can simply be deleted
   and lose nothing. You write the list; you do NOT apply it (see the fence).
4. **Session ids, explained for a newcomer, and the design for tracking them.** First the plain
   facts, verified on this machine, in a short section the owner can read in a minute: a session
   is a transcript file at `~/.claude/projects/<slug>/<uuid>.jsonl`, outside the repo, where the
   slug is the folder the session was started in with every non-alphanumeric character turned
   into `-`; `claude --session-id <uuid>` picks the id up front; `claude --resume <uuid>` reopens
   it (I tested both at 17:39, from the same folder and from a different one); sidebar tabs are
   the same kind of file (47 of them for this repo, 1.1 GB, oldest 2026-08-27); transcripts are
   deleted after `cleanupPeriodDays`, default 30, which is not set on this machine; the repo's
   only pointer to a session today is the `session_id` field in a task's `task.jsonl`. Check each
   of those. Then the design. My decision, for you to test against what you find: **one
   append-only registry in the repo, `public/framework/ai/sessions.jsonl`**, one line per session
   (`id`, `at`, `role`, `task`, `page` — the site path it owns, which is the owner's "each path
   could have" — `model`, `effort`, `cwd`, `status`), merged by `id`, written by a small spawn
   script that is the ONLY way minions get launched; a page's long-lived minion is the newest
   line with that `page`. The alternative: no registry, only the `session_id` already in each
   `task.jsonl` — nothing new to keep in step, but no answer to "who owns this page" without
   scanning every task. Say which is right and why, what the spawn script's interface should be
   (one command to spawn, one to send a follow-up, one to list), and what in the skills changes
   as a result — the mastermind skill's spawn, harvest and follow-up sections are written around
   the in-process spawn tool and `SendMessage`. A sibling task, `ai/2026-09-19/model-latency/`,
   is measuring what resuming costs and what happens when two processes resume one id; read its
   `task.jsonl` for whatever it has logged by then, and do not repeat its measurements.
   **The owner's fuller statement of it, a minute later** — design to this:

   > that would require the fast assistant to spawn the master assistant. However, not spawn it
   > with the spawn skill, we want to use the Claude resume API. Also, we definitely want to be
   > able to fork these sessions, so that you can create kind of these libraries — well they're
   > basically like benchmarks, right? […] maybe I should stop saying spawn because it seems like
   > you might take that to mean use your spawn skill. When I say spawn, I always mean use the
   > session ID to resume the session via the API, so that in that way we can have any number of
   > agents speaking in parallel to each other just by messaging — adding a prompt to that
   > session ID.

   So the design covers three verbs, each one command: **start** (`claude --session-id <new
   uuid> -p …`, with `--model` and `--effort`), **message** (`claude --resume <id> -p "<prompt>"`
   — how any agent, or the fast assistant, talks to any other), and **fork** (`claude --resume
   <id> --fork-session -p …` — a session kept as a library or a checkpoint, copied N times; the
   `fork-claude-session` skill has what this repo has learned, including why to fork a library
   and not a working session). Say plainly what the owner needs to know before relying on it:
   a message is a whole turn that runs in the SENDER's process and returns when it ends, so
   "in parallel" is true across sessions and false within one — two prompts to one id at the same
   moment is the case the sibling task is testing, and the script probably needs one queue or
   lock per session id; a reply does not arrive anywhere by itself, the sender reads it from the
   command's output; a tab the owner has open on that session does not show a headless turn
   live. And say which word the skills should use from now on so "spawn" stops being read as the
   in-process tool — the owner has offered to change their word; the skills should change theirs.
   **Already done, on the owner's direct instruction at about 17:50 ("make sure that's very
   clear … please try and verify that that's working properly") — evaluate these as part of the
   system, improve on them in your list, do not redo them.** I added a section *A minion is a CLI
   session with its own id* to `mastermind/SKILL.md`, a matching one to `minion/SKILL.md`, and one
   measured paragraph to `fork-claude-session/SKILL.md`. The measurement
   (scratchpad `fork-cache-test/out/*.json`, Sonnet, an 80k-token library session that read four
   skills and replied READY): three forks at once at the same model and effort each read 79k
   tokens from cache — 2 seconds, 2 cents, against 32 cents uncached; **the first fork at a
   different effort level read zero from cache**, exactly like a different model, and the second
   fork at that effort then hit; seven forks left the library's transcript untouched; a fork
   messaged again by its own id answered from cache. The owner's closing thought, which the
   design should adopt unless you find a reason not to: no `cd`-ing around — resuming by id works
   from any folder (tested), so path-specific work is tracked by putting its unique id in the log
   files, not by starting sessions in different folders. The one thing the starting folder does
   decide is which `CLAUDE.md`, skills, hooks and settings load, and which folder's list the
   session shows up in — so start from the repo root.
5. **What being spawned this way was like** — you are the test. Did the repo's hooks fire for
   you (the ledger hook on your writes, the Stop hook at the end)? Did they resolve to YOUR task?
   (For in-process minions the Stop hook blames the parent session, because they share its id —
   twice today.) Did anything in the skills assume you were an in-process subagent? Three or four
   `log` lines; they decide how the spawn script is built.

## The fence — other minions are in flight; the tree is shared

You may write ONLY:
- `public/framework/ai/2026-09-19/system-eval/**` — `task.jsonl`, `page.js`, any data it reads
- one appended line per event in `public/framework/ai/2026-09-19/day.jsonl`
- the scratchpad dir `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/1736b987-7cf0-4a02-9c6f-94a36cebb660/scratchpad/system-eval/`

**`.claude/**` is read-only to you**, skills included — another mastermind has uncommitted edits
in those files and the owner asked for an evaluation, not a rewrite. So no `improvements.md`
lines either; put what you would have written there in your `task.jsonl`. Do not create
`sessions.jsonl`; design it. Not `Server/**`, not `ai/v/3/**`, not `dev/DevBar/**`. Skip the
`ai/usage.json` refresh; I keep it. A progress card through the `say.mjs` command line is fine
(`--as system-eval --id system-eval`).

Never kill or restart the dev servers (80, 8123), never drive the owner's tabs, never
`git stash`, never commit. Two sibling minions are running (`model-latency`, `day-audit`) and
one from another mastermind (`card-replies`); their processes and files are not yours. If you
use helper agents, run them in the foreground.

## Budget

You are launched just after the 5-hour window reset at **18:40 local**, on purpose: Fable at max
is the most expensive seat there is (one word from it cost 89 cents at 17:46, nearly all of it the
41k-token prompt prefix), and at 17:45 the old window stood at 73% used. The weekly Fable-scoped
window was 34% used at 40% elapsed — stay frugal with turns, not with thought. One careful read of
the skills is about 40k tokens — read them yourself, once, whole: one reader who has seen
everything finds the duplicates and contradictions that parallel readers cannot. No helper
fan-outs; no re-reading a file you have read.

## The page

`public/framework/ai/2026-09-19/system-eval/page.js` — load `new-page` and `layout` first.
Level 1: where we are in two sentences, the picture of the system, the top three changes. One
click down: the skill-by-skill table, the full ranked list, the subtractions, session ids
explained, the registry design. Leave the dir undeclared in the day page's `children:`; link the
page from your `task.jsonl` `links`.

## Landing

`finish-task`. Your final message (it is returned to me as the result of the command that
launched you): one screen — where we are, the top three changes, the biggest subtraction, how
session ids work in three sentences, the registry verdict, what being spawned as a CLI session
was like — each with a link or a file path.
