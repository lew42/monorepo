# follow(path) — Servex watches a file for you, and tells you what changed

An agent cannot watch a file itself — it only sees what arrives as a message.
So Servex watches, and sends each change to every agent that asked for it.

## Watch something

Call the MCP tool `follow`, or use it as a normal tool if you are an agent
Servex spawned (it is already in your tool list, no setup needed):

```
follow({ path: "public/framework/ux/Dictate" })
```

- `path` is repo-relative — a single file (a log, a page.jsonl) or a whole
  directory (any change under it, at any depth). **It doesn't have to exist
  yet** — following a file or folder that hasn't been created is allowed,
  and its first line arrives the moment it's born.
- `agent` is who gets told. Leave it out and it's you (the caller) — but any
  caller may name a DIFFERENT agent, the same way `send_to_agent` lets you
  message one on somebody else's behalf. That's intended, not a hole: it's
  how one agent sets a follow up for another it just spawned.
- `gather_ms` (default 2000) is a fixed window: Servex starts the clock on
  the FIRST change, waits that long, then sends everything that happened in
  between as one message. It doesn't reset the clock on every new change, so
  a burst that keeps going past `gather_ms` still lands on time — you just
  might get a second message a moment later for whatever came in after.

`unfollow({ path })` stops it. `list_follows()` shows every active
subscription (or just one agent's, with `agent`).

**A path has to sit at or below a module or a Servex folder** —
`public/framework/<module>` or `Servex/<dir>`. `public/`, `public/framework/`,
`Servex/` and the repo root are all refused, and so is anything containing a
`node_modules` or `.git` segment — following the whole tree, or someone else's
dependency tree, is not a thing you can ask for. The path is resolved first
(`public/framework/.` collapses to `public/framework` before the check runs,
so a stray `.` can't sneak past it), then checked. A refused path throws
instead of following anything:

```
follow({ path: "public/framework" })
→ Error: "public/framework" is above public/framework/<module> or Servex/<dir> — refused
```

## Only what's new — never a replay

The very first thing you get is whatever changes AFTER you called `follow`.
An existing, already-full-of-lines `task.jsonl` you just started following
does not get sent to you from the top — only what's appended from this
moment on. That holds across a restart too: if Servex comes back and reloads
your subscription, it re-checks the file as it stands RIGHT THEN, not as it
stood when you first followed it — so you still only ever see what's
genuinely new, never the backlog that piled up while nothing was watching.

## The message you get

One message per burst, through the same queue `send_to_agent` uses — if you're
mid-turn, it waits behind that turn, exactly like any other message. It never
interrupts. Following one file:

```
follow: 2 changes under public/framework/ai/2026-09-29/follow/build/task.jsonl
public/framework/ai/2026-09-29/follow/build/task.jsonl:
{"assign":{...}}
{"log":{...}}
```

Following a directory, where more than one file under it changed:

```
follow: 4 changes under public/framework/ai/2026-09-29/follow/build
public/framework/ai/2026-09-29/follow/build/task.jsonl:
{"log":{...}}
{"log":{...}}
changed: public/framework/ai/2026-09-29/follow/build/inbox.jsonl, public/framework/ux/Dictate/page.js
```

A `.jsonl` file's new lines arrive **verbatim, in full** — Servex remembers
the byte offset, so you only ever get what's new. Any other kind of file just
tells you its path changed; go read it yourself if you need to.

Each new line arrives **once**, even if you're following both a directory and
a file inside it at the same time — Servex delivers a change to you under
whichever one of your own subscriptions matched it first, never once per
matching subscription.

**A huge burst is capped, per file, per message** — at most 200 jsonl lines.
Past that, the rest is a note instead of a wall of text, naming exactly where
to read the remainder yourself:

```
public/framework/ai/2026-09-29/follow/build/task.jsonl:
{"i":0}
… (198 more shown lines) …
{"i":199}
… 50 more line(s) — read public/framework/ai/2026-09-29/follow/build/task.jsonl from byte 1890
```

## Traps this works around

- **On Windows, just reading a file fires the same "changed" event as writing
  one** (last-access tracking). Servex keeps each watched file's last size and
  modified time and says nothing unless one of them actually moved — so a
  `fs.readFileSync` from anywhere never triggers a message. This is primed
  the moment a path starts being watched (see "Only what's new" above) — a
  file already sitting there when you follow it is a known baseline from the
  start, not a blank slate that the next real change gets compared against.
- **A restart doesn't lose your subscription — even a graceful one.** Every
  `follow` is saved to one small file the moment it's made, and reloaded when
  Servex starts back up. A graceful shutdown stops every live agent on its way
  down, which normally ends that agent's subscriptions too (the next bullet)
  — but Servex knows it's shutting down, not that the agent is really gone,
  and skips that step, so nothing is erased. Only a burst still sitting
  unsent in that moment is lost — nothing replays it, by design (see "Only
  what's new" above), but it is gone; there is no second delivery.
- **Your subscriptions end when you do — for real, not on a restart.** The
  moment an agent actually stops (not a Servex shutdown), Servex drops
  everything it was following, and clears any burst it hadn't sent yet, so a
  change arriving seconds later can't wake that agent back up just to deliver
  a note nobody will read. The same thing happens automatically to a
  subscription for an agent id that turns out not to be real — never spawned,
  or gone before the message went out: it's dropped instead of quietly
  starting a new, paid session to deliver one line.

## One caveat: a replaced file, not an appended one

The offset Servex remembers assumes a `.jsonl` only ever grows by appending —
true for every task log and page log in this repo. A file written to a temp
path and renamed over the old one, ending up bigger than the remembered
offset, gets read from that stale offset instead of from the start, and the
lines that come out are not actually new. This is rare enough for an
append-only log that it's a caveat, not a fix.

## Proof

```
node Servex/proof/follow-proof.mjs
```

14 checks against a fake host (no live Servex needed): a 20-line burst inside
one second arrives as one message; a file nobody follows reaches nobody;
`unfollow` really stops it; a subscription survives a simulated restart; a
plain file read sends nothing; three that specifically follow a file that
ALREADY has content on disk before the follow starts (an existing 100-line
log plus one more append, the same across a restart, and a plain read of it —
the case "only what's new" is about); a graceful shutdown keeps every
subscription; an agent that stops mid-burst gets no message; a directory and
a file inside it deliver each line once; `public/framework/.` and `Servex/.`
are refused; an unknown agent's subscription is dropped instead of sent to;
and following a directory that doesn't exist yet still catches a file born
inside it, from its first line.

## Where it lives

The whole mechanism is one class, [`Servex/Follow.js`](../Follow.js) — one
chokidar watcher covering every followed path, re-scoped as subscriptions
change. Wired in at boot in `Servex.js` (`this.follow`), and hooked into
`Agents.js`'s `register()` so a stopped agent's subscriptions end with it.
