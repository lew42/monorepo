# ai2-groups — the AI 2 inbox as familiar groups, not a stream of ids

Task mastermind: `task-mastermind-ai2-dashboard`. Group: `ai-log`. Budget mode: at most ONE minion.

## The owner's words (relayed by servex-mastermind-opus, "condensed but faithful")

> "If I want to see the things you're doing, I don't even know where to click. I see task names
> that are more like ids. The id shouldn't be in the card preview on the left. We need better
> naming for all the cards: names and icons that are familiar. The left list of previews should
> primarily be GROUPS, familiar groups. If any new thing happens, instead of becoming its own card,
> it gets added to one of those groups. Task audit, card consolidation, inventory, page-jsonl:
> these aren't hitting me as anything I've seen before. We really need to focus on getting
> familiar cards quickly, so when I give prompts, they turn into visible concrete things. For this
> one it would be 'System design': when I send a new prompt about system design, the System design
> card should come to the top. A log entry on AI 2 should be an update to that item, not a
> brand-new item."

Earlier asks this answers (from [`ai2/doc/owner-asks.md`](/framework/ai2/doc/owner-asks.md)):
`#names-icons` ("each card named really well with an icon"), `#unread-wall` ("331 unread, a wall;
I need it digestible"), `#sizes` ("topics I keep referring to become a big thing").

## Deliverables

1. **A small set of familiar group cards**, each a name + an icon. Tonight's: System design ·
   Servex · AI dashboard · Pages & markdown · Cards & content · Layout & columns · Audits.
2. **Every task and prompt attaches to one group** — a tag line; the latest line wins, so it can
   be moved.
3. **A new task becomes an update line inside its group**, and the group rises to the top of the
   rail. Not a new card.
4. **Previews show the group name, the latest update in plain words, and when** — never a slug/id.
5. **Today's tasks tagged** into the groups; the result shown (a shot at 1280 and 1920).

## More from the owner, same task (relayed)

> "Most of these cards have a task page link on them, which is kind of helpful. I don't like the
> truncated preview. If it's worth putting in the preview, render the whole thing as tall as it
> needs to be; if it's not worth it, it goes on the detail page. When I click a card to see the
> detail page, the information is about the same as the preview, plus a link to the task page. I
> want these to be the actual task page data. Let's just render the task page right here."

6. **Previews are never truncated.** Pick what earns a place in the preview and show it whole,
   as tall as it needs. (This retires the readme's "rows must not change height" rule; the
   "enter only when the list is quiet" pill still guards against jumping — a decision line.)
7. **A card's detail view RENDERS the task page itself** — the same view
   `/framework/ai/<date>/<slug>/` draws (`ext/AITask`: outcome, links, steps, log, decisions,
   shots), embedded in the card column, not linked. **A group card shows its tasks' pages as
   sections, newest first.** Reuse the task page's own view code; never copy it.

## Coordination

- `task-mastermind-card-folders` owns card storage: groups are probably a type or tag line on a card.
- `task-mastermind-assistant-layers`: the fast assistant files each prompt into an existing group
  first, a new group only when nothing fits.
- Merge carefully: before/after guard (padding + gaps) on /framework/ai2/, /framework/ai/, two others.
