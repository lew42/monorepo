# Refine stages — the live stages of a voice prompt

Each stage of a spoken prompt (raw, things you mentioned, clean, structure, refined, cards) is drawn live on the session page by its own class. Servex writes them as page deltas; the browser tails them.

- `VoiceStage.js` — base class + `VoiceStage.View` (one stage's box and header).
- `RawStage.js`, `ThingsStage.js` (no model: links the named modules as you say them, from `things.json`; rebuild with `node ThingsIndex.mjs`), `CleanStage.js`, `StructureStage.js`, `RefinedStage.js`, `CardsStage.js` — one per stage, each with its own `.View`.
- `VoicePrompt.js` — one prompt's data (`apply(delta)`) and its view with the six stages.
- `VoiceFlow.js` — folds the session page's lines into prompts; mounted above the chat on `ai/AISession`.
- `Compose.js` — DOM-free text builders shared with Servex (`Servex/ext/refine/VoicePage.js`).

More: [`doc/voice-to-page.md`](doc/voice-to-page.md) (class map, wire format, decisions) · try it: [`ux/Dictate/doc/try-it.md`](/framework/ux/Dictate/doc/try-it/).
