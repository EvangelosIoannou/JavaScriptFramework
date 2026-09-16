import {
	CompilerComponent
}
from "../js/core/CompilerComponent.js";

export default class Dashboard
extends CompilerComponent {

	template() {

		return `
			<div>

				<h1>
					Dashboard
				</h1>

				<p>
					Protected route content.
				</p>

			</div>
		`;
	}
}