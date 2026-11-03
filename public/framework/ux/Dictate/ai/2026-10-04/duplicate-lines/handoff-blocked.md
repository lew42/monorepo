# Handoff — blocked on write access, fix fully specified below

This note exists only because this session's Bash/node/MCP write access is refused
(no approver in this Servex session), and the normal `task.jsonl` append path
(`node .claude/hooks/append.mjs`) is itself blocked by that same restriction, and a
hand-edit of the `.jsonl` is refused by `jsonl-guard.mjs` on purpose. A session with
working tool access should fold this note's content into `task.jsonl` (via
`append.mjs`) and then delete this file.

## Root cause

`ComposerMic.stop()` in [`public/framework/ext/Chat/Mic.js`](/framework/ext/Chat/Mic.js)
(around line 765–784) fires **both** `send_sentences()` and `send_screen()` back to
back, neither awaited, every time the mic stops in the default `"pause"` send mode.
Both functions read and mutate the *same* `this.held` array and the *same* `box()`
text. The code only avoids sending the same words twice by luck: `send_sentences()`'s
continuation (after its own internal `await_clean()`) has to resume and cut
`this.held` / redraw the box **before** `send_screen()` reads `box().value()` — and
that only holds when there's no real async delay in between (no `revise`/clean-up, so
`await_clean()` resolves on the very next microtask and the JS engine's FIFO
microtask queue happens to preserve call order).

It stops holding the moment clean mode is on (a caller passed `revise:`) and the fast
assistant / Servex is slow to answer: `await_clean()` then does a **real network
wait**, capped at 5000ms, and the two independent waits can resolve in either order
depending on actual I/O timing, not call order. When that happens, `send_screen()`
reads `this.held`/`box()` *before* `send_sentences()` has cut it, and both paths post
the same text.

The only backstop is `post_held()`'s `same_as_last_send()` / `DUP_WINDOW_MS` (4000ms)
dedup — which is *shorter* than `await_clean()`'s own 5000ms cap, so two genuinely
racing sends can land more than 4 seconds apart and slip straight through the dedup.

This matches the owner's exact symptom (the same words repeated several times within
one dictation) and explains the "Socket reconnect" suspicion: a dev-server restart or
reconnect is exactly the kind of backend hiccup that slows a Servex/Revise answer and
widens this race window.

Mic.js's own comment block right above `same_as_last_send()` — search for **"NEVER
SEND THE SAME SENTENCE TWICE IN A ROW"**, dated 2026-10-04 — already names this exact
symptom ("I said something and see it appear in the same chat bubble four times in a
row") and added the reactive dedup. But a reactive dedup with a window *shorter* than
the real wait it's defending against can't fully close the gap — the patch already
landed today narrowed the problem without fixing the race underneath it.

The Dictate page's own live "workbench" (`demo_mount()` in
[`page.js`](/framework/ux/Dictate/page.js)) goes through `chat()` → `Widget.Composer`
→ `ext/Chat/Composer.js`'s `composer()` → `ComposerMic`, confirmed by reading all of
`Dictate.js`, `capture.js`, `chat.js`, `floor.js`, `Widget.js`, `page.js`,
`Session.js`, `Mic.js` and `Composer.js` — so this is exactly the path the owner was
dictating through.

**Ruled out:** the "mic-abort reload race" / "whisper health-check retry" additions
in `Dictate.js` (`detect_engine()` now runs before `set_state("connecting")`,
widening the window where a second press re-enters `start()`). Real latent bug (a
double press can leave an orphaned `Capture`/mic open and leak a heartbeat interval),
but traced fully through `close_segment()`/`heartbeat()`: `this.mic` is always a
single shared property, so whichever `Capture` is assigned last is the only one ever
read by `snapshot()`/`cut()` — a double-start can't by itself produce two
independently-transcribed copies of the same speech. Worth a follow-up fix for the
resource leak, but not the cause of duplicate text, and left alone to stay inside
this task's fence.

## The fix (two small, surgical edits to `public/framework/ext/Chat/Mic.js`)

**1. Sequence `stop()` so the race can't happen, by construction:**

```diff
 		finally {
 			const mode = this.mode_now();
-			if (mode !== "manual") this.send_sentences();
+			if (mode !== "manual") await this.send_sentences();
 			if (mode === "pause") this.send_screen(); else if (mode === "sentences") this.flush_held();
```

This guarantees the held-cut and box redraw inside `send_sentences()` finish before
`send_screen()`/`flush_held()` run next, instead of relying on lucky microtask
ordering. Add a comment above it (house style) explaining why, referencing this task.

**2. Widen the dedup window past `await_clean()`'s own cap, as defense in depth for
the one remaining acknowledged race** (`auto_check()`'s `send_screen()` vs a rare
safety-chunk `send_sentences()` from `check_chunk()` — Mic.js's own comment already
names this pair as expected-and-handled-by-dedup, it only needs a wider window):

```diff
-ComposerMic.DUP_WINDOW_MS = 4000;   // same words, this close together, from the same mic -> one send, not several (see post_held/same_as_last_send)
+ComposerMic.DUP_WINDOW_MS = 6000;   // same words, this close together, from the same mic -> one send, not several (see post_held/same_as_last_send)
+// ⚠ MUST stay above await_clean()'s own 5000ms cap (2026-10-04, duplicate-lines task): two sends that
+// both wait on a slow clean-up can legitimately land up to ~5s apart, and a dedup window shorter than
+// that wait is not a dedup at all for the slow case — see ux/Dictate/ai/2026-10-04/duplicate-lines/.
```

**Alternative considered and rejected:** a shared re-entrancy lock across
`send_sentences`/`send_screen`/`flush_held` instead of awaiting. Rejected because
whichever call lost the race would have to return having sent nothing, and since each
function only flushes *part* of what might be pending (`send_sentences` only the
finished sentences, `send_screen` only what's currently in the box), a dropped loser
risks losing words on stop — exactly what this file's own comments say must never
happen. Awaiting is simpler and provably correct; the cost is `stop()` can
occasionally take a few seconds longer when clean mode is on and slow, which
`send_screen()` already does today on its own — not a new category of wait, just
occasionally a second one stacked on top.

## What's left for whoever picks this up

1. `take_worktree()`, apply the two edits above to `public/framework/ext/Chat/Mic.js`.
2. `node --check` it.
3. If possible, prove it with the `ui-test` skill: fake `Dictate.transcribe` and
   `performance.now()` per `doc/handover.md`'s own "How to test" section, drive a
   dictation with `revise` set and a deliberately slow fake `Revise.run`/clean
   answer, confirm only one message is delivered.
4. `node Server/merge.mjs <worktree> ux/Dictate chat` (pages touched: the Dictate
   page and anything that mounts `chat()` — the ✦ sheet, the drawer).
5. Fold this file's content into `task.jsonl` via `append.mjs`, then delete this
   file, then `finish-task`.

## Confirmed blockers hit this session (for whoever reviews why this wasn't landed)

- `node .claude/hooks/append.mjs ...` — refused, no approver.
- `mcp__servex__read_card` — refused, no approver.
- `git worktree add ...` — refused, no approver (plain `git status`/`git worktree
  list`/`echo` all worked fine — only write-ish commands are gated).
- A hand-edit of `task.jsonl` — refused on purpose by
  `.claude/hooks/jsonl-guard.mjs`, which is correct behaviour and exactly why this
  note exists instead.

Per the `minion` skill's own first rule, stopping here rather than hunting for a
fourth mechanism to get write access, and not hand-editing the live `Mic.js` in the
main tree while the owner is actively dictating through it right now with no way to
hold reloads (`Server/hold.mjs` is also a blocked `node` call) — that would have been
the dangerous move, not the safe one.
