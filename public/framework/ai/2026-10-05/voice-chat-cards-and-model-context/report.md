# Voice/chat cards and model context: what exists, and a proposal

This is a read-only investigation. No code was changed. Each section starts with the answer, then the proposal.

## 1. How the voice/chat system makes and updates cards

**The answer: one writer, one file, one line per change.** A card is a folder under `public/framework/ai/` holding an append-only `page.jsonl`. Only [`Servex/cards/Cards.js`](/Servex/cards/readme.md) writes it. Line 1 names the class (`/framework/ai2/card.js`), and every later line is one change, where the latest line wins.

How voice reaches a card:

- **The owner speaks.** Each sentence becomes a `{"prompt": {id, raw, text, via, on}}` line on the selected card, and the same sentence also goes to `/log/prompts` ([`ai2/doc/cards.md`](/framework/ai2/doc/cards.md)).
- **The fast assistant cleans the sentence**, and its refinement lands as a `{"chat": {level: "summary"|"edit"|"clean"}}` line on the card (`Servex/agents/Sessions.js` `line()`).
- **The page pair's assistant turns the sentence into UI** with the card tools in `Servex/agents/Layers.js`: `card_reply`, `card_set`, `add_item` and `amend_bubble`.
- **Any agent can make a card** with the `create_card` tool, or ask the owner something with `card_ask`.

## 2. The card types that exist

There are two separate layers of "type". They are easy to confuse:

| Layer | The values | Where they are defined |
|---|---|---|
| **The card's own type** (the type picker) | `question` · `request` · `sub-question` · `note` · `task`, plus the default `card` | `TYPES`, [`ai2/card.js`](/framework/ai2/card.js) line 61 |
| **What a card holds** (lines inside it) | `prompt` · `message` (kind: reply, update, task) · `item` (a checklist line) · `ask` (a Question, or a Decision when it has options) · `chat` (a refinement) · `refined` (an older summary) | [`Servex/cards/readme.md`](/Servex/cards/readme.md) "The lines" |

A sub-card that nobody asked anything in is a **topic**. It is listed on its parent but never counted as work to do.

## 3. How a card is amended

**The answer: every part of a card can already be amended, and nothing is ever overwritten.**

| What you want to change | The line or tool that changes it |
|---|---|
| Title, type, tags, status | `{"title"}` · `{"type"}` · `{"tags"}` · `{"status"}`, where the latest line wins (`card_set`) |
| The cleaned reading of one prompt | another `prompt` line with the **same `id`**, merged into it field by field |
| A chat bubble | `amend_bubble`: sections with checklists, each citing the prompt ids it came from, while the raw prompts stay in the log |
| One checklist line | `add_item` with the same `id`, plus `done` and `proof` |
| A reply to one specific line | `message` with `re` set to that line's id (a threaded reply) |

**The gap:** a `message` cannot be edited after it is written. The chat keeps a `fix` at the same `at`, but cards have no equivalent. **The proposal:** let a `message` line with an existing `id` merge into the earlier one, exactly the way `prompt` already does. That is one rule in `Card.set()`, with no new verb.

## 4. Can a card shrink to an icon and a name?

**The answer: yes, and two pieces of it already exist.**

- **Cards already carry an icon.** `card.js` line 761 draws `this.icon`, falling back to the group's icon, and then to `type_icon(type)`. The `/cards` row (line 71) is already icon + title + what it is. Topic stubs are already just `{title, icon}`.
- **`ext/Mention` already draws icon + word.** It turns `#Page` into a small icon followed by the page's name, as a link.

**The proposal: a third face of a card, called the chip, built on Mention rather than as a new component** (law 6). `faces.js` already holds the card's two faces, the preview and the full page, so the chip goes there too. It shows the card's icon (from the same fallback chain) and its title, and links to the card's url. A card mentioned in chat, or a card the assistant sends back as its whole reply, draws as a chip.

Setting the icon is one line, `{"icon": "mic"}`, where the latest line wins. Per the voice-assistants brief, the fast assistant already does "a name and an icon".

## 5. Every request visibly tracked, with a proposal before work starts

**What already exists, and is reused here:** the asks ledger (`ai/asks.jsonl`, plus stalled detection in `Servex/asks/`), `card_ask` with the **Waiting on you** list, `refine.mjs` (brief + `coverage.md`), and `add_item` checklists.

**The proposal: one request becomes one sub-card, and its first state is "proposed".**

1. **Heard.** The owner says something actionable. The fast assistant shows a ✓ and creates a sub-card of type `request` titled "<module>: <outcome>". It then adds the request's line to `asks.jsonl`, with status `proposed`.
2. **Proposed.** The smart assistant writes the proposal on that sub-card as `add_item` lines: the plan's steps, which files, which model, and the cost estimate. It then sets the status to `proposed`. The rail shows the sub-card as a chip with a "proposed" badge.
3. **Started, with no approval gate** (law 5). Work starts on its own after a short hold. **Default: 2 minutes, or immediately when the owner says go.** During the hold, the owner can see the proposal and change it by speaking (the same request id, merged in). The spawn's brief is the sub-card's path. The status becomes `building`, and the asks ledger takes over stall detection from here.
4. **Landed.** `finish-task` ticks each item with its proof, and the chip turns to ✓.

The alternative is no hold at all, with the proposal written but work starting at once. That is safer for law 5 but gives no window to change course. The 2-minute hold is cheap, and it can be set per session.

## 6. Can switching the model template reuse the full SDK log?

**The answer: very probably yes, for every Claude ↔ OpenRouter switch, but today the code deliberately refuses.**

- **What happens today:** `Sessions.js` `wake()` resumes the old SDK session only while the provider stays the same. When the provider changes (Claude → OpenRouter, or a fallback after a usage refusal), it clears `backing`, then starts a **fresh** agent with only the **last 40 lines** of the voice-session file (`tail(s, 40)`). Every tool call, file read and decision before those 40 lines is lost.
- **Why reuse looks possible:** OpenRouter agents run through the **same Claude Agent SDK**. Only `ANTHROPIC_BASE_URL` and the token change (`Servex/ext/openrouter/provider.js` `env_for()`). The voice-assistants brief says it directly: "an OpenRouter model run through the SDK makes the same kind [of session] (same files, same ids)." The same `cwd` (the repo) means the transcript `~/.claude/projects/<repo>/<uuid>.jsonl` is still findable. In other words, `resume: <uuid>` under the new model replays the full log.
- **The risk is why the code refuses:** a Claude transcript contains **signed thinking blocks**, and a non-Anthropic model behind OpenRouter may reject them or mishandle them. A long Claude history may also exceed a smaller model's context window.

**The proposal:**

1. **Prove it with one cheap test** before changing anything: resume a real 20-turn `session-smart` uuid with `fork: true` on `openai/gpt-6-luna`. Ask it about something from turn 3, and check that the answer is right, that nothing errors, and what the turn cost. `fork: true` leaves the original session untouched.
2. **If the test passes:** a template switch passes `resume: old, fork: true` instead of a tail, and the `backing` line records `how: "fork"`.
3. **If thinking blocks are rejected:** fork the transcript with its thinking blocks stripped. That is a node script (law 7) that copies the jsonl to a new uuid. Resume from the copy.
4. **Keep `tail(s, 40)` as the fallback** whenever the resume errors. This also covers `local/qwen2.5-coder`, whose small window cannot hold the full log anyway.

**Templates themselves:** today the switch is one text file, `session-backend.txt` (`claude` / `openrouter` / `local`). A template is a named row: a model and a brief for each role. The proposal is that `SESSION_BACKENDS` becomes a small `templates.json`, read by `session_model()`, so one dropdown picks a template and the session records which one it used.

## Recommended order

1. The cross-provider resume test (§6.1). It is small, and it decides the most.
2. Message merge by id (§3). One rule.
3. The chip face in `faces.js`, built on Mention (§4).
4. Request sub-cards with the "proposed" state and the 2-minute hold (§5). This touches the fast/smart briefs and `asks.jsonl`, and belongs with the queued voice-assistants task (`ai/2026-10-04/voice-assistants`) rather than a new parallel one.
