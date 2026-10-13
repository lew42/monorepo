# PWA and notifications: what was built, does it work today, where is it

Budget: $8. Load the `sub-mastermind` skill first. The owner's raw words: `../requirements-3.md`, ask 1 ("I'm now recalling a bunch of PWA or notification stuff. Not sure if that was done. Definitely look into that."). Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; show don't tell; link every mention.

## What the mastermind found (past-work, 2026-10-13)

- `Notifications lab` landed 10-09: `ai/sessions/2026/10/09/notifications-lab/notifications-lab/` ("merged to michael/dev 6aa438200, dev server restarted, /push/key live"). It was listed as "quiet" in today's follow-up and then given a landing line.
- Run `node Server/PastWork.mjs "pwa manifest service worker"`, `… "web push notification"`, `… "install app home screen"` and `git log --all -i --grep=pwa --grep=notification --grep="service worker" --oneline` and record the hits.

## Deliverable: a one-screen section appended to the notifications lab's own readme or doc (where the page skill says the module lives), linked from `public/framework/readme.md` if it is not already

1. **State today, proven** (log each answer with its status code or output):
   - [ ] Does the site serve a web manifest and a service worker? (`curl` the URLs.)
   - [ ] Does `/push/key` answer?
   - [ ] Can a headless browser subscribe and receive one test push? (Re-run the lab's own proof script on current `michael/dev`.)
   - [ ] Can Android install it to the home screen? List what the manifest declares (icons, display, start_url) and check Chrome's installability rules by script or Lighthouse.
2. **What was asked vs what exists**: the owner's asks about PWA/notifications (from the task briefs you find and `public/framework/ai/asks.jsonl`), each with done / partly / not done and a link.
3. **Fix the small things** (under an hour of Sonnet): a missing manifest field, an icon, a broken push key route. Anything larger is written as `doc/next.md` beside the lab with a brief ready to spawn.
4. Report on your card: works / partly / no, the proof, the links, what is next.

Fence: the notifications lab module and its docs, `public/framework/readme.md` (one link line), this task dir. Worktree for code, `merge.mjs`. Never restart Servex or the :8137 server; headless only.
