# System architecture — a checkable container per module, one manager

A System is anything we keep in order: its files (`root`), its readme, its rules, and a `check()` that computes whether they hold. The base class is [`System.js`](../System.js) (page: [`/framework/ext/System/`](/framework/ext/System/)). It is a plain class with no file access, so pages can import it; each module's own subclass or instance does the reading. The manager is [`Systems.js`](../Systems.js), which runs every system and writes one line per system to `results.jsonl`.

## Base class, not a page

**Decided:** `System` is a plain class; it never extends `Page`. The page for it is `SystemPage`, which extends `Page` and shows the class card.
**Why:** the base class runs in the browser and in node. A page base would tie every checkable thing to the UI.
**Instead:** making each System a Page (rejected: a system is data plus checks, not a screen).
**Detail:** [system.md](./system.md)

## Checks compute, never recall

**Decided:** `check()` reads the real files and returns findings `{rule, path, text}`. An empty list means healthy. It only reads.
**Why:** the rule that record-keeping is code, not an AI's memory (CLAUDE.md law 7).
**Instead:** an AI summary of the health of a module (rejected: it can be wrong and it costs tokens).
**Detail:** [system.md](./system.md)

## One manager; each module declares its own system

**Decided:** `Systems.run()` runs every system and appends one JSON line per report to `results.jsonl`. A module joins by adding its `system.js` path to `Systems.modules`.
**Why:** one log the page can stream, and no module has to know about the others.
**Instead:** each module writing its own log (rejected: the page would read many files, and the log becomes two datastores).
**Detail:** [system.md](./system.md)

## Two whole-site checks live here, for now

**Decided:** `ReadmeSystem` and `NavigationSystem` live in this folder because they check the whole site, not one module. They are listed in `Systems.shared`.
**Why:** neither belongs to one module, and both need the same manager.
**Instead:** a home in each module they touch (not yet chosen: no single module owns them).
**Detail:** [readme](./readme.md)

## The hourly beat only reports

**Decided:** `Server/systems-beat.mjs` calls `Systems.run()`, which calls `check()` only. Nothing heals on the beat. `heal()` runs only from the page's Heal button, on the demo system.
**Why:** no real system has a fix proven safe yet, so an automatic fix would be a guess.
**Instead:** automatic healing capped per cycle (not built). The cap is the `heal_limit` field.
⚠ **Code mismatch:** `heal_limit` (default 3) is declared in `System.js` but nothing reads it. No cap is enforced anywhere.
**Detail:** [system.md](./system.md)

## Each module's system is an instance beside its page

**Decided:** a module's system is `system.js` in the module's own folder, a default-export instance with `root` set to that folder. The page for the class is `page.js`, which stays a thin import.
**Why:** the checks sit with the files they check, so moving a module moves its checks with it.
**Instead:** one central file that describes every module (rejected: it drifts from the folders it describes).
**Detail:** [system.md](./system.md)
