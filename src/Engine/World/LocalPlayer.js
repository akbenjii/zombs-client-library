'use strict';

module.exports = class LocalPlayer {
    constructor(currentGame) {
        this.currentGame = currentGame;
    }
    setEntity(entity) {
        this.entity = entity;
    }

    getEntity() {
        return this.entity;
    }

    getMyPartyId() {
        const myNetworkEntity = this.currentGame.world.getEntityByUid(this.currentGame.world.getMyUid());
        if (!myNetworkEntity) return 0;

        const target = myNetworkEntity.getTargetTick();
        if (!target) return 0;

        return target.partyId;
    }

    setTargetTick(tick) {
        //this.currentGame.ui.setPlayerTick(tick);
    }
}