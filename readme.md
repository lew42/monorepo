# Lew42.com Framework Site

`npm install`, then `node Servex/sustain.mjs` and open `http://monorepo.localhost/` —
Servex holds port 80 and starts the site the first time you visit it (`Servex/readme.md`).

- Maintain static compatibility (server is just for local dev)
- No bundler or build (pure static hosting)
- Native ESM `imports`
- Simple `div()` view system with capturing
- No new npm dependencies (`chokidar`, `express`, `ws` are the dev server); `npx` and globally-installed tools are fine

## Systems (one line each; every link opens that system's own short readme)

- **Accounting** (spend, tokens, pace): [token accounting](public/framework/ai/doc/tokens/tokens.md) · [usage and budgets](Servex/doc/budget.md) · [session spend](public/framework/ai/sessions/readme.md)
- **Servex** (the always-on process that runs every agent): [Servex/readme.md](Servex/readme.md) · [how an agent is started (SDK)](Servex/doc/sdk.md) · [decisions](Servex/doc/architecture.md)
- **Dev server** (local only, live reload): [Server/readme.md](Server/readme.md)
- **MCP servers** (the tools agents call: `servex`, `site`): [ai/doc/agents/mcp.md](public/framework/ai/doc/agents/mcp.md)
- **Models** (Anthropic, OpenRouter, local): [OpenRouter](Servex/ext/openrouter/readme.md) · [local](Servex/ext/local/readme.md) · [which is best value](public/framework/ai/system/models/)
- **Sessions** (VS Code sidebar tabs, browser voice agents, resumable chats): [ai/sessions](public/framework/ai/sessions/readme.md) · [conversations](public/framework/ai/doc/logs/conversations.md)
- **Transcription** (Whisper, Dictate): [ux/Dictate](public/framework/ux/Dictate/readme.md)
- **Refine** (dictation → refined prompt; past prompts → refined cards on each session's Coverage tab): [ext/Refine](public/framework/ext/Refine/readme.md) · [refine queue](public/framework/ext/Refine/doc/refine-queue.md)
- **Page system** (pages, routing, JSONL streaming): [core/Page](public/framework/core/Page/readme.md) · [ext/JSONL](public/framework/ext/JSONL/readme.md)
- **Organization** (what goes where, the System class): [organization.md](public/framework/ai/doc/organization.md)
- **Skills and CLAUDE.md** (what every agent reads first): [CLAUDE.md](CLAUDE.md) · [skills](.claude/skills/)
- **Task queue** (accepted tasks ranked by importance, cost and re-asks, live): [ai/queue](public/framework/ai/queue/readme.md) · [TaskQueue.js](public/framework/core/Task/TaskQueue.js)
- **Dashboard, Log, Inbox, tasks**: [ai/readme.md](public/framework/ai/readme.md) · [all systems, with size and freshness](public/framework/ai/systems-map.md)
- **New today (2026-10-12):** [core/Property](public/framework/core/Property/readme.md) (`Property.of`) · [core/Page/Template](public/framework/core/Page/Template/readme.md) (page templates, `BigCard`) · [ext/Shots](public/framework/ext/Shots/readme.md) · [ext/Query](public/framework/ext/Query/readme.md) · [ext/DataGrid](public/framework/ext/DataGrid/readme.md) · [code/performance](public/framework/code/performance/readme.md)
- **PageInbox** (a note left on a page reaches its owner): [PageInbox.js](public/framework/core/Page/PageInbox.js) · [inbox tab doc](public/framework/core/Page/doc/inbox-tab.md)
- **UI library** (every ui and Figma item, three columns): [library](public/framework/library/readme.md) · **Layout catalog**: [layouts](public/layouts/readme.md)
- **Step runner** (a task as ordered steps): [Servex/doc/steps.md](Servex/doc/steps.md)
- **Past-work skill** (look before you build): `.claude/skills/past-work/SKILL.md` · [past-work-index.md](public/framework/ai/past-work-index.md)

## Cloudflare Previews

The current `main` branch is deployed at: https://monorepo.lew42.workers.dev/

Branches will be deployed at https://branch-name-monorepo.lew42.workers.dev/

Git branch names will have `/` converted to `-` for preview URLs, which is important here.  I want git branch names to be of the form `<yourname>/<branch-name>`, such as `michael/fix-whatever`, which will translate to `michael-fix-whatever-monorepo.lew42.workers.dev` (whew, yea, it's long).

## New Dev Onboarding:

My team has been invited to this repo as Collaborators.  If you accept, you should be able to:

1. Clone this repo (no need to fork).
2. You **cannot** push to `main` branch.
3. **Always** `git switch main` and `git pull` before creating a new branch.
4. Make a branch (`git switch -c <yourname>/<branch-name>`), use your name, like `michael/fix-whatever`.
5. Make a change, add, commit, and `git push`.  You should have push privilege, so it should work.
6. Cloudflare will automatically build your branch, and convert the branch name from `michael/fix-whatever` to `michael-fix-whatever` (notice `/` becomes `-`) and publish it at `michael-fix-whatever-monorepo.lew42.workers.dev`

## Again:

For every new task, we make a new `<yourname>/<branch-name>` git branch.  But first, we:
- `git switch main`
- `git pull`
- `git switch -c <yourname>/<branch-name>` to create a new branch
- `git add .` and `git commit -m "whatever"` and `git push`
- Cloudflare auto-builds the preview URL based on the branch name, send me the link.

Note, you'll either need to `git push -u origin <yourname>/<branch-name>` the first time, or you can set this:

`git config push.autoSetupRemote true`

And then `git push` should just automatically push.  Alternatively, you can set it globally:

`git config --global push.autoSetupRemote true`

so you don't have to set it per-project.



## Load Order (tracing each browser request through the app.js -> page.js)

1. All paths fallback to the root `/index.html` (standard SPA fallback)
2. `index.html` loads `app.js`
3. `app.js` `imports App` and creates `new App()`
4. The `app` then loads the proper `/path/page.js`
5. The `app` `awaits` the `page.js` module to finish, and then `injects()` it into the dom, only after all stylesheets have loaded.

This should prevent any flash of unstyled content.
