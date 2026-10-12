# health-revive — turn the safety net back on, and make it stay on

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Fastest working version first, then improve.
2. **Clear beats brief — by far.** Plain full sentences, basics first, for an overwhelmed newcomer.
3. **Prioritize.** The most important thing first.

## Why this is the top job tonight

The owner works on the live site while agents write to it. Twice this afternoon a module that did
not parse blanked every page that imports it, and there was a third outage around 17:20 that lasted
about eighty seconds. `Server/health.mjs` exists precisely to catch that: a hidden browser loads
the pages being worked on and reports when one breaks.

**It is dead.** Two minions found this independently this evening:

- Its own lock file names PID 32096, and no such process exists.
- Nothing restarts it. The dev server has a supervisor that restarts itself; the health watcher has
  nothing.
- Its default check target is port **8123**, which is also not running — so even revived as-is it
  would be watching a dead server.
- Its findings page is linked from nowhere in the site, so even when it did find something, nobody
  would have seen it.
- Its own task log's last line says it was shut down deliberately the moment its task landed:
  "port 8141 free, no health.mjs process anywhere."

That last point is the real lesson, and it is the pattern behind seven of tonight's eleven
corrected grades: **something was built, demonstrated honestly, and then never actually left the
demo.** Your job is not only to restart a process. It is to make this one survive the end of your
task.

## What to build

**1. Make it run, against something that is actually up.** Port 80 is the owner's server and it is
live — but never touch it, never restart it, and do not assume you may point a watcher at it
without thinking about load. Decide the target deliberately and say why. If the watcher needs a
server of its own, starting one on a free `809x` port is fine
(`netstat -ano | grep LISTENING | grep -E ":80(8|9)[0-9]\s"` shows what is taken); if pointing at
port 80 read-only is lighter and safer, that is probably better. Your call, logged as a `decision`
with the alternative.

**2. Make it survive.** A watcher that dies silently is worse than none, because people believe
they are covered. Give it the same treatment the dev server already has — read how `server.js`
supervises and restarts itself and reuse that mechanism rather than inventing a second one. At
minimum: it restarts when it dies, and **its liveness is visible somewhere the owner already
looks** — a stale lock file that nobody reads is what failed here.

**3. Make its findings reachable.** Nothing crawls in this repo: a page nobody links to does not
exist. Its findings must be linked from somewhere a reader already is. The AI board is the obvious
home — a single line saying the watcher is alive and what it last saw, or how many pages are
currently broken.

**4. Prove it catches a real break.** This is the deliverable that matters. Deliberately break a
page in a scratch copy — or better, in a way you can undo instantly and safely — and show the
watcher noticing. **Do not break anything on the live site the owner is using.** If you cannot find
a safe way to stage a break, say so plainly rather than claiming it works; an honest
"not proven end to end" beats the exact mistake this task exists to fix.

## What you must not do

- **Never kill or restart the dev server on port 80.** The owner is on it right now.
- **Never drive the owner's open browser tabs.** Headless only.
- **Never `git stash`, never commit, never push.** The tree is shared with agents in flight.
- **Do not break a live page to test.** See above.
- Do not search from the filesystem root; scope every search to the repo.
- Hold reloads around your batch of writes:
  `node Server/hold.mjs on "health-revive"` … `node Server/hold.mjs off "health-revive"`.
- ⚠ Changes under `Server/` need a server restart to take effect. You may restart **your own**
  private server; you may not restart the owner's. If your change needs their restart to take
  effect, say so in your landing line as a one-minute owner item.

## Deliverables

1. **The watcher running, supervised, and reachable**, as above.
2. **Evidence it catches a break** — the safest demonstration you can construct, with a shot.
3. **`page.js` in your task dir — one screen.** Top line in plain words: what is watched, how you
   know it is alive, and what happens when it finds something. Then the proof. Detail one click
   down. `new-page` skill for the shape; add it to the day page's `children:`.
4. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "health-revive (in-process agent)"`. One `decision` line for the watch target and one
   for how it is supervised, each naming the alternative. Land with `finish-task`.

## Fences

You own: `Server/health.mjs`, any new supervisor file you add beside it, and
`public/framework/ai/2026-09-19/health-revive/**`. You may add one line to the day page's
`children:` and append to that day's `day.jsonl`.

**You may not touch `Server/server.js`** — read it and copy its supervision pattern, but if it
needs a change, write the exact lines in your log as a finding and say so in your landing report.
Two other minions are working in `public/framework/ai/v/3/**` and `say.mjs`; stay out of both.

There are five orphaned `node server.js` processes on this machine with no listener, plus an idle
pm2 daemon. **Do not kill them** — they are on the owner's own list. But do not let your watcher be
confused by them, and say in your log if they get in your way.

If a skill misleads you or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`.

## Length budget

One screen, mostly the proof. Landing `outcome`: a headline plus at most five sentences with links.
