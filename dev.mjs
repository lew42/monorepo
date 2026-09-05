#!/usr/bin/env node
// dev.mjs — `npm run dev`. Two servers, two ports, two jobs (local-dev.md):
//   :80 (or $PORT)  node server.js     — the existing UI dev loop, unchanged
//   :8787           wrangler dev       — identity + rooms, one origin, fully local
//
// Applies worker/schema.sql + worker/seed.sql to the local D1 first (idempotent:
// CREATE TABLE IF NOT EXISTS, and seed.sql deletes its own rows before inserting —
// local D1 persists across restarts, so a plain re-run must not assume a clean db).
// Prefixes both children's output and kills both on Ctrl+C.

import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const PORT = process.env.PORT || 80;
const children = [];

function isListening(port) {
    return new Promise((resolve) => {
        const socket = net.connect({ port, host: "127.0.0.1" });
        socket.once("connect", () => { socket.destroy(); resolve(true); });
        socket.once("error", () => resolve(false));
    });
}

function prefixed(label, child) {
    const onData = (buf) => buf.toString().split("\n").filter(Boolean).forEach(l => console.log(`[${label}] ${l}`));
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
}

function stopAll() {
    for (const child of children) child.kill();
}
process.on("SIGINT", () => { stopAll(); process.exit(0); });
process.on("SIGTERM", () => { stopAll(); process.exit(0); });

console.log("[dev] applying worker/schema.sql + worker/seed.sql to the local D1 …");
for (const file of ["worker/schema.sql", "worker/seed.sql"]) {
    const result = spawnSync(`npx --yes wrangler d1 execute local-dev --local -c wrangler.dev.jsonc --file=./${file}`, { shell: true, encoding: "utf8" });
    if (result.status !== 0) {
        console.error(`[dev] ${file} failed:\n${result.stdout}\n${result.stderr}`);
        process.exit(1);
    }
}
console.log("[dev] local D1 ready — five fake users (alice owner, bob moderator, carol member, dave member, eve banned).");

if (await isListening(PORT)) {
    console.log(`[dev] :${PORT} is already answering — assuming node server.js is running there; not starting a second one.`);
} else {
    const server = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT: String(PORT) } });
    prefixed("server", server);
    children.push(server);
    console.log(`[dev] node server.js  → http://localhost:${PORT}`);
}

const wrangler = spawn("npx --yes wrangler dev -c wrangler.dev.jsonc --port 8787", { shell: true });
prefixed("wrangler", wrangler);
children.push(wrangler);
console.log("[dev] wrangler dev    → http://localhost:8787   (identity + rooms; DEV_LOGIN=1)");
console.log("[dev] switch users at http://localhost:8787/api/dev/login?as=alice   (alice bob carol dave eve; ?as=none clears it)");

wrangler.on("exit", (code) => { stopAll(); process.exit(code ?? 0); });
