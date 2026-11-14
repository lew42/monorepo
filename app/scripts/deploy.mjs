// node scripts/deploy.mjs <staging|production> [--seed] [--secret KEY=VALUE]...
// Stages assets, applies D1 migrations to that stage's own database, deploys, and makes sure SESSION_SECRET exists.
// Deploy staging first, look at it, then production. Never touches the git-built "monorepo" worker.
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const [stage, ...flags] = process.argv.slice(2);
if (!["staging", "production"].includes(stage)) { console.error("usage: deploy.mjs <staging|production> [--seed] [--secret KEY=VALUE]"); process.exit(2); }

const wr = (args, input) => {
	console.log("\n$ wrangler", args.join(" "));
	const r = spawnSync("npx", ["wrangler", ...args], { cwd: app, shell: true, input, encoding: "utf8", stdio: [input ? "pipe" : "inherit", "pipe", "inherit"] });
	process.stdout.write(r.stdout || "");
	if (r.status !== 0) { console.error("FAILED:", args.join(" ")); process.exit(r.status || 1); }
	return r.stdout || "";
};

const run = (cmd, args) => { const r = spawnSync(cmd, args, { cwd: app, stdio: "inherit" }); if (r.status !== 0) process.exit(r.status || 1); };
run("node", ["scripts/stage.mjs"]);
wr(["d1", "migrations", "apply", "DB", "--env", stage, "--remote"]);
if (flags.includes("--seed")) wr(["d1", "execute", "DB", "--env", stage, "--remote", "--file", `seed/${stage}.sql`]);
wr(["deploy", "--env", stage]);

const listed = wr(["secret", "list", "--env", stage, "--format", "json"]);
const have = JSON.parse(listed.slice(listed.indexOf("["), listed.lastIndexOf("]") + 1) || "[]").map(s => s.name);
if (!have.includes("SESSION_SECRET")) wr(["secret", "put", "SESSION_SECRET", "--env", stage], randomBytes(32).toString("hex"));
flags.forEach((f, i) => { if (f === "--secret") { const [k, ...v] = flags[i + 1].split("="); wr(["secret", "put", k, "--env", stage], v.join("=")); } });
console.log("\ndeployed", stage);
