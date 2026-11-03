# System — a generic container for anything we keep in order

A System knows where its files live (`root`), its `readme`, its `rules`, and can `check()` itself. Not an AI thing: code, layout, readmes or an AI module can each be one. Page: `/framework/ext/System/`.

## Index
- `System.js` — the base class (its card with every field and method is on the page)
- `Systems.js` — the manager: runs every system, appends a line each to `results.jsonl`
- `ReadmeSystem.js`, `NavigationSystem.js` — two checks, kept here for now because they check the whole site, not one module
- `DemoSystem.js` — a tiny in-memory system so the page can run `check()` and `heal()` live
- `SystemPage.js`, `page.js` — the page; its live instance tree: [InstanceTree](/framework/ux/Content/Object/instance-tree/)
- A module's own system is a `system.js` beside its `page.js` (an instance, e.g. `ai/sessions/system.js`); list it in `Systems.modules`
- [doc/system.md](doc/system.md) — what each member means, the hourly beat, the future compositor
- [doc/move-manifest.md](doc/move-manifest.md) — the 2026-10-12 move from `ai/systems/` (old paths are one-line shims)

## More
- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
