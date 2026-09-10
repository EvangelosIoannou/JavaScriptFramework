import {
	Component
}
from "../js/core/Framework.js";

import {
	compile
}
from "../js/core/compiler/Compiler.js";

export default class CompilerSandbox
extends Component {

	onMount() {

		compile(`

			<Card>

				<h1>

					{{ fullName }}

				</h1>

			</Card>

		`);
	}

	render() {

		return {

			tag: "section",

			props: {},

			children: [

				"Compiler Sandbox"
			]
		};
	}
}