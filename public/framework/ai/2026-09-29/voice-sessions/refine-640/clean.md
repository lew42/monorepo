S1. Yeah, so I think with the smart assistant part, and I think right now it might be called like a manager or something, and it's per page.
S2. I think what I'm feeling here is that the two assistants can be kind of per voice session, and those should be more global and context aware as we're switching, as I just said.
S3. However, any path, any page essentially, could have a mastermind, could and should have a default mastermind based on the README.
S4. So starting a fresh mastermind in any directory should automatically load, well, we were saying, top-down.
S5. So right now, Claude, any Claude session automatically loads Claude.md and all the Claude skills.
S6. And we're going to potentially generalize this if we use Open Router and maybe our own harness.
S7. So this might have to kind of adapt as we kind of make it cross-compatible.
S8. However, generally speaking, okay, so let's say I'm paging around and I write and I'm using a voice session and I'm talking about a bunch of things and I'm jumping from here to there.
S9. As I jump through page to page and the assistants see which page I'm on and then I ask a question about the thing, so they should automatically have contextual awareness of what I'm talking about based on getting those navigation updates.
S10. And then when I ask it a question about that thing, we don't want those assistants digging into the details of that thing.
S11. And so the whole README chain of well, it's really spawning a fresh mastermind, a fresh mastermind, fresh context that should be just based on the path alone.
S12. And so if we keep the config or the dependency loading or whatever to a minimum, the idea is that no matter what model we're using, no matter which provider or whether it's Claude or OpenAI or whatever, we put all the necessary details and we build the entire system around this README.
S13. And so when you start a mastermind in a specific directory, its basic operating principle is to load the README.
S14. Well, really load all parent readmes, load all the system prompts, obviously.
S15. We'll have to try and unify that process, whether it's a Claude.md or an agents.md.
S16. But load the system prompt, load probably some skills.
S17. I think that could be useful.
S18. Obviously, all the tools and MCPs.
S19. So that's all kind of baked in, but it's really the gist of the new prompt is you're a mastermind working in this directory.
S20. And then that mastermind would have the ability to spawn minions to build things, test fixes, for example.
S21. It might be able to use a quick fix work tree, for example.
S22. But that mastermind is the technical part, where all the questions about the technicality get routed.
S23. And so the fast assistant probably doesn't do much of anything in terms of interacting with the mastermind.
S24. It should probably be the smart assistant who makes all the kind of executive decisions and pulls all the triggers.
S25. So the fast assistant is literally just doing a quick transcribe, getting the text on the screen as fast as possible.
S26. And updating UIs or writing a minimal amount of things.
S27. We'll have to make the roles explicit here.
S28. And maybe we merge them together in the future, but I think right now I want to try keeping a quick model just for instant feedback and just to see the results of my words as quickly as possible.
S29. So that's roughly how we have it set up.
S30. But I do think renaming it a little bit seems to make sense here.
S31. All right, and then in terms of the per-page AI sessions versus the global sessions, I'm thinking that the per-page mastermind kind of just becomes what I was describing of the read per-directory README system, and so we just kind of assume that we're going to start fresh.
S32. We're gonna assume that we've had everything, all the updates in the README, or maybe the README points to a log if there's a more detailed ongoing process that we don't want to put log data in the README, which we probably don't.
S33. But whatever the system is, we assume.
S34. Make sure this is clear for the Servex skill architect.
S35. We want every new mastermind on a per-directory basis.
S36. A per-page basis to start with a fresh slate.
S37. So we always want to keep that README and all the referenced documentation up to date.
S38. And so whenever we, well, and frankly, if we're doing parallel work and we're going to spawn a work tree, we should always assume that work tree is in a stable state.
S39. And so we use a work tree to first build the thing, then update all the documentation.
S40. And maybe spawn a fresh mastermind just to load it all up and do a smoke test.
S41. And maybe we should do the review process after the documentation has been updated, just so when we load it all up and we ask it to review the system, the README system, all the systems inside of it, it can pull up all the recent, most current information and just do kind of a smoke test to see whether it all makes sense or whether there's anything unclear or missing, for example.
