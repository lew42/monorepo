# Figma: section 15 on the Forms page, the in-app browser escape

Budget: $5. Load the `minion` skill, then the `figma` skill, then `figma:figma-use` before any `use_figma` call. Read `public/framework/ext/Figma/doc/start-here-v3.md` and `doc/assistant-access.md` first.

Card: /framework/ai/2026/11/25/auth-get-people-out-of-in-app-browsers/.

## Where
File "Claude November 2026", key `woCZQDoXKJW3GcJPZukW7f`, page Forms `103:11`, inside the one auto-layout frame `root` `103:12`, AFTER section 14. Read the existing sections first and copy their shape (header, 400 px phone frames, labels). No Figma Sections, nothing at the page root. Lew42 v3 text styles; phone colours from the local "Form scheme" collection, as the other sections use. Do not rename or restyle anything that exists.

## What to draw: "15 · Out of the in-app browser", six 400 px phone frames in order
1. In-app landing (an in-app browser's top bar, e.g. YouTube or Instagram): a short talking-head video, a "Continue with Google" button, and under it a small "Not working? Send me a link" link. Show the Android variant's "Open in Chrome" button too (a second small frame or a note).
2. The bottom sheet: phone or email field, a Send button, and the note "In the app's browser you're probably not signed in. The link opens your own browser, where you are."
3. The text message arriving (an iOS Messages banner with the link).
4. The page reopened in Safari, signed in, at the same place in the flow ("Welcome back").
5. Add to Home Screen (the Safari share-sheet step, or a short how-to card).
6. The notification permission prompt (the iOS system dialog over the home-screen app).
Reuse first: components from earlier sections (04 sign-in, 07 forms on video, 02 buttons).

## Done when
A screenshot of section 15 saved in this folder (`section15.png`), the node id logged as a `log` line in this folder's task log, and a 3-line message to mastermind-forms with the node link. Never: edit other pages or sections, use git's stash, push.
