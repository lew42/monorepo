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
