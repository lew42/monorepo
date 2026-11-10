# Fresh review: the plugins plan at /live/plan/plugins/

Budget: $1.5. Load the `review` skill first. This reviews a **plan**, not code. Read only, and change nothing on the page.

## What was asked

The owner, 2026-11-09, relayed by voice-app. Read both messages:
1. "Building pages better and faster… create a new page, boom, it should show up immediately. Add tabs, boom… go full screen or add cards… the good ones we want to be able to adopt and build into our template system. I kept asking for a template system… How do we get all this stuff we're doing to all these pages into an organized system? You figure it out."
2. A correction: plan first, don't build. "The page templating system, well, it's really like page extensions… plugins is probably the way to handle all these things. Every page is just a collection of plugins, and plugins can have plugins… a tree of plugins… toggleable… the content system can have plugins, and maybe the streaming system… page.content is a list, maybe that list can have plugins itself… being able to write views into JSONL… could be interesting… we're sometimes pulling the trigger too fast when we don't have the right shape yet."

voice-app asked for four parts: what exists; the shape (a page as a plugin tree, a template as a saved tree applied in one call, where the plugin UI lives); views in JSONL (worth it or not, and the risk); and the MVP. The page should have the MVP card on top, a preview per card, and JS, not JSON.

## The plan

The page is `public/live/plan/plugins/page.jsonl`; read it with `page_read` path `/live/plan/plugins/`, or the file itself. The search it rests on is `findings.md` beside this brief.

## Check

1. **Against the code.** Is each "exists" claim true? Check `public/framework/core/Plugin/` (readme, Plugin.js, PluginEntry.js: sub-plugins, `overrides`, `make_default`), `core/Page/doc/words.md` (`width: "full"`, `navigation`) and `core/Page/doc/ai-api.md`. Prove a claim wrong with file:line.
2. **The shape.** Does the template layering (class defaults → template → the page's own choices) fit how core/Plugin resolves an instance row today? What breaks? Is "a template is stored as a page" sound? Is the content plugin with sub-plugins, rather than a pluggable List, the right call?
3. **The dependency.** The MVP waits on live-page's fold step 2 (`Pluggable(Item)` for Page; brief at `public/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/live-plan/fold-2/requirements.md`). Could the MVP start without it, on a plain `Plugin` host, and still be worth showing?
4. **The words.** Read it as the owner would, on a phone: is level 1 clear, does each card make one point, and is the code JS?
5. **Missing.** Anything asked that the page does not answer.

## Report

Write `review.md` beside this brief: a verdict (`ok` / `fix`), then numbered findings marked `[fix]` or `[note]`, each with its proof. Under one screen. Reply in three lines.
