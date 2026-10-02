/* provider.js — the "local" half of the Claude Agent SDK proxy trick.
 *
 * Same trick as `Servex/ext/openrouter/provider.js` (read that one first — this
 * is the short version of it): the SDK only ever talks to "the Anthropic API",
 * so pointing its base url at something else that SPEAKS the Anthropic Messages
 * API makes the exact same `query()` loop run a different model. Verified live,
 * 2026-10-01: `llama-server.exe -m <model.gguf> --port 8999`, then a normal
 * Anthropic-shaped `POST /v1/messages`, got back a normal Anthropic-shaped
 * reply (`type:"message"`, `content:[{type:"text",...}]`, `stop_reason`). No
 * shim needed — `local/MODEL` works exactly like `openrouter/MODEL`.
 *
 * The one real difference from OpenRouter: there is no server answering at
 * `ANTHROPIC_BASE_URL` until Servex starts one. So the base url this module
 * hands out does not point straight at llama-server — it points at Servex's
 * OWN small proxy (`LocalProxy`, in `llama.js`), which:
 *   1. reads which model the request wants (the `model` field in the request
 *      body, e.g. `"local/qwen2.5-coder"`),
 *   2. makes sure THAT model is the one loaded (starting or swapping llama-
 *      server if it isn't — only one model fits on this GPU at a time),
 *   3. remembers the time, so the idle-unload timer knows when to free the GPU,
 *   4. forwards the request on to llama-server and streams the reply straight
 *      back.
 * That's also the answer to "where does Servex see every request" — the proxy
 * route IS the one place that happens, by construction. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/* WHERE THINGS ARE. `LLAMA_HOME` is where the llama.cpp release was unzipped;
 * `qwen2.5-coder` is the one model actually copied into its `models/` folder
 * today. The owner's env can move any of this without a code change. */
export const LLAMA_HOME = process.env.LLAMA_HOME || "C:\\llama";
export const LLAMA_EXE = path.join(LLAMA_HOME, "llama-server.exe");
export const LLAMA_PORT = Number(process.env.SERVEX_LLAMA_PORT) || 8999;        // llama-server's own port, Servex-only
export const LOCAL_PROXY_PORT = Number(process.env.SERVEX_LOCAL_PROXY_PORT) || 8998;  // what ANTHROPIC_BASE_URL points at

/* THE IDLE KNOB (requirements.md: "pick something sane, e.g. 10 — put it in one
 * constant, name it, so the owner can change it in one place"). How many
 * minutes with no request before Servex stops the loaded model and gives the
 * GPU's 12 GB back. Change this one line (or set SERVEX_LLAMA_IDLE_MIN) to
 * change it everywhere — `llama.js`'s idle timer reads only this. */
export const LLAMA_IDLE_MINUTES = Number(process.env.SERVEX_LLAMA_IDLE_MIN) || 10;

/* A shallow, bounded search for a file under `root` whose name matches `test`
 * — used below to find the two models that live in someone else's cache
 * instead of `C:\llama\models`, without hardcoding a path that changes (Hugging
 * Face names its snapshot folder after a hash that changes when the model
 * updates). Stops at `depth` levels down so a huge cache can't make this slow;
 * returns the first match, or null if `root` doesn't exist or nothing matches. */
function find_gguf(root, test, depth = 4){
	let entries;
	try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return null; }
	for (const e of entries) if (e.isFile() && test.test(e.name)) return path.join(root, e.name);
	if (depth <= 0) return null;
	for (const e of entries) if (e.isDirectory()){
		const hit = find_gguf(path.join(root, e.name), test, depth - 1);
		if (hit) return hit;
	}
	return null;
}

const home = os.homedir();

/* THE THREE MODELS THIS GPU FITS (requirements.md's "already answered": RTX
 * 4070 SUPER, 12 GB VRAM — qwen2.5-coder 4.7 GB, gemma-3-4b 2.5 GB, gemma-4-e4b
 * 5.5 GB; only one loaded at a time). Only qwen2.5-coder is copied into
 * `C:\llama\models` today; the other two are read straight out of wherever LM
 * Studio and the Hugging Face cache already put them — found by file name
 * instead of copying multi-gigabyte files around, which is both slower and one
 * more place for the same bytes to go stale. A model whose file isn't found
 * yet is `null`, not a crash; everything downstream (the dropdown, `ensure()`)
 * already treats a missing model as "not offered", not an error. */
export const MODELS = {
	"qwen2.5-coder": path.join(LLAMA_HOME, "models", "qwen2.5-coder.gguf"),
	"gemma-3-4b": find_gguf(path.join(home, ".lmstudio", "models"), /^gemma-3-4b.*\.gguf$/i),
	"gemma-4-e4b": find_gguf(path.join(home, ".cache", "huggingface", "hub"), /^gemma-4-e4b.*\.gguf$/i)
};

/* The dropdown's list: every slug whose file actually exists on disk right
 * now, newest/biggest first doesn't matter — alphabetical is fine. */
export function available_models(){
	return Object.keys(MODELS).filter(slug => MODELS[slug] && fs.existsSync(MODELS[slug])).sort();
}

/* A model id with a `local/` prefix (`local/qwen2.5-coder`) picks this
 * provider — checked AHEAD of OpenRouter's plain "/" rule in Agents.js, since
 * `local/qwen2.5-coder` also contains a `/`. */
export const is_local_model = model => String(model ?? "").startsWith("local/");
export const slug_of = model => String(model ?? "").replace(/^local\//, "");

/* The env a spawned `claude` process needs to run through the local proxy
 * instead of Anthropic. No key: it's loopback-only and llama-server never asks
 * for one. `ANTHROPIC_API_KEY`/`CLAUDE_CODE_OAUTH_TOKEN` are blanked for the
 * same reason openrouter/provider.js blanks them — either one left set lets
 * the CLI authenticate straight past the base-url swap and bill the owner's
 * real Claude subscription instead of talking to the local model at all. */
export function env_for(provider){
	if (provider !== "local") return {};
	return {
		ANTHROPIC_BASE_URL: `http://127.0.0.1:${LOCAL_PROXY_PORT}`,
		ANTHROPIC_AUTH_TOKEN: "",
		ANTHROPIC_API_KEY: "",
		CLAUDE_CODE_OAUTH_TOKEN: ""
	};
}
