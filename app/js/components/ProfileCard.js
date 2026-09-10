import {
	CompilerComponent
}
from "../core/CompilerComponent.js";

export default class ProfileCard
extends CompilerComponent {

	template() {

		return `

			<div class="card">

				<h2>

					{{ props.name }}

				</h2>

				<p>

					Age:
					{{ props.age }}

				</p>

			</div>

		`;
	}
}