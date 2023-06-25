'use strict';

const Replication = require('../Network/Replication');
const NetworkEntity = require('../Network/NetworkEntity');
const LocalPlayer = require('./LocalPlayer');

module.exports = class World {
    constructor(currentGame) {
        this.currentGame = currentGame;

        this.entities = {};
        this.inWorld = false;
        this.myUid = null;
        this.networkEntityPool = [];
        this.modelEntityPool = {};

        this.network = currentGame.network;
        this.renderer = currentGame.renderer;
        this.replicator = new Replication(currentGame);
        this.localPlayer = new LocalPlayer(currentGame);
    }

    init() {
        this.replicator.setTargetTickUpdatedCallback(this.onEntityUpdate.bind(this));
        this.replicator.init();

        this.network.addEnterWorldHandler(this.onEnterWorld.bind(this));
        this.renderer.addTickCallback(this.onRendererTick.bind(this));
    }

    preloadNetworkEntities() {
        if (!this.currentGame.getNetworkEntityPooling()) return;

        //logger.debug('Preloading network entities...');
        const bsTick = {
            uid: 0,
            entityClass: null
        }

        const poolSize = this.currentGame.getNetworkEntityPooling();
        for (let i = 0; i < poolSize; i++) {
            const entity = new NetworkEntity(this.currentGame, bsTick);
            entity.reset();
            this.networkEntityPool.push(entity);
        }
    }

    preloadModelEntities() {
        const modelsToPool = this.currentGame.getModelEntityPooling();
        for (const modelName in modelsToPool) {
            const poolSize = modelsToPool[modelName];
            //logger.debug('Preloading model %s...', modelName);

            this.modelEntityPool[modelName] = [];
            for (let i = 0; i < poolSize; i++) {
                //const model = this.currentGame.assetManager.loadModel(modelName);
                //model.modelName = modelName;
                //model.preload();
                //this.modelEntityPool[modelName].push(model);
            }
        }
    }

    getTickRate() {
        return this.tickRate;
    }

    getMsPerTick() {
        return this.msPerTick;
    }

    getReplicator() {
        return this.replicator;
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getLocalPlayer() {
        return this.localPlayer;
    }

    getInWorld() {
        return this.inWorld;
    }

    getMyUid() {
        return this.myUid;
    }

    getEntityByUid(uid) {
        return this.entities[uid];
    }

    getPooledNetworkEntityCount() {
        return this.networkEntityPool.length;
    }

    getModelFromPool(modelName) {
        if (this.modelEntityPool[modelName].length === 0) return null;

        return this.modelEntityPool[modelName].shift();
    }

    getPooledModelEntityCount(modelName) {
        if (!(modelName in this.modelEntityPool)) return 0;

        return this.modelEntityPool[modelName].length;
    }

    onEnterWorld(data) {
        if (!data.allowed) return;

        this.width = data.x2;
        this.height = data.y2;
        this.tickRate = data.tickRate;
        this.msPerTick = 1000 / data.tickRate;
        this.inWorld = true;
        this.myUid = data.uid;
    }

    onEntityUpdate(data) {
        let uid;

        for (uid in this.entities) {
            if (!(uid in data.entities)) {
                this.removeEntity(uid);
            } else if (data.entities[uid] !== true) {
                this.updateEntity(uid, data.entities[uid]);
            } else {
                this.updateEntity(uid, this.entities[uid].getTargetTick());
            }
        }

        for (uid in data.entities) {
            if (data.entities[uid] === true) continue;
            if (!(uid in this.entities)) this.createEntity(data.entities[uid]);

            if (this.localPlayer != null && this.localPlayer.getEntity() === this.entities[uid]) {
                this.localPlayer.setTargetTick(data.entities[uid]);
            }
        }
    }

    createEntity(data) {
        let entity;

        if (this.currentGame.getNetworkEntityPooling() && this.networkEntityPool.length > 0) {
            entity = this.networkEntityPool.shift();
            entity.setTargetTick(data);
            entity.uid = data.uid;
        } else entity = new NetworkEntity(this.currentGame, data);

        entity.refreshModel(data.model);

        if (data.uid === this.myUid)
            this.localPlayer.setEntity(entity);

        this.entities[data.uid] = entity;
    }

    updateEntity(uid, data) {
        this.entities[uid].setTargetTick(data);
    }

    removeEntity(uid) {
        delete this.entities[uid];
    }

    onRendererTick(delta) {
        const msInThisTick = this.replicator.getMsInThisTick();

        for (const uid in this.entities)
            this.entities[uid].tick(msInThisTick, this.msPerTick);
    }
}