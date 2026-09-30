# Plan: one dictation system

**The goal:** one component, the **dictation sidebar**, is the same code on every surface. It is the one Widget (merged in 5c1b7d15) plus the fast/smart session wiring that today lives only inside the ✦ sheet (`ext/drawer/rail.js`).

## What changes, surface by surface

| Surface | Today | After |
|---|---|---|
| **Mobile ✦ rail** (`rail.js`) | Widget + the pair, wired inside rail.js | The dictation sidebar in a resizable sheet that collapses to one line |
| **Desktop right sidebar = ☰ drawer AI tab** (`tabs/ai.js`) | Widget; a plain page goes to the old page assistant (`POST /api/page-ai`); has a model chooser | The same dictation sidebar at full height; the model chooser is gone |
| **AI 2 card sidebar** (a card page with the drawer open) | The reply comes from `assistant-<card>`, the old single assistant | The same dictation sidebar, with `start({path, card})` on the pair |
| **VS Code prompts** (`POST /api/page-ai`, Servex `Layers.js`) | Spawn or wake `assistant-<card>` / the page assistant | Say into the page's or card's pair session, so they show up in the same chat |

## Small merges, in order (each one screenshot-checked on every surface before the next)

0. **Baseline, read-only.** Reproduce the owner's evidence on the live site. On `/framework/ai2/2026/09/30/now-one-inbox-everywhere-and-refined-pro/`, say one line and record which code path sends it and which agent answers. Shoot every surface at 400 and 1920: that's the "before" set.
1. **Lift, no visible change.** Move the pair wiring (start, say, watch, stream, resume offer, own-ats dedupe, floor, reactions) out of rail.js into one module the sheet uses. Every "after" shot should match "before".
2. **Desktop sidebar on it.** tabs/ai.js uses the same module for pages AND cards, at full height. The model chooser and the page-ai and `send({card})` branches are deleted.
3. **Card sidebar on it.** Whatever step 0 found still reaching `assistant-<card>` from a card page moves to the pair.
4. **Servex: `/api/page-ai` onto the pair** (with the ext/Session owner). It needs a Servex restart. Then the old page/card assistant spawn in Layers.js retires.
5. **Phone sheet: resizable, collapses to one line.**

## What could regress, and how each merge checks it

One Playwright script (fake mic) drives every surface and shoots 400 + 1920. Each check needs a shot, not a claim.

- The owner's bubble appears, then a streamed reply from **fast/smart** (the name shown on hover). This is the owner's own test.
- Live refinement: partial grey → settled.
- The choice buttons on a reply and the "pick up where you left off" line; they regressed once already.
- The page inbox line above the sheet's widget.
- Reactions and threaded replies (chat-reactions' work).
- Box, mic and Send on one row; the mic is released when the sheet closes.
- The drawer's other tabs (Sessions, Dictation, Settings, Files) are unchanged.

**Reversible:** each merge is its own merge commit, posted on the card with its shots, so `git revert -m 1 <id>` undoes exactly that one.

**Who builds:** one Sonnet minion per merge, in the audio-consolidate worktree, one at a time. I judge every shot before the next merge starts.
