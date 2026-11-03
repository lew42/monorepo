/* node Server/UsagePace.test.mjs — the pace rule (used% against % of the window gone) with a fixed clock. */
import assert from "node:assert/strict";
import { usage_pace, report_line } from "./UsagePace.mjs";

const now = Date.parse("2026-10-29T23:19:05.551Z");
const json = { utilization: { limits: [
	{ kind: "session", percent: 10, resets_at: "2026-10-30T02:00:00.091751+00:00" },
	{ kind: "weekly_all", percent: 5, resets_at: "2026-11-05T03:00:00.091772+00:00" }
] } };

const { week, session } = usage_pace(json, now);
assert.equal(week.used, 5);
assert.equal(week.gone.toFixed(1), "12.1");
assert.equal(week.pace, 41);
assert.equal(week.over, false);
assert.equal(week.advice, "room to spend");
assert.equal(report_line(week), "Week: 5% used · 12% gone · 41% of pace (room to spend, 6 days 3 hours left)");
assert.equal(session.gone.toFixed(1), "46.4");
assert.equal(session.over, false);

const hot = usage_pace({ utilization: { limits: [{ kind: "weekly_all", percent: 80, resets_at: "2026-11-05T03:00:00Z" }] } }, now).week;
assert.equal(hot.over, true);
assert.equal(hot.advice, "slow right down");

console.log("UsagePace: ok");
