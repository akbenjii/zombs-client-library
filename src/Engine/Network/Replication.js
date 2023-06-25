'use strict';

module.exports = class Replication {
    constructor(currentGame) {
        this.currentGame = currentGame;

        this.currentTick = null;
        this.ticks = [];
        this.shiftedGameTime = 0;
        this.lastShiftedGameTime = 0;
        this.receivedFirstTick = false;
        this.serverTime = 0;
        this.msPerTick = 0;
        this.msInThisTick = 0;
        this.msElapsed = 0;
        this.lastMsElapsed = 0;
        this.ping = 0;
        this.lastPing = 0;
        this.startTime = null;
        this.startShiftedGameTime = 0;
        this.frameStutters = 0;
        this.frameTimes = [];
        this.interpolating = false;
        this.ticksDesynced = 0;
        this.ticksDesynced2 = 0;
        this.clientTimeResets = 0;
        this.maxExtrapolationTime = 0;
        this.totalExtrapolationTime = 0;
        this.extrapolationIncidents = 0;
        this.differenceInClientTime = 0;
        this.equalTimes = 0;
        this.wasRendererJustUnpaused = false;
    }

    init() {
        this.currentGame.network.addEnterWorldHandler(this.onEnterWorld.bind(this));
        this.currentGame.network.addEntityUpdateHandler(this.onEntityUpdate.bind(this));
        this.currentGame.renderer.addTickCallback(this.onTick.bind(this));
    }

    setTargetTickUpdatedCallback(tickUpdatedCallback) {
        this.tickUpdatedCallback = tickUpdatedCallback;
    }

    setLatestTickUpdatedCallback(callback) {
        this.latestTickUpdatedCallback = callback;
    }

    getClientTimeResets() {
        return this.clientTimeResets;
    }

    getMsInThisTick() {
        return Math.floor(this.msInThisTick);
    }

    getMsPerTick() {
        return this.msPerTick;
    }

    getMsSinceTick(tick, useInterpolationOffset = true) {
        if (useInterpolationOffset) tick += 2;
        return this.shiftedGameTime - tick * this.msPerTick;
    }

    getMsUntilTick(tick) {
        return tick * this.msPerTick - this.shiftedGameTime;
    }

    getServerTime() {
        return Math.floor(this.serverTime);
    }

    getClientTime() {
        return Math.floor(this.shiftedGameTime);
    }

    getRealClientTime() {
        if (!this.startTime) return 0;

        const msElapsed = (new Date().getTime() - this.startTime.getTime());
        return Math.floor(this.startShiftedGameTime + msElapsed);
    }

    getFrameStutters() {
        return this.frameStutters;
    }

    getDifferenceInClientTime() {
        return this.differenceInClientTime;
    }

    isFpsReady() {
        return this.frameTimes.length >= 10;
    }

    getFps() {
        let time = 0;

        for (let i = 0; i < this.frameTimes.length; i++)
            time += this.frameTimes[i];

        return 1000 / (time / this.frameTimes.length);
    }

    getInterpolating() {
        return this.interpolating;
    }

    getTickByteSize() {
        if (!this.currentTick) return 0;
        return this.currentTick.byteSize;
    }

    getTickEntities() {
        if (!this.currentTick) return 0;
        return Object.keys(this.currentTick.entities).length;
    }

    getTickIndex() {
        if (!this.currentTick) return 0;
        return this.currentTick.tick;
    }

    getLastMsElapsed() {
        return this.lastMsElapsed;
    }

    getMaxExtrapolationTime() {
        return this.maxExtrapolationTime;
    }

    getExtrapolationIncidents() {
        return this.extrapolationIncidents;
    }

    getTotalExtrapolationTime() {
        return this.totalExtrapolationTime;
    }

    resetClientLag() {
        this.shiftedGameTime = this.getRealClientTime();
    }

    onTick(msElapsed) {
        this.msElapsed += msElapsed;
        this.lastMsElapsed = msElapsed;
        this.frameTimes.push(msElapsed);

        if (this.frameTimes.length > 10) this.frameTimes.shift();

        let steps = 0;
        const timeStep = 1000 / 60;

        while (this.msElapsed >= timeStep) {
            this.msElapsed -= timeStep;
            steps++;
        }

        if (steps > 1) this.frameStutters++;

        if (this.isRendererPaused()) {
            this.wasRendererJustUnpaused = true;
            this.equalTimes = 0;
            this.currentGame.logger && this.currentGame.logger.debug(`Prevented huge delta time %d after render pause: ${msElapsed}`);
            msElapsed = 0;
        }

        this.serverTime += msElapsed;
        this.shiftedGameTime += msElapsed;
        this.msInThisTick += msElapsed;
        this.updateTick();
    }

    updateTick() {
        for (let i = 0; i < this.ticks.length; i++) {
            const tick = this.ticks[i];
            const tickStart = this.msPerTick * tick.tick;
            if (this.shiftedGameTime >= tickStart) {
                this.currentTick = tick;
                this.msInThisTick = this.shiftedGameTime - tickStart;
                this.tickUpdatedCallback(tick);
                this.ticks.shift();
                i--;
            }
        }

        if (this.currentTick != null) {
            const nextTickStart = this.msPerTick * (this.currentTick.tick + 1);
            if (this.shiftedGameTime >= nextTickStart) {
                if (this.interpolating) {
                    this.interpolating = false;
                    this.extrapolationIncidents++;
                    this.currentGame.logger && this.currentGame.logger.debug('Extrapolation incident beginning');
                }
                this.maxExtrapolationTime = Math.max(this.shiftedGameTime - nextTickStart, this.maxExtrapolationTime);
                var extrapolationTime = Math.min(this.msInThisTick - this.msPerTick, this.lastMsElapsed);
                this.totalExtrapolationTime += extrapolationTime;
            } else {
                this.interpolating = true;
            }
            if (this.serverTime - this.shiftedGameTime < this.ping) {
                this.ticksDesynced++;
                if (this.ticksDesynced >= 10) {
                }
            }
        }
    }

    onEnterWorld(data) {
        if (!data.allowed) return;

        this.currentGame.logger && this.currentGame.logger.debug('Effective tick rate: ' + data.effectiveTickRate);
        const tickRate = data.tickRate;
        this.msPerTick = 1000 / tickRate;
        this.msInThisTick = 0;
        this.shiftedGameTime = 0;
        this.serverTime = 0;
        this.receivedFirstTick = false;
        this.msElapsed = 0;
        this.lastMsElapsed = 0;
        this.ping = this.currentGame.network.getPing();
        this.lastPing = this.ping;
        this.startTime = null;
        this.startShiftedGameTime = 0;
        this.interpolating = false;
    }

    checkRendererPaused() {
        if (this.lastShiftedGameTime === this.shiftedGameTime) this.equalTimes++;
        else this.equalTimes = 0;
    }

    isRendererPaused() {
        return this.equalTimes >= 8;
    }

    onEntityUpdate(data) {
        if (this.latestTickUpdatedCallback) this.latestTickUpdatedCallback(data);

        this.serverTime = data.tick * this.msPerTick + this.ping;
        this.ticks.push(data);
        if (!this.receivedFirstTick) {
            this.receivedFirstTick = true;
            this.startTime = new Date();
            this.currentGame.logger && this.currentGame.logger.debug('Initializing replicator...');
            this.currentGame.logger && this.currentGame.logger.debug(`Start time: ${this.startTime}`);
            this.currentGame.logger && this.currentGame.logger.debug(`Tick index: ${data.tick}`);
            this.currentGame.logger && this.currentGame.logger.debug(`MS per tick: ${this.msPerTick}`);
            this.currentGame.logger && this.currentGame.logger.debug(`Ping: ${this.ping}`);
            this.shiftedGameTime = data.tick * this.msPerTick - 90;
            this.startShiftedGameTime = this.shiftedGameTime;
            this.clientTimeResets = 0;
        } else {
            this.checkRendererPaused();

            const rendererPaused = this.isRendererPaused();
            const differenceInClientLag = (data.tick * this.msPerTick - 90) - this.shiftedGameTime;

            if (!rendererPaused) this.differenceInClientTime = differenceInClientLag;
            if (Math.abs(differenceInClientLag) >= 40) this.ticksDesynced2++;

            this.ticksDesynced2 = 0;
            if (this.ticksDesynced2 >= 10 || this.wasRendererJustUnpaused) {
                this.currentGame.logger && this.currentGame.logger.debug('Resetting client time');
                this.currentGame.logger && this.currentGame.logger.debug(`Difference in client time: ${differenceInClientLag} (${this.shiftedGameTime} -> ${(data.tick * this.msPerTick - 90)})`);
                this.currentGame.logger && this.currentGame.logger.debug(`Renderer paused: ${rendererPaused ? 'true' : 'false'}`);
                this.currentGame.logger && this.currentGame.logger.debug(`Renderer just unpaused: ${this.wasRendererJustUnpaused ? 'true' : 'false'}`);
                const last = this.shiftedGameTime;

                this.shiftedGameTime = data.tick * this.msPerTick - 90;
                this.msInThisTick += (this.shiftedGameTime - last);

                if (!rendererPaused && !this.wasRendererJustUnpaused) this.clientTimeResets++;

                this.ticksDesynced2 = 0;
                this.wasRendererJustUnpaused = false;
            }

            this.lastShiftedGameTime = this.shiftedGameTime;
        }
    }
}