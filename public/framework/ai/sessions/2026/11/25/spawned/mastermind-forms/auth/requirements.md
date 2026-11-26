Budget: $6

# Users and auth: what exists, then a proposal for per-user forms (read and write docs only)

Load the `minion` skill and the `past-work` skill first. The owner, 2026-11-25 (condensed by the cloud chat): "look into if we have any user authentication system set up, whether we have any kind of user system at all. I think there was some past work… a couple audits of the users and auth system. I think we were thinking about using Cloudflare… What we want to do is design a user authentication system where people can log in and have a custom experience, via these forms. We want these forms to be user specific."

Context: the forms kit being built now is `public/framework/ux/Form/` (plan: `../plan.md`; answer JSON shapes: `.scratch/forms/spec.md`, "Answer stored"). Leads to start from (verify each, don't trust): `worker/readme.md` (a Cloudflare Worker with Google sign-in verification, users, sessions, roles, a `Room` Durable Object), `public/app/` (the auth demo PWA), `public/notes/auth/` (identity rulings), `public/framework/ux/Auth/`. Search the rest: `node Server/PastWork.mjs "users auth login"`, `node Server/PastWork.mjs "cloudflare d1 kv durable objects"`, `git log --oneline -i --grep=auth --grep=user --grep=cloudflare | head -50`, `git grep -il` over `public/framework/ai/` and `public/notes/` for auth, passkey, D1, wrangler, session cookie. `public/framework/ai/indexing-past-work.md` has the recipes.

## Deliverables (both in this folder)

1. `findings.md`, one screen: what exists (file, what it does, live or never run), what was decided (with the doc that decided it), what was audited (with the audit's link and its conclusion), what is missing. Every claim has a path.
2. `proposal.md`, two screens at most, MVP on top, alternatives below: sign-in (Continue with Google first; passkeys later), the session, the user record, where a user's answers are stored (one record per user per form, the JSON shapes above), how a `Form` reads and writes its signed-in user's answers (name the call, e.g. `form.bind(user)` / `answers.save()`; reuse what the Worker already has before adding anything), what runs on Cloudflare vs locally (`node dev.mjs`), privacy and deletion. Build on what exists; a second auth system is a failure.

Propose only: deploy nothing, create no accounts, keys or Cloudflare resources, change no code. End your turn with one line naming both files.

## Rules

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Search scoped to the repo, never `find /`. Findings as `log` lines in this folder's task log too.
