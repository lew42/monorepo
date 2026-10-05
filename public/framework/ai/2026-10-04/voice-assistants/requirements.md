# Voice sessions: assistants that acknowledge, ask, and hand off

## The ask (owner, 2026-10-04, dictated; full text on /framework/ai/2026/10/03/session-60d9def6/, the prompt starting "All right, so on, on the whole, like, re-architecting")
> I still haven't experienced a new session button working properly and like automatically naming the old sessions and jumping between them.

> maybe we just want one mastermind that's across all voice sessions ... if the fast and smart assistants deem whatever was requested to be worthy of the mastermind's attention it could pass along the refined prompt

> when I see the smart assistant and the fast assistant both responding with very similar responses, that's broken ... most of the time, those assistants could or should respond with a green check mark ... versus a yellow question mark of like, transcript doesn't make sense ... if there's a task or a question ... converting those into those specific types of cards ... recognizing a question when it's been asked ... a one line preview of the answer ... If I click through, then that answer becomes more of a breakdown

## The design principle (owner, 2026-10-04: "write that down")
**A voice session listens and answers in real time, as fast as possible without lag.** The fast assistant goes first: quick, automatic, a rough guess (clean, refine, ✓/?, a first card). The smart assistant takes its turn after: revises what the fast one did, in place. Neither manages work. Real work, and fixing anything that went wrong, goes to **one Opus mastermind** above all voice sessions, because the session pair isn't a reliable manager.

## Added 2026-10-05 (owner)
- **Split screen is the default:** the chat is a sidebar for what doesn't belong on the page; the page itself updates live beside it.
- **The fast assistant may add cards to the page**, only through the page tools (`page_add` / `page_set`: they stamp time, author and format), never by hand-written JSON.
- **The smart assistant stays hands-free:** a simple search ("find this pattern in these folders") goes to the cheapest model that passes that job (local Qwen, or a one-shot cheap OpenRouter call), not to itself; real work goes to the one mastermind.

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

## Sessions are global (owner, 2026-10-04)
- **One place for every voice session**, not the folder of the page it started on: the day folder, like VS Code sessions (`public/framework/ai/<yyyy>/<mm>/<dd>/voice-<id>/`); the page it started on is a field, not its home. Move the existing per-page `ai/v-<id>` files there and leave a link.
- **The AI button resumes by time since the last line** (thresholds are settings): under 10 min, resume silently; 10–60 min, open the last session scrolled to its last messages with a **Continue** and a **New session** button side by side; over 60 min, a new session (the old one named automatically). Switching either way afterwards is one tap.
- **The session header** (on mobile, the sheet's top line): the session's title (a short, capitalised, descriptive title, a sentence if needed; set by the smart assistant via `session_summary`) and its date/time. A resumed session opens scrolled to the bottom, the text box and mic ready.
- **New session is one tap:** a **+** right beside the session title. Tapping the **title** opens a short list of recent sessions (newest first, a few; "all sessions" links to the Sessions tab) to switch to.
- **Auto-chunking** (a session over an hour that drifts to new territory starts a fresh one): try later, behind a setting; not in this task.
