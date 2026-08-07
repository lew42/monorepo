/* An engineering notebook — sixteen notes that reference each other freely.
 *
 * This is a GRAPH. `idempotency` is reached from `retries`, from `at-least-once`
 * and from `outbox`; `backpressure` links forward to `queue-depth` and back to
 * `leases`; two notes are orphans and one pair is a cycle. There is no root, no
 * parent, and no path — which is the whole point of the product.
 *
 *   [ slug, title, date, paragraphs ]   [[slug]] is a link to another note
 */
export const notes = [
	["leases", "Leases beat locks", "2026-01-14", [
		"A lock has to be released. A lease expires, which means the failure mode of a dead worker is a delay rather than a wedged queue.",
		"The cost is that a slow worker and a dead one look identical, so every handler has to be safe to run twice — see [[idempotency]].",
		"Related: [[backpressure]], [[visibility-timeout]].",
	]],
	["idempotency", "Idempotency is the whole tax", "2026-01-16", [
		"Everything else in at-least-once delivery is bookkeeping. The real work is making handlers safe to repeat, and that work lives in the handler, not the queue.",
		"The cheapest version is a unique key on the effect: an insert that conflicts is a no-op. See [[outbox]] for the version that survives a crash between the write and the send.",
		"Related: [[at-least-once]], [[retries]].",
	]],
	["at-least-once", "At-least-once, and why not exactly-once", "2026-01-16", [
		"Exactly-once needs the effect and the acknowledgement in one transaction. Across two systems that is a distributed commit, and nobody wants one.",
		"So: at-least-once plus [[idempotency]]. The queue promises delivery; the handler promises repeatability.",
	]],
	["retries", "Retry with jitter or not at all", "2026-01-21", [
		"Synchronised retries are a thundering herd wearing a hat. Full jitter, always.",
		"Cap the delay ([[backoff]]) and cap the attempts, then send the remainder to [[dead-letter]] where a human can look at it.",
		"Depends on [[idempotency]].",
	]],
	["backoff", "Exponential backoff, capped", "2026-01-21", [
		"base × 2^attempt, capped, with full jitter. The cap is what stops attempt 12 scheduling itself into next week.",
		"See [[retries]].",
	]],
	["dead-letter", "The dead-letter table is a UI", "2026-01-23", [
		"A dead-letter queue nobody reads is a delete with extra steps. It is worth building the requeue button on day one.",
		"Related: [[retries]], [[observability]].",
	]],
	["backpressure", "Backpressure is a product decision", "2026-02-02", [
		"When the queue grows faster than it drains, something has to give: latency, acceptance, or correctness. Choosing which is not an engineering decision.",
		"Watch [[queue-depth]] rather than throughput — throughput looks healthy right up until it does not.",
		"Related: [[leases]].",
	]],
	["queue-depth", "Queue depth is the only honest metric", "2026-02-02", [
		"Rate in and rate out both look fine during an incident. Depth is the integral, and it is the one that tells you whether you are winning.",
		"Alert on the derivative, not the value: a depth of 200,000 that is falling is fine, and a depth of 400 that is climbing is not.",
		"Related: [[backpressure]], [[observability]].",
	]],
	["outbox", "The outbox pattern", "2026-02-11", [
		"Write the effect and the message in one local transaction, then relay the message separately. The crash-between-two-systems window closes.",
		"It converts a distributed-commit problem into an [[idempotency]] problem, which is one we know how to pay for.",
	]],
	["observability", "Three questions, not three pillars", "2026-02-15", [
		"Is it broken, where, and since when. Everything else is a way of answering one of those faster.",
		"For queues that is [[queue-depth]], attempt histograms, and the age of the oldest unacknowledged job.",
	]],
	["visibility-timeout", "Picking a visibility timeout", "2026-02-19", [
		"Too short and a slow job is delivered twice while the first copy is still running. Too long and a crash costs that much dead time.",
		"Start at p99 of handler duration, then extend the lease from inside the handler for the long tail. See [[leases]].",
	]],
	["ordering", "Ordering is a per-key promise", "2026-02-24", [
		"Global ordering is a single consumer wearing a costume. Per-key ordering is achievable and is almost always what was actually wanted.",
		"Related: [[partitioning]].",
	]],
	["partitioning", "Partition by the thing you order by", "2026-02-24", [
		"If order matters per customer, partition by customer. Any other key and [[ordering]] becomes a coincidence.",
		"This note and [[ordering]] reference each other — a two-note cycle, which a tree cannot hold and a graph does not notice.",
	]],
	["naming", "Names for queues", "2026-03-02", [
		"Name a queue for the work, not the consumer: `emails`, not `email-worker-v2`. The consumer will be replaced and the work will not.",
	]],
	["schemas", "Version messages from day one", "2026-03-05", [
		"A message outlives the deploy that wrote it. A version field costs one byte and buys the ability to change your mind.",
	]],
	["postmortems", "Write it while it still hurts", "2026-03-11", [
		"A postmortem written a week later is a summary. One written the same afternoon is evidence.",
	]],
];

export const find = slug => notes.find(note => note[0] === slug);

export const links_from = slug =>
	[...new Set((find(slug)?.[3].join(" ").match(/\[\[([\w-]+)\]\]/g) ?? [])
		.map(ref => ref.slice(2, -2)))];

export const links_to = slug => notes.filter(([other]) => links_from(other).includes(slug)).map(n => n[0]);

// nobody links to them — a shape a tree cannot even describe
export const orphans = () => notes.filter(([slug]) => !links_to(slug).length).map(n => n[0]);
