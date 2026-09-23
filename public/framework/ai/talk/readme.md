# Talk — press the mic, talk, see your words

One page, two things on it: a big microphone button, and under it one card that fills with
what you say as you say it. Open it at [`/framework/ai/talk/`](/framework/ai/talk/), or click
**🎤 talk** on the AI board's top line.

Built 2026-09-22 from the owner's own sentence: *"I push the microphone button and I talk and
I see my words on the screen… Without shit jumping around."*

## What happens when you press it

1. **You talk.** `ux/Dictate` records and re-sends the growing sentence to whisper running on
   this machine roughly twice a second, so a **grey guess** appears in the card almost at once.
2. **A sentence finishes.** The grey is replaced by the real words, in solid ink, and the next
   sentence starts underneath it. Text only ever appends — nothing above it moves.
3. **The assistant answers.** Every finished sentence also goes to Servex's prompt log, and a
   second or two later the fast assistant sends back a **title** (which becomes the card's
   heading) and the **names** it heard (which become the chips under the text). Both land *in
   place*, in the card you are already looking at, never as a second card.
4. **If you asked for something built,** a status strip appears under the heading: grey
   `queued`, then a pulsing dot while a task mastermind actually works on it (with its own
   live one-line progress), then green `landed` with a link to the finished page, or amber
   `blocked` with the reason. A remark or a question never grows a strip at all — see
   [`card-to-task`](/framework/ai/2026-09-22/card-to-task/) for the whole loop.
5. **"New card"** finishes the one you are on and starts a fresh one below it. Nothing you have
   already said is ever removed.

## Use

Nothing imports this — it is a page, not a component. What it is built from:

- `ux/Dictate` is the microphone, used unchanged. `TalkMic` is a four-line subclass whose only
  job is to redirect the live guess into this page's card: see
  [`ux/Dictate`](/framework/ux/Dictate/) for the engines, the hotkey and the pause rules.
- `v/3/prompts.js`'s `prompt_stream()` is the live connection to Servex — shared, so this page
  opens no second socket.

## Watch out

- **The card must never move** — that is the whole feature, and it is fragile in an obvious
  way: anything above the card that can change height will shove it. Read
  [`doc/no-jump.md`](doc/no-jump.md) before touching the head, the heading or the chip row; it
  has the shape, the reason and the five measured numbers.
- **Servex may be down.** Nothing here waits for it. The microphone and the card work exactly
  as they do now; the heading just stays on `listening…` and no chips arrive.
- **`re` is not one shape.** A `name` line points back with a bare id, a `card` line with an
  array of them. `refs()` in `page.js` is the only place that knows this — reading `e.re` as a
  string alone silently drops every title (measured on the live log, 2026-09-22).
- **A `task` line points at the CARD's id, not the prompt's.** It is matched on `card_id`
  (`TalkCard.headline()` remembers it), never on `ids` — the same set a `name`/`prompt` line
  matches by. Mixing the two silently drops every status update.
- **The landed link is a regex guess against the task mastermind's own `now` text**, not a
  structured field — it only shows for `state: "landed"`, so a working line that happens to
  mention a path never grows a stray link.

## More

- [`doc/no-jump.md`](doc/no-jump.md) — why the card's top edge holds still, and the numbers.
- [the task](/framework/ai/2026-09-22/talk/) — the brief, the decisions, the proof run.
