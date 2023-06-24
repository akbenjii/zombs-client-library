'use strict';

module.exports = class NetworkEntity {
    constructor(currentGame, tick) {
        this.currentGame = currentGame;

        this.uid = tick.uid;
        this.setTargetTick(tick);
    }

    reset() {
        this.uid = 0;
        this.currentModel = null;
        this.entityClass = null;
        this.fromTick = null;
        this.targetTick = null;
    }

    isLocal() {
        const local = this.currentGame.world.getLocalPlayer();

        if (!local || !local.getEntity()) return false;
        return this.uid === local.getEntity().uid;
    }

    getTargetTick() {
        return this.targetTick;
    }

    getFromTick() {
        return this.fromTick;
    }

    setTargetTick(tick) {
        if (!this.targetTick) {
            this.entityClass = tick.entityClass;
            this.targetTick = tick;
        }

        this.addMissingTickFields(tick, this.targetTick);
        this.fromTick = this.targetTick;
        this.targetTick = tick;

        if (this.fromTick.model !== this.targetTick.model) {
            this.refreshModel(this.targetTick.model);
        }

        this.entityClass = this.targetTick.entityClass;
    }

    overrideFromTick(tick) {
        this.fromTick = tick;
    }

    overrideTargetTick(tick) {
        this.targetTick = tick;
    }

    tick(msInThisTick, msPerTick) {
        if (!this.fromTick) return;
    }

    update(dt, user) {

    }

    refreshModel(networkModelName) {

    }

    addMissingTickFields(tick, lastTick) {
        for (const fieldName in lastTick) {
            const fieldValue = lastTick[fieldName];

            if (!(fieldName in tick))
                tick[fieldName] = fieldValue;
        }
    }
}