# Chat v3: hide a title that repeats its prompt

## Before and after

```
before                 after
Hello  (title)         Hello
Hello  (body)            └ reply nests here
  └ reply nests here
```

Real topic cards (an AI title or refined text) keep their title.

## Owner's ask, polished

On the Chat v3 page ([public/framework/ext/Chat/v3](/framework/ext/Chat/v3/), `ChatV3.js` / `ChatV3.css`), each prompt gets its own card, and for short chit-chat prompts like "Hello" the card shows a title that is essentially the same as the prompt text, so it reads "Hello" and then "Hello" again underneath. That is redundant. The owner likes the smart assistant's replies nesting on the cards, and says a prompt card for every bit of chit-chat is acceptable if it's the easiest approach for now.

The change: hide the card title when it matches the prompt text (normalised, case/punctuation-insensitive) or the prompt is only about a sentence or two and has no refined version; keep titles on real topic cards that have a refined title/text. Replies stay nested on the card. Add or extend a test in `ChatV3.test.mjs`. Land through `node Server/merge.mjs` as usual.

Task record: item id `hiwmlper` on session [/framework/ai/sessions/2026/11/02/v-qfzrnhh/](/framework/ai/sessions/2026/11/02/v-qfzrnhh/) (empty at the time this task ran — no nested item found there to update).

## Decision

`ChatV3.prompt()` only shows the muted first-words title when the Prompt has no AI title (`p.title`) and no refined text (`p.text`) — the existing "is-untitled" branch. Inside that branch, a new `redundant_title(p)` (`ChatV3.js`) hides the title when either:

1. The muted title, normalised (lowercased, punctuation stripped), equals the Prompt's own body text, normalised — an exact duplicate ("Hello" over "Hello"); or
2. The Prompt has 2 or fewer `sentence_items` — "a sentence or two" taken literally as the Sentence-object count already used elsewhere in this class (`p.sentence_items`), since that is the natural unit in this codebase, and it keeps the first existing fixture Prompt (3 sentences) showing its title, unchanged.

A real topic card (an AI title, or refined text) always keeps its title, per the ask. A longer untitled dictation (more than 2 sentences) keeps its muted title too, since there it is a genuinely useful one-line preview of a body the reader has to click "show all" to see in full.

## What was built

- `public/framework/ext/Chat/v3/ChatV3.js`: `redundant_title(p)` and `norm_words(text)` (static), called from `prompt()`.
- `public/framework/ext/Chat/v3/ChatV3.test.mjs`: section 7, two live-appended checks — a 1-sentence chit-chat Prompt (no title shown) and a 1-sentence Prompt with refined `text` (title still shown).
- Docs: `public/framework/ext/Chat/v3/readme.md` ("How it works") and `public/framework/ext/Chat/readme.md` ("Next") updated to describe the new behaviour (review findings 2–3).

## Left open (reviewer's notes, not fixes)

- The `sentence_items.length <= 2` rule hides the title of a long two-sentence dictation too (e.g. two long sentences with no pause between them), not just short chit-chat — this matches the owner's literal wording ("a sentence or two") rather than a word-count threshold, and a word-count threshold tried during design (≤20 words) broke the existing fixture's 3-sentence Prompt. Worth a second look if a real long two-sentence case turns up looking wrong.
- That boundary (a long two-sentence Prompt, title still shown or not) is not covered by a test.
