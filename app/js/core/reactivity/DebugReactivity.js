/* -------------------------------- */
/* REACTIVITY DEBUGGING */
/* -------------------------------- */

export function inspectEffect(
	effectStop
) {

	const observer =
		effectStop?.observer;

	if (
		!observer
	) {

		return {

			dependencies:
				[]
		};
	}

	return {

		dependencies:
			Array.from(
				observer.dependencies
			)
	};
}