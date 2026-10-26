# The fast and smart seats: who does what in the dictation chat

Status: design, 2026-10-25, by the AI system architect. Nothing here is built; it answers the owner's question "what does each seat do, and what should it do?". The wake settings (`every`, `gap_ms`) are another task's (task-mastermind-2) and are not repeated here: [wake-policy.md](wake-policy.md).

**In one line.** Two models listen to every voice session. The **fast seat** tidies and files each piece of speech the moment it arrives. The **smart seat** reads what the fast seat did, then decides what the words mean: titles, a refined prompt, questions, tasks. Code (not a model) cuts the speech into chunks, opens the Prompt and counts what is done.

## 1. What each seat is today

| | Fast seat | Smart seat |
|---|---|---|
| Role / prompt | `voice-assistant`, prompt [`.claude/skills/voice-assistant/SKILL.md`](/.claude/skills/voice-assistant/SKILL.md), loaded by `voice_brief()` (`Sessions.js:1203`). The default since 2026-10-17 (`Sessions.js:70-85`). The older chatty `session-fast.md` is only the escape hatch (`fast` in `session-assistant.txt`) | `session-smart`, prompt [`Servex/agents/session-smart.md`](/Servex/agents/session-smart.md) appended to the full Claude Code preset (`Sessions.js:1256-1260`) |
| Model | `claude-haiku-5-5`, tier `fast` (`tiers.js:6`) | `claude-sonnet-5-5`, tier `voice_smart` (`tiers.js:12`); the same Sonnet when over pace (`manager`, `Sessions.js:1219`). `session-smart.md:1` still says "Opus 5.5": stale |
| Effort | `low`, written in the spawn spec (`Sessions.js:1236`) and `roles.js:98` | `medium` (`Sessions.js:1256`, `roles.js:99`) |
| Tools | none except Servex's door for the item tool; no settings, no memory (`Sessions.js:1237-1240`) | everything: files, `spawn_agent`, `item`, `quick_fix`, `owner_note`, `session_summary` (`session-smart.md:1-15`) |
| Woken | once per released thought, with the whole prompt so far plus the new sentence(s) (`voice_say`, `Sessions.js:457`) | in a batch from the wake gate (`feed_smart`, `Sessions.js:265`) |
| Writes | one `{place}` per sentence, a `Question` for a "?" sentence (`SKILL.md:15-34`); never chat | refined title and text on the Prompt, replies, answers, tasks, the `working` sign, `session_summary`, and chat text (`session-smart.md:62-73`) |

Not seats: the page assistants in `Layers.js` (`card-assistant`, `:637`) belong to cards, not dictation; and a third writer, code, runs the shared Refine engine on each finished line (`Sessions.refine`, `Sessions.js:985`, `worth_refining`: two sentences or 15 words), which writes `refined` lines with its own model calls.

## 2. Job by seat: today against your picture

| Job | Today | Your picture | Gap |
|---|---|---|---|
| Cut the stream into chunks | Browser `Mic.js` sends at `. ! … ?`; comma is **off** (`send_on_comma: false`, `Mic.js:30`); 2 s quiet sends the rest (`:16,19`) | every comma/period/question chunk to fast | One switch, but a comma chunk is a Haiku call and a chat line each |
| How fast the fast seat hears it | A spoken line with a floor is **held** until 2.5 s quiet (`answer_quiet_ms`, `Sessions.js:246,998-1002`), max 8 s; only then `voice_say` (`:1148`) | immediate, no pause | Not quick today: the fast seat hears a whole thought, not a chunk |
| Capitalize, punctuate, drop fillers | Fast, via `edit: improve` + cleaned `text` (`SKILL.md:20`) | fast; smart may too | Matches. Smart's prompt never says it may fix them |
| Fix a mis-heard known word ("surveys" for Servex) | Only the dormant `session-fast.md:9` did, and only when named. The voice prompt has no such rule | fast, "upgrading from known references" | **Missing** from the live fast prompt |
| Turn a sentence into a question | Fast fixes the "?" in `text` and files a `Question` (`SKILL.md:26-34`); smart may file one too, checks for a duplicate first (`session-smart.md:68`) | fast makes it a question | Matches; two writers, one duplicate rule |
| Group into the open prompt or a new one | **Code** decides the Prompt: `assign_prompt` merges lines into the open Prompt until the thought is released (`Sessions.js:475-485,1139`). Fast decides only paragraph/card *inside* it (`to: same|paragraph|card`, `SKILL.md:18`). `chat-shape.md:17` says the fast seat makes the Prompt: not true | fast groups into open or new prompt | No seat decides "new prompt"; code does, by silence |
| Titles | Fast: `title` on a `place` card, 2-5 words (`SKILL.md:21`). Smart: `title` on the Prompt (`session-smart.md:66`) and `session_summary`. But `SKILL.md:34` and `session-smart.md:73` say the fast seat never writes a title | fast first-pass, smart improves | The fast prompt contradicts itself; two title places, no rule on who wins |
| Refined prompt from the raw wall | Smart (`session-smart.md:66`); also code-side `refine()` | smart | Matches, plus an unmentioned third writer |
| Tasks | Smart only (`session-smart.md:71`) | smart | Matches |
| Second pass on the fast seat's work | In batch mode the smart seat **never sees the `{place}` lines**; only raw owner lines (`feed_smart`, `Sessions.js:277`). Tail mode (opt-in, off) delivers them (`wake-policy.md:35`) | smart reviews what fast did | **Not wired by default** |
| "Handled" | Three meanings, none of them "done" (below) | smart decides how each prompt is handled | Undefined |

**What "handled" means today.** (a) The grey-to-green and grey-to-pink marks are `{sent}` lines: "delivered to that seat" (`mark_sent`, `Sessions.js:622`), not "dealt with". (b) `handled {to, note}` is a Prompt field for the prompt-hook path (`PromptLog.js:18`); no voice-seat prompt writes it. (c) `session-smart.md:23` tells the smart seat to "mark it handled" when woken per sentence, but there is no such mark; the real behaviour is an empty reply.

## 3. Recommended split

Rule: **fast = per chunk, mechanical, reversible; smart = per thought, meaning, ownership.** Code owns chunking, the Prompt id and every count (law 7).

| Job | Owner | Smallest change |
|---|---|---|
| Chunk, Prompt id, "sent" marks, "handled" | **Code** | "Handled" becomes computed: a Prompt is handled when every Question under it is answered and every task under it has an owner (started, or a child session). Seats never set it. Reword `session-smart.md:23` to "end with an empty reply" |
| Punctuation, capitals, fillers, known-name fixes, "?" | **Fast** | `SKILL.md`: add one line in `edit`: "fix a word that is a speech-to-text slip for a name in the module index (Servex, page.js, Whisper) in `text`" |
| Same paragraph / new paragraph / new card | **Fast** | none |
| First-pass title | **Fast**, on the `place` card only | `SKILL.md:34`: change "never write a card's title" to "never replace a title the smart seat wrote" (latest `by: smart` wins) |
| Question item for a "?" sentence | **Fast**; smart files only questions the fast seat missed | none (already the rule since 2026-10-25) |
| Second pass, better title, refined text, replies, answers, tasks, sub-sessions | **Smart** | `session-smart.md`: add "you may correct a `{place}` the fast seat wrote: the latest `place` line for a sentence wins (`voice-assistant.md:24`)" |
| Seeing the fast seat's lines | code | **Turn tail mode on** for dictation sessions (`settings {tail: true}`, built, `Sessions.js:299`) or have `feed_smart` append `(fast placed a1: same; a2: card "…")`. Tail mode is the smaller step |
| Stale heading | docs | `session-smart.md:1` "Opus 5.5" to what `tiers.js` says |

## 4. Model, prompt and effort: what to try

Your lean: start high, measure latency and cost, trim where it does not hurt; keep the fast seat fast.

| Seat | Today | Start with | Trim rule |
|---|---|---|---|
| Fast | Haiku 5.5, low | **Keep Haiku 5.5.** Trial: Haiku at medium, and Sonnet at low, against it | Latency to place decides: if p50 is over about 2 s, or accuracy gains under 5 points, go back to Haiku low |
| Smart | Sonnet 5.5, medium | Opus 5.5 at high (the model its own prompt still claims) | Step down to Sonnet high, then Sonnet medium, as long as titles/tasks/refined text still agree with the high run on the replay set; check `node Server/usage-now.mjs` before each arm |

Today model and effort cannot be changed per session: effort is written into the spawn spec (`Sessions.js:1236,1245,1256`), the model comes from `tiers.js` (global) or the global backend file (`session_backend`, `Sessions.js:185`, values auto/openrouter/local). `settings()` (`Sessions.js:297`) takes only `gap_ms`, `every`, `tail`.

## 5. How to experiment safely

Rule: never edit `tiers.js` or a live prompt to test; that changes every session and a live call. Four safe moves, in order of effort:

1. **A private Servex from a worktree** (works today, no code). Edit `SKILL.md` or `session-smart.md` in a worktree, boot a private Servex on another port from it ([Servex/readme.md](/Servex/readme.md), "tested before they touch the live system"), open a new ✦ session there. Only that session's seats change.
2. **Per-session model and effort** (small change, proposed): `settings {session, fast: {model, effort}, smart: {model, effort}}` stored on the session and read by `session_model()`/the spawn spec; applies when the seat next starts (`stop` then wake, `Sessions.js:1333`). Use one test session per arm.
3. **Swap a prompt file** (small change, proposed): `voice_brief()` and `brief()` read a fixed path (`Sessions.js:1200,1204`); allow a per-session override path so two prompts run side by side.
4. **Replay a recorded session** (proposed script, e.g. `Servex/agents/seat-replay.mjs`): take the owner `chat` lines of a real `session.jsonl` (`owner_lines`, `Sessions.js:~435`), post them into a test session through `say()` with their original `said_at` gaps, and diff the new `place`, `Question`, `refined` and task lines against the recorded ones. The precedent is `wake/replay.mjs` ([report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/wake/report.md)), which replays real sessions through the wake gate with a fake clock and no model; a seat replay needs the real model, so it costs sentences times the per-call price.

**Measure, per arm, on the same 30+ sentences:**

- **Latency to place** (fast): `place.ts` minus the chat line's `at`; the `{sent}` line's `delay_ms` (`Sessions.js:627`) is the delivery part. Report p50 and p95.
- **Cost per sentence** (both): the seat's session cost from `item({path: <session url>})` divided by sentences handled; `node Server/FollowCost.mjs` prices the wake path.
- **Accuracy** (fast): 20 sentences you label once (same/paragraph/card, question yes/no, punctuation right); count agreements.
- **Smart quality**: tasks created against asks in the Coverage tab, titles judged blind side by side, wakes per minute.
- Log each arm as an `experiment {try, measure, result}` line on the task.

## 6. Decisions for the owner

1. **Comma chunks to the fast seat?** One switch (`send_on_comma`), but each chunk is a Haiku call and the fast seat must hear chunks live, not after 2.5 s of quiet.
2. **Who opens a new Prompt:** code by silence (today), or the fast seat by topic (needs a `to: "prompt"` value).
3. **What "handled" means:** computed from open Questions and tasks (recommended), or something the smart seat sets.
4. **The smart seat sees the fast seat's work:** turn on tail mode (recommended) or leave it blind.
5. **Which trial first:** smart on Opus high first, or fast on Sonnet low first.
6. **Keep the code-side `refine()` per line** (a third writer, two model calls per finished line), or let the smart seat refine alone.
