import {
	CompilerComponent
}
from "../js/core/CompilerComponent.js";

export default class About
extends CompilerComponent {

	template() {

		return `
			<div>

				<h1>
					About Us
				</h1>

				<p>
					This framework is built entirely with Vanilla JavaScript.
				</p>

			</div>
		`;
	}
}