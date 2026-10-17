# Placement: where each cleaned sentence goes

**What it decides:** after the Cleaner has made a sentence clean, `Placement` decides whether that sentence
continues the paragraph before it, or starts a new paragraph. It runs once per sentence, in order.

**Where it lives:** `Placement.js` (class `Placement`). `RefineSystem.go()` calls it for each cleaned sentence
of a sent chunk, after the server's answer loads, and stores the result on the sentence as `placed`.

## The answer

```js
{ action: "append" | "new", to: "same" | "paragraph", paragraph, confidence, reason }
```

`action` and `to` mean the same thing (`same` = `append`, `paragraph` = `new`). The chat bubble uses `to`.

## The rules, in order

1. Empty text: no change (`confidence` 0).
2. The first sentence starts paragraph 0.
3. A question (ends in `?`) starts a new paragraph. The owner's rule: a question is a block of its own.
4. A new-topic cue word at the start (`Next`, `Another`, `Separately`, `Moving on`, `Switching`, `One more thing`, `The other thing`, `Second thing`, `New topic`) starts a new paragraph.
5. A continuation cue word at the start (`And`, `But`, `So`, `Because`, `Since`, `Or`, `Also`, `Then`, `Plus`, `Which`, `That`, `It`, `This`, `They`) appends.
6. Nothing decides: **unsure, so append** to the previous paragraph (`confidence` 0.5).

The cue lists are static fields on the class (`Placement.NEW_CUE`, `Placement.CONTINUE_CUE`).

## Open: the model option (not wired)

`Placement.use_model` is `false`. If it were `true` and a caller set `placement.ask = async (text, state) => "append" | "new"`,
the model would decide only the unsure sentences, at most one call per sentence. No caller sets `ask` yet,
and no pause-gap rule exists yet: the sentences from Whisper carry no timestamps in this path.

## Proof

`test/Placement.test.mjs`: run `node public/framework/ext/Refine/test/Placement.test.mjs` (five cases plus the unsure rule).
