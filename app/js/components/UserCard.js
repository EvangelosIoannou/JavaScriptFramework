import {
	CompilerComponent
}
from "../core/CompilerComponent.js";

export default class UserCard
extends CompilerComponent {

	template() {

		return `

			<div class="card">

				<h2>

					{{ props.name }}

				</h2>

			</div>

		`;
	}
}