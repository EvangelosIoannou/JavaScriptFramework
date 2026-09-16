export function tokenize(
	template
) {

	return template
		.replace(
			/\n/g,
			" "
		)
		.replace(
			/\s+/g,
			" "
		)
		.trim();
}