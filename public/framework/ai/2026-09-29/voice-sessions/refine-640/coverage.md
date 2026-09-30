# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | Yeah, so I think with the smart assistant part, and I think right now it might be called like a manager or something, and it's per page. | ask #1 |
| S2 | I think what I'm feeling here is that the two assistants can be kind of per voice session, and those should be more global and context aware as we're switching, as I just said. | ask #2 |
| S3 | However, any path, any page essentially, could have a mastermind, could and should have a default mastermind based on the README. | ask #3 |
| S4 | So starting a fresh mastermind in any directory should automatically load, well, we were saying, top-down. | ask #4 |
| S5 | So right now, Claude, any Claude session automatically loads Claude.md and all the Claude skills. | ask #4 |
| S6 | And we're going to potentially generalize this if we use Open Router and maybe our own harness. | ask #4 |
| S7 | So this might have to kind of adapt as we kind of make it cross-compatible. | ask #4 |
| S8 | However, generally speaking, okay, so let's say I'm paging around and I write and I'm using a voice session and I'm talking about a bunch of things and I'm jumping from here to there. | ask #5 |
| S9 | As I jump through page to page and the assistants see which page I'm on and then I ask a question about the thing, so they should automatically have contextual awareness of what I'm talking about based on getting those navigation updates. | ask #5 |
| S10 | And then when I ask it a question about that thing, we don't want those assistants digging into the details of that thing. | ask #6 |
| S11 | And so the whole README chain of well, it's really spawning a fresh mastermind, a fresh mastermind, fresh context that should be just based on the path alone. | ask #6 |
| S12 | And so if we keep the config or the dependency loading or whatever to a minimum, the idea is that no matter what model we're using, no matter which provider or whether it's Claude or OpenAI or whatever, we put all the necessary details and we build the entire system around this README. | ask #7 |
| S13 | And so when you start a mastermind in a specific directory, its basic operating principle is to load the README. | ask #8 |
| S14 | Well, really load all parent readmes, load all the system prompts, obviously. | ask #8 |
| S15 | We'll have to try and unify that process, whether it's a Claude.md or an agents.md. | ask #8 |
| S16 | But load the system prompt, load probably some skills. | ask #8 |
| S17 | I think that could be useful. | ask #8 |
| S18 | Obviously, all the tools and MCPs. | ask #8 |
| S19 | So that's all kind of baked in, but it's really the gist of the new prompt is you're a mastermind working in this directory. | ask #9 |
| S20 | And then that mastermind would have the ability to spawn minions to build things, test fixes, for example. | ask #10 |
| S21 | It might be able to use a quick fix work tree, for example. | ask #10 |
| S22 | But that mastermind is the technical part, where all the questions about the technicality get routed. | ask #10 |
| S23 | And so the fast assistant probably doesn't do much of anything in terms of interacting with the mastermind. | ask #11 |
| S24 | It should probably be the smart assistant who makes all the kind of executive decisions and pulls all the triggers. | ask #11 |
| S25 | So the fast assistant is literally just doing a quick transcribe, getting the text on the screen as fast as possible. | ask #12 |
| S26 | And updating UIs or writing a minimal amount of things. | ask #12 |
| S27 | We'll have to make the roles explicit here. | ask #13 |
| S28 | And maybe we merge them together in the future, but I think right now I want to try keeping a quick model just for instant feedback and just to see the results of my words as quickly as possible. | ask #13 |
| S29 | So that's roughly how we have it set up. | ask #13 |
| S30 | But I do think renaming it a little bit seems to make sense here. | ask #13 |
| S31 | All right, and then in terms of the per-page AI sessions versus the global sessions, I'm thinking that the per-page mastermind kind of just becomes what I was describing of the read per-directory README system, and so we just kind of assume that we're going to start fresh. | ask #14 |
| S32 | We're gonna assume that we've had everything, all the updates in the README, or maybe the README points to a log if there's a more detailed ongoing process that we don't want to put log data in the README, which we probably don't. | ask #14 |
| S33 | But whatever the system is, we assume. | ask #15 |
| S34 | Make sure this is clear for the Servex skill architect. | ask #15 |
| S35 | We want every new mastermind on a per-directory basis. | ask #15 |
| S36 | A per-page basis to start with a fresh slate. | ask #15 |
| S37 | So we always want to keep that README and all the referenced documentation up to date. | ask #15 |
| S38 | And so whenever we, well, and frankly, if we're doing parallel work and we're going to spawn a work tree, we should always assume that work tree is in a stable state. | ask #16 |
| S39 | And so we use a work tree to first build the thing, then update all the documentation. | ask #16 |
| S40 | And maybe spawn a fresh mastermind just to load it all up and do a smoke test. | ask #16 |
| S41 | And maybe we should do the review process after the documentation has been updated, just so when we load it all up and we ask it to review the system, the README system, all the systems inside of it, it can pull up all the recent, most current information and just do kind of a smoke test to see whether it all makes sense or whether there's anything unclear or missing, for example. | ask #17 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #2 | new words | "between" — not in the transcript at all |
| #3 | new words | "give" — not in the transcript at all |
| #4 | new words | "already", "stays", "another", "used" — not in the transcript at all |
| #5 | new words | "during" — not in the transcript at all |
| #6 | new words | "asked", "instead" — not in the transcript at all |
| #8 | new words | "follow", "trying", "adding" — not in the transcript at all |
| #9 | new words | "bake", "material" — not in the transcript at all |
| #13 | new words | "already" — not in the transcript at all |
| #14 | strength word | uses "always", not found in the cited sentence(s) |
| #14 | new words | "clutter" — not in the transcript at all |
| #15 | strength word | uses "must", not found in the cited sentence(s) |
| #15 | new words | "holds", "regardless", "underlying", "must", "kept" — not in the transcript at all |
| #17 | new words | "happen", "asked" — not in the transcript at all |
