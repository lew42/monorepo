# Path tags, topic scans and the session audit button (owner, 2026-10-09 ~17:50)

Dictated in VS Code tab 7efd07d5. The owner's design, condensed; nothing here is built yet.

## Tags are paths
- A tag is a **path** (a URL on the site). A session, task or card carries an array of them, rendered as a list of links, and the grid filters by them. Tagging should be **universal**: any object with a URL can carry and be found by path tags.
- **Automated**: whenever a session references, imports, edits or discusses a module, it gets that module's path. Computed by a script from the transcript (paths named, files touched, mentions), not by an AI guess.
- **Tag the module, not every file**: three files touched in `ext/Refine/` = one tag `/framework/ext/Refine/`. (File-level could be kept too if it is cheap; measure first.)
- Zero to any number of tags per session.

## Topic scans beat task-by-task audits
- To find everything on one topic (Cloudflare, payments, users, auth), **scan all sessions' prompts for keywords by script**, then read only the hits. Cheaper and more complete than auditing every task day by day.
- The day-by-day task audit (`ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/`) stays possible, but its output must be **tags first** (path tags + topic keywords), loose ends second. The owner's critique: it read a lot, did not categorise well, and its agents argued about who was right; that does not matter as much as everything being findable.

## Re-refine a whole session (an audit button)
- On a past session's page, one button re-runs the current Refine system over every prompt: refined prompts, every request and suggestion listed, each checked against what was done.
- Result: a score and confidence for how well the session was handled, and whether it can be closed or still has loose ends. As Refine improves, sessions can be re-refined.
- Un-refined prompts can be passed through Refine automatically as it becomes available.

## Why
The owner has dictated a great deal that was not built correctly or got lost. These are the loose ends; this is how to find them systematically.

First prototype: the production-stack task (2026-10-09) runs the keyword topic scan for Cloudflare / auth / users / payments over session prompts.
