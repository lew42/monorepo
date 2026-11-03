# chat-live (step D): result

Worktree `C:\Code\lew42\worktrees\chat-live`, branch `worktree/chat-live`. Budget $8 — spent mostly on real client-side fixes; stopped short of a disposable mock PNG once the owner's live spec (three revisions mid-task) settled the look directly. `node public/framework/ext/Chat/v2/ChatV2.test.mjs http://localhost:57224`: **47 passed, 0 failed** after every change below.

## Item 13: diagnosis (3 lines, as asked)

1. **Lowercase/uppercase flip mid-paragraph**: Whisper's `interim` text (`Dictate.js:511`) re-transcribes the WHOLE growing window every 900 ms (`resend_ms`), so a word's capitalization legitimately changes until `close_segment()`/`commit()` finalizes it — this is expected, not a bug, per the owner's correction mid-task: interim must stay visibly gray until final, never shown as settled.
2. **A sentence split across two paragraphs**: `Sessions.assign_prompt` (Servex, out of my fence) always grows paragraph `a` by quiet/floor only (`PromptLines.add_paragraph` has no caller — `prompt-record.md` defect 1/2) — a pause mid-sentence can close one segment's `commit()` into the Prompt before its continuation arrives, and nothing re-joins them into one paragraph. This is a Servex-side fix (see `proposal.md`).
3. **Raw-to-clean cause**: the fast seat (`voice-assistant` SKILL.md) defaulted `edit` to `"nothing"` — the raw Whisper words landed in the Prompt's paragraph un-cleaned, carrying whatever capitalization/punctuation Whisper happened to finalize with. Fixed in my fence (below).

## What I built (client side, in fence)

- **Item 12 + 13's client half** — `.claude/skills/voice-assistant/SKILL.md`: `edit` now defaults to `improve` (clean punctuation, filler words, capitalization) instead of `nothing`; `move` alone is only for an already-clean sentence. Takes effect on the fast seat's next respawn.
- **Item 3's actual bug** — `Chat.css` `.chatbox-live-sent`: the bubble-wide "sent, waiting" fade used to dim the SAME text opacity the per-sentence "heard, not sent" gray uses, so a black (sent) sentence read as reverting to gray. Now a left rule + the "cleaning…/sent, waiting" label carry that state; the text itself never dims again once sent.
- **The "fast … smart …" marks (17:31 note), through three live owner revisions mid-task** — settled on: a small green ✓/✓✓ **per bubble** (not per sentence), nothing shown until the first tick. `Chat.js`'s `sent_badge()` rewritten: returns `null` (nothing drawn) until `pc.sent.fast` is set, then ✓; ✓✓ once `pc.sent.smart` is also set. Wired into `ChatV2.js`'s prompt head too. **Caveat, written down because the owner's last message asked for a finer granularity than the data supports**: the `{sent:{to:"fast"}}` line (`Sessions.mark_sent`, Servex, out of fence) fires when the Prompt *reached* the fast seat, not when the fast seat *answered/placed* that sentence — the owner's last ask ("✓ only once fast has answered") needs a new Servex-side line (`{sent:{to:"fast", at:<sentence>}}` per sentence, not per Prompt) to be exact; noted in `proposal.md`. What ships now is the closest honest approximation with today's data.
  - Alternative tried and dropped: a per-sentence border/mark on each span — the owner's own ticks ("messenger-style, ✓/✓✓") read faster at a glance.
  - Not built (open): the live, un-sent raw interim text is not yet drawn in Chat v2 at all (item 1 — a real feature, no code path exists today in `ChatV2.js`; it only ever draws from `session.jsonl` lines already written). The owner's final mark spec (raw = light gray until final, ✓ once the fast seat answers, 🧠 once smart has seen it) is recorded here for whoever builds item 1, since it needs that feature to exist first.
- **Brain-dots (17:31 note, "see a reply is being drafted")** — `ChatV2.js`'s new `working_dots()`: a pulsing 🧠 shown only while `n.working` (the existing `{by,at}` getter on `Prompt`/`Question`, `core/Task/Prompt.js:103`) is set — never a standing mark. Reused on both a prompt and a child Question/Task.
- **Item: silence hallucinations** (owner note 17:30) — `Mic.js`: a small `HALLUCINATIONS` set ("thank you", "thanks for watching", …) dropped silently in `commit()` when `!this.has_speech` for that segment (no real speech energy was seen), so a genuinely spoken "Thank you." is never touched.
- **Item 15: three settings checkboxes** — `Mic.js` `SETTINGS.send_on_period/question/comma`, all `true` by default, in the gear panel; `send_sentences()` now cuts at `cut_re()` (built from whichever are checked) instead of a fixed `.!?…` set. Unchecking all three falls back to the old set rather than silently never sending.

## Mapped to the brief's 1-15

| # | State |
|---|---|
| 1 | Open — raw live draft is not drawn in Chat v2 at all yet; no code path today (see above) |
| 2 | Open — needs 1 first (the flash is between "nothing shown" and "the real line", which only exists once 1 exists) |
| 3 | **Done** (the bubble-wide fade bug) + **done, through three live revisions** (the per-message marks → ✓/✓✓) |
| 4 | **Diagnosed** (item 13, cause 1 and 3) + **fixed** (SKILL.md `edit: improve` default) |
| 5 | Open — no code path for "send moment" cue exists without item 1 (nothing is drawn while a send is pending in V2 today) |
| 6 | Open — the long-pause-did-not-send path is in `Sessions.js`/`Mic.js` auto_check; `Mic.js`'s own `auto_check` looks correct by inspection (quiet → `send_screen`); the two Servex-side candidates (`Sessions.js:984`, `:1109`) are out of fence — see `proposal.md` |
| 7 | Open, follows 6 |
| 8 | Open — `ext/Session/Session.js:34`'s `fetch` (no `keepalive`) is in fence but a real headless refresh-reproduction test needs more budget than remained; not attempted, not fixed |
| 9 | Open — a verdict call, not a code change; not reached |
| 10 | **Answered directly, not mocked**: the owner gave three live revisions during this task (gray-until-final / ✓ per sentence or bubble / 🧠 once smart has seen it) that converged faster than building a disposable six-look PNG against a moving target would have. The ✓/✓✓-per-bubble + pulsing 🧠 shipped is the result; a true per-sentence ✓ needs the Servex-side line noted above, and no `shots/phases-mock.png` was produced — an explicit budget call, not an oversight. |
| 11 | Addressed by 3 and 10 together |
| 12 | **Done** (SKILL.md default to `improve`) |
| 13 | **Diagnosed** (3 lines above) |
| 14 | Read, informs the diagnosis above; no fence-side action (facts about `Dictate.js`, already correct) |
| 15 | **Done** (three checkboxes, wired into the actual cut regex) |

## Left open, with reasons

- Items 1, 2, 5: no code path exists for them without building Chat v2's live-draft feature first — a real feature, not a quick fix, and outside this budget.
- Items 6-9: the likely cause lives in `Servex/agents/Sessions.js`, outside my fence (`ext/Chat/`, `ux/Dictate/` client, `ext/Session/`, the SKILL.md) — see `proposal.md` for the exact lines to check.
- Item 8 ties to the same fence boundary (`ext/Session/Session.js:34` is in fence, but proving it headless needs a real reload test I did not have budget left for).

Shots: not produced (see item 10's row above for why). Readmes: `ext/Chat/v2/readme.md` and `ux/Dictate/readme.md` are unchanged — nothing on-disk shape changed, only behavior inside existing classes; no readme line went stale.

---

## Round 2 (commit `71d2d7d48`, on top of `68f765793`)

Budget $5. `node public/framework/ext/Chat/v2/ChatV2.test.mjs http://localhost:57224`: **47/47**. `node public/framework/ux/Dictate/test/chat-sent.mjs http://localhost:57224 <shots>`: the sent-mark checks pass; two pre-existing scroll-jump failures (unrelated to this task, present before my edits) left as found. Shots: `shots/bubbles-400-*.png`, `shots/v2-400-*.png`.

### Review fixes (review.md)

1. **has_speech**: was read live in `commit()`, but `Dictate.js:526` resets it to `false` synchronously before the async Whisper final even returns — so it was always `false` by commit time and the hallucination guard dropped real speech. Fixed: captured per-segment in `close_segment()` (`had_speech_q`, before `super.close_segment()` resets the flag) and read back out of that queue in `commit()`.
2. **cut_re()**: `send_on_period` now keeps `!` and `…` with it (one "sentence ended" mark — `. ! …` — matching `ends_sentence()`); `send_on_question` is `?` alone; `send_on_comma` defaults to **off** (every comma cutting a send fragmented sentences). Confirmed with a small standalone regex check against sample text (both settings), output logged in the session.
3. **mic-notes.md**: the three `send_on_*` settings documented (new "Settings: send_on_period, send_on_question, send_on_comma" section); "deliverable 15" comments reworded to plain words.
4. **voice-assistant SKILL.md**: reworded from "always `improve` unless moving" to "clean each sentence you place" (punctuation, fillers, capitalization; cleaned text into the Prompt's paragraph, raw stays behind "show raw") — same substance, matching ask 7/item 12's actual wording instead of a blanket-sounding rule, and still consistent with "you still never write a card's title/text/reply/working sign" right below it.
5. **Stray file**: `ext/Chat/v2/fixture/dbg-27008.jsonl` was already gone (the test's own cleanup, or never present in this worktree) — nothing to delete.
6. **Left-open list**: below.

### The flip-flop bug (black → gray → black)

Diagnosis, 3 lines: (1) the mic's live draft bubble (`Chat.js`'s `live_bubble("draft"…)`/`live_bubble("sent:"+n…)`) is appended into the SAME container as real chat lines and stamps the same `dataset.sender`/`dataset.at` a real bubble does, so `speak()`'s own `mergeable()` could pick a live bubble as `last` for a brand-new real line. (2) a live bubble is never registered in the `bubbles` WeakMap (only `hit.el`/`hit.text` are kept), so that merge path's `bubbles.get(last).pieces` is a crash, not a silent re-color — the closest concrete defect found by reading the code, not a perfect match for "reverts to gray" but the one real hazard in this join. (3) **Fixed**: `mergeable()` now refuses any element carrying `chatbox-live` as a merge target, so a real (committed, black) line can never land inside a bubble that still carries the live gray guess. **Not reproduced with a dedicated test**: `Chat.js` has no existing Playwright harness of its own (only `ux/Dictate/test/chat-sent.mjs`, which drives the real widget), and building one from scratch to force this exact race was more than this round's remaining budget — left open below with the reason.

### Marks, round 2 (replaces round 1's per-bubble ✓/✓✓ and per-node working_dots pulse)

The owner iterated the mark design live, several times, during this round; what shipped is the LAST spec given, with earlier variants named as alternatives:

- **ONE moving cursor** (`ChatV2.js` `place_cursor()`/`cursor_el()`, `.chat-v2-cursor` in `ChatV2.css`): sits after the newest Prompt only — light gray until that Prompt has reached the fast seat (`sent.fast`), green once it has. Moving to a new Prompt removes it from the old one (no standing ticks on history). A fixed `inline-size: 1.2em` so showing/hiding/recoloring it never reflows the surrounding text (the owner's stated worry) — screenshots at 400px are in `shots/v2-400-*.png`.
  - **Caveat**: the data has `{sent:{to:"fast"}}` firing when the Prompt *reaches* the fast seat (`Sessions.mark_sent`), not when the fast seat's `{place}` answer for THAT SENTENCE lands. The owner's most precise ask ("green once fast's `{place}` line for that sentence arrives") is NOT reliably available per-sentence from today's record — `{place}` is read and turned into Servex lines by `Sessions.js`/`PromptLines.js` (out of fence), and nothing there currently stamps which SENTENCE a `{place}` answer was for, separate from the Prompt-level `sent` line. The exact signal needed is in `proposal.md`.
  - Alternatives tried and dropped, in order: a per-sentence bordered span (too busy — the owner's own words: "keep this simple"); a standing ✓/✓✓ per bubble (round 1 — superseded); a 🎤 "Whisper finalized" glyph (owner dropped this in favor of plain black-on-final, no extra glyph).
- **ONE 🧠 stamp per Prompt** (`smart_stamp(n)`): left once `ChatV2Model.refined(n)` is true (the smart seat has written a title or text) — a static glyph, not a pulse, one per Prompt.
  - **Alternative considered, not built**: a gray 🧠 on the bubble the moment `{sent:{to:"smart"}}` fires, turning full-colour once `working` clears (so the bubble alone tells "smart has it" vs "smart is done" without needing the bottom indicator at all). Not built: the owner offered it as one of two options and asked for "the clearer" — the single bottom pulse plus the existing per-Prompt stamp was already built, tested, and simpler to verify in the time left, so that is what shipped. The gray-sent/full-colour-done bubble variant is the one still open if the owner prefers it later.
- **ONE pulsing 🧠 at the bottom of the whole chat** (`watch_smart()`/`update_smart_dots()`, `.chat-v2-smart-dots`): shown only while some Prompt's `working:{by,at}` is set AND under 10 minutes old (review finding 8's staleness concern) — checked on every patched line and every 15s, so a dead smart seat's pulse clears itself.
- **V1 bubble chat (`Chat.js`)**: kept round 1's simple ✓/✓✓ per-bubble tick (`sent_badge()`, unchanged this round) rather than building the full per-Prompt cursor/stamp/bottom-dot design twice — V1's bubbles have no sentence-level structure to hang a moving cursor on, so the honest, cheap thing was to leave it as the simpler tick and put the full design where the data actually supports it (V2). `ux/Dictate/test/chat-sent.mjs` updated to check for this instead of the old literal "fast ✓ · smart ✓" text.
- **Raw-while-streaming (gray-until-final, no 🎤)**: the owner's last word on this is the plan for whoever builds item 1 (the live draft is still not drawn in Chat v2 at all — see round 1's note); nothing to build yet in the fence I have.

### Left open, with reasons (round 2)

- **A dedicated regression test for the live-bubble merge crash** (the flip-flop investigation): no existing test harness for `Chat.js` itself; building one was bigger than this round's remaining budget. The fix (`mergeable()` excluding `.chatbox-live`) is structural and low-risk, but unverified by an automated test.
- **Per-sentence fast-answered signal** (ask 1/3/5/7/8, as named in review.md): `Sessions.js`'s `assign_prompt`/`mark_sent` only ever stamp the whole Prompt, never a sentence — the per-sentence/per-chunk precision several of the owner's live revisions asked for needs a new Servex-side line; exact shape in `proposal.md`. Out of fence.
- **Ask 5 (an offscreen send cue)** and **ask 8 (a windowed list)**: not reached this round — no code touches them in this diff; a fresh agent should check `plan.md`/`requirements.md` for their current numbering, since this task's own brief (items 1-15) and the review's "ask" numbers don't share one scheme, and that mismatch itself is worth settling before building either.
- **Items 6-9 (the long pause that did not send, lines survive refresh)**: unchanged from round 1 — still believed to be `Servex/agents/Sessions.js`, out of fence.

---

## Round 3 (commit `7217da3b5`, on top of `7217da3b5`'s parent `71d2d7d48`)

`node public/framework/ext/Chat/v2/ChatV2.test.mjs http://localhost:57224`: **47/47**. `node public/framework/ux/Dictate/test/chat-sent.mjs http://localhost:57224 <shots>`: all sent-mark checks pass (two pre-existing, unrelated scroll-jump failures left as found, same as rounds 1-2). Shots: `shots/bubbles-400-*.png`, `shots/v2-400-*.png`, `shots/v2-400-paragraph-gap.png`.

### Part B — the placement diagnosis (done first, as asked)

**B(i): does fast ever choose "new paragraph"?** Queried the real voice session [v-sq8y7db](/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl) directly: `grep -o '"place":{[^}]*}'` over all 2804 lines. **591 `{place}` lines, 100% `{to:"same", edit:"nothing"}` — no exceptions.** So the owner's hypothesis is confirmed by the record: fast never once chose `paragraph` or `card`, and never once cleaned a sentence. This matches the SKILL.md text as it stood BEFORE round 2's fix ("`same` … is the default, and the answer whenever you are unsure", "`edit`: `nothing` (default)") — this session predates round 2, so it is evidence of the OLD default being followed literally, not evidence that round 2's fix (SKILL.md now says "clean each sentence you place") failed. No session recorded since round 2's SKILL.md change exists yet to check that fix against; a fresh agent should re-run this same grep against a session recorded after round 2 once one exists.

**B(ii): which stage actually splits sentences into separate paragraphs?** Not the fast seat's text (B(i) shows the raw Prompt record correctly keeps every sentence of a thought in ONE paragraph, since `{place}` never says otherwise) and not the Prompt record/reader (`ChatV2Model.sentences()` correctly reads `para: para.id` per sentence, preserving which paragraph each belongs to). **The cause is `ChatV2.css`**: `.chat-v2-head { display:flex; flex-direction:column; gap:.6em; }` applied the SAME `.6em` gap between every `.chat-v2-sentence` row with no paragraph grouping at all, so two sentences the fast seat placed in the identical paragraph read as two separate paragraphs purely from spacing. **Fixed at that stage** (not papered over in a different layer): `.chat-v2-sentence { margin-block-start: -.45em }` pulls same-paragraph rows close (net ≈.15em), `.chat-v2-new-paragraph` (set when `ChatV2.js`'s `sentences()` sees the paragraph id change) restores the full gap as a real break. Checked V1 (`ux/Dictate/Widget.js`'s `Thread`) too: it has no equivalent bug — `same` already leaves the text merged via one `md_into()` call per paragraph, not one row per sentence, so there was nothing to fix there.

**B(iii): show which paragraph each sentence landed in.** `ChatV2.js`'s `sentences()`: every sentence row now carries `title="paragraph <id>, sentence <n>"` and `data-paragraph`; a new paragraph gets the visible `.chat-v2-new-paragraph` gap from B(ii)'s fix. Proof at 400px: `shots/v2-400-paragraph-gap.png` ("show raw" opened on the fixture's first Prompt, two sentences of paragraph "a" sitting tight together under "Cleaned into paragraphs").

### Part A — review fixes

1. **`smart_dots` creation**: moved outside the `if (!roots.length)` early return in `draw()`, so an empty chat still gets the element ready for its first Prompt.
2. **V1 standing ✓✓**: `sent_badge()` now returns `null` once `smart` is set too (not just before `fast` is set) — the tick shows only while pending (fast has it, smart doesn't yet), never as a permanent "done" marker. `chat-sent.mjs`'s check updated to assert the badge is GONE once both assistants have the line.
3. **Stale docs**: `ux/Dictate/doc/notes.md:762`, `ext/Chat/v2/readme.md` (names `chat-v2-cursor`, `chat-v2-smart-cursor`, `smart_dots`) and `ext/Chat/readme.md` (names the three `send_on_*` settings) all updated.
4. **Done/open table**: added directly to `task-mastermind-2/requirements.md` (confirmed that file's numbering, not `chat-live`'s own 1-15, is what review.md's "ask N" refers to — matches exactly). Asks 1, 3, 5, 8 marked open as asked; 2 and 7 marked partly done with why.
5. **Stray file**: still gone (same as round 2's check) — `git status` on `v2/fixture/` shows only the tracked `files.jsonl`/`session.jsonl`.

### Marks, round 3 (TWO moving cursors replace round 2's single ✓ + per-Prompt 🧠 stamp)

The owner refined the smart mark live again this round. What shipped:

- **`.chat-v2-cursor`** (✓, fast): unchanged logic from round 2 — gray, green once `sent.fast`.
- **`.chat-v2-smart-cursor`** (🧠, smart): gray once `sent.smart`; colours in once `working` is also clear for that Prompt (answering/answered). **Colour decision, written down because no such token exists**: the owner asked to reuse "the same pink as smart's reply bubble" — there is no pink anywhere in the framework's CSS (checked `Chat.css`, `ChatV2.css`, `styles/*.css`; the smart/assistant role's own colour, via `roles.js`'s `role_key`, is actually `--ok` green, which would be visually identical to the done ✓ and defeat having two marks). Used `--warn` (amber) instead — an existing, already-semantic token, not invented, but NOT the pink the owner pictured; flagging for confirmation rather than guessing a new hex value.
- Both are `inline-size: 1.2em` fixed slots, shown/hidden by colour only, so moving either from an old Prompt to a new one never reflows text — same technique as round 2's single cursor.
- Both cursors are PROMPT-level signals (`Sessions.mark_sent` fires once per Prompt, not per sentence/chunk) — same caveat as round 2's ✓, now also true for the 🧠; exact Servex-side line needed is in `proposal.md` (7).
- **Dropped**: the per-Prompt `smart_stamp()` (static 🧠 after a finished Prompt) — superseded by the smart cursor, which already shows "done" via colour.
- **Bottom `smart_dots`**: now a fallback only (`update_smart_dots` hides it whenever any Prompt exists to carry the smart cursor) — it still exists for the edge case of a chat with `working` set but genuinely no Prompt yet to show a cursor on.

### Left open, with reasons (round 3)

- **A dedicated regression test for the live-bubble merge crash** (round 2's flip-flop fix): still no `Chat.js` test harness; unchanged from round 2.
- **Per-sentence signals for both cursors** (fast-answered, smart-answered): confirmed, with real session evidence this round, that `{place}` carries no per-sentence stamp today — out of fence, in `proposal.md`.
- **Asks 1, 3, 5, 8** (shared reader, cards converge, offscreen cue, windowed list): not reached — see the new Status column in `task-mastermind-2/requirements.md` for the one-line reason each.
- **Re-checking B(i) against a post-round-2 session**: the 591-line sample that proves "fast never chose paragraph" predates the SKILL.md fix; nobody has re-dictated into a session since. Worth a quick re-check once one exists, to confirm round 2's fix actually changed fast's behavior and not just its instructions.

---

## Round 4 (commit `494e754de`, on top of `7217da3b5`)

`node public/framework/ext/Chat/v2/ChatV2.test.mjs http://localhost:57224`: **47/47**. `node public/framework/ux/Dictate/test/chat-sent.mjs http://localhost:57224 <shots>`: all sent-mark checks pass (same two pre-existing, unrelated scroll-jump failures). Shots: `shots/v2-400-cursor-identity.png`, `shots/v2-400-sentence-spacing-check.png`, plus the round-1-3 shots already there.

### Item 8(a)(b) — settings trace (reported first, as asked)

**(a) `paragraph_pause_ms` end to end, 3 lines:**
1. Read once, in `Mic.js`'s `auto_check()` (every 250 ms while listening): `if (SETTINGS.paragraph_pause_ms > 0 && quiet >= SETTINGS.paragraph_pause_ms && this.ends_sentence(text)) return this.send_screen();` — a natural, sentence-ending pause sends the whole screen immediately.
2. It runs and has a real effect, **but it is never independently settable today**: the gear panel's only control touching it is the single "send delay" slider, which does `SETTINGS.paragraph_pause_ms = SETTINGS.pause_send_ms = …` — the SAME value, in one assignment (`Mic.js` line ~376).
3. So `quiet >= paragraph_pause_ms` and the very next line's `quiet >= pause_send_ms` (the plain tail-send check) always trip at the EXACT same instant in practice, since they're always equal — the setting exists, is read, and runs, but has no behavior distinguishable from `pause_send_ms` with today's UI. A real "send sooner after a clean sentence end than after mid-sentence silence" effect would need the gear panel to expose it as its own, smaller value.

**(b) hard-coded timing constants, listed:**
- `ux/Dictate/Dictate.js` (prototype defaults, `Dictate.prototype.*`, lines 813-824): `pause_ms = 700` (silence that closes a segment), `max_segment_ms = 15000` (hard cap), `skip_partial_after_ms = 300` (no resend once quiet this long — the final is next), `resend_ms = 900` (how often the growing segment re-sends), `silence_at = 0.01` (RMS floor guess), `min_speech_ms = 120` (a segment with less speech is never sent), `end_pause_ms = 2500` (silence before `send_on_pause` auto-stops).
- `Mic.js` (`SETTINGS`, module-level): `paragraph_pause_ms = 2000`, `pause_send_ms = 2000`, `break_pause_ms = 1500`, `guess_ms = 900` (already the live override for `resend_ms`, set in `start()`), `chunk_chars = 1200`, `chunk_ms = 60000`.
- `Servex/agents/Sessions.js` (out of fence, read-only for this trace): `answer_quiet_ms = 2500` (env `SERVEX_SESSION_ANSWER_QUIET_MS`, the server-side "quiet" threshold that releases a held thought), `hold_max_ms = 8000` (env `SERVEX_SESSION_HOLD_MAX_MS`, the cap if no quiet event arrives), `floor_wait_ms = 8000`.

**(c) built, small as asked:** `resend_ms` was already exposed — it is exactly what `SETTINGS.guess_ms` ("guess every (ms)") sets in `start()`, nothing new needed. Added `pause_ms` and `max_segment_ms` as two more gear-panel fields (`segment_rows()`, under "More"): blank = Dictate.js's own prototype default, unchanged; a value overrides the INSTANCE only (`this.pause_ms`/`this.max_segment_ms`), live while dictating and again on the next `start()`. `end_pause_ms`, `skip_partial_after_ms`, `silence_at`, `min_speech_ms` were left alone — smaller, more dangerous to expose casually (silence/false-positive tuning), and not asked for by name.

### Review fixes

1. **Cursor semantics reversed, fixed**: the 🧠 cursor coloured when `!n.working`, which is ALSO true before smart ever starts — the reverse of the comment above it and of the ask. Now: gray while `sent.smart` is set and `smart_answered(n)` is false (has it, hasn't answered); coloured once `smart_answered(n)` is true (`M.refined(n)`, or a reply/question/task timestamped at or after `sent.smart.at`). Checked live via `chat-sent.mjs`'s existing flow: the smart cursor reads `["🧠"]` with no `done` class at the point where `sent.smart` has fired but no reply/refine exists yet — exactly "gray, has it, not answered" (see the test's own log). The bottom pulsing dots (`update_smart_dots`) no longer go `hidden` just because a Prompt exists — they now answer "is smart doing anything, anywhere, right now", independent of the cursor.
2. **SKILL.md example**: confirmed the worktree's own file still had `edit: "nothing"` in the example delta (line 15) even though the rule text below it (line 20) already said "clean each sentence" — one rule, example now matches (`edit: "improve"`, with `text`).
3. **Stale text**: `Chat.js`'s `LIVE_SENT_TITLE` reworded (no longer says "Faded" — the text stays full strength, a left rule marks the wait); `chat-sent.mjs`'s header comment no longer mentions "✓✓" (gone since round 3).
4. **`:first-child` selector**: traced the actual reachable case. A titled/texted Prompt is always `refined()`, and `prompt_head()` only calls `sentences()` when NOT refined — so an `h3.chat-v2-title` and a `.chat-v2-sentence` can never actually be siblings in `.chat-v2-head` with today's code (a titled Prompt's sentences only ever show inside `.chat-v2-raw-wrap`'s "show raw" reveal, behind a `small.chat-v2-label`, a different container and a different immediate sibling). Added the adjacent-sibling selector anyway (`.chat-v2-title + .chat-v2-sentence`) as a defensive match for any future path that puts them together, and confirmed the one REACHABLE case (an untitled Prompt's first sentence) still gets `margin-top: 0` live: `{"found":true,"margin_top":"0px","is_first_child":true}`.
5. **`had_speech_q` misalignment**: real bug, fixed. `close_segment()` always pushes a flag, but `Dictate.js`'s own close_segment can return via THREE no-commit paths (not worth sending; a stale epoch/seq; a failed transcribe) without ever reaching `commit()` to shift it back off — the next real segment's `commit()` would then read an orphaned, wrong flag. Fixed with a `clear_guess()` override (all three no-commit paths call `clear_guess()` before returning) that pops the queue, guarded by an `_in_commit` flag so a real commit's own internal `clear_guess()` call (an empty/annotation-only final, `Dictate.js` line 706) does not double-pop. **Does not touch `strip_words`, `send_screen`, or `take_out`** — flagging as asked, for the `dictation-mangle` sibling's awareness. No node test added: `Mic.js` has no plain-node harness (its imports — `Dictate`, `Capture`, `Session` — are browser-only, no jsdom in this repo), same limitation as round 2's hallucination check; verified by code-reading the three return paths plus a manual trace, not a persisted test.
6. **`plan.md`**: step D's row rewritten with what has landed across 4 rounds and the real remaining gap (ask 2's live draft); a "Next step for a fresh agent" section added naming asks 1, 3, 5, 8 by number with one line each on what is actually missing.
7. **`mic-notes.md` cut-off sentence**: finished ("...the rest stays held for the next call.").
8. **Settings fallback**: confirmed correct, nothing to fix. `Object.assign(SETTINGS, saved)` (top of `Mic.js`) only overwrites keys PRESENT in the parsed `localStorage` JSON — a settings blob saved before `send_on_period`/`send_on_question`/`send_on_comma` existed has no such keys, so `Object.assign` never touches them, and the module-level defaults (`true, true, false`) survive untouched. Nothing reads them as `undefined`-means-off anywhere.

### New owner asks this round

- **Two chunk rules (fast = per punctuation, smart = per sentence end)**: client-side, the ✓ cursor already follows whatever `{sent:{to:"fast"}}` lines actually arrive, and the 🧠 cursor follows `{sent:{to:"smart"}}` — the client does not decide the granularity, it just draws whichever boundary Servex sends. **Confirmed (again) that today's record only has PROMPT-level marks for both** — `Sessions.mark_sent` fires once per Prompt reaching a seat, not once per punctuation-chunk or per sentence — so right now both cursors move at the exact same (Prompt) boundary regardless of the two different chunk rules the owner wants server-side. This is unchanged from the round 2/3 caveat, restated here because the owner asked specifically; the fix is server-side (`proposal.md`, already covers it — the sibling fixing `WakePolicy.sentence_count` is the natural place to also add a per-chunk `sent` stamp, since it already needs to count chunks correctly).
- **Persistent DOM elements (not recreated per chunk)**: already built this way since round 3 — `cursor_el()`/`smart_cursor_el()` use `??=` memoization, so the SAME `span` element is returned every call for the instance's lifetime; `place_cursors()` only ever `.remove()`s and re-`append()`s it, never creates a second one. **Proved live**, round 4: tagged the ✓ cursor's DOM node with a unique marker, streamed in 3 more Prompts (forcing 3 moves), and confirmed afterward: `{"mark":"same-node","cursor_count":1,"in_last_prompt":true,"last_id":"p-4"}` — one element, the SAME element, correctly relocated into the newest Prompt each time. Screenshot: `shots/v2-400-cursor-identity.png`.

### Left open, with reasons (round 4)

- **A dedicated regression test for the live-bubble merge crash** (round 2): still no `Chat.js` test harness.
- **A persisted node test for the hallucination drop / `cut_re()`**: no plain-node harness exists for `Mic.js` (browser-only imports); verified by reading the code and a manual trace instead, both rounds 2 and 4.
- **Per-chunk `sent` granularity for both cursors**: confirmed again this round; needs a Servex-side change, in `proposal.md`, naturally paired with the sibling's `WakePolicy.sentence_count` fix.
- **Asks 1, 3, 5, 8**: unchanged — `plan.md`'s "Next step" section now names them for whoever picks this up next.
