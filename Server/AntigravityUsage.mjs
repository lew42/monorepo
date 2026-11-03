#!/usr/bin/env node
/* AntigravityUsage.mjs — Fetches Antigravity model quotas and plan status.
 * Communicates with the local Antigravity LanguageServerService via gRPC-Web.
 * Usage:
 *   node Server/AntigravityUsage.mjs          # Formatted console summary
 *   node Server/AntigravityUsage.mjs --json   # Machine-readable JSON
 *   node Server/AntigravityUsage.mjs --sync   # Write public/framework/ai/antigravity-usage.json & append .jsonl
 */

import fs from "fs";
import path from "path";
import https from "https";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const AI_DIR = path.join(REPO_ROOT, "public/framework/ai");

const stamp = () => {
	const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`;
};

export default class AntigravityUsage {
static discoverCredentials() {
	try {
		// Discover language_server.exe process and command line
		const psCmd = 'Get-CimInstance Win32_Process -Filter \\"Name = \'language_server.exe\'\\" | Select-Object -First 1 ProcessId, CommandLine | ConvertTo-Json';
		const out = execSync(`powershell -NoProfile -Command "${psCmd}"`, { encoding: "utf8", windowsHide: true });
		const proc = JSON.parse(out);
		if (!proc?.CommandLine) return null;

		const m = proc.CommandLine.match(/--csrf_token\s+([a-f0-9\-]+)/);
		const csrfToken = m ? m[1] : null;

		// Discover listening TCP ports for this PID
		const netOut = execSync(`netstat -ano`, { encoding: "utf8", windowsHide: true });
		const pid = String(proc.ProcessId);
		const lines = netOut.split(/\r?\n/).filter(l => l.includes("LISTENING") && l.trim().endsWith(pid));

		// Find 127.0.0.1 ports
		const ports = [];
		for (const l of lines) {
			const match = l.match(/127\.0\.0\.1:(\d+)/);
			if (match) ports.push(parseInt(match[1], 10));
		}

		return {
			pid: proc.ProcessId,
			csrfToken,
			ports: [...new Set(ports)]
		};
	} catch (e) {
		return null;
	}
}

static fetchStatus({ port = 53301, csrfToken } = {}) {
	return new Promise((resolve, reject) => {
		const payload = Buffer.from("{}", "utf8");
		const envelope = Buffer.alloc(5 + payload.length);
		envelope.writeUInt8(0, 0); // 0 = uncompressed
		envelope.writeUInt32BE(payload.length, 1);
		payload.copy(envelope, 5);

		const options = {
			hostname: "127.0.0.1",
			port,
			path: "/exa.language_server_pb.LanguageServerService/GetUserStatus",
			method: "POST",
			rejectUnauthorized: false,
			headers: {
				"x-codeium-csrf-token": csrfToken,
				"content-type": "application/grpc-web+json",
				"x-grpc-web": "1"
			}
		};

		const req = https.request(options, (res) => {
			const chunks = [];
			res.on("data", c => chunks.push(c));
			res.on("end", () => {
				const buf = Buffer.concat(chunks);
				if (buf.length < 5) return reject(new Error("Empty or truncated response"));
				const len = buf.readUInt32BE(1);
				try {
					const jsonStr = buf.slice(5, 5 + len).toString("utf8");
					resolve(JSON.parse(jsonStr));
				} catch (err) {
					reject(err);
				}
			});
		});

		req.on("error", reject);
		req.write(envelope);
		req.end();
	});
}

static async getAntigravityUsage() {
	const creds = AntigravityUsage.discoverCredentials();
	if (!creds || !creds.csrfToken) {
		throw new Error("Antigravity language_server process not running or CSRF token not found");
	}

	let lastErr = null;
	for (const port of creds.ports) {
		try {
			const raw = await AntigravityUsage.fetchStatus({ port, csrfToken: creds.csrfToken });
			const userStatus = raw?.userStatus || {};
			const planInfo = userStatus?.planStatus?.planInfo || {};
			const configs = userStatus?.cascadeModelConfigData?.clientModelConfigs || [];

			const models = {};
			for (const c of configs) {
				const label = c.label || c.modelId;
				models[label] = {
					modelId: c.modelId,
					remainingFraction: c.quotaInfo?.remainingFraction ?? null,
					resetTime: c.quotaInfo?.resetTime ?? null
				};
			}

			return {
				at: stamp(),
				user: userStatus.name || "Unknown",
				email: userStatus.email || "",
				tier: planInfo.planName || userStatus.userTier?.name || "Unknown",
				availablePromptCredits: userStatus.planStatus?.availablePromptCredits ?? null,
				availableFlowCredits: userStatus.planStatus?.availableFlowCredits ?? null,
				models
			};
		} catch (e) {
			lastErr = e;
		}
	}
	throw lastErr || new Error("Failed to connect to Antigravity gRPC service");
}

static async main() {
	const args = process.argv.slice(2);
	const wantJson = args.includes("--json");
	const wantSync = args.includes("--sync");

	try {
		const usage = await AntigravityUsage.getAntigravityUsage();

		if (wantSync) {
			const targetJson = path.join(AI_DIR, "antigravity-usage.json");
			const targetJsonl = path.join(AI_DIR, "antigravity-usage.jsonl");

			fs.writeFileSync(targetJson, JSON.stringify(usage, null, 2));

			// Extract brief snapshot for append stream
			const snap = {
				log: {
					at: usage.at,
					tier: usage.tier,
					prompt_credits: usage.availablePromptCredits,
					flow_credits: usage.availableFlowCredits,
					gemini_fraction: usage.models["Gemini 3.8 Flash (High)"]?.remainingFraction ?? null,
					gemini_reset: usage.models["Gemini 3.8 Flash (High)"]?.resetTime ?? null,
					claude_reset: usage.models["Claude Sonnet 5.5 (Medium)"]?.resetTime ?? null
				}
			};
			fs.appendFileSync(targetJsonl, JSON.stringify(snap) + "\n");
			console.log(`Synced to ${targetJson} and appended to ${targetJsonl}`);
			return;
		}

		if (wantJson) {
			console.log(JSON.stringify(usage, null, 2));
			return;
		}

		// Formatted terminal display
		console.log(`\nAntigravity Status (${usage.at}):`);
		console.log(`  User: ${usage.user} (${usage.email}) | Tier: ${usage.tier}`);
		console.log(`  Credits: Prompt=${usage.availablePromptCredits}, Flow=${usage.availableFlowCredits}\n`);
		console.log(`  Model Quotas:`);
		for (const [name, info] of Object.entries(usage.models)) {
			const pct = info.remainingFraction !== null ? `${Math.round(info.remainingFraction * 100)}% remaining` : "Rate-limited / Reset-tracked";
			const reset = info.resetTime ? `(resets ${info.resetTime})` : "";
			console.log(`    - ${name.padEnd(28)} : ${pct.padEnd(26)} ${reset}`);
		}
		console.log("");
	} catch (e) {
		console.error("Antigravity usage fetch failed:", e.message);
		process.exit(1);
	}
}
}

/** Old names, kept until 2026-10-20. */
export const discoverCredentials = AntigravityUsage.discoverCredentials, fetchStatus = AntigravityUsage.fetchStatus, getAntigravityUsage = AntigravityUsage.getAntigravityUsage;

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	AntigravityUsage.main();
}
