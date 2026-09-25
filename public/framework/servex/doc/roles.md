## Who's who

```
you
├── this VS Code tab ............ the root mastermind today (routes, merges, settles disputes)
│
└── Servex (always on)
    ├── master assistant ........ one, for all cards: reads everything, changes nothing
    ├── fast assistant .......... turns your dictation into cards
    ├── Servex mastermind ....... the systems engineer: fixes Servex, skills, roles
    ├── Dispatcher .............. a script, not an agent: starts a task mastermind per task
    │   └── task mastermind ..... one task, its own worktree
    │       └── minions ......... do the edits
    └── per card
        ├── card assistant ...... answers you on that card, right away
        └── card manager ........ does that card's work; kept for the card's life
```

## Each role, and how it's set up

| role | started by | model | skill it loads | may it edit? |
|---|---|---|---|---|
| **master assistant** | Servex, at start | **Opus** | master-assistant | no (plan mode) |
| **fast assistant** | Servex, at start | Sonnet | every-prompt | yes |
| **Servex mastermind** | Servex, at start | **Opus** | servex-mastermind | yes |
| **task mastermind** | the Dispatcher, or any mastermind | **Opus** | sub-mastermind | everything |
| **minion** | a task mastermind | Sonnet | minion | yes |
| **card assistant** | Servex, the first time you talk on a card | Sonnet | its own brief (card-assistant.md) | everything |
| **card manager** | that card's assistant | **Opus** | sub-mastermind | everything |
| **clarity** | Servex, after each landing | Sonnet | clarity | everything |

Where it's set: `Servex/agents/roles.js` (one row per role) and `Servex/agents/tiers.js` (which model each size of role uses).

## The gap you spotted

No agent owns **operations**: handing out quick-fix slots, settling a task mastermind's impasse, deciding merge order. Today that's this VS Code tab, which only works while the tab is open.
