export class Router {

    constructor(routes, app) {

        this.routes = routes;
        this.app = app;

        window.addEventListener(
            "popstate",
            () => this.load()
        );
    }

    getPath() {

        return window.location.pathname || "/";
    }

    async load() {

        const path =
            this.getPath();

        const route =
            this.routes[path] ||
            this.routes["/"];

        const module =
            await route.component();

        this.app.setPage(module.default);
    }

    navigate(path) {

        history.pushState(null, null, path);
        this.load();
    }
}