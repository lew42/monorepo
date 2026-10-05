# Voice sessions: assistants that acknowledge, ask, and hand off

## The ask (owner, 2026-10-04, dictated; full text on /framework/ai/2026/10/03/session-60d9def6/, the prompt starting "All right, so on, on the whole, like, re-architecting")
> I still haven't experienced a new session button working properly and like automatically naming the old sessions and jumping between them.

> maybe we just want one mastermind that's across all voice sessions ... if the fast and smart assistants deem whatever was requested to be worthy of the mastermind's attention it could pass along the refined prompt

> when I see the smart assistant and the fast assistant both responding with very similar responses, that's broken ... most of the time, those assistants could or should respond with a green check mark ... versus a yellow question mark of like, transcript doesn't make sense ... if there's a task or a question ... converting those into those specific types of cards ... recognizing a question when it's been asked ... a one line preview of the answer ... If I click through, then that answer becomes more of a breakdown

## Roles (owner, 2026-10-04, second prompt)
- **Fast assistant = the prompt interpreter.** Stays free; reacts in seconds; does only quick, simple things (✓ / ?, a name and an icon, first guesses at requirements on the card).
- **Smart assistant = a mini mastermind, hands off.** Picks the model and spawns the minion or mastermind for real work; doesn't do the work itself, so it stays free to respond.
- **The first one to respond covers it.** The second speaks only with a strong, new reason; never repeats the other ("we're looking into it").
- **Systematic feedback over chat text:** a ✓ when nothing more is needed; structured cards for questions and tasks, each **leading with the quoted question or idea it answers**, then the answer.

## Want
1. **New session works:** a button starts a fresh voice session, the old one gets an automatic name, and a picker jumps between sessions.
2. **The assistants don't echo each other:** the fast one reacts (✓ heard, ? unclear) and only the smart one writes, and only when there's something to say.
3. **Questions and tasks become cards:** a question shows as a short query with a one-sentence answer, click for the breakdown; a task goes to the one mastermind as the refined prompt.
4. **One mastermind across all voice sessions** (Opus, not Fable) receives what the assistants hand off.
5. Worktree → check_page → merge.mjs.

QUEUED: start after /framework/ai/2026-10-04/dictate-without-claude lands (same files).
Budget: $6

## Cards, not chat (owner, 2026-10-04, third prompt)
Each prompt becomes one context block: what was asked (the essence), and nested inside it whatever came of it (a task launched, its state, its result). A ✓ when nothing more is needed. Decisions are made, not asked: record the options, the choice, why, and a confidence; when two options are close, test both.

## Added (owner, 2026-10-04, fourth prompt)
The fast assistant does the clean + first refinement (sentence ids, questions spotted); the smart assistant watches both raw and refined, verifies, curates or changes them in place, through the cards, not with a second chat reply. Both can reference existing pages (links, not explanations).
