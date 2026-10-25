# AI sessions page: one slim sticky toolbar, then the sessions

For `mastermind-page`, after (or alongside) the top-tabs task, since the two sticky bars stack. The owner's words are in the prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` (2026-10-24, the prompt after "Session is a Task").

## The owner's ask

- **Cut to the chase.** On a phone today, about 80% of the first screen of `/framework/ai/sessions/` is controls, before a single session shows. "We need to be more careful about not creating these vomit UI filters."
- **No second heading.** The highlighted Sessions tab already says where you are.
- **One slim toolbar, and it's sticky.**
  - It has its own opaque background, so cards don't mysteriously vanish behind it as you scroll.
  - It holds only the most common filters. The date is one button: "Today ▾", with a dropdown for other ranges.
- **Then straight into the list:**
  - one white card per session, with a little left and right padding, newest first;
  - **root sessions only**, with child sessions nested inside their parent's card.
  - Most of the time that's one card: the VS Code sidebar session, with everything it spawned inside it.
- **Build it fresh.** Don't rework the current page: keep it as a backup at a linked path, and use it as a guide for the data and the controls worth keeping.

## Notes

- Child sessions nest only once they're linked to their parent's session id. The deputy is building that now: `../session-is-a-task/requirements.md` (item 3). Use the same data; don't build a second linking system.
- Shots at 390 and 1920, scrolled and unscrolled. In the phone shot, the first session card must sit near the top of the first screen.
- Land ready to merge, with a `show:` line that has links. The merge is the owner's.

## The owner again (2026-10-24, after seeing the page)

- **The controls go above the card stack, in one full-width sticky header** with its own opaque background. The stack of session cards is the big scrolling area below it.
- **Condense it greatly.** There are about a dozen controls today, and the owner has used none of them and isn't sure they work.
  - Keep the one or two common ones visible (the date, "Today ▾").
  - Put the rest in a dropdown menu. Don't break them; hide them.
- **Then, in order:**
  1. redesign the session card previews;
  2. then the session detail page.
  Each is its own step, and each lands before the next starts.

## The owner, third pass (2026-10-24, after looking at the list and this session's detail page)

- **Load only what the view needs.**
  - The default view is a short range (today, or the month), read from the per-level index files: `ai/sessions/index.jsonl` → year → month → day, which the deputy just merged.
  - Never load every session to draw the list.
- **Totals come from Servex's live cached sessions,** the `live_root` instances that the deputy's fast-write work keeps current. A card can then show its total, including children, without loading hundreds of child sessions in the browser.
  - Until that's ready, the card shows the session's own cost, clearly labeled, and the full total one click down.
  - Both numbers come from ONE cost function, the deputy's fix for the $2xx-card vs $9xx-detail mismatch.
- **On the detail page, the task list is broken:**
  - each task sits in a narrow column, so its text wraps over 3–6 lines and looks cut short;
  - every row has play and stop buttons nobody explained. Find out what they do and whether they work; hide them if not.
  
  Make each task one full-width row. Then give the tasks the same filterable grid as the sessions list (state, day, kind), so a 4-day session can be browsed by day. One component for both.

## The owner, fourth pass (2026-10-24): the session detail page is the focus

**New order:** (1) the slim sticky header on the list (small); then **(2) the session detail page, the main job;** then (3) the list's cards.

What the detail page shows:
- **A chronological view: everything in the session's `session.jsonl`, in order.**
  - Its prompts, tasks, child sessions and notes, as they happened. "Just show me everything in there."
  - Configurable, so the owner sees what's needed and not much more.
- **A chat view, live:**
  - each owner prompt appears as its refined form: a heading, then its asks, questions and notes as cards, each citing its sentences (S4, S7–18). The raw transcript is one click down, never repeated in full;
  - the flow plays out in place as it happens: prompt → refined prompt → task → "agent launched" (the child session, with its state and cost) → checked off when done;
  - when the owner dictates in the VS Code tab and switches to the site, the new prompt's refinement is already appearing.
- **Child sessions are shown** where their task is, not in a separate dump.
- **Today's flat list of 100+ one-line tasks is replaced,** because it gave the owner no confidence about what they were looking at.

**Build on what exists:**
- the AI system mastermind's chat-view plan (merged tonight; see `ai/doc/` and `../prompt-breakdown/`);
- `prompts.jsonl` (raw, clean sentences, parts with cites);
- the deputy's work: Prompt extends Task, child sessions as tasks, and live cached sessions.
Agree one component for the chat view with the deputy. Land it in small, visible steps.

## The owner, fifth pass (2026-10-24): what the detail page must let them do

**"I want to see all the things that were requested in this session, verify they're all done, and click through to the proof."**
- **An Overview view, first:** the session's work ranked by recency and importance, with **task cost as the main weight**, so the big things rise to the top. It gives a strong understanding of what the session did at a glance. The chronological view and the chat view sit beside it.
- **Grouped, never flat.** Each prompt → its main tasks → their subtasks, checked off by the agents building them, live. Small asks nest under the task they belong to: the item tool's add-as-subtask, or a move with a back reference when one was filed flat.
- **Checkmarks:**
  - an empty box while open;
  - a **green checkmark when done**, drawn as our own icon, not a form checkbox;
  - clicking a done task opens its proof (its outcome, links and commit).
- **Show the state; drop the play and stop buttons.** Today they break the layout, so take a screenshot of the current page first, for the before-and-after.

## The owner, sixth pass (2026-10-24): an idea for later, not now

When a task moves into a session made for it, its old spot in the chat stays, dimmed, with a small "moved" arrow. Clicking it scrolls to the new home, and the item in its new home carries a small "moved in" arrow in its top-left corner. That way nothing is shown twice without saying so. Build it once moves exist (item 32 of session-is-a-task). Note it in your plan.

## The owner, seventh pass (2026-10-24)

The sessions list and the session detail page are "the core truth". The queue page is secondary.
- **The detail page opens on the prioritized view (Overview) by default.** The chat view is a tab beside it.
- **The owner must be able to:** open AI → Sessions, find this session, click through, and see both views. Test exactly that path, with a shot of each step.

## The owner, eighth pass (2026-10-25): drill down through child sessions

- **This session's Overview is grouped by child session.** Each child session is one group, holding the tasks assigned to it, with its own cost and state. That includes past children that are no longer running (the deputy, the architects, and so on), not only live ones.
- **Every child session has its own detail page, the same component, recursively.** Click through from the parent and see everything inside: its tasks, its own children, cost and outcome. "Drilling down and figuring out what these things actually did should not be terribly hard."
- **Child sessions get no chat tab.** Their agent-to-agent chat is kept to a minimum and isn't the record; the files are. Only the VS Code tab's session processes the owner's prompts, so only it gets the chat tab.
- Test the drill-down: AI → Sessions → this session → the deputy → one of the deputy's children. A shot at each step.

## Ninth pass (2026-10-25): the chat tab is the shared chat component

The detail page's chat tab uses the same chat component as the mobile sheet's dictation chat, which mastermind-dictation-2 owns. Agree the interface with it, so dictation works in the chat tab with no extra wiring.
