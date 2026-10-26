verdict: fix
1. [fix] `Servex/agents/doc/layers.md:112` still lists `SERVEX_MIN_FREE_MB` with a default of 4096. That table is the reference people use for the setting's default, so it now gives the wrong number. Change it to 2560 in the same branch.
2. [note] `Servex/agents/roles/ai-system-mastermind.md:70` still tells that mastermind to spawn audit minions only with "more than 4 GB free", and `Servex/agents/doc/assistant-chain.md:44` still says `Echo.call` refuses under "a 4 GB RAM floor". Change both to 2.5 GB. If the mastermind is meant to keep the stricter 4 GB margin, add a word saying that on purpose.
3. [note] `Servex/doc/dormant.md:126` adds "(lowered from 4 GB on 2026-10-24 at the owner's word)". That is history inside a readme, and law 9 asks for none, so the commit message can carry it instead. The rewritten sentence about the cap stopping the ninth agent is correct now that 3.8 GB is above the floor.
4. [note] The tests (`Servex/agents/global.test.mjs:397-409`, `queue-proof.mjs:34`) pass 4096 explicitly, so they still pass and never test the new default. That is fine, but no test checks that the default is now 2560.

## Requirements
No `requirements.md` in the task folder. The ask comes from `page.jsonl`: "lower the free-memory floor 4096 -> 2560 MB (owner, priority 1)", with Global.js, Echo.js and the docs updated.
- 1 "Global.js min_free_mb default to 2560" — yes — diff, `Servex/agents/Global.js:88`
- 2 "Echo.js floor to 2560" — yes — diff, `Servex/agents/Echo.js:123-125`, and its comment changes to 2.5 GB
- 3 "docs updated" — partly — `mastermind.md:222` and `dormant.md:126,128` are updated; `layers.md:112`, `ai-system-mastermind.md:70` and `assistant-chain.md:44` still say 4096 / 4 GB
- 4 a class added or changed — n/a (only a default value changes)
- Simpler way: none. The two defaults could share one constant, but Echo reads the env var on its own to avoid going through Global, and this diff keeps that design.

## Words
- content: plain sentences, the numbers match (2560 MB = 2.5 GB) — yes
- content: no history in readmes — no — `dormant.md:126` "(lowered from 4 GB on 2026-10-24 at the owner's word)"
