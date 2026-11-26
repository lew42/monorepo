// node worker/scripts/vapid.mjs: makes the VAPID key pair (P-256) once and writes it to worker/.dev.vars (gitignored), where
// `wrangler dev` reads it and deploy.mjs finds it to set the staging secrets. Run again and it does nothing (a new pair would
// orphan every browser subscription). Never prints the private key. Exports ensure_dev_vars() for deploy.mjs.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const DEV_VARS = join(dirname(fileURLToPath(import.meta.url)), "..", ".dev.vars");
const b64u = bytes => Buffer.from(bytes).toString("base64url");

export function read_dev_vars() {
	const vars = {};
	if (existsSync(DEV_VARS)) for (const line of readFileSync(DEV_VARS, "utf8").split(/\r?\n/)) {
		const m = /^([A-Z0-9_]+)=(.*)$/.exec(line);
		if (m) vars[m[1]] = m[2].replace(/^'(.*)'$/, "$1");
	}
	return vars;
}

// Adds whatever is missing: the VAPID pair and the staging test sign-in key. Returns the vars. Existing lines are never rewritten.
export async function ensure_dev_vars() {
	const vars = read_dev_vars(), add = [];
	if (!vars.VAPID_PRIVATE_JWK || !vars.VAPID_PUBLIC) {
		const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
		vars.VAPID_PRIVATE_JWK = JSON.stringify(await crypto.subtle.exportKey("jwk", pair.privateKey));
		vars.VAPID_PUBLIC = b64u(await crypto.subtle.exportKey("raw", pair.publicKey));
		add.push(`VAPID_PRIVATE_JWK='${vars.VAPID_PRIVATE_JWK}'`, `VAPID_PUBLIC=${vars.VAPID_PUBLIC}`);
	}
	if (!vars.STAGING_TEST_LOGIN_KEY) {
		vars.STAGING_TEST_LOGIN_KEY = randomBytes(18).toString("base64url");
		add.push(`STAGING_TEST_LOGIN_KEY=${vars.STAGING_TEST_LOGIN_KEY}`);
	}
	if (add.length) writeFileSync(DEV_VARS, (existsSync(DEV_VARS) && readFileSync(DEV_VARS, "utf8").trim() ? readFileSync(DEV_VARS, "utf8").trimEnd() + "\n" : "") + add.join("\n") + "\n");
	return { vars, wrote: add.length };
}

if (process.argv[1]?.endsWith("vapid.mjs")) {
	const { vars, wrote } = await ensure_dev_vars();
	console.log(wrote ? `wrote ${wrote} line(s) to worker/.dev.vars` : "worker/.dev.vars already has the keys; nothing changed", "\nVAPID_PUBLIC =", vars.VAPID_PUBLIC);
}
