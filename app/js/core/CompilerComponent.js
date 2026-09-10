import {
	Component
}
from "./Framework.js";

import {
	compile
}
from "./compiler/Compiler.js";


export class CompilerComponent
	extends Component {


	constructor(
		props = {},
		injector = null,
		parentOwner = null
	) {

		super(
			props,
			injector,
			parentOwner
		);
	}


	/* -------------------------------- */
	/* TEMPLATE */
	/* -------------------------------- */

	template() {

		return "";
	}


	/* -------------------------------- */
	/* RENDER */
	/* -------------------------------- */

	render() {

		return compile(
			this.template(),
			this
		);
	}
}