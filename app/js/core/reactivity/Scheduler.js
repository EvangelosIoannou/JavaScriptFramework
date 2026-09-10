import {
	recordEffectQueued,
	recordFlush,
	recordBatch
}
from "./Diagnostics.js";


const queue =
	new Set();


let pending =
	false;


let flushing =
	false;


let batchDepth =
	0;


/* -------------------------------- */
/* QUEUE EFFECT */
/* -------------------------------- */

export function queueEffect(
	observer
) {

	if (
		!observer ||
		observer.stopped
	) {

		return;
	}


	queue.add(
		observer
	);


	recordEffectQueued(
		queue.size
	);


	if (
		batchDepth > 0
	) {

		return;
	}


	scheduleFlush();
}


/* -------------------------------- */
/* SCHEDULE FLUSH */
/* -------------------------------- */

function scheduleFlush() {

	if (
		pending ||
		flushing
	) {

		return;
	}


	pending =
		true;


	queueMicrotask(
		flush
	);
}


/* -------------------------------- */
/* FLUSH */
/* -------------------------------- */

export function flush() {

	pending =
		false;


	if (
		flushing
	) {

		return;
	}


	if (
		batchDepth > 0
	) {

		return;
	}


	flushing =
		true;


	recordFlush();


	try {

		while (
			queue.size
		) {

			const effects =
				Array.from(
					queue
				);


			queue.clear();


			effects.forEach(
				observer => {

					if (
						observer.stopped
					) {

						return;
					}


					observer.run();
				}
			);
		}

	}
	finally {

		flushing =
			false;
	}
}


/* -------------------------------- */
/* BATCH */
/* -------------------------------- */

export function batch(
	fn
) {

	batchDepth++;


	recordBatch();


	try {

		return fn();

	}
	finally {

		batchDepth--;


		if (
			batchDepth === 0 &&
			queue.size
		) {

			scheduleFlush();
		}
	}
}


/* -------------------------------- */
/* BATCH STATE */
/* -------------------------------- */

export function isBatching() {

	return (
		batchDepth > 0
	);
}


/* -------------------------------- */
/* CLEAR */
/* -------------------------------- */

export function clearScheduler() {

	queue.clear();


	pending =
		false;
}