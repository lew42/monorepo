# hold-guard — the reload hold expires silently, and tonight that cost a live outage

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** This should be small. Prefer a check to a sentence.
2. **Clear beats brief — by far.** Plain full sentences, basics first.
3. **Prioritize.** The check first; the wording second.

## What happened, tonight, for real

An agent took the reload hold, went away to investigate something, came back and carried on
writing. While it was away the hold **expired by itself** — the default TTL is five minutes — and
nothing told it. Its next batch of writes went out unheld and the owner's live site served 404s for
about fourteen seconds before the health-guard hook caught it. The agent fixed it at once, disclosed
it plainly, and wrote up the gap rather than hiding it. No lasting damage.

**The self-expiry itself is correct and must stay.** Read the header of `Server/hold.mjs`: it exists
so a hold can never stick and block reloads forever, which would be a worse failure. The defect is
not the expiry — it is that the expiry is **silent**, so an agent believes it is protected when it
is not. A written rule saying "remember to renew your hold" does not fix that; a rule already exists
and a careful agent still got caught.

## What to build

**A check, not a sentence.** When an agent writes a file under `public/` and it *had* a hold that
has since lapsed, something should notice and act, instead of the agent finding out from a 404.

The mechanism is yours to choose — this repo already stops an agent the moment its `.js` write stops
parsing, via `.claude/hooks/syntax-guard.mjs`, and that is the shape that works here. Read that hook
and `.claude/settings.json` to see how hooks are wired before you design anything.

The behaviour I would expect, as a starting point and not an instruction:

- **Renewing is almost certainly better than warning.** An agent that took a hold and is still
  writing plainly still wants it. Silently re-taking it on the next write, and saying so once in the
  hook's output so the agent knows what happened, turns a trap into a non-event. Weigh that against
  the opposite risk: an agent that has genuinely finished and forgot to release would then hold the
  lock indefinitely through some unrelated later write. Decide, and name the alternative.
- **A hold that was never taken is not the same as one that lapsed.** Plenty of writes happen
  outside a batch and must not start taking locks. Only act where a hold once existed for that
  holder. Work out how to know that — the lock file's shape is in `hold.mjs`'s header and the file
  is deleted when the list empties, which is the obvious obstacle. Solving it may mean keeping a
  small record of who has held it; keep that record cheap and outside `public/`.
- **Never make the failure mode worse.** If your check cannot tell, it should do nothing and say
  nothing. A hook that fires spuriously on every write will be disabled within a day, and then the
  real protection goes with it.

## Prove it

Do not describe this working. Drive it:

1. Take a hold with a short TTL — `RELOAD_HOLD_TTL_MS` in the environment overrides the default, and
   `hold.mjs`'s own header says a five-second TTL is the intended way to test expiry without waiting
   five minutes.
2. Let it lapse. Write a file under `public/`. Show what your check did.
3. Write a file under `public/` with **no** hold ever taken. Show that it did nothing.
4. Write a file **while a hold is genuinely live**. Show that it did nothing.

Those three outcomes are the whole test. Put the actual output of each in your log.

## What you must not do

- **Never kill or restart the owner's dev server on port 80**, the mastermind's on 8123, the health
  watcher, or whisper-server. The owner is on the live site right now.
- **Never drive the owner's open tabs.** Headless only.
- **Never `git stash`, never commit, never push.** Do not search from the filesystem root.
- **Do not change the expiry behaviour or the TTL** — the self-expiry is deliberate, and a hold that
  can stick forever is a worse bug than the one you are fixing.
- **Do not edit `.claude/settings.json`.** If your hook needs to be registered there, that is the
  owner's file and their decision: write the exact line it needs into your landing report as a
  one-minute owner item, and make the hook work the moment it is added.
- Test your own writes somewhere harmless. Do not practise expiry on a file a page loads.

## Deliverables

1. **The check, working**, with the three test outcomes above.
2. **`page.js` in your task dir — one screen.** Top line, plain words: what used to happen and what
   happens now. Then the three test outcomes, because that is the proof. Then, briefly, why the
   expiry itself was left alone. `new-page` for the shape; add it to the day page's `children:`.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "hold-guard (in-process agent)"`. One `decision` line for renew-versus-warn, naming
   the alternative. Land with `finish-task`.
4. **Fold the lesson into the docs that already exist** rather than adding new ones:
   `Server/doc/watch.md` covers the hold, and `hold.mjs`'s own header is the source of truth. One or
   two sentences, linked, not an essay.

## Fences

You own: `.claude/hooks/**` (your new hook, plus reading the others), `Server/hold.mjs`,
`Server/doc/watch.md`, and `public/framework/ai/2026-09-19/hold-guard/**`. One line in the day
page's `children:`, one append to its `day.jsonl`.

`Server/health.mjs` and `Server/health-supervisor.mjs` were edited tonight by another task and are
not yours. Nothing else under `Server/`.

If a skill misleads you or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`. There is already one there about this exact gap, written
by the agent it bit — read it first.

## Length budget

One screen. Landing `outcome`: a headline plus at most five sentences with links.
