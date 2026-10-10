# Minion 3: the drawer walkthrough (Next / Next)

Load the `minion` skill, then `new-page` and `content`. The owner: "demos so simple and self-evident that I literally just click Next".

**Build** `/framework/ext/drawer/walkthrough/`, a copy of the shape of `public/framework/ux/Dictate/playground/walkthrough/page.js` (54 lines; read it first). Add `children: ["walkthrough"]` (or append to an existing list) in `public/framework/ext/drawer/page.js`, and one link to it at the top of `ext/drawer/readme.md`'s More section.

**Steps** (one small screen each, a screenshot plus a one-line caption). Copy the pngs from `public/framework/ai/2026-09-28/page-drawer/proof/` into `ext/drawer/walkthrough/shots/` (check `git check-ignore` on that dir; if it's ignored, name the dir `pictures/`):
1. The ☰, top right of every page: `menu-3440-devbar.png`
2. The AI tab, chat and dictate, with a model picker: `plain-ai-1920.png`
3. Sessions: every thread on this page, one click to jump back in: `thread-resumed-1280.png`
4. A reload keeps the tab (`?drawer=sessions`): `reload-sessions.png`
5. Select any paragraph or card; its properties open: `select-paragraph-properties-1920.png`
6. "Ask about this" puts it in the chat as a chip: `chip-in-input-1920.png`
7. Dictation, Settings and Admin: `tab-dictation-1280.png`

**Rules.** Work in the main tree (C:\Code\lew42\monorepo). Before writing, run `node Server/hold.mjs on "minion-drawer-walkthrough — walkthrough" --paths "public/framework/ext/drawer/**"`, and afterwards `node Server/hold.mjs off "minion-drawer-walkthrough"`. Touch only `ext/drawer/page.js` (the children line), `ext/drawer/readme.md` (one line) and `ext/drawer/walkthrough/**`. Load http://monorepo.localhost/framework/ext/drawer/walkthrough/ headless (Playwright, never the owner's tabs) and click through every step. Zero console errors. Save one 1920 shot of step 1 at `public/framework/ai/2026-09-28/page-drawer/proof/walkthrough-1920.png`. Don't commit. Every spawn uses `windowsHide: true`. Reply with the url and stop.
