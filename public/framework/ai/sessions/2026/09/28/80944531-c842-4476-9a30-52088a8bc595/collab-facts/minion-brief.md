# Minion brief — collab-facts

Load the `minion` skill first. Your worktree: `C:\Code\lew42\worktrees\collab-facts` (branch
`worktree/collab-facts`, its own dev server already running — don't start or restart it). Edit
files **only inside that worktree**, never in `C:\Code\lew42\monorepo`.

## The owner's words (verbatim, read before you touch anything)

`public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-4.md`
(the FIRST HALF only — facts, disputes, abstaining; the second half, about a per-element
suggestion sidebar, is a different task, not yours).

The task's own requirements: `public/framework/ai/2026-09-28/collab-facts/requirements.md`.
Background you need before editing: `public/framework/ai/2026-09-28/collab-rounds/collab-format.md`
(the contract), `Server/collab.mjs` (the runner), `public/framework/ext/Collab/Collab.js` (the
replay model), `public/framework/ext/Collab/view.js` (the live page).

## What to build (all five, in this worktree)

1. **`Collab.Fact`** in `Collab.js`: `{id, text, certainty, disputes: [{member, why}]}`.
   `certainty` is `settled | likely | open`. Add it the same way `Collab.Vote` /
   `Collab.Decision` are built: a plain assign-based class, a `fact` verb in `Collab.verbs` /
   `Collab.handlers`, an `on_fact` handler that upserts by `id`, plus a `dispute` verb /
   `on_dispute` handler that pushes `{member, why}` onto the named fact's `disputes` and drops
   `settled` → `likely` (never touches `open`). Add `collab.facts` (array) and
   `collab.fact(id)` lookup, matching the style of `member()`/`phase()`/`decision()`.

2. **`Server/collab.mjs`: a `facts` phase, first, in both `DEFAULT_PHASES.research` and
   `DEFAULT_PHASES.design`** (renumber the phases that follow). Each member's prompt
   (`promptFor`, new `case "facts"`) asks for a JSON file `<n>-facts.json`: an array of
   `{id, text, certainty}` — "simple, foundational truths: 'always X', 'never Y', 'one A per
   B', 'before X, do Y'. certainty is settled/likely/open. Write 'never'/'always' only for
   what actually breaks; anything else is likely." After the phase runs, the runner merges
   every member's facts by normalized text (case/whitespace-insensitive) into one canonical
   list: a fact settled by every member who listed it stays `settled`, any `open` from any
   member makes it `open`, otherwise `likely` — then appends one `{"fact": {...}}` line per
   merged fact to `collab.jsonl` (id = a short slug from the text, or the first member's id if
   you prefer — your call, document it in a comment). Open facts get named in the NEXT phase's
   prompt header: "Open facts to dig into: <text> (<text>)…" for `brief`/`names`, the phases
   that follow `facts`.

3. **Disputing:** any member, in any later phase, may write `<dir>/dispute.json`:
   `{"fact": "<fact id>", "why": "…"}` (one line in `header()` telling every member this is
   available — "If a fact looks wrong, write one line to `<dir>/dispute.json`"). After each
   phase's `runPhase` (not just `facts`), check every active member's dir for a fresh
   `dispute.json` (mtime after the phase started, or just re-read every phase — simplest is
   fine) and, for each one found, append a `{"dispute": {"at", "fact", "member", "why"}}` line.
   A disputed `settled` fact drops to `likely` — write that by also appending an updated
   `{"fact": {...}}` line with the new certainty (same id — Collab.js's on_fact should upsert,
   later line wins, same as `decision`).

4. **Abstaining:** the vote JSON a member writes may now be `{"abstain": true}` instead of
   `{"pick": …}`. Update the `vote` phase's prompt (`case "vote"`) to say a member may abstain
   — "write `{"abstain": true}` instead, if you have no opinion" — and `runPhase`'s vote-tally
   block: an explicit `{"abstain": true}` file counts as an abstention (already true for "no
   file" and "picked self/invalid" — keep those as abstentions too, but they're a DIFFERENT
   reason; only an explicit `abstain: true` is "a member weighed in and chose not to pick").
   The `abstained` array `Collab.js`/`view.js` already draw should keep working. `Collab.Vote`
   gets an `abstain` field (default falsy) — set it when a real abstain vote is recorded to
   `collab.jsonl` as `{"vote": {..., "abstain": true}}` instead of a bare pick, OR simplest:
   only append a `vote` line for a real pick (current behavior), and add abstentions with
   `abstain: true` to the `tally`/`decision` line's existing `abstained` list — re-read
   `runPhase`'s current vote block (around line 263-281 of `collab.mjs`) before changing it;
   don't break the existing "no file = abstained" and "thin" logic, just make an explicit
   `abstain: true` file also land in that same `abstained` bucket instead of being silently
   dropped as "invalid pick".

5. **Docs, all three, small:**
   - `public/framework/ai/2026-09-28/collab-rounds/collab-format.md`: one new section (don't
     rename anything) documenting `Fact`, the `facts` phase, `dispute`, and abstain — the same
     terse style as the file's existing "Added 14:15" / "Added 14:25" sections.
   - `public/framework/ext/Collab/view.js`: draw facts (a small list, each with a certainty
     chip and its disputes) — above `phase_track`, since facts come first. Keep it simple: one
     `div.c("collab-facts flow")` block, a chip per certainty (`settled`/`likely`/`open` as a
     class modifier so `collab.css` can color it — add the 2-3 rules it needs to
     `collab.css`, prefixed `collab-`, per the `new-css-class` skill).
   - `.claude/skills/sub-mastermind/SKILL.md`'s collab section: ONE line, "start with the
     facts" — find the "Research, planning or a design choice: run a collab" section and add
     it there, don't restructure anything else. NOTE: this file lives in the MAIN repo, not the
     worktree (skills aren't part of the site) — edit
     `C:\Code\lew42\monorepo\.claude\skills\sub-mastermind\SKILL.md` directly, carefully, as a
     small targeted Edit, and say so back to me so I know it touched outside the worktree.

## Proof you must produce before you say done

Run a **mock** collab (free) that exercises all three: facts, one dispute, one abstention.
`Server/collab.mjs` supports `--mock` already (no real agents, canned content) — you'll need to
extend the mock path (`mockContent`/the `mock` branch in `runPhase`) so a mock run also writes
plausible facts, and so ONE mock member's vote is `{"abstain": true}` and the run demonstrably
disputes a fact. Write the mock spec to
`public/framework/ai/2026-09-28/collab-facts/mock-run/collab.json` (3 members, `kind: research`,
any short question) inside your worktree, run
`node Server/collab.mjs public/framework/ai/2026-09-28/collab-facts/mock-run --mock`, and check
`mock-run/collab.jsonl` has `fact`, `dispute`, and a vote with `abstain: true`, and that
`mock-run/collab/tally.md` shows the abstention count.

Then, if the mock proves it out, run ONE real short collab (3 cheap members, a tiny question) to
get a real cost number — ask me first if you're not sure it's worth the spend; a mock run alone
may be enough proof if real spend isn't warranted. Say the cost either way.

## When done

Commit your changes in the worktree (`git add`, `git commit` — normal commit, no push). Send me
(`task-mastermind-collab-facts`) one message: what you built, the mock run's path, whether you
also ran a real one and its cost, and confirm the skill-file edit outside the worktree. Don't
merge — I do that.
