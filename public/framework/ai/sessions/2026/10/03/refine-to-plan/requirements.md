# Prompt refinement → plan → a quick first try

## The ask (owner, 2026-10-03 ~23:00, dictated, verbatim excerpts)
> first we have the raw prompt, kind of what my intent is. It gets transferred into text, which may or may not happen accurately, but we want to refine it into something that, you know, makes sense. If there's things that don't make sense, we can kind of red flag them and I can try and clarify ... especially if this is a real-time update thing ... amend the UI and create the proper cards

> going from prompt refinement to then like beginning the actual task should probably mostly happen automatically. At least a first pass, like what can be done? Can we try something real quick and see if it works? ... especially if you have a quick work tree available, always you can just ask a minion to, to try a few things, see what works. See how many tokens it's taking to like get a first go of it. And uh, hopefully we can estimate the complexity of tasks.

> the prompt becomes like the plan, right? ... the planning phase might be taking an initial prompt and kind of, you know, getting some AI feedback, initial AI feedback, and then fleshing it out with like more, maybe I help answer, you know, direction decisions.

> I'm not sure if moving to a clean session and losing all of my past transcriptions is the best idea because then I have to like repeat everything and I don't know what was written down.

Full raw prompt: /framework/ai/2026/10/03/session-60d9def6/.

## Where it stands (2026-10-03 night)
- Hook → session page → Echo works: each owner prompt in a VS Code tab is cleaned into numbered sentences in ~13 s (~$0.21 each; target cents).
- Missing: sections/topics, red flags shown for clarification, asks pulled out as cards, threaded replies (prompts-live left these + an event-wiring break in Servex).
- Fixed tonight: subagent hand-backs were logged and refined as owner prompts (commit 8615f0de).

## Want, in order
1. Finish refinement: sections, red-flagged unclear bits the owner can clarify, each ask as its own card, at cents per prompt.
2. Refined prompt → plan: an AI first read with direction questions the owner can answer (decide tool), never blocking (law 5).
3. Plan → quick first try: a minion in a pool worktree tries the smallest version, and the tokens/$ it took are recorded beside the plan.
4. Complexity estimate: record per task what was built (files, classes, UI parts) next to its tokens, so estimates improve; name what actually drives token cost.
5. A new session never loses the old one's words: a fresh tab reads the previous tab's refined asks (open/landed) so the owner never has to repeat anything.

6. **A demo page** (owner, 2026-10-03: "is there a page that demos like a live voice session with the prompt refinement kind of built into it?"): one page where you talk and watch raw → clean → structured → cards appear live. Today the pieces are split: /framework/ux/Dictate/ (live voice, a collapsed "refined" block per sentence group, from minion-voice-refine, merged 8ce2c9ef with no landing line) and /framework/ext/Refine/ (the four-column ladder, but from a saved run, not live).

Owner: @task-mastermind-one-dictation (Echo, Refine). Servex pieces (event wiring, dispatch) with @mastermind-servex-10.
Budget: $15

## Added 2026-10-04 (owner): file every answered question
A question worth asking and paying to answer is filed once, as a Q&A on the page it belongs to (its FAQ), and logs and replies link to it instead of re-answering. The refiner marks each question in a prompt; the answer links back to the prompt sentence.

## Measured 2026-10-04: refining 10 real prompts
DeepSeek v4.1 flash 10/10 (~$0.001/prompt), local Qwen 8/10 ($0), Sonnet 7/10 (~$0.003/prompt as a raw call; ~$0.21 inside an agent session). eval-results-refine-sonnet.json in ai/sessions/2026/10/04/new-brain/new-brain/.
