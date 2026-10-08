# Chat reactions: requirements

Deliverables 1 to 4 are in your first prompt. This file adds deliverable 5, which the owner asked for after you were queued.

## 5. One acknowledgement, not two

The owner's words (by voice, on /framework/ux/Dictate/, 2026-09-30):

> "if both assistants are responding with roughly just kind of a, That's very simple. If an emoji could work just as well, sort of like a yes, heard you, or okay, we'll do that... I'd probably leave it to the smart assistant to make that call. But I think the fast assistant could wait for the smart assistant."

What that means:

- Today the fast and smart assistants often send almost the same short acknowledgement. Only one should go out.
- When all the reply needs to say is "heard you" or "okay, we'll do that", the **smart** assistant makes the call. It can answer with a reaction (✅ or 👍) on the owner's bubble instead of writing text.
- The **fast** assistant first waits a short, fixed time for the smart one. Pick the timeout (a few seconds) and write it down in the docs.
- If the smart assistant has already reacted or replied, the fast assistant says nothing. If it hasn't, the fast assistant posts its usual one-liner.
- Make the change where the session's fast and smart prompts and the posting flow live. The writer of `public/framework/ux/Dictate/ai/v-<id>.jsonl` and the every-prompt skill will lead you there.

The owner was still speaking when this was written down, so more may follow.

The owner added, which confirms the fallback: "If maybe if the smart assistant hasn't responded in a certain amount of time, then the fast assistant could just reply with kind of like a," (the sentence was cut off there).

## 6. What the fast assistant sends when the smart one is slow

The owner: "maybe a best guess, like I think that'd be okay, or I don't know, like, or not sure what's wrong here... for simple prompts or for simple messages like an emoji response would work also."

So when the wait runs out, the fast assistant sends its best guess in a few words ("I think that'd be okay", "not sure what's wrong here"). For a simple message, an emoji reaction on its own is enough.

## 7. An icon for each assistant, used as its avatar and name

The owner: "choose an icon for both the fast and the smart assistant and then on the chat card just make it more in line so it's like whatever the fast assistant's icon is is kind of like their avatar and doubles as the username... maybe two forward arrows for Fast and... a brain for the smart assistant."

- Fast is ⏩. Smart is 🧠.
- In each bubble's label, the icon replaces the word "fast" or "smart" and sits inline, as the avatar. The 🎤/⌨ mark stays.

## 8. Reactions belong to the chat module, not to Dictate

The owner: "as part of this emoji reaction thing for our chat UI, This should be an extension... /framework/ext/Chat... could have any source, whether it's a dictation app..."

- Build reactions and avatars in /framework/ext/Chat/ (it already exists), so any source can use them, not only Dictate.
- Dictate and the dev bar should use them through Chat.

## 9. (Noted, not in this task unless it's small) Streamed input

The owner: "it should have a streaming input system. So messages aren't just sent, but streamed. And so as I'm dictating this into this text area... it's kinda bad."

The owner was still talking. Report what Chat does today with in-progress (streamed) text and what it would take. Don't build it here unless it's small.

## 10. The composer wastes space on a phone (a bug report, fix it if Chat owns it)

The owner, on a phone, on /framework/ux/Dictate/: "the text area is about 50% of my screen's width. It's alongside the microphone, the send, there's three dots and this looks like a gear... more like a ship's wheel than a gear... It has a massive void of space to the right of it, above the three or four buttons."

- At phone width the text area should fill the row, with the buttons beside it or below it, and no empty block above the buttons.
- The settings icon reads as a ship's wheel. Use a clearer gear.
- Prove the fix with a phone-width screenshot, before and after.

## 11. Messages inline with an avatar icon, for everyone (refines 7)

The owner: "get the messages on the same line as the icon that represents the user. Make my icon like an avatar or a head or something. I think somebody's picture might be the best way. Or... people could choose an icon... The agent should stay on the left. I should, you know, keep all the styling the same. I like the color coding and everything... have inline messages just with a little icon."

- Every bubble starts with a small avatar icon, and the message text begins on the same line. No separate label row above the words.
- Fast is ⏩. Smart is 🧠. The owner gets a person/head icon by default (👤 or a small SVG head). Let a user pick their own icon or picture later: build a hook for it (one setting), not a full picker.
- Keep the current sides, colors and bubble styling exactly as they are. The agents stay on the left.
- The 🎤/⌨ mark stays, and becomes small and trailing.

Item 10 (the broken composer layout) is confirmed again: "The layout is broken... that space is not being utilized properly and it looks broken." More may follow.

## Added by the VS Code tab (the owner, 2026-09-30 about 1:05 PM)

- **Long-tap a bubble for quick reactions** (👍 ✅ ❤ ? …); tap a reaction to remove it. It's a line in the session log, and the latest line wins.
- **Reply to a specific message, THREADED:** a reply is attached to its parent bubble, shown as a thread under it (collapsed to "N replies"), not appended at the bottom out of context. The line carries `re: <parent at/id>`.


## 12. Icons, revised (relayed by servex-mastermind-opus, 2026-09-30, from the owner)

> "Chat bubbles show only an ICON as the author, no name text: a BRAIN for the smart assistant, a fast icon (a bolt) for the fast assistant, a small user AVATAR for the owner (instead of "you"), and for any MASTERMIND the site's M logo (the mlogo SVG in the sidebar's top left on the home and framework pages; find the file and use it like an icon)."
> "New cards and messages show which agent made them: the icon plus the agent id on hover. A reference to an existing card needs no author."

This replaces the ⏩ in items 7 and 11 with a bolt ⚡.
