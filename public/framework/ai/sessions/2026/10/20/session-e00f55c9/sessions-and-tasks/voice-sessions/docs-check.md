#  review: `public/framework/ext/Session/` readme chain

Loaded with `load_module` (root readme → framework readme → ext readme → Session readme → `doc/sessions.md`, `doc/decisions.md`, `doc/architecture.md`). Verdict: the readme chain holds together and answers the three asked questions, with one stale doc found along the way.

## Where a voice session's file lives

Clear, and told twice consistently: `ext/Session/readme.md` and `doc/sessions.md` both give
`public/framework/ai/sessions/YYYY/MM/DD/<session>/session.jsonl` as the current store (local
day it was opened), with the pre-2026-10-19 flat path `<home>ai/<session>.jsonl` named as the
old shape that `voice-backfill.mjs` moves out of. Card sessions are called out as the one
exception: `/framework/ai/<card>/ai/<session>.jsonl`, beside that card's `page.jsonl`.

**One stale doc:** `ext/Session/doc/architecture.md` ("One press, one file, under the page it
started on") still states the *old* path as the decision — `a session lives at
<home>ai/<session>.jsonl` — with no note that the dated central store superseded it. A reader
who opens `architecture.md` before `sessions.md` gets the wrong current path. Worth a one-line
fix: either update the "Decided" line or point it at `sessions.md`'s "The file" section instead
of restating it.

## The smart assistant's model and permissions

Clear and specific, in `doc/sessions.md`'s "The two assistants" section: **Opus 5.5** (tier
`voice_smart` in `Servex/agents/tiers.js`, set 2026-10-25), effort medium, **mastermind
permissions** — `bypassPermissions`, the full Claude Code preset, and Servex's own tool door —
"so it can spawn, use the item tool and write notes: the owner dictates to it directly and it
acts." Contrasted directly against the fast assistant (Sonnet, effort low, no tools, no
settings, no Servex door), which makes the asymmetry easy to see on one read. Nothing unclear
here.

## How child agents show up on `/framework/ai/sessions/`

Stated once, in one sentence, in the readme's "Watch out" list (echoed in `doc/sessions.md`):
"Both seats are spawned with `parent_session` = the voice session's id, so the session index
lists them as the voice session's child sessions and adds their cost to its total." Checked
against code, not just the doc: `parent_session` is real and wired through
`Servex/agents/Sessions.js`, `Servex/agents/Agents.js`, `Servex/agents/Registry.js`, and is
covered by two tests (`Sessions.test.mjs`, `child-links.test.mjs`) — not aspirational.

The sentence answers the mechanism but not the two things a reader would ask next:
- **Where** on `/framework/ai/sessions/` this nesting actually renders — which class reads
  `parent_session` to draw a session as a child row (the readme names the field, not the
  reader). A pointer to the class/page would save the next agent a grep.
- **What "adds their cost to its total" sums** — whether a child's cost rolls up once (at
  `ended`) or live while it runs, and whether a Servex restart mid-pair double-counts anything,
  given the doc's own note elsewhere that a restart drops in-memory state.

Not a blocker — the behavior is real and the one sentence is accurate — but it is the one place
in the chain where "a reader could stop investigating" fails: finding the renderer took a grep
outside the module, which the readme chain itself doesn't point at.

## Everything else

- The readme chain's shape (root → framework → ext → Session) reads top-down with no
  contradictions and no retired systems mixed in.
- `doc/sessions.md` is thorough and internally consistent: the file format, the folder index
  (`ai/log.jsonl`), the three refined levels, the floor/quiet timing, sleep/wake caps, and the
  reaction/acknowledgement rules all cross-reference correctly.
- `doc/decisions.md`'s only open item (the `session-` CSS prefix missing from
  `css-scopes.txt`) is outside this module's fence and already flagged as such — not a docs gap,
  a known loose end.
- `doc/architecture.md`'s own flagged mismatches (`watch()` is a poll loop, not a stream;
  mic-resume is polled, not evented) are honestly marked with ⚠ rather than hidden, which is the
  right call — but see the stale "one press, one file" entry above, which has no such flag and
  should.

## Suggested fix (not applied — out of this review's scope)

One line in `ext/Session/doc/architecture.md`, "One press, one file, under the page it started
on": replace the restated old path with a link to `doc/sessions.md#the-file`, so there is exactly
one place that states the current path.
