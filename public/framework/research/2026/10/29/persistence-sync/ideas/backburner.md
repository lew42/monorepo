# Back burner

Things worth doing later. Not open questions, not being worked on. Revisit when one becomes a problem.

- **Git branch strategy.** `michael/dev` is the real trunk; `main` is 7,368 commits behind (production dates from 2026-08-07). Owner leans toward merging `michael/dev` into `main` and keeping `name/branch` names for people and agents. Needs a proper conversation first. Detail: `agent-ops/proposal.md`.
- **GitHub webhook → Servex (auto-git).** Owner OK'd setting it up when wanted. Purpose: local and cloud sessions learn about pushes automatically. Route: GitHub webhook → `servex.lew42.com/hooks/github` through the existing Cloudflare tunnel; needs a Cloudflare token with Tunnel Edit + DNS Edit; a local agent with the Cloudflare MCP can do it. Detail: `agent-ops/proposal.md` §5.
- **git-guard in cloud sessions.** In cloud sessions it blocks `git rebase` but allows pushes to `michael/dev` and `main`. Review only if it causes trouble.
- **Slim CLAUDE.md with `@AGENTS.md`.** Owner is OK with it in principle ("if it works and nothing important is lost"). Do it together with the branch strategy. Drafts: `agent-ops/drafts/`.
- **Cloudflare Pages for the research app.** Only if the hosted app can't do something we need.
- **Hosting from anywhere** (tunnel to the PC, or Durable Object + R2 in the cloud): `ideas/hosting-tunnels-and-cloud-files.md`.
