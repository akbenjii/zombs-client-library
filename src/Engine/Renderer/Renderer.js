'use strict';

module.exports = class Renderer {
    constructor() {
        this.tickCallbacks = [];
        this.lastMsElapsed = 0x0;
        this.firstPerformance = null;
        this.followingObject = null;
        this.longFrames = 0;
    }

    addTickCallback(callback) {
        this.tickCallbacks.push(callback);
    }

    getLongFrames() {
        return this.longFrames;
    }

    update() {
        if (!this.firsrPerformance) {
            this.firsrPerformance = performance.now();
            setImmediate(this.update.bind(this));
            return;
        }

        const currentPerformance = performance.now();
        const performanceDelta = currentPerformance - this.firsrPerformance;
        const msElapsed = performanceDelta - this.lastMsElapsed;

        this.lastMsElapsed = performanceDelta;

        try {
            for (const callback of this.tickCallbacks)
                callback(msElapsed);
        } catch (e) {
            //logger.error(`Failed to execute tick callbacks: ${e}`)
            console.log(e.stack)
        }

        setImmediate(this.update.bind(this));
    }
}