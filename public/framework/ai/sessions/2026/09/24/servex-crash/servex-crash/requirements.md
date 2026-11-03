# servex-crash — requirements

The ask, verbatim from the master-mastermind's brief:

> You own one task: the owner reloaded /framework/ai/ and got an error page. The goal is that the owner never sees one.
>
> 1. Find the likely cause of the 0xC0000409 crash. Think native modules, the Agent SDK's child processes, node 24 on Windows, or a websocket through the proxy. If you can reproduce it, do. If you can't find it, say what you ruled out and add whatever logging would catch it next time (for example, node's --report-on-fatalerror in the keeper's spawn, written to the logs dir).
> 2. Make a Servex blip invisible to the owner. A restart or a crash should not show an error page. Pick the simplest one that works, and prove it: restart Servex while a headless browser loads the page in a loop, and show zero error pages.

Fence: `Servex/` in a worktree on branch `worktree/servex-crash`, plus this task dir. Merge into michael/dev under a hold; restart Servex at most twice, never `--force`, as the last step.
