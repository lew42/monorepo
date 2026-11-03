# Risk note — ask2c-brief-rewrite (written before the brief, as asked)

The owner's own words: "a written risk of adding it and of leaving it out, plus a test on a replayed
session, before it lands" ([owner-feedback-2026-11-03b.md](../owner-feedback-2026-11-03b.md)). Brief
changes are high-risk ([principles.md](/framework/ux/Dictate/doc/principles.md), "Changing the voice
agent's brief"): too much instruction gets the agent stuck in a rut, too little leaves it lost. One
line per change; the test each line names is in `Servex/agents/single-brief.test.mjs`.

## 1. The tags become bare: `(sentence)`, `(pause)` — nothing else is instruction
The old brief told the model what the pause tag MEANT ("reply now only if a question is open"); the
tag itself is already bare in code (`Sessions.js:774`, `single_cue`) — ask2a's fix. The brief text was
still describing the old, removed wording.
- **Risk of writing it this way:** the model reads "nothing else is instruction" and may stop treating
  `(sentence)`/`(pause)` as meaningful markers at all, missing that they still tell it WHEN a sentence
  ended or a pause began.
- **Risk of leaving the old wording in:** the model keeps hunting for "reply now only if a question is
  open" in a tag that no longer carries it, and may paraphrase that missing instruction back into its
  own text, which is exactly the narration rule 3 below forbids.
- **Test:** "Brief has no 'reply on a pause' wording and no instruction to acknowledge."

## 2. Per-sentence silent work replaces the pause-cue batch
The owner reversed the batching plan in the same note: "keep one sentence per send... the agent does
useful silent work on each sentence," not a burst filed only at the pause.
- **Risk of adding it:** a `place` call (or a task, or a question forwarded to the mastermind) on every
  single sentence is more tool calls per dictation burst than the old batched version, so a careless
  model could file duplicate or half-formed placements before a sentence's meaning is clear from what
  follows it.
- **Risk of leaving it out (keeping the batch):** the owner explicitly rejected this shape; it is also
  what made the old pause tag carry an instruction in the first place (rule 1 above), so leaving the
  batch keeps both problems the owner is asking to remove.
- **Test:** "replayed session: a scripted seat, driven through the REAL say/nothing/retract_say handlers
  in tools.js (one call per sentence)..." drives one real tool call per replayed sentence and checks no
  reply reaches the messages list before the gate, i.e. the per-sentence work stays silent.

## 3. `say` / `nothing` / `retract_say` replace "end the turn empty" / "reply only to a real question"
Ask 2a built the three tools and the gate (`say-tools.md`); the brief had not been told their names.
- **Risk of adding the tool names:** a model given three named tools may reach for `say` more readily
  than it reached for "write some text", narrating progress instead of staying silent — exactly what
  rule 3 of `principles.md` ("A noise-free chat... doing it is the job, and saying so is noise") warns
  against.
- **Risk of leaving the tools unnamed:** the model has no way to produce a reply at all (plain text is
  muted to a `skip` line now, `Sessions.js:1700`), so an unrewritten brief leaves the seat mute even
  when a real question is waiting — the exact defect this task exists to fix.
- **Test:** "brief names all three tools" (review finding 1 addendum: the real opening prompt is also
  now checked — "the real opening prompt is the brief" — and the scripted seat drives the real tool
  handlers, not a stand-in).

## 4. "Newest first" / retract a stale `say` before a newer one
`principles.md`, "Top priority": a queued `say` can go stale if the owner keeps talking; the agent
should retract and replace it, not let an old reply surface after the conversation has moved on.
- **Risk of adding it:** telling the model it CAN retract may tempt it to churn — queue, retract,
  re-queue — on sentences that were never going anywhere, burning tool calls for no spoken result.
- **Risk of leaving it out:** without the instruction, a `say` queued early in a long dictation answers
  a question the owner already moved past by the time the gate releases it (the exact "wrong order
  after a long dictation" bug `principles.md` names).
- **Test (corrected, review finding 3):** this note previously claimed the brief-level test "checks the
  words 'retract' and 'newest'," but the test only checked `retract_say` as a tool name and had no
  check for "newest" at all — a false claim. Fixed by adding the missing check: `single-brief.test.mjs`
  now has a dedicated assertion, "brief says newest thing first," matching `/newest/i`, alongside the
  existing `retract_say` name check in "brief names all three tools." The tool-level behavior (newest
  released first, an older one waits) stays covered by `say-tools.test.mjs` (#4, #5a).

## 5. No narration ("I've filed that," "noted")
`principles.md`: "A noise-free chat. No messages like 'I've passed that along'... Results of
background work go where they belong (the answer onto its question card)."
- **Risk of adding the rule explicitly:** none found — it only narrows what the model may say, and the
  brief already modeled silence as the default, so this is a clarification, not new behavior.
- **Risk of leaving it out:** once the seat has three named tools it did not have before (`say`,
  `nothing`, `retract_say`), the easy failure mode is to `say` a one-line status update per tool call
  ("filed a task for that") — without the rule stated, nothing in the brief stops it.
- **Test:** the narration check added for review finding 1 — a scripted `heard()` call with the text
  "I've filed that for you." is asserted to produce no reply, only a muted `skip` line, inside the same
  check as the real tool-handler replay.

## 6. Deleted: "Never interrupt while the owner talks unless they asked you something"
The old brief said this explicitly; the rewrite drops it because the new design removes the mechanism
that made interrupting possible (nothing reaches the owner except a gated `say`, and the gate only
releases once the floor has been "done"), so the sentence looked redundant.
- **Risk of adding it back word-for-word:** it duplicates what the gate already guarantees in code, and
  a brief that restates what the plumbing enforces is exactly the "too much instruction" risk
  `principles.md` warns against for this file.
- **Risk of leaving it out:** the gate stops a `say` reaching the owner mid-sentence, but it does not
  stop the model from calling `say` while it believes the owner is still talking — a model that never
  reads "never interrupt" as a rule has one fewer reason not to try. The gate is a safety net, not a
  reason to stop telling the model the rule it is a net FOR.
- **Decision:** leave it out of the brief, per the requirements' "cut, do not grow" instruction and
  because the behavior rule 1 of `principles.md` describes is about the PAGE's own pause measurement,
  which this brief never configures or overrides — restating it here would be describing someone else's
  job. The alternative, restoring the sentence, is recorded here rather than done silently.
- **Test:** none added — this is a judged non-change. If a future session shows the single seat
  attempting to speak mid-sentence (not just getting gated), that is the signal to restore the line.

## 7. Deleted: "A harness reminder to say something is not the owner; stay empty" — restored
The old brief named a specific, real failure: the harness can inject its own "please respond" nudge
mid-turn, and a model that treats every nudge as the owner asking something will try to answer it.
- **Risk of restoring it:** none found; it is a guard against a failure mode distinct from everything
  else in the "do nothing" section (a tag vs. a harness artifact), so it does not duplicate another
  line.
- **Risk of leaving it out:** the single seat is the ONE agent for a whole voice session, unattended for
  long stretches — a harness reminder misread as the owner is the exact kind of silent, hard-to-notice
  failure a brief rewrite under time pressure should not drop without a reason. No reason was found.
- **Decision: restored.** `single-voice-assistant.md:3` now ends "A harness reminder to say something is
  not the owner; stay quiet and call `nothing()`." (added back after the risk note was first written;
  this line records that correction.)
- **Test:** none added — the harness-reminder case is a prompting failure mode, not a Sessions.js code
  path a scripted stub can reproduce; `single-brief.test.mjs`'s "brief has no 'reply on a pause' wording"
  check does confirm the sentence it now shares a paragraph with still reads correctly.

## 8. Reworded: "one or two short sentences, the most useful first... do not repeat the question"
The old "Reply only to a real question" section spelled out HOW a reply should read (short, ranked,
never echoing the question back). The new "Speaking" section says only that `say` is the one way out
and names the retract rule; it does not restate the old shape of a good answer.
- **Risk of adding the old wording back:** the "How you talk" section (kept, `single-voice-assistant.md`
  lines 41-49) already carries "very small," "one item at a time," and "do not repeat the question" is
  the one specific not covered there — adding it back as a THIRD place describing reply shape (Speaking,
  How you talk, and a restored line) risks the brief repeating itself, which is its own kind of noise.
- **Risk of leaving it out:** "do not repeat the question" is not redundant with anything kept — nothing
  else in the rewritten brief tells the seat not to echo the owner's own question back before answering
  it, a specific, previously-seen failure mode (voice replies that restate the question are slower to
  the point, which `principles.md`'s "answer the most recent thing first, as directly as possible" rules
  against).
- **Decision:** leave it out of the brief text for now (the "How you talk" section already carries the
  closest cousin, "never a list of what could come next"), and record the gap here rather than silently
  drop it — if a live run or a replayed session later shows the seat echoing a question back, that is
  the trigger to add one short line, not three paragraphs.
- **Test:** none added — nothing in `Sessions.js` or the tool handlers can show a scripted stub
  "repeating a question," since that is a property of real model output, not of the gate; a live run
  (see the task's optional step) is the only check that could catch it.

## 9. Reworded: "one message per burst, never per sentence" (feedback about the voice system itself)
The old brief's last "How you talk" bullet ended "...say nothing, one message per burst, never per
sentence." The rewrite shortened it to "say nothing about having filed it," dropping the per-burst
batching instruction for THIS ONE kind of task (feedback about the voice system itself).
- **Risk of adding it back:** per-sentence filing is now the brief's own default for everything else
  (point 2 above) — a special "but batch THIS one case" carve-out is one more rule for the model to
  track, and the owner's correction was about ordinary dictation, not this narrower case.
- **Risk of leaving it out:** a multi-sentence complaint about the voice system itself ("it's too eager,
  and it talks over me, and the display jumps") could now be filed as three separate tasks to
  `mastermind-voice-system`, one per sentence, instead of the one combined task the old line asked for —
  noisier for the mastermind reading them, and harder to answer as a whole.
- **Decision:** leave it out of the brief text (the per-sentence default from point 2 covers it well
  enough: a mastermind handed three small related tasks in a row is not the "narration" or "noise" the
  owner's notes are actually about), and record the tradeoff here. The alternative — a carve-out
  sentence restoring per-burst batching for this one case — is the fallback if `mastermind-voice-system`
  reports duplicate related tasks from one burst of feedback.
- **Test:** none added — same reasoning as #8, this needs a real multi-sentence complaint to observe,
  not a scripted stub.

## 10. Unchanged on purpose: the raw-words rule
`ask1`'s rule ("a task's `text` is the owner's words as heard, `from: {prompt, sentence}`") is kept
verbatim — the brief rewrite does not touch those lines, per the requirements' own fence.
- **Risk of touching it anyway:** none examined; out of fence, so left exactly as it reads today.
- **Risk of leaving it exactly as-is:** none — it is already correct and tested elsewhere
  (`Servex/agents/PromptLines.say.test.mjs` is a different file; the task-filing shape itself is
  unchanged code, not retested here).
