# Dictation, per page

The microphone lives in the drawer — [`ext/drawer`](/framework/ext/drawer/) — the same
component on every page, opened with the same ☰ button. Its **Dictation tab** embeds the
[Dictate](/framework/ux/Dictate/) playground (one shared instance, so the words said
there are the same words the playground's own page shows). Its **AI tab** is the actual
send box: a typed message and a dictated one arrive there the same way and go out the
same way — dictation is just one more way to fill that one message box.

- The tab: `public/framework/ext/drawer/tabs/dictation.js`.
- The capture, cleanup and speech-to-text: [`ux/Dictate`](/framework/ux/Dictate/).
- Where a message goes next (a card, or this page's own thread) is the
  [Fast assistant](/framework/core/Page/ai/doc/assistant/) page.
