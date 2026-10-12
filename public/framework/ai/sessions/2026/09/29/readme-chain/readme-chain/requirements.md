# readme chain — give every spawned agent the readmes from root to its directory

## The owner, verbatim

> I want the mastermind system... to be able to first... operate in any directory with a fresh
> context, but also potentially with some awareness of parent... a child directory should
> probably read every README in every parent directory... reading the core or the root README
> and every README down the file system to the actual working directory, we need to read all
> those README's in order, starting from the top down, so that we first know where we are, then
> we know first level, second level, we know where we're going, and we have all the context of
> all the things at each level. Make sure that happens.

CLAUDE.md already loads automatically — don't add it.

## Deliverables

1. **`readme_chain(dir)` helper** in `Servex/agents/`, next to `brief.js`. For `dir`, returns the
   readme.md files down from the root, one per level that has one — for example
   `/framework/ux/Dictate/`:

   ```
   readme.md
   public/readme.md
   public/framework/readme.md
   public/framework/ux/readme.md
   public/framework/ux/Dictate/readme.md
   ```

   Match `readme.md` and `README.md` case-insensitively; skip a level with none. If the chain
   gets long, trim each entry to its first screen (up to the first `## More` heading or ~60
   lines) and give the path, so the agent can read the rest itself.

2. **Every agent Servex starts FOR a directory or page** gets the chain in its opening context,
   labelled "Where you are: readmes from the root down to `<dir>`". Covers: task masterminds
   (their brief's folder or the page they own), per-page/card assistants and managers (their
   page's folder), and the ☰ drawer's page AI. Find each spawn path — `Agents.spawn()`,
   `Layers.js`, `Global.js`, the drawer or card chat route. Keep it OUT of plain minions unless
   their brief names a directory.

3. **Document it**: `Servex/doc/` page/doc for the helper, plus one line in the `sub-mastermind`
   and `minion` skills ("you start with the readme chain for your directory; read deeper docs on
   demand").

4. **Prove it**: spawn a test agent on a private Servex for `/framework/ux/Dictate/` and show its
   first prompt contains the root → public → framework → ux → Dictate readmes, in order.

## Process

- Budget ~$4, at most 2 minions.
- Use a pool worktree (`take_worktree`) and `Server/merge.mjs`; restart the live Servex once at
  the end (`Servex/sustain.mjs --restart` per the sub-mastermind skill, or the `restart_servex`
  MCP tool).
- Post progress on card `2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom`, two sentences at
  a time.
- Tell `mastermind-servex-4` (the architect) this task exists — the page-sessions design
  (task-placement) should build on it.

## Where to read first

- `Servex/agents/brief.js` — where `readme_chain` lives beside.
- `Servex/agents/Agents.js`, `Layers.js`, `Global.js` — spawn paths.
- `.claude/skills/sub-mastermind/SKILL.md`, `.claude/skills/minion/SKILL.md` — the one-line add.

## Length budget

Doc page: one screen. Skill lines: one sentence each.
