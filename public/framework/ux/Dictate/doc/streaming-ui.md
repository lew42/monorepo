# Streaming dictation UI and context cards (owner, 2026-10-13)

The owner's design ideas, dictated while the Figma `Screens · Transcription` page was being built. They are being designed in Figma (file `QYN0G2URSBHYH5I06MOjxU`, see [ext/Figma](/framework/ext/Figma/)) before any code changes.

## The live text area
- A small text area, about **three lines**, holds the raw transcription as it streams in.
- Chunks end at a sentence (a period). As each sentence finishes, it **leaves the text area** and moves up into the refined prompt, even while the next sentence is still arriving.
- The design must show the states and the transitions: a half-finished sentence, then the finished sentence, then the sentence moving up, all next to each other.

## Refining is a ladder
1. **References first.** The first refinement only finds the things the owner mentioned and links them. Three things mentioned means three **pills** appear on screen (an icon and a name, each linking to its page).
2. **Relations next.** Once the context is on screen, show how the pieces connect ("move this to that"): symbols, arrows, flowchart notation, whatever layout fits.

## Context cards
- A pill is a padded frame with an icon and a name. The same layout, **expanded**, becomes a context card: the pill is its header row, and one more row below holds anything (a log line, a message, a request, a question, a recent event).
- A card references something else, like a quote block. It can link, with a special **launch arrow** that means "go to this thing's own view". That view is a custom view about the topic, not just a URL.
- One component family covers the pill, the card header and the card body.
