# Dictation 13 (2026-10-14): screenshots are never committed

Asks, each with the task that took it:

1. **No automated screenshot is ever committed**, anywhere in the repo, not only under the AI log. → `screenshots-never-committed/`
2. **Hand-chosen pictures are the exception**: the owner picks which ones a doc keeps. → same task (the rule names the places that stay: a `doc/` folder, a blog post).
3. **A path pattern for layout screenshots** so any page can keep a log of shots on disk, browsable, ignored by git, purged when the disk fills. → same task (`**/shots/` and `**/screenshots/`; the purge is a script).
4. **The worktree question**: ignored files are not carried into a worktree, so where do a mastermind's own dev server and shots land, and do they need porting back? → same task answers it in `ai/doc/repo-size.md`.
5. **Don't let pictures fill the GitHub repo** over months of edits. → the unpushed-only history rewrite already proposed in `ai/doc/repo-size.md` (waits on the owner).

## The owner's words, verbatim

Okay, so on the screenshots, I would say do not commit screenshots to the repo. I thought, I didn't think we were. I mean, okay, so some screenshots could be useful, but I think I would want to like choose which ones if I needed them. So I, yeah, I think as a general rule for us, yeah, all the automated screenshotting, I want them to get ignored essentially. So like, you could create some sort of path pattern so that on any page you could take kind of layout screenshots and having a log of all those might be useful. We might need to purge them as the repo gets too large. Um, if they're get ignored, then I would assume they don't get brought over into work trees, which actually might be part of a work tree step. Like if, if Mastermind is creating a work tree and running, you know, its own dev server and whatnot, I'm not sure where the screenshots would get generated. That would be an interesting question, whether they would need to be ported back over. Anyway, the, yeah, but let's not commit them to GitHub. We don't want to, as if, if you're working over, you know, many months on a project and doing tons of edits and screenshots, then you don't want those filling up a Git repo. They're going to kick you off GitHub.
