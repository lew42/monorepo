// worker/scripts/serve.mjs: the local API as ONE supervised process, for Servex (package.json "servex.routes" starts it on the first
// request to monorepo.localhost/api/*). The same two jobs as dev.mjs, without the dev server it also starts:
//   1. apply worker/migrations and worker/seed/dev.sql to the local D1 (idempotent),
//   2. run `wrangler dev -c worker/wrangler.jsonc` on $PORT, loopback only.
// Run from the repo root; PORT comes from Servex's PortRegistry (name "monorepo-api"), 8787 when run by hand.
// Servex stops it with `taskkill /t`, which takes the wrangler children too.
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const port = process.env.PORT || "8787";

const wrangler = args => spawnSync(`npx --yes wrangler ${args}`, { shell: true, encoding: "utf8", windowsHide: true });
for (const args of ["d1 migrations apply DB --local -c worker/wrangler.jsonc", "d1 execute DB --local -c worker/wrangler.jsonc --file=./worker/seed/dev.sql"]) {
    const done = wrangler(args);
    if (done.status !== 0) { console.error(`wrangler ${args} failed:\n${done.stdout}\n${done.stderr}`); process.exit(1); }
}
console.log("local D1 ready: migrations applied, dev users seeded");

// A free inspector port: wrangler's default 9229 is taken by any other node --inspect on the machine.
const inspector = await new Promise(resolve => { const s = net.createServer().listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => resolve(port)); }); });

const child = spawn(`npx --yes wrangler dev -c worker/wrangler.jsonc --ip 127.0.0.1 --port ${port} --inspector-port ${inspector}`, { shell: true, stdio: "inherit", windowsHide: true });
child.on("exit", code => process.exit(code ?? 0));
