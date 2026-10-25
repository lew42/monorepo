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
