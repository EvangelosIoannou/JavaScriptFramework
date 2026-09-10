import { Component }
	from "../core/Framework.js";

import { h }
	from "../core/VDom.js";

import Sidebar
	from "./Sidebar.js";

export default class Layout
	extends Component {

	render() {

		const CurrentPage =
			this.props.page;

		return h(
			"div",
			{
				class: "layout"
			},

			[

				h(
					Sidebar,
					{},
					[]
				),

				h(
					"main",
					{
						class: "content"
					},

					[

						CurrentPage
							? h(
								CurrentPage,
								{},
								[]
							)
							: ""
					]
				)
			]
		);
	}
}