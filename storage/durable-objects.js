module.exports = class Counter {
    constructor(state, env) {
        this.state = state;
    }

    async initialize() {
        let stored = await this.state.storage.get("value");
        // after initialization, future reads don't need to access storage!
        this.value = stored || 0;
    }

    // Handle HTTP requests from clients.
    async fetch(request) {
        // Make sure we're fully initialized from storage.
        if (!this.initializePromise) {
            this.initializePromise = this.initialize();
        }
        await this.initializePromise;
        // this.value will retain its state until this object is evicted from memory
        ...
    }
}