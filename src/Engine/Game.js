'use strict';

const World = require('./World/World');
const Renderer = require('./Renderer/Renderer');
const NetworkAdapter = require('./Network/NetworkAdapter');
const Metrics = require('./Metrics/Metrics');

const _WebAssembly = require('./WebAssembly/_WebAssembly');

module.exports = class Game {
    constructor(config) {
        if (!config.username) throw new Error('Please provide a username.');
        this.config = config;

        this.group = null;

        this.modelEntityPooling = {};
        this.networkEntityPooling = false;

        this.network = new NetworkAdapter(this);
        this.renderer = new Renderer(this);
        this.world = new World(this);
        this.metrics = new Metrics(this);
    }

    async preload() {
        this.world.init();

        this.world.preloadNetworkEntities();
        this.world.preloadModelEntities();

        this._WebAssembly = new _WebAssembly(this);
        await this._WebAssembly.init();

        this.network.addEnterWorldHandler(() => {
            this.renderer.update();
        });
    }

    getNetworkEntityPooling() {
        return this.networkEntityPooling;
    }

    setNetworkEntityPooling(poolSize) {
        this.networkEntityPooling = poolSize;
    }

    getModelEntityPooling(modelName) {
        if (modelName === undefined)
            modelName = null;

        if (modelName)
            return !!this.modelEntityPooling[modelName];

        return this.modelEntityPooling;
    }

    setModelEntityPooling(modelName, poolSize) {
        this.modelEntityPooling[modelName] = poolSize;
    }

    setGroup(group) {
        this.group = group;
    }

    getGroup() {
        return this.group;
    }
}