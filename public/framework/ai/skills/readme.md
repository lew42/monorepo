# Skills — plain readmes that tell an agent how to do one kind of job

A **skill** here is a folder of readmes, not a feature of Claude's own skill tool (the owner, 2026-10-24: stop leaning on Claude's skill system). An agent reads it like any other readme. A role's readme says which skills it leans on, with a link; nothing is installed or registered.

```
ai/skills/<name>/
├── readme.md          what the job is and when to do it; shared by every role (short, one screen)
├── mastermind.md      the part a mastermind plays (optional; one file per role that plays a part)
└── worker.md          the part a minion or Haiku plays (optional)
```

- **One skill, one folder, one part per role.** A part is named for the role that reads it: `mastermind.md`, `worker.md`, `reviewer.md`. A role reads `readme.md` and its own part, and skips the others.
- **A skill is the way to do a job, a process is the order of its steps.** A [process](/framework/core/Task/doc/process.md) says "step 3 is a Haiku search"; the skill says how a Haiku search is done.
- **Roles name their skills** in their own readme under "Skills you lean on" ([roles](../../../../Servex/agents/roles/readme.md)). The design for how a role, a process step and a skill become one spawned session: [doc/role-process-skill-session.md](../doc/role-process-skill-session.md).
- Claude's own `.claude/skills/<name>/SKILL.md` files still exist for the skills not yet moved. A skill that moves here leaves a short pointer behind, so the old name still works. Move one when you touch it; don't move them all.

## The skills

| Skill | What | Parts |
|---|---|---|
| [past-work](past-work/readme.md) | Look for what already exists before you build | [mastermind](past-work/mastermind.md) · [worker](past-work/worker.md) |
