export class Injector {

    constructor() {
        this.services = {};
    }

    register(name, service) {
        this.services[name] = service;
    }

    get(name) {
        return this.services[name];
    }
}