# Every prompt kept in its session's log (2026-10-10)

**What:** a prompt refined on the Refine page is saved in the session's own folder, in `prompts.jsonl`, in stages. Nothing is ever overwritten.

| Stage | Holds | Rule |
|---|---|---|
| `raw` | the words as heard | immutable: a second raw is refused |
| `clean` | numbered sentences | final once `final:true` |
| `refined` | cards citing sentence indexes | later line wins |
| `notes` | per sentence: clarity, alternates, names, tags | later line wins |

Cites in the log are 0-based (`clean[i]`); the screen shows `S` numbers (index + 1). The format and checks live in [`ai/AISession/PromptLog.js`](/framework/ai/AISession/) (its class comment is the spec). `Prompt.from_log` replays a saved prompt into the Refine view.

**Who writes it:** `POST /api/refine` (`Servex/ext/refine/run.js`) when the page sends a `session` (the page keeps one uuid in `localStorage["refine.session"]`). `Annotator` (Haiku 5.5, batched by size, far under 60k tokens) adds alternates, names and tags. Echo stays off. A failed log write never fails the refine (`log_errors` in the answer).

**Not built yet:** per-sentence streaming (plan: interim `clean` lines with `final:false`, tailed with `live()`); a Refine button per VS Code prompt; the cold-cache cost (about $0.30–0.43 per refine, see [refine v3](/framework/ext/Refine/md/doc/refine-v3-2026-10-09/)).

**Going live** needs a Servex restart: the route runs in the Servex process.
