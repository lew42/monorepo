// node serve.mjs <port> - a PRIVATE dev server from this worktree with the session tailer on (SESSION_TAIL=1), detached. Same pattern as Server/session-latency.mjs.
import { spawn } from "node:child_process";
import fs from "node:fs";
const port = process.argv[2] || "8461", repo = process.cwd();
const out = fs.openSync(".priv.out", "w");
const c = spawn(process.execPath, ["server.js"], { cwd: repo, windowsHide: true, detached: true, stdio: ["ignore", out, out], env: { ...process.env, PORT: port, SESSION_TAIL: "1", NO_PAGEFILES: "1", SESSION_ROOT: process.env.SESSION_ROOT || "" } });
c.unref();
console.log("pid", c.pid, "port", port);
