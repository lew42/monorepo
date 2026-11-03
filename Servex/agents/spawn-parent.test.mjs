// The parent of a spawn is the caller's own id, never the remote door's "voice-app". `node Servex/agents/spawn-parent.test.mjs`
import assert from "node:assert";
import { tools } from "./tools.js";
import RemoteMCP from "../ext/remote/RemoteMCP.js";
import fs from "node:fs";
assert.equal(RemoteMCP.CALLER, fs.readFileSync(new URL("./tools.js", import.meta.url), "utf8").match(/const REMOTE_CALLER = "([^"]+)"/)[1], "tools.js REMOTE_CALLER must equal RemoteMCP.CALLER");

const seen = [];
const agents = {
	spawn: a => { seen.push(a.parent); return { card: () => ({ id: "x" }) }; },
	external: { register: ({ id }) => ({ id }) },
	reg: () => ({ read: () => ({}) }),
	policy: { spawn: () => ({ ok: true }), parent: () => null }
};
const spawn = tools(agents).find(t => t.name === "spawn_agent");
const parent_of = async (args, ctx) => { seen.length = 0; await spawn.handler({ prompt: "p", ...args }, ctx); return seen[0]; };

assert.equal(await parent_of({}, { caller: "mastermind-a" }), "mastermind-a", "a Servex agent's own door names it");
assert.equal(await parent_of({ parent: "mastermind-b" }, { caller: "voice-app" }), "mastermind-b", "an explicit parent wins");
assert.equal(await parent_of({ session_id: "5b6b1e66-aaaa" }, { caller: "voice-app" }), "vscode-5b6b1e66", "a tab through the remote door is its tab, not voice-app");
assert.equal(await parent_of({ session_id: "5b6b1e66-aaaa" }, { caller: null }), "vscode-5b6b1e66", "a tab on the local door");
assert.equal(await parent_of({}, { caller: "voice-app" }), "voice-app", "the voice agent itself still parents its own spawns");
console.log("spawn-parent: 5 checks passed");
