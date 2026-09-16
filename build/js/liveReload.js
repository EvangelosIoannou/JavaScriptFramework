const source =
	new EventSource(
		"/__reload"
	);

source.onmessage =
	event => {

		if (
			event.data ===
			"reload"
		) {

			console.log(
				"Reloading..."
			);

			location.reload();
		}
	};

source.onerror =
	error => {

		console.warn(
			"Live reload disconnected",
			error
		);
	};