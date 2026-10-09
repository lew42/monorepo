# STATE — refine-demo (mastermind-refine-demo)

Worktree: C:/Code/lew42/worktrees/refine-demo (branch worktree/refine-demo). Model: Sonnet 5.5, no OpenRouter, no minions.

Done: Prompt.js (class + View + scoring rules), RefineDemo.js (mic/text, result, DefaultView debug tree, class card), Prompt.css, Servex/ext/refine/run.js + POST /api/refine in Servex.js, doc/prompt.md, readme + ai/readme links, page.js shows demo first.
Next: commit, merge to michael/dev, restart Servex (route is new), headless check at 400/1200/1920/3440, finish-task.
Decisions: scores = rules (Haiku per prompt was the alternative); one /api/refine route because structure() is Node-only.
