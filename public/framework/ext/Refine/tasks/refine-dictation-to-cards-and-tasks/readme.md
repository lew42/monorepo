# Refine: dictation to cards and tasks — the six subtasks, in the order to do them

Source: the owner's dictations of 2026-10-16 (`ext/Refine/doc/card-types.md`, including the night addendum "one assistant, one pass, by sentence"; `core/Task/doc/owner-2026-10-16-top-down.md`; `ai/doc/owner-2026-10-16-indexing.md`). Ranked 2026-10-17 by the checkup: the owner's emphasis first (one pass per sentence, the visible Whisper-to-LLM line), then what unblocks the rest. Each alternative order was weighed; the cards come last because they wait on the open Item / List persistence question.

| # | Subtask | Why here |
|---|---|---|
| 1 | [A placement step per sentence after cleaning](a-placement-step-per-sentence-after-clea/) | The owner's night rule is clean, structure, place, once per sentence. Placement is the missing third step, and every card feature below needs a placed sentence. **Started** (one Sonnet minion, brief beside the task). |
| 2 | [The input box shows Whisper typing and clears when sent](the-input-box-shows-whisper-typing-and-c/) | Small and visible; lets the owner see where Whisper ends and the LLM begins. The raw Whisper reply is now saved too (`audio/Whisper/doc/raw-log.md`), so the box can show it. |
| 3 | [Refine looks up past work as a step](refine-looks-up-past-work-as-a-step-then/) | Independent; `Server/PastWork.mjs` already searches the indexes, so the step is a wire, not a search engine. |
| 4 | [The selected card is the voice context](the-selected-card-is-the-voice-context-a/) | Needs placed sentences (1) to have a card to select. |
| 5 | [A decision holds a ranked live list of options](a-decision-holds-a-ranked-live-list-of-o/) | `List` is live already; needs card types from 1 and 4 first. |
| 6 | [Interactive cards: buttons, forms, saved data](interactive-cards-buttons-forms-and-data/) | The owner says the data structure is undecided (JSONL appends with `live()` versus a database); last until `core/Task` settles it. |

Voice side (spoken replies, barge-in): [audio/Voice/tasks/](/framework/audio/Voice/tasks/). Next to this: [doc/card-types.md](/framework/ext/Refine/doc/card-types.md).
