export class CompilerContext {

	constructor(
		template
	) {

		this.template =
			template;

		this.position =
			0;
	}

	current() {

		return this.template[
			this.position
		];
	}

	advance(
		amount = 1
	) {

		this.position +=
			amount;
	}

	remaining() {

		return this.template.slice(
			this.position
		);
	}

	eof() {

		return (
			this.position >=
			this.template.length
		);
	}
}