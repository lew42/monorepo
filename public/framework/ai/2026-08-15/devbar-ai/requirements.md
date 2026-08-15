# devbar-ai

## The ask, verbatim

> we have a dev sidebar dev/DevBar
>
> it's resizable. give it 4 icon buttons at the top that resize the devbar
> dynamically given the viewport width, so that the website becomes 390
> (mobile), 810 (tablet), 1920 (desktop), and 3440 (mega).
>
> also, add the ext/Ask widget. does the ask widget spawn a new session each
> time? is this setup to handle ongoing conversations and start new
> conversations? can we have the dev sidebar dynamically switch Ask context, so
> that on the styles/layouts page, for example, we see the previous AI sessions
> for that page?
>
> don't we have a Saver/LocalSaver? let's save devbar settings (like x-ray) to
> localstorage

## Answers given, and what they settled

**Does `ask()` spawn a new session each time?** Yes — with no `resume`/`from`
the server passes `--session-id <fresh uuid>`. `chat()` is the one that
continues: it holds the returned `session_id` in a closure and sends it as
`resume`. That continuity is in-memory only — reload and the thread is gone,
unless `task` was passed, in which case `task.jsonl` holds `chat_session_id`
and the `chat` lines.

**Mike's direction (2026-08-15):** he does not like the
`framework/ai/<date>/<slug>/` system. Every page gets its own `./ai/` dir
instead, so the record lives beside the thing it is about.

## Decisions taken before the first edit

- **`<page>/ai/<slug>/task.jsonl`** — no `<date>/` dir, no per-page day log.
  The date is a *field* (`requested_at`), not a path: it is already in the log,
  Timeline already reads it, and a task spanning two days currently has to pick
  one and lie. The dir listing is the index. Slug uniqueness is per-page, a
  tiny namespace, so slugs get short (`sizing`, not `read-public-framework-ext`).
- **A chat IS a task.** `TaskJSONL` already models both. One store, one
  renderer, one slug namespace; "multiple persistent sessions" = multiple slugs.
- **The dashboard moves to `/ai/`** — the root page's own `ai/` dir, so the
  rule has no exception. *Deferred to the ext/AI task*, not this one.
- **The write fence widens** from `public/framework/ai/<date>/<slug>/` to any
  `public/**/ai/<slug>/`. Still fenced: must resolve under `public/`, must
  carry an `ai` path segment, slug regex-checked, no `..`.

## Scope — this pass

1. `--rail-floor` in `framework.css` so a preset can actually reach 390.
2. `dev/DevBar/settings.js` — one `LocalStorageSaver` document for the rail.
3. Rewire `DevBar.js`, `grip.js` and `tools.js`'s `knob()` onto it; x-ray
   persists for the first time.
4. Four viewport preset buttons, in the `viewport` section, moved to the top.
5. Server: generalize the task fence; add a light `rpc:thread` that opens a
   thread dir **without** spawning a session (`start()` stays as-is).
6. `dev/DevBar/ask.js` — this page's threads, and a chat on the selected one.
7. `devbar.css`, `readme.md`, `page.js`.

## Deferred to the next task (ext/AI)

- `ext/AI` as a real `Page` subclass, and the browsable `<page>/ai/` route.
- `all_tasks()` crawling every `*/ai/*/task.jsonl` under `public/`.
- Moving the dashboard from `/framework/ai/` to `/ai/`.
- Backfilling or migrating the legacy `2026-08-*` date dirs (they keep
  rendering; nothing is moved).
