# Directory audits (script inventory, not judged)

## 1. Transcription: every piece found

| piece | where | readme | mentions Servex | mentions Dictate |
|---|---|---|---|---|
| Dictate | /framework/ux/Dictate | 365 lines | yes | yes |
| Transcriber | /framework/audio/Transcriber | 63 lines | NO | yes |
| Refine | /framework/ext/Refine | 53 lines | NO | yes |
| Chat | /framework/ext/Chat | 40 lines | NO | NO |
| whisper | /framework/core/Page/card/log/whisper | 31 lines | NO | yes |

Also: the Servex whisper server (`Servex/readme.md`) and `ux/Dictate/doc/whisper.md`. Names: Dictate (widget), Transcriber (audio engine), Refine (clean transcript and prompt cards), whisper/clipmic (Page log card). No single overview ties them together. Proposal: a `ux/Dictate/doc/pieces.md` table like this one, linked from each readme. Not written.

## 2. core/Page

- `readme.md` is 105 lines; `doc/` has 28 entries.
- page.js vs page.jsonl: `doc/page-jsonl.md`. JSONL streaming: `doc/jsonl.md`, `doc/data.md`, `doc/data-children.md`. Dynamic routing: `dynamic/`. Creating a page: `doc/declaring.md`, `doc/loading.md`.
- Readme links them?
  - page-jsonl: NO
  - jsonl: yes
  - data: yes
  - declaring: NO
  - loading: yes
  - dynamic: yes
- Proposal: `doc/jsonl.md` is the primary JSONL overview; other docs backlink to it (see `jsonl-map.md`).

## 3. framework/ai and Servex docs

- `Servex/doc/` has 13 files (incl. `readme-chain.md`); the site view is `/framework/servex/`.
- ai readme mentions Servex: yes. Servex readme mentions framework/ai: yes.

## Rendering readmes at the top of pages (report only)
Not tried in a browser. Page already loads each module's readme for the readme chain; showing it above the first screen competes with 'show, don't tell'. Suggest an opt-in collapsed strip, not a default.
