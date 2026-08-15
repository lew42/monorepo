/* ISO with the machine's local offset — the format every `at` / `requested_at` in
 * a task.jsonl uses. ⚠ Not `toISOString()`: that is UTC, and a log mixing `Z` with
 * `-05:00` no longer sorts by `localeCompare`, which is how the board orders tasks. */
export default function stamp(date = new Date()){
	const p = n => String(n).padStart(2, "0");
	const off = -date.getTimezoneOffset(), sign = off < 0 ? "-" : "+", a = Math.abs(off);

	return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
		+ `T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
		+ `${sign}${p(Math.floor(a / 60))}:${p(a % 60)}`;
}

export { stamp };
