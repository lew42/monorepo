# Refine — the class architecture

Read this first. One system, a handful of small classes, one boss. Written before the demo was reshaped (owner rule, 2026-10-08); the demo's class card draws this same table from `RefineSystem.parts`.

## The boss: `RefineSystem`
`RefineSystem` (`ext/Refine/RefineSystem.js`) orchestrates one prompt at a time. It **composes** the parts below, owns the one live `Prompt`, and is the only thing a page talks to: `go(text)`, `next()`, `prompt`. The demo page is just a view of it.

## The parts

| Class | Job (one line) | Relation | State |
|---|---|---|---|
| `RefineSystem` | runs one prompt through the steps and owns the live `Prompt` | composes all below | built |
| `Prompt` | the in-memory prompt: `raw`, `clean` sentences, `refined` cards, scores, flags | plain data; has a `Prompt.View` | built |
| `Prompt.View` | draws a `Prompt`: raw, clean with ⚑ flags, cards with `S#` links | extends `View` | built |
| `Scorer` | rules that give each sentence `clarity` and `weight` and its flags | used by `Prompt.load()` | built |
| `Cleaner` | raw → numbered near-verbatim sentences (`engine.js` `clean()`, run by Servex) | a step of `RefineSystem` | exists as a function; named here |
| `Structurer` | sentences → outline of cards that cite them (`structure.js` `structure()`) | a step of `RefineSystem` | exists as a function; named here |
| `DictationSource` | where words come from: the mic (`ux/Dictate`) or the text box | wraps `Dictate` | the demo wires `Dictate` directly |
| `Echo` | the same steps run on every VS Code prompt (`Servex/agents/Echo.js`) | a second caller of Cleaner + Structurer | built, separate |

Not classes yet, on purpose: `Cleaner` and `Structurer` stay the two functions that already work. Wrapping them in classes is one small step, taken when something needs more than a call (per-sentence streaming will).

## What extends what, what composes what
- `Prompt.View` extends `View` (house pattern: `Prompt.View = …` after the class, `prompt.view`).
- `RefineSystem` composes `Prompt` + `Scorer` + the Servex call (`Cleaner` then `Structurer`) + the dictation source. Nothing else extends anything: data and boss, no inheritance tree.
- The debug tree on the page is the generic `ux/Content/Object/DefaultView` pointed at the live `Prompt`.

## Prompt and the session record
The **session owns the record**: the raw words and the clean sentences are logged lines in the session (Servex's prompt log, `ux/Dictate`'s `post_prompt`). `Prompt` is the **in-memory object** built from them (or from a live dictation) so a page can show and score it. It never replaces the record; when a session id exists it should carry it as a reference (not built yet: the demo prompt belongs to no session).

## Names considered and rejected
- Boss: `Refinery` (cute, less clear), `Refiner` (reads like a step), `Pipeline` (generic, hides that it owns state). `RefineSystem` is the owner's own word for this role.
- Scores: `Judge` (suggests a model), `Meter` (too small); `Scorer` says what it does.
- Data: `Utterance` (speech only; the class also serves typed and VS Code prompts), so `Prompt` stays.
- Steps: `Cleaner`/`Structurer` over `Tidy`/`Outline`, because `tidy.js` and `Outline` already mean other things here.
