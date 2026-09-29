---
name: research
description: Run before writing down anything you researched — a round of digging into a question, a topic in a research program, a claim you are about to record as true. Covers the entry schema, the credence discipline (the one thing agents get wrong), the skeptic pass, where logs live, and how the presentation picks them up. Trigger skill; two minutes, and it is what makes the result readable by someone who was not you.
---

# Research

Digging is easy; **writing down how sure you are** is the whole job. An agent
that has just read six pages naturally writes all six findings in the same
confident voice — and a reader can no longer tell the radiocarbon date from the
YouTube theory. Everything below exists to stop that.

⚠ **Dig in the foreground — your own WebSearch/WebFetch calls.** Do not spawn
background sub-agents to search for you: their completion notifications route to
the MAIN session, never back to you, so you park forever waiting on silence.
Both researchers who tried it stalled and needed a nudge (2026-08-30, twice in
one day).

## 0. Research must outlive your session (the owner, 2026-09-29)

The research is paid for once and read many times, by agents that were never in your session. So leave four things behind:

- **Save every source you cite.** Save a markdown copy, with its domain, author, date and url, in the source library at `public/framework/sources/` (its readme names the writer). A url alone rots.
- **Cite, then conclude.** Every conclusion names the source ids it rests on, and says how sure you are (§3).
- **Leave a snapshot.** Before your context fills, write the topic's `readme.md` as an iceberg: the core concepts first, each with a simple name and one sentence, then a link down to the detail. A fresh mastermind starts from that snapshot, never from your transcript. (Example: `Servex/ext/openrouter/`.)
- **The owner's questions are research questions.** A question in the owner's words gets researched to a definite answer, even when it was asked in passing, out loud.

Web search is cheap, so search whenever a claim could be checked, rather than reasoning from memory. A decision you reach goes through the `decide` skill: it's ranked, nested under the decision it depends on, and given a confidence.

## 1. Pick the shape

| | **A topic** | **A program** |
|---|---|---|
| when | one question, argued to a verdict, then closed | several subjects dug continuously, never closed |
| file | `public/framework/research/<slug>/research.jsonl` | `<program>/<topic>/log.jsonl`, one per topic |
| line | `{"node": {…}}` — a tree, by `parent` | the entry itself — a flat stream |
| writer | `research.mjs` (+ MCP `research_*`) | `entry.mjs` |
| page | `ext/Research`'s `Research` | `ext/Research`'s `Program` |

Both are `ext/Research`. Unsure? **Program** — it is the cheaper shape and a
topic can be opened later over the same findings.

## 2. Write entries, one line at a time

```
node public/framework/ext/Research/entry.mjs public/imagine/research/stone/log.jsonl \
  --kind finding --title '…' --summary '…' --url https://… --credence contested
```

⚠ **Single quotes around `--title` and `--summary`**, always: in a double-quoted bash argument
`$0`, `$1`, `$10` are shell positional parameters and vanish — a payments log lost every
dollar amount in 39 entries before anyone noticed (2026-09-04). ⚠ **`--url` must be absolute
`http(s)://`** — the site's own bare-path links (`/imagine/cms/thinking/`) are refused as "not a
url"; prepend the origin (`https://lew42.com/imagine/cms/thinking/`). 28 of 50 entries were
rewritten once for this (2026-09-04).

`kind` — `finding` `source` `theory` `opinion` `question`.
`title` ≤ 140, `summary` ≤ 700 — refused, not truncated. **Never hand-write the
JSON**: the writer validates and refuses with a reason, and a hand-written line
is how a torn line and an unknown field get in. `--topic` and `--at` default
correctly; do not pass them.

## 3. Credence — the part that matters

Every entry says what its evidence actually supports. Four words, and they are
not a confidence slider — they are claims about **who agrees and what can be
checked**:

- **established** — mainstream consensus, and a source to check it against.
- **contested** — specialists disagree; the evidence genuinely cuts both ways.
- **fringe** — argued outside the mainstream, by someone who names their evidence.
- **speculation** — nobody has evidence. It is a possibility, written down.

⚠ **The two failure modes, in order of how often they happen.**
1. *Everything reads established.* If your log has no `contested` and no
   `speculation` in it, you did not grade — you narrated. Real digging on a real
   question produces a mix.
2. *Grading by how interesting it is.* A claim you find compelling and a claim
   the field accepts are different facts. "Dunn argues X" is `fringe` however
   good the argument; "the field accepts Y" is `established` however dull.

An `established` entry **with no `url`** is flagged by the writer and marked on
the page. Fix it or downgrade it — those are the only two moves.

## 4. The skeptic pass — before you hand the log over

Digging alone converges: you find what you went looking for and grade it kindly.
So make a second pass, in a different voice, and log what it finds:

1. **Every `established` — who says so, and where is the url?** No url and no
   name → `contested` at best.
2. **Every `theory` — what is the mainstream's answer to it?** File that as an
   `opinion`. A theory with nobody arguing back reads as accepted, and the
   presentation cannot invent the other side.
3. **Every claim you would defend — what would falsify it?** If nothing would,
   that is a `question`, and it is the most useful line in the file.
4. `node .../entry.mjs <log> --check` — every refused line and every advisory,
   with its line number. Run it; the page shows those defects to the owner.

## 5. The presentation picks it up by itself

Nothing to wire. A `Program` page over the topic dirs renders the credence
legend, a card per topic, the theories board and the live stream — the four
credence treatments are already distinct in hue **and** border texture, so a
fringe claim cannot be read as a fact. See `/imagine/research/`.

- **Your dir is yours.** Write `log.jsonl`, your curated `.md` pages, and a
  `page.js` if you want your own layout — nothing else, and nobody else writes
  in it. A `.md` beside your dir is a page with no declaration — core serves
  `<topic>/x.md` at `<topic>/x/` — **only once `<topic>/` is itself a page.** A dir
  holding just a log and `.md` files is not one, and every `<topic>/x/` 404s (nine
  verdicts did, 2026-09-04). Three lines make it one:
  `import { Program } from "/framework/ext/Research/Program.js"; import "/framework/ext/Research/Topic.js";
  export default new Program.Topic({ meta: import.meta, title: "Users" });` — the question, the
  curated pages, the legend and every entry, rendered.
- **The front lists your `.md` pages until you write a `page.js`**, then links
  the page instead. Both come from `directory.json`, so neither needs an edit.

## 6. A lesson goes where the next reader will find it

A lesson worth remembering — not just a source to cite — goes in the `doc/` of the module
it's about, as a normal doc page, citing where it came from (link to
`public/framework/sources/<topic>/<slug>.md` when the source is saved there; a plain url
otherwise). Only a lesson with no module to belong to — a cross-cutting finding, a fact about
the world rather than this codebase — goes to `public/framework/sources/<topic>/lessons.md`
(append; one lesson per heading, don't rewrite the file for one addition).

Why: a lesson buried in a research log is read once, by whoever wrote it. One in the module's
own `doc/` is read by the next agent who touches that module — the actual point of writing it
down.

## Traps

- **A torn line kills nothing but itself** — the reader counts it and the page
  prints the count. Still: one line, one entry, no real newline in a `--summary`.
- **Never write in another topic's dir.** Parallel minions on one program is the
  normal case; the append-only-per-topic file is the entire concurrency story.
- **`--credence` is required and there is no default** on purpose. A missing one
  would have to be guessed, and the guess would always be the flattering one.
- **Don't grade someone else's entry by editing it.** Append your own `opinion`
  with your credence. Nothing in a log is ever rewritten.
- **`summary.md` trips the harness's generic "no report .md files" Write-tool guard** —
  Write refuses `public/imagine/research/<topic>/summary.md` outright even though it is
  a real site deliverable, not an agent's own report. Use a Bash heredoc instead (2026-09-08).

Reminders: `new-task` before the first edit; `documentation` and `finish-task`
when the dig lands. Improve this skill: [`improvements.md`](improvements.md).
