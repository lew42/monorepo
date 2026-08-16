# Starting work from the board

`compose.js` is a box on `/framework/ai/`: an ask, an optional name, an
effort (`group`), a model. Submitting posts `rpc:start`;
`Server/plugins/Start.js` answers it by scaffolding `ai/<date>/<slug>/` — a
`requirements.md` and an opened `task.jsonl` with the launch line written,
exactly what the `new-task` skill writes by hand — and spawning
`claude -p --session-id <uuid> …` to work it.

`available()` (`ext/Ask/Ask.js`) is what makes `compose()` return `null` off
localhost: there is no dev server to spawn anything there, and the board is
otherwise a static page. Nothing renders broken; the box simply isn't there.

## It returns as soon as the process is away

**Not when the work is done.** A task can run for an hour; a promise
resolving on that would be a lie the UI would have to hide. The task's own
log is the progress channel, and live-reload is what carries it to the
board — which is the entire reason `task.jsonl` exists as an append-only,
watchable file rather than a request/response payload.

`--session-id` is generated up front by `Start.js` and written into the
launch `assign`, so the transcript is joined from line one instead of
discovered afterwards by grepping for a match.

## `acceptEdits`, not `bypassPermissions`

A text box on a web page should be able to write files, not run anything at
all. `Start.js`'s `spawn()` passes `--permission-mode acceptEdits` by
default; raising it per call is a deliberate choice a caller has to make, not
this module's default.

## The mute, and the fallback slug

The three scaffold writes (`requirements.md`, `task.jsonl`, `day.jsonl`) are
muted for the socket that asked (`LiveReload.mute`) — without it, the board's
own live-reload would reload the compose box out from under itself before it
can show the returned link. Every *other* open tab still sees the task
appear normally.

Deriving a slug from the raw ask is the fallback, and a poor one — "Read
public/framework/ext/AITask/readme.md and …" slugged to
`read-public-framework-ext` names nothing useful. `Start.js`'s `slugify()`
drops path-ish tokens (anything containing `/` or a `word.word` pattern)
before falling back to the first few content words; the compose box's own
`name` field is the real answer and wins whenever it's filled in.

## Where this still stops at `framework/ai/`

`Start.js`'s `AI` constant is hardcoded to `public/framework/ai` — every
`scaffold()` call writes there, whatever page the board is opened from. The
*reading* side (chat threads, `AITask.chat()`'s `task` path,
`Server/plugins/Ask.js`'s `thread_dir()` fence) already accepts any
`public/**/ai/<slug>` path, widened 2026-08-15 in the `devbar-ai` task — so a
thread can be opened and chatted to beside any page, but a brand-new *worked*
task (one that spawns `claude -p`) still lands under a date, not beside the
page it's about. See the readme's Open section.
