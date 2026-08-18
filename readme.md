# Lew42.com Framework Site

`npm install` and then `node server.js`

- Maintain static compatibility (server is just for local dev)
- No bundler or build (pure static hosting)
- Native ESM `imports`
- Simple `div()` view system with capturing
- No new npm dependencies (`chokidar`, `express`, `ws` are the dev server); `npx` and globally-installed tools are fine

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
