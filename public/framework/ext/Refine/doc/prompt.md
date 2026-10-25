# Prompt — one prompt, seen at every step of its refinement

`PromptRun` (`ext/Refine/PromptRun.js`; was `Prompt` until 2026-10-25, when core `Prompt extends Task` took that name: [core/Task/doc/prompt.md](/framework/core/Task/md/doc/prompt/)) is the class the owner asked for in [the vision](vision-2026-10-08.md): one object per prompt that holds what was said, the cleaned sentences, and the refined cards. You can use it live on the [Refine page](/framework/ext/Refine/).

## What it holds

| Property | What it is |
|---|---|
| `raw` | the words exactly as heard or typed |
| `clean` | numbered sentences: `{ n, text, clarity, weight, flags, alternates, names, card }` |
| `refined` | cards (`{ title, cites, cards }`), each with sub-cards, each citing the sentences it came from |
| `subject` | the outline's heading: what the prompt is about |
| `status`, `ms`, `error` | `empty → working → done` (or `error`), how long it took |

`RefineSystem.go(text)` fills it (via `prompt.load()`); see [architecture](architecture.md). `prompt.flagged` lists the sentences that get the yellow ⚑. `prompt.view` is a `Prompt.View` (the rendered result). The debug tree on the page is the generic `ux/Content/Object/DefaultView` pointed at the same instance.

## How it works (no second pipeline)

Browser → `POST /api/refine` (Servex, `Servex/ext/refine/run.js`) → the same `engine.js` `clean()` and `structure.js` `structure()` that Echo runs → plain data back → `Prompt.load()` → `Scorer.score()`. The route exists only because `structure()` is Node-only.

## Scores: rules, not model calls (decision, 2026-10-08)

The alternative was a Haiku call per prompt. Rules won for the first version: instant, free, repeatable, and they use what the pipeline already reports. The rules live in `Scorer.js`'s comment:

- **clarity** starts at 1 and only goes down: the model said "unsure" (max 0.3), the checker found a word nobody said (max 0.5), a glossary fix (×0.85, a guessed reference), a self-correction (×0.8), under 3 words (×0.7). Under 0.6, or any model/checker question, gets the yellow flag. It never nags: the flag is a tooltip.
- **weight** = how sure the outline placed the sentence (`structure()` confidence: cited once 1, twice 0.4, never 0.2), a little lower for a sub-point, pulled down by low clarity.

## Not built yet (next steps)

- `alternates` (shorter wordings) and `names` (good short names for ideas) exist as empty lists; nothing fills them.
- A Haiku pass for real clarity/weight judgement and per-reference confidence (a path, class or page).
- Per-sentence streaming: today one prompt is refined in one go, after Refine is pressed.
- Hand-off of the refined prompt to an agent, filing requests into inboxes, multi-agent ranking of alternates, VS Code hooks.
- The mic needs the https/LAN setup on a phone: [`dev/mobile`](/framework/dev/mobile/). The text box always works.
