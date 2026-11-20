# How the Figma assistant reaches Figma (checked 2026-11-19)

## Tools

A Servex agent has the **`figma` MCP** (the remote, official server; OAuth is already done as the owner, `whoami` answers). The tools that matter:

- `create_session({fileKey, description})`: call it first for a file, and pass the returned `sessionId` to every later call.
- `use_figma({code, fileKey, sessionId, skillNames, description})`: runs Plugin API JavaScript in the file; the only way to change it. Always pass `skillNames: "figma-use"` (add `figma-generate-design` for visible design changes). Recipe: [use-figma.md](./use-figma.md).
- `get_metadata`, `get_screenshot`, `get_design_context`, `get_variable_defs`, `search_design_system`, `get_libraries`, `create_new_file`, `upload_assets`: reads and file creation.
- `figma-desktop` (Dev Mode at `127.0.0.1:3845`): only to read what the owner has selected right now. Everything else uses `figma`.

Reads (`whoami`, `create_session`, a read-only `use_figma`) and a write (a text node on the Claude page, through the `figma` tool below) were tested on 2026-11-19 and ran with no approval.

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

## From live voice, call Figma through Servex `figma`

In live voice the Claude app asks aloud before `use_figma` and a spoken yes often fails. Servex's own tool `figma` forwards the same Figma calls from the PC with no prompt: `call({tool: "figma", args: {...}})` from the chat (or `figma({...})` from a Servex agent). It returns Figma's content unchanged, images included. Full arguments and behaviour: [remote-tools.md](/Servex/ext/remote/doc/remote-tools.md#figma-call-figmas-own-mcp-through-servex-no-spoken-yes).

```js
call({tool: "figma", args: {list: "names"}})                                       // Figma's tools, writes marked
call({tool: "figma", args: {tool: "get_metadata", args: {fileKey: "3So7QCupj4U6ofjASX2ZxK", nodeId: "16:1195"}}})
call({tool: "figma", args: {tool: "create_session", args: {fileKey, description: "what I will do"}}})   // then use its sessionId:
call({tool: "figma", args: {tool: "use_figma", args: {fileKey, sessionId, skillNames: "figma-use", description, code}}})
call({tool: "figma", args: {resource: "skill://index.json"}})                      // read a skill or doc resource
```

**Two agents, one file: claim it first.** The tool checks claims, but only for calls that go through it, so everyone who writes to a Figma file follows the same convention:

1. `list_claims`; if another agent holds `figma:<fileKey>` (or `figma:<fileKey>/<page id>`), ask it to pause rather than write.
2. `claim_topic({thing: "figma:<fileKey>", change: "what you will do"})` before a multi-step edit (one `use_figma` call needs no claim).
3. Re-read the nodes you are about to change right before writing: another agent may have moved them.
4. `release_topic({thing: "figma:<fileKey>"})` when done.

A write through `figma` to a file another live agent has claimed is refused with the holder and the time; pass `force: true` only when the owner says so. Reads are never blocked.
