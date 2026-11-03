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
- **Test:** the replayed-session test drives several sentences through the stub model and checks no
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
- **Test:** "Brief contains `say`, `nothing`, `retract_say`"; "Scripted seat: no reply reaches the
  messages list before the gate."

## 4. "Newest first" / retract a stale `say` before a newer one
`principles.md`, "Top priority": a queued `say` can go stale if the owner keeps talking; the agent
should retract and replace it, not let an old reply surface after the conversation has moved on.
- **Risk of adding it:** telling the model it CAN retract may tempt it to churn — queue, retract,
  re-queue — on sentences that were never going anywhere, burning tool calls for no spoken result.
- **Risk of leaving it out:** without the instruction, a `say` queued early in a long dictation answers
  a question the owner already moved past by the time the gate releases it (the exact "wrong order
  after a long dictation" bug `principles.md` names).
- **Test:** covered already by `say-tools.test.mjs` (#4, #5a) at the tool level; the brief-level test
  checks the words "retract" and "newest" appear so a reader can confirm the seat was told the rule.

## 5. No narration ("I've filed that," "noted")
`principles.md`: "A noise-free chat. No messages like 'I've passed that along'... Results of
background work go where they belong (the answer onto its question card)."
- **Risk of adding the rule explicitly:** none found — it only narrows what the model may say, and the
  brief already modeled silence as the default, so this is a clarification, not new behavior.
- **Risk of leaving it out:** once the seat has three named tools it did not have before (`say`,
  `nothing`, `retract_say`), the easy failure mode is to `say` a one-line status update per tool call
  ("filed a task for that") — without the rule stated, nothing in the brief stops it.
- **Test:** "Scripted seat: no reply reaches the messages list before the gate" (a scripted narration
  attempt would be caught the same way a scripted answer is).

## 6. Unchanged on purpose: the raw-words rule
`ask1`'s rule ("a task's `text` is the owner's words as heard, `from: {prompt, sentence}`") is kept
verbatim — the brief rewrite does not touch those lines, per the requirements' own fence.
- **Risk of touching it anyway:** none examined; out of fence, so left exactly as it reads today.
- **Risk of leaving it exactly as-is:** none — it is already correct and tested elsewhere
  (`Servex/agents/PromptLines.say.test.mjs` is a different file; the task-filing shape itself is
  unchanged code, not retested here).
