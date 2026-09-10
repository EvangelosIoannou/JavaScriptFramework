import { Component } from "../js/core/Framework.js";
import { html } from "../js/core/Template.js";

export default class Dashboard extends Component {

    render() {

        return html(`
            <div>

                <h1>Dashboard</h1>

                <p>
                    Protected route content.
                </p>

            </div>
        `);
    }
}