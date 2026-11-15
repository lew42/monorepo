// node worker/scripts/deploy.mjs <staging|production> [--seed] [--secret KEY=VALUE]...
// Applies D1 migrations to that stage's own database, deploys the ONE config (worker/wrangler.jsonc, env <stage>), and makes sure
// SESSION_SECRET exists. Deploy staging first, look at it, then production. Run from anywhere; wrangler runs at the repo root.
import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONFIG = ["-c", "worker/wrangler.jsonc"];
const [stage, ...flags] = process.argv.slice(2);
if (!["staging", "production"].includes(stage)) { console.error("usage: deploy.mjs <staging|production> [--seed] [--secret KEY=VALUE]"); process.exit(2); }

const wr = (args, input) => {
	console.log("\n$ wrangler", args.join(" "));
	const r = spawnSync("npx", ["wrangler", ...args, ...CONFIG], { cwd: root, shell: true, input, encoding: "utf8", stdio: [input ? "pipe" : "inherit", "pipe", "inherit"] });
	process.stdout.write(r.stdout || "");
	if (r.status !== 0) { console.error("FAILED:", args.join(" ")); process.exit(r.status || 1); }
	return r.stdout || "";
};

wr(["d1", "migrations", "apply", "DB", "--env", stage, "--remote"]);
if (flags.includes("--seed")) wr(["d1", "execute", "DB", "--env", stage, "--remote", "--file", `worker/seed/${stage}.sql`]);
wr(["deploy", "--env", stage]);

const listed = wr(["secret", "list", "--env", stage, "--format", "json"]);
const have = JSON.parse(listed.slice(listed.indexOf("["), listed.lastIndexOf("]") + 1) || "[]").map(s => s.name);
if (!have.includes("SESSION_SECRET")) {
	const secret = randomBytes(32).toString("hex");
	wr(["secret", "put", "SESSION_SECRET", "--env", stage], secret);
	// kept locally (gitignored) so latency.mjs can mint test cookies for staging; production's secret is never written down
	if (stage === "staging") appendFileSync(join(root, "worker", ".dev.vars"), `
STAGING_SESSION_SECRET=${secret}
`);
}
flags.forEach((f, i) => { if (f === "--secret") { const [k, ...v] = flags[i + 1].split("="); wr(["secret", "put", k, "--env", stage], v.join("=")); } });
console.log("\ndeployed", stage);
