# How the Figma assistant reaches Figma (checked 2026-11-19)

## Tools

A Servex agent has the **`figma` MCP** (the remote, official server; OAuth is already done as the owner, `whoami` answers). The tools that matter:

- `create_session({fileKey, description})`: call it first for a file, and pass the returned `sessionId` to every later call.
- `use_figma({code, fileKey, sessionId, skillNames, description})`: runs Plugin API JavaScript in the file; the only way to change it. Always pass `skillNames: "figma-use"` (add `figma-generate-design` for visible design changes). Recipe: [use-figma.md](./use-figma.md).
- `get_metadata`, `get_screenshot`, `get_design_context`, `get_variable_defs`, `search_design_system`, `get_libraries`, `create_new_file`, `upload_assets`: reads and file creation.
- `figma-desktop` (Dev Mode at `127.0.0.1:3845`): only to read what the owner has selected right now. Everything else uses `figma`.

Read calls (`whoami`, `create_session`, a read-only `use_figma`) were tested from a Servex agent on 2026-11-19 and ran with no approval. A write was not tested (the setup turn forbade changes); the first real write should confirm it and this line should be updated.

## Approval clicks

The clicks the owner sees come from the **cloud voice agent**, a claude.ai connector, which asks before each write. A Servex agent of role `mastermind` runs with `bypassPermissions`, so Claude Code asks nobody. Figma itself has no per-call confirmation. So: route Figma writes to this assistant, not to the voice agent.

## Skills

The plugin skills (`figma:figma-use`, `figma:figma-generate-design`, `figma:figma-generate-library`, `figma:figma-use-figjam`, ...) are loaded with the Skill tool. They are mandatory before `use_figma` (see the `figma-use` text). The repo's own `.claude/skills/figma/SKILL.md` is a pointer to these docs, nothing more.

## Pitfalls

- **Rate limit** about 10 calls a minute, 200 a day, shared by every agent; one batched `use_figma` beats five small ones.
- A page's content is only loaded after `await figma.setCurrentPageAsync(page)`; it resets to the first page on every call, and switch at most once per call.
- Variables hidden from publishing cannot be bound in a consuming file. Unhide, republish the library, accept the update in the consumer.
- A consumer file sees a library's components, styles and variables only after the owner publishes and accepts the update; `importComponentByKeyAsync` says "not found" until then.
- `figma.root.name` is "Document" in the headless copy; the owner renames files in Figma.
- Hug frames keep a stale size after a mode or padding change by script; toggle the sizing to FIXED then HUG, children first.
- Others in [troubleshooting.md](./troubleshooting.md) and [use-figma.md](./use-figma.md#traps).

## The job in hand (2026-11-19, update as it changes)

Target file **"November 2026"** (was "Untitled"), key `3So7QCupj4U6ofjASX2ZxK` (not the old library of the same name, `hbolzQ3Xnc78rhxAPj8xK2`). Its pages: Transparent Video `7:68`, Person Vectors `7:78`, Page 1 `0:1`, Page with Root `5:60`, 1920 `2:9`, 1600 `3:49`.

- Page `7:68` holds the owner's own frame `7:69` "Frame 1" (heading text `7:70`): **leave it alone**. Also on the page: `7:71` Transparent Video Preview (component), `7:73` Frame 1, Ellipse `7:74`, two vectors `7:75`, `7:77`.
- Frame `10:66` "Transparent Video" (1000 wide) was built by the voice agent from **Lew42 v3** (`JYGQX0WaBO4HcGMZTkL2rx`) component instances from the kit's Content page, v3 text styles and the v3 scale variables (width, pad, gap).
- Open: (a) the frame's white fill and the code block's black text are hardcoded, because the v3 colour variables `fill` and `text` were hidden from publishing. All 11 are now unhidden in v3; the owner must republish v3 and accept the update in the target file before they can be bound. (b) v3 has no code-block component; the code block `10:134` is a plain frame using the `code` text style and the `darken` variable.

## From a claude.ai cloud chat (checked 2026-11-19, project "Design (Figma + FAL)")

- A cloud chat has the same `figma` MCP as a connector. Writes work from it: on 2026-11-19 it created the **Claude** page (`16:1195`) in "November 2026" (`3So7QCupj4U6ofjASX2ZxK`) with `use_figma`, and frame `16:1196` (1024 × 1024) there. That page is the cloud agents' test space.
- Skills there are not in a plugin cache: read them with `get_figma_skill` (`skill://figma/figma-use/SKILL.md`, `skill://figma/figma-generate-design/SKILL.md`) and pass `skillNames: "resource:figma-use"`.
- **An image from a URL (for example a fal.ai output):** `use_figma` has no `createImageAsync`. Make the frame, call `upload_assets({fileKey, nodeIds: [frameId], scaleMode: "FILL"})`, then POST the raw bytes to the returned `submitUrl` with `Content-Type: image/png` (`curl --data-binary @file`). Raw bytes keep the frame's name; a multipart upload renames the layer to the file name. The upload URL is single-use and lasts 10 minutes.
- **Seeing what is in a file:** `get_screenshot` with `enableBase64Response: true` returns the image inline; `maxDimension` at the node's size gives it 1:1.
- The cloud project's own map of these docs is its project doc `claude/figma.md`.
