'use strict';

const World = require('./World/World');
const Renderer = require('./Renderer/Renderer');
const BinNetworkAdapter = require('./Network/NetworkAdapter');
const Metrics = require('./Metrics/Metrics');

const wasmSolver = require('../wasmSolver');

module.exports = class Game {
    constructor(config) {
        if(!config.username) throw new Error('Please provide a username.');

        this.group = null;

        this.modelEntityPooling = {};
        this.networkEntityPooling = false;

        this.network = new BinNetworkAdapter(this);
        this.renderer = new Renderer(this);
        this.world = new World(this);
        this.metrics = new Metrics(this);
    }

    async preload() {
        this.world.init();

        this.world.preloadNetworkEntities();
        this.world.preloadModelEntities();

        this.wasmmer = new wasmSolver();
        await this.wasmmer.init();
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