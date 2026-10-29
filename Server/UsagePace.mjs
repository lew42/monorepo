/* UsagePace.mjs — the one reading of public/framework/ai/usage.json for pace: each window's share used against its share of time gone.
 * Used by Server/usage-now.mjs (the skill's command), Servex/Usage.js (over_pace, status) and the check_usage tool. */
const WEEK = 7 * 24 * 3600e3, FIVE_HOUR = 5 * 3600e3;

export function window_pace(limit, length, now = Date.now()){
	const resets = Date.parse(limit?.resets_at), used = limit?.percent;
	const gone = Math.min(100, Math.max(0, 100 * (1 - (resets - now) / length)));
	const pace = Math.round(100 * used / Math.max(gone, 0.1));
	return { used, gone: +gone.toFixed(1), margin: +(gone - used).toFixed(1), pace, over: used > gone, advice: advice(pace), resets_at: limit?.resets_at, left_ms: Math.max(0, resets - now) };
}

export function usage_pace(json, now = Date.now()){
	const limits = json?.utilization?.limits ?? [];
	const week = limits.find(l => l.kind === "weekly_all") ?? { percent: json?.utilization?.seven_day?.utilization, resets_at: json?.utilization?.seven_day?.resets_at };
	const session = limits.find(l => l.kind === "session");
	return { week: window_pace(week, WEEK, now), session: session ? window_pace(session, FIVE_HOUR, now) : null };
}

/* pace % = used ÷ gone: under ~75 spend more, ~90 slow down, 100 is the line (the owner, 2026-10-12) */
export function advice(pace){
	return pace >= 100 ? "slow right down" : pace >= 90 ? "slow down" : pace >= 75 ? "steady" : "room to spend";
}

export function time_left(ms){
	const mins = Math.floor(ms / 60000), d = Math.floor(mins / 1440), h = Math.floor(mins % 1440 / 60), m = mins % 60;
	const pl = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
	return d ? `${pl(d, "day")} ${pl(h, "hour")}` : `${pl(h, "hour")} ${pl(m, "minute")}`;
}

/* the report line, all three numbers (the owner, 2026-10-23): used, gone, and used ÷ gone as "% of pace" */
export function report_line(week){
	return `Week: ${week.used}% used · ${week.gone.toFixed(0)}% gone · ${week.pace}% of pace (${week.advice}, ${time_left(week.left_ms)} left)`;
}
