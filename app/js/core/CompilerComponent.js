import { Component } from "./Component.js";
import { compile } from "./compiler/Compiler.js";


/* -------------------------------- */
/* COMPILER COMPONENT */
/* -------------------------------- */

export class CompilerComponent
	extends Component {


	/*
	 * --------------------------------
	 * TEMPLATE
	 * --------------------------------
	 *
	 * Components override this method
	 * to provide their declarative
	 * template.
	 */

	template() {

		return "";

	}


	/*
	 * --------------------------------
	 * INTERNAL RENDER
	 * --------------------------------
	 *
	 * The Component base class owns the
	 * rendering lifecycle and render
	 * ownership.
	 *
	 * CompilerComponent only defines
	 * how the component is rendered:
	 *
	 *     template
	 *        ↓
	 *     compiler
	 *        ↓
	 *     DOM
	 */

	_render() {

		return compile(
			this.template(),
			this
		);

	}

}