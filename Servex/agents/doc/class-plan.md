# Class plan: `Agents.js` and `directory.js` (a plan, not a change)

Both sit in the live agent host, so changing them is major surgery (CLAUDE.md "ask before"). This is the plan; nothing in `Servex/` was touched. Source: the last two function bags of the [scripts census](/Server/doc/scripts.md).

## What the counts really are

The census counted every mention of the name (82 for `Agents.js`, 131 for `directory.js`). Real importers are far fewer:

| file | lines | real importers | what it is today |
|---|---|---|---|
| `Agents.js` | 1872 | 17 (`Servex.js`, `Jobs.js`, `tools.js`, `Global.js`, `Sessions.js`, 9 proof/test scripts, `landing-nag-proof.mjs`) | **already** `export class Agents` (28 to 797) plus a loose tail: `next_briefs`, `task_landed`, `session_facts`, `self_restarted`, the constants `SELF_RESTARTED`, `STANDING`, `STARTING_GRACE_MS`, `ONE_PASS`, and the `agents` singleton |
| `directory.js` | 256 | 1 (`Servex.js`, one line: `directory_tools`) | a true function bag: `dir_of`, `opening`, `question`, `ask`, `directory_tools`, constants `REPO`, `SKILLS`, `IDLE_MS`, `MAX_PER_SESSION` |

## The classes

```js
class Directory {                       // Servex/agents/Directory.js
  static REPO, SKILLS, IDLE_MS, MAX_PER_SESSION
  static dir_of(input)                  // repo path or site path -> "public/framework/core/Page"
  static opening(dir)                   // first message, a pure function of the files
  static question(text)                 // second message
  static ask(host, {dir, question, session, parent})
  static tools(host)                    // was directory_tools(host)
}
class Agents {                          // stays in Agents.js
  static STANDING, SELF_RESTARTED, STARTING_GRACE_MS, ONE_PASS   // the constants join the class
  static next_briefs(dir); static task_landed(dir); static session_facts(sid); static self_restarted(id)
}
```

`Directory` is a class of statics because it holds no state (every call takes the `host`); it is the plain shape the code skill asks for, one class per file named for the class.

## Shim strategy

1. `Directory.js` holds the class; `directory.js` stays as `export * from` plus the old names (`directory_tools = Directory.tools`). On Windows `directory.js` and `Directory.js` are one file, so there is no lowercase shim: the one importer (`Servex.js`) is changed in the same commit, and the old names stay as named aliases at the bottom of `Directory.js` for anything outside the repo.
2. `Agents.js`: add the statics, keep the named exports as aliases (`export const next_briefs = Agents.next_briefs`, and so on) so the 17 importers do not change in step one. A second small pass moves callers to `Agents.x` and deletes the aliases.

## Test (private port, never the live host)

1. Do it in a worktree (`worktree-up.mjs`), commit after each step.
2. `node --check` every changed file; run the existing proofs that import `Agents` (`landing-check.test.mjs`, `Sessions.test.mjs`, `cost.test.mjs`).
3. Boot a second Servex on a private port (a free port, per `Servex/doc/sdk.md`), call `ask_directory` and `list_agents`, compare against the live host's output for the same folder.
4. Only then `sustain.mjs --restart` (it restarts every running agent, so last).

## Size

About 1.5 hours and one worktree: `Directory` is a 30-minute mechanical move (256 lines, one importer); `Agents` is 20 minutes for the statics plus aliases and 40 for the proofs and the private-port boot. Risk is low for `Directory`, medium for `Agents` (a typo in the host takes every agent down until restarted).

**Waits on the owner** (CLAUDE.md: major surgery, a core API with a dozen callers). Recommended: do `Directory` first, `Agents` after.
