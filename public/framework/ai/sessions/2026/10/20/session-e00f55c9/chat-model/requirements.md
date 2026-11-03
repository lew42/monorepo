# The chat data model, next phase: one list drives every view (you are a mastermind, on Opus, high effort)

**Why Opus:** foundational object-oriented work on core/Item, core/List and core/Session that every chat view will stand on.

**Read first:**
- the owner's words: [../night-2026-11-01/requirements.md](../night-2026-11-01/requirements.md), points 1–4 and 8–9;
- `core/Session/tasks/data-shapes/synthesis.md` (the class map: Chat, Message, Prompt, Reply, Question, Card, **Ref**, Sentence) and `plan.md` (forks F1–F7; F6 is a direct store call, F7 makes adding an item that already has a parent create a Ref);
- `core/Session/Chat/readme.md` (`session.messages`, landed b35ee6370 and 9165c4e6c), `doc/pseudo-properties.md` and `doc/views-on-messages.md` (the six-step plan; step 1, V3 on messages, is running as `mastermind-v3-messages`);
- `core/Item/`, `core/List/` and their readmes and handovers. **Find the Item/List multi-phase plan:** the owner was told only about half of phase 0 was done. Grep for "phase 0" under `core/Item`, `core/List`, `core/Session/tasks` and `ai/sessions/2026/10/2*`.

**Ask first, before you build:** `mastermind-dictation-v3` owns the views, and `mastermind-v3-messages` is changing V3 now. Send them a short note of what you'll touch, and never edit `ext/Chat/v3` or `ux/Dictate` while they hold them.

## Build (worktree, one merge per step, in this order; write the step list as child tasks first)

1. **Finish the Item/List phase-0 items** that the chat needs. Make sure the tests exist and actually run (`core/Test`, `TestRunner.mjs`, `SITE_URL`); a test that never runs is a finding.
2. **Ref** (synthesis.md): an Item that points at another item by path or id and renders it. Use it for tasks, child sessions and resurfaced messages. F7: adding an item that already has a parent makes a Ref, never a move or a copy.
3. **Child sessions and tasks in `session.messages`:** when a task or child session is created in a session, Servex appends a Ref in order. Add a replay test.
4. **List-view hooks:** a List view that re-renders on insert, remove, move and sort (the Store delta), so that any view "just renders the list". Find the existing List view first and extend it.
5. **Per-sentence timestamps and raw-prompt rebuild:** every Sentence carries `at`. A function rebuilds the exact raw prompt from a Prompt's sentences. Add a test against real `v-u48msei` lines.
6. **Prompt upgrade, the data side:** a Card (task, request or question) can own sentences and sub-items, so a view can show title → items → raw text. Just the shape and the item-tool operations; the views are dictation-v3's.
7. **Session completion:** find the existing session completion system (grep "completion" in `core/Session` and `Servex`). Make each session compute its completion from its open tasks, and show it on the session page. Add a test.
8. **The V1 switch-over, as a script and a plan only:** a dry-run migration that writes `session.messages` for old sessions from their `{chat}`/`{place}` lines, plus a side-by-side check that V1 renders the same from either source. **Don't run the migration, and don't switch V1.** The owner says V1 must keep working.

**Docs:** update `core/Session/Chat/readme.md` and the Item/List readmes as you go (Law 9: structure, writer, reader).

**Fences:**
- worktree only; `node Server/review.mjs <this dir> <worktree>` before each merge; merge with `node Server/merge.mjs` (it pushes);
- commit by path; no `python -`;
- Servex restarts are fine when no voice call is live (no `v-*` session line in the last 2 minutes);
- don't touch V1's renderers.

**Budget:** about $40. Report each merge to vscode-mastermind in 3 lines, and nothing else.
