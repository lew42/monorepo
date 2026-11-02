# The green check and the brain icon: what each one means and why they can look out of sync

Two small marks sit after your own words while they are still live (not yet in the read-only part
of the chat): a check mark (✓, gray then green) and a brain (🧠, gray then coloured). They are two
separate signals, set by two separate seats, so they almost never change at the same moment — that
is expected, not a bug, except for one real mismatch between V1 and v2 (below).

## ✓ — reached the fast seat

Gray until the fast assistant (the one that cleans up your words) has the chunk; green once it has.

- **V1** (`Chat.js`'s `place_live_cursors()`, line 114): per PIECE. The newest tracked piece of the
  live bubble turns its ✓ green when that one piece's own `sent.fast` is set.
- **v2** (`ChatV2.js`'s `place_cursors()`, line 226): per PROMPT. The whole Prompt's ✓ turns green
  when `n.sent.fast` is set — there is no per-chunk signal on v2's side yet (the comment at
  `ChatV2.js:212` names this gap: "the owner's per-chunk ask needs a new Servex line").
- Made by `cursor_el()` (`cursors.js:8`), coloured by `.chat-cursor.done` → `var(--ok)` (`cursors.css`).

## 🧠 — the smart seat

Gray/dim while the smart assistant (the slower one that answers, titles or files things) is
working on it; coloured once it is actually DONE.

- **V1** (`Chat.js:125-130`): coloured (`.done`) as soon as `sent.smart` exists — i.e. smart has
  *received* the chunk. It does not check whether smart has produced an answer yet.
- **v2** (`ChatV2.js:233-236`, `smart_answered()` at `ChatV2.js:220`): only shown at all once
  `sent.smart` exists, and only coloured once `smart_answered()` is true — a real answer exists
  (the Prompt's own title/text, or a reply/question/task timestamped after `sent.smart`). "Received"
  alone keeps it gray.
- Made by `smart_cursor_el()` (`cursors.js:10`), coloured by `.chat-smart-cursor.done` → `var(--warn)`.

## The real mismatch (not just timing)

V1's 🧠 and v2's 🧠 answer a **different question** for the same icon: V1 asks "has smart seen it?",
v2 asks "has smart actually answered it?". Side by side (or across a reload that switches view), the
brain can read "done" on V1 while the same moment reads "still working" on v2 — that is not the
owner's clock drifting, it is two definitions of "done" wearing the same icon. Logged as a finding
in `views-fix/task.jsonl` (not fixed here: aligning V1 to v2's stricter check needs a way to tell,
from a live piece alone, whether an answer landed after `sent.smart` — not a one-line change).

**Decided meaning for the unified data: 🧠 = smart *answered*** (v2's rule). On `session.messages` it is
computable from the list alone (a Reply whose `re.to` is one of the Prompt's sentences); "received" stays
a gray state. See [views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md).

The ✓'s own V1-vs-v2 difference (per piece vs per Prompt) is not a bug: v2 genuinely has no
per-chunk signal yet, which is the known, already-documented gap above, not a drawing mistake.

## Two other 🧠 marks, not this pair

- **v2's bottom dots** (`ChatV2.js:68`, `.chat-v2-smart-dots`): a single animated 🧠 at the very end
  of the whole chat, shown whenever ANY Prompt's `working` is fresh (under ~10 minutes old) — "smart
  is doing something, somewhere right now", unrelated to any one piece's own cursor above.
- **A reply's own brain** (`ChatV2.js:302`, `ChatV3.js:81`, `.chat-v2-brain`/`.chat-v3-brain`): the
  static 🧠 beside an already-written smart reply — just the "who said this" avatar (`roles.js`'s
  `AVATARS.smart`), not a moving status mark at all.
