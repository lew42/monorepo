# Prompt refinement map: every mechanism that cleans or breaks down an owner prompt

Eight mechanisms touch an owner's prompt, and they write to different files. This page lists them, says how they differ, and flags the overlaps. Verified against the code on 2026-10-24.

## The mechanisms

| # | Mechanism | Runs when | Model | Writes (exact file) | What it does |
|---|---|---|---|---|---|
| 1 | **Hook** [`.claude/hooks/prompt-relay.mjs`](/.claude/hooks/prompt-relay.mjs) | every prompt typed in the owner's own VS Code tab | none | `ai/sessions/<day>/<session>/page.jsonl`: one `Prompt` item (`page_add`) | Saves the raw words. No cleaning. Everything below hangs off this line. |
| 2 | **PromptTasks, `live` process** [`Servex/agents/PromptTasks.js`](/Servex/agents/PromptTasks.js) + [`PromptRecords.mjs`](/Server/PromptRecords.mjs) | when `page_add` lands that `Prompt` (`hooks.prompted`), human turns of a VS Code tab only, prompts of 30+ characters | Haiku (`claude-haiku-5-5`), one call, no tools | session's `prompts.jsonl` (`raw`, `clean`, `parts` lines); each top-level ask becomes an `idle` task in the session's `session.jsonl`, at most 15 | **The one breakdown that feeds tasks.** Numbered sentences (code), then parts with kinds and cites (model). |
| 3 | **PromptRecords, `review` process** `node Server/PromptRecords.mjs <session> --process review` | by hand, after the fact | Haiku for parts; Haiku with Read/Grep for outcomes (one call per ~150k-character window of the session) | same `prompts.jsonl` (`parts` lines with outcomes); with `--file`, tasks in `session.jsonl` | Same parts step as 2, plus what came of each part. Asks and rules still open are filed. |
| 4 | **RefineQueue** [`Server/RefineQueue.mjs`](/Server/RefineQueue.mjs) | by hand (`--days 7 --limit N`) | Haiku, one call per prompt | a `refined` card on the session page (`page_add`), `ext/Refine/queue/runs.jsonl` (cost) and `queue/asks.jsonl` (one line per ask) | The older breakdown of past prompts into cited cards (the Coverage tab's "refined" cards); no outcomes. |
| 5 | **PromptAudit** [`Server/PromptAudit.mjs`](/Server/PromptAudit.mjs) | by hand (`--days 7`) | pass 1 Haiku per prompt; pass 2 Sonnet, one agent per session | `<session>/prompt-audit.jsonl`, `<session>/prompt-review.jsonl` | Sorts every prompt into tasks, questions, statements, updates, then judges each against what the session did. Files nothing. Its prompt filter (`PromptAudit.prompts`) is used by 2 and 3. |
| 6 | **Echo** [`Servex/agents/Echo.js`](/Servex/agents/Echo.js) | live, for an assistant session (one always-up agent per owner session) | `clean()` and `structure()` on the local `qwen2.5-coder` first, Anthropic if it fails; the per-session agent judges `topic`, `references`, `asks_flags` | `refine_step` lines in that assistant's log | Mechanical clean and outline, then a model names the topic, the pages involved and sizes the asks. |
| 7 | **Live dictation** Whisper in [`ux/Dictate`](/framework/ux/Dictate/) → `POST /api/refine/live` → [`LiveRefine.js`](/Servex/ext/refine/LiveRefine.js) (also `run_refine` behind `/api/refine`) | while the owner speaks | Haiku, one batched call per few seconds; optional per-sentence clean ([`LiveClean.js`](/Servex/ext/refine/LiveClean.js)), notes ([`Annotator.js`](/Servex/ext/refine/Annotator.js)), clarity ([`ClarityScorer.js`](/Servex/ext/refine/ClarityScorer.js)) | the session's `prompts.jsonl` (`raw`, `clean`, `refined`, `notes` stages) and the page via [`VoicePage.js`](/Servex/ext/refine/VoicePage.js) | Places each finished sentence into an outline as it is said. `TagRouter.js` sends tagged cards to the pages they name; `CardAsk.js` turns a card into a board card. |
| 8 | **Day batch tools** [`refine.mjs`](/Server/refine.mjs), [`refine-days.mjs`](/Server/refine-days.mjs), [`DayPromptsRefine.mjs`](/Server/DayPromptsRefine.mjs), [`refine-litmus.mjs`](/Server/refine-litmus.mjs) | by hand | Haiku (`refine.mjs`, `refine-days.mjs`); local qwen2.5-coder (`DayPromptsRefine.mjs`); litmus compares three cheap models | `refine.mjs`: its `--out` folder (`raw.txt`, `clean.md`, `structured.md`, `brief.md`, `coverage.md`, `refine.json`); `refine-days.mjs`: `ext/Refine/runs/<day>/`; `DayPromptsRefine.mjs`: `sentences` lines on old card pages | Retroactive clean, structure and brief for whole past days. |

Not a breakdown, but nearby: the **`refine_step` tool** is only how Echo's agent writes its three judgment lines (mechanism 6); the **cloud voice agent** ([cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md)) forwards speech to `ask_mastermind` and does not refine; **[`PromptLog.js`](/framework/ai/AISession/PromptLog.js)** is the file format for `prompts.jsonl`, not a mechanism.

## The flow that matters (mechanisms 1 to 3)

```
owner types a prompt in a VS Code tab
  → hook (prompt-relay.mjs)         one Prompt item on the session's page.jsonl           THE one writer of the raw prompt
  → page_add fires hooks.prompted   (page_tools.js)
  → PromptTasks.prompted            only owner, only a human turn (turnOrigin), 30+ chars, switch on
  → PromptRecords "live"            sentences (code) → parts (Haiku) → file
       prompts.jsonl                raw, clean sentences, parts {id, cites, kind, text, outcome, parts[]}
       session.jsonl                one task per top-level ask (source {session, line, prompt, part}), max 15
  → Prompt (ext/Refine/Prompt.js)   computes completion from the parts and those tasks' states
  → session page, Coverage tab      AISessionCoverage.js draws it
```

In the session-is-a-task design the session's own `session.jsonl` already carries its tasks, so a `Prompt` instance is the parts of one prompt joined to the tasks that carry them (`source.prompt` and `source.part` are the join). The hook stays the only writer of the raw words; `PromptRecords.sentences` only copies them into `prompts.jsonl` once. Detail: [prompt-records.md](/framework/ext/Refine/doc/prompt-records.md).

## Overlaps worth merging

1. **RefineQueue (4) and PromptRecords (2, 3) both run one Haiku call per prompt to break it into cited cards.** PromptRecords is the newer one, adds kinds, nesting, outcomes and tasks, and measured 100% sentence coverage. Recommendation: retire the RefineQueue breakdown for new prompts and read old `refined` cards as history; keep its prompt filter.
2. **PromptAudit (5) pass 1 does the same sorting as the parts step**, with kinds `task/question/statement/update` instead of `ask/rule/question/idea`. Recommendation: stop running it; `PromptRecords --process review` replaces both passes and its outcomes step replaces pass 2. Keep `PromptAudit.prompts/locate/read/json` as the shared helpers (PromptRecords imports them).
3. **Live dictation (7) and Echo (6) both clean and outline a prompt as it arrives**, with two code paths (`LiveRefine` and `run_refine`/`Echo`) calling the same `clean()` and `structure()`. Recommendation: one path, `LiveRefine`, writing `prompts.jsonl`; Echo keeps only its judgment (topic, references, ask sizes) if it is still wanted.
4. **Day batch tools (8) are a third and fourth way to refine past days** next to RefineQueue and PromptRecords review. Recommendation: replace them with `PromptRecords --process review` over the day's sessions; keep `DayPromptsRefine.mjs` only if the local model's $0 matters (see "What stays Haiku").

## What stays Haiku

The retroactive days (mechanisms 3, 4, 8) stay on Haiku whatever the live process uses: they run in bulk over hundreds of prompts, and the owner asked for Haiku there. In the measured run below the dollars the SDK reported were higher for Haiku 5.5 than for Sonnet 5.5, which does not fit the per-token prices in [models.md](models.md) (Haiku is 20 times cheaper per token). The likely cause is an unknown model id priced with a fallback rate, so recompute the cost from token counts with the script before the next bulk run and do not take the dollar gap as a fact.

## Model comparison: Haiku 5.5 against Sonnet 5.5 on the parts step

| Prompt | Chars | Sentences | Haiku parts / asks / $ | Sonnet parts / asks / $ | Coverage (Haiku / Sonnet) |
|---|---|---|---|---|---|
| 4d2d4974 | 450 | 7 | 3 / 0 / $0.037 | 3 / 1 / $0.0071 | 100% / 100% |
| a9198354 | 739 | 12 | 6 / 3 / $0.0904 | 5 / 2 / $0.0249 | 100% / 100% |
| 86261a04 | 1526 | 16 | 11 / 4 / $0.1581 | 10 / 3 / $0.037 | 100% / 100% |
| d3e202fd | 2281 | 24 | 14 / 8 / $0.1683 | 12 / 8 / $0.0375 | 100% / 100% |
| 73082125 | 2473 | 28 | 8 / 0 / $0.0711 | 6 / 0 / $0.0267 | 100% / 100% |
| 9162c602 | 1893 | 25 | 14 / 8 / $0.1261 | 11 / 7 / $0.0352 | 100% / 100% |
| 7b07a33b | 4822 | 46 | 28 / 15 / $0.1946 | 15 / 10 / $0.0573 | 100% / 100% |
| c210bb26 | 5395 | 55 | 22 / 4 / $0.2883 | 22 / 9 / $0.0733 | 100% / 100% |

Total cost for the eight prompts: Haiku $1.13, Sonnet $0.30. Raw numbers and every ask: [results.json](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-breakdown/compare/results.json); script: [Server/PromptRecordsCompare.mjs](/Server/PromptRecordsCompare.mjs) (read-only: it calls the same `PromptRecords.ask` and `PARTS_BRIEF` and writes only its output folder).
(Asks and parts count nested ones too.)

Eight real prompts from tab `e00f55c9` (7 to 55 sentences; five have 15 or more), the same loosened `PARTS_BRIEF` of 2026-10-24. Coverage is the share of sentences cited by at least one part.

**Reading the asks by hand (from results.json):**
- **Two wants merged into one ask.** Haiku: 2 cases (`c210bb26` sentences 40-42, the minion writes to its log AND the mastermind tails it; `7b07a33b` 41-43, tag modules and show them as tags). Sonnet: 6 cases (`7b07a33b` 14-16, the audit file plus its name; 20-21; 22-24; 25-32, Sonnet reads the audit plus how to handle the results; `c210bb26` 40-42, and 52-54, the DNS permission plus the remote.url).
- **Asks missed.** On the 55-sentence prompt `c210bb26` Haiku found 4 asks and Sonnet 9: Haiku dropped "explain how sessions and tasks are saved and nested", "the difference between a session and a task" and the DNS-token ask. On the 46-sentence prompt Haiku listed 15 asks, several of them fragments of one want.
- Both cited every sentence in every prompt (100%), so coverage does not tell them apart.

**Recommendation: Sonnet 5.5 for the live process, with one known cost: it merges two wants into one ask more often than Haiku on long prompts (6 cases against 2), which the "never merge" line does not fully stop.** The SDK reported $0.30 for Sonnet against $1.13 for Haiku, but by [models.md](models.md) Haiku should be 20 times cheaper per token, so treat that dollar gap as a pricing artefact, not a finding. Sonnet cited everything, and found more asks on the hardest prompt. Haiku is enough for short prompts (under about 20 sentences, where the two agree within one ask) and is not enough for long ones: it dropped about 5 asks on the longest. This is one run of eight prompts, a small sample; rerun the script before changing a default. **The default has not changed:** `live` in `PromptRecords.mjs` still runs the parts step on Haiku; switching it to Sonnet is a one-line change for the owner to decide.

