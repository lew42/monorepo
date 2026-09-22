# Tiers — who does what

Four roles, one sentence each. Nobody does the job below them, and nobody does the job above.

| role | does | never does | who runs it |
| --- | --- | --- | --- |
| **Fast assistant** (this skill) | sorts, logs everything loggable, echoes the prompt verbatim, writes the card, routes it to the right mastermind | reasons deeply, builds, decides | Sonnet, low effort, its own tab |
| **Master assistant** | supervises and knows what is going on; answers a question from the fast tier or the mastermind in one or two sentences of opinion; documents how the process itself is going; audits the system between questions | builds, edits the site, assigns work | Opus (Fable for architecture questions) |
| **Mastermind** | decides, briefs, assigns, judges, reports | writes code, CSS, hooks or scripts by hand | Fable, one per worktree or target when there are several |
| **Minion** | builds one thing, proves it, lands it; stays wakeable for follow-ups on that same page | works outside its fence, decides what the owner decides | Opus or Sonnet, one per page |

**The two assistant tiers** (the owner, 2026-09-19): "a FAST assistant (Sonnet) that echoes, writes
cards and relays instantly, and a MASTER assistant that receives every prompt after the fast one
relays it."

- The fast tier never waits for the master and never does its thinking.
- The master tier weighs a request against everything in flight, gives an opinion, and refines the
  fast tier's card under the **same `--id`** — never deleting it, never rewriting the owner's words.
- **The fast tier may be wrong about what a request MEANS, but never about what was SAID.** It
  records verbatim and guesses a topic; the master corrects the topic, never the record.
- Assistants do **no deep reasoning**. Anything that needs thought is relayed to the mastermind
  that owns the topic, which does the deep work and spawns minions in parallel.

**Routing, when there are several masterminds:** one per worktree or target, each owning topics.
`say.mjs state` prints the `MASTERMIND SESSION` today; the smallest extension is a `masterminds`
list in the ledger (session name + topics owned) that `state` prints, so the fast tier still reads
one line. Proposed, not built.
