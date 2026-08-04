/* A long-running action that outlives the page that started it.
 *
 * NOT a network call — production is static hosting, so there is no endpoint and
 * there never will be. This is an interval and a promise, and the page says so.
 *
 * The job lives wherever the caller puts it. That is the whole lesson: put it on
 * the page that STARTED it and it dies from view the moment you navigate (the
 * /forms/optimistic/ finding — correct, invisible). Put it on an ancestor that
 * stays mounted and it keeps running, keeps reporting, and is still there when
 * you come back.
 *
 * It caps itself. A demo page that leaves an interval running forever is not a
 * lesson, it is a leak.
 */
export function upload(name, { ms = 9000, tick = 300 } = {}){
	const watchers = new Set();
	const started = Date.now();
	let timer;

	const job = {
		name, percent: 0, done: false,

		watch(fn){
			watchers.add(fn);
			fn(job);
			return () => watchers.delete(fn);
		},

		count(){ return watchers.size; },

		cancel(){
			clearInterval(timer);
			job.done = true;
			watchers.forEach(fn => fn(job));
			return job;
		},
	};

	timer = setInterval(() => {
		job.percent = Math.min(100, Math.round((Date.now() - started) / ms * 100));

		if (job.percent >= 100){
			clearInterval(timer);
			job.done = true;
		}

		watchers.forEach(fn => fn(job));
	}, tick);

	return job;
}

export default upload;
