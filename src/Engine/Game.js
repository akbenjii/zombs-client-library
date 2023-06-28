'use strict';

const World = require('./World/World');
const Renderer = require('./Renderer/Renderer');
const NetworkAdapter = require('./Network/NetworkAdapter');
const Metrics = require('./Metrics/Metrics');
const Codec = require('./Network/Codec');

const _WebAssembly = require('./WebAssembly/_WebAssembly');
const {fetchServers} = require('../Utilities/fetchServers');

const {LOG_TYPE} = require('../Enumerations');

module.exports = class Game {
    static LOG_TYPE = LOG_TYPE;
    static Codec

    constructor(config) {
        if (!config.username) throw new Error('Please provide a username.');
        if(!config.logType) config.logType = LOG_TYPE.DISABLED;

        this.config = config;
        this.group = 0;

        this.modelEntityPooling = {};
        this.networkEntityPooling = false;

        this.network = new NetworkAdapter(this);
        this.renderer = new Renderer(this);
        this.world = new World(this);
        this.metrics = new Metrics(this);

        this.preloaded = false;

        if (config.logType && config.logType !== LOG_TYPE.DISABLED) {
            this.logger = require('../Utilities/logger');
            this.logger.init(config.logType);
        }
    }

    preload() {
        return new Promise(async resolve => {
            if (this.preloaded) return;
            this.servers = await fetchServers();

            this.world.init();

            this.world.preloadNetworkEntities();
            this.world.preloadModelEntities();

            this._WebAssembly = new _WebAssembly(this);
            await this._WebAssembly.init();

            this.network.addEnterWorldHandler(() => {
                this.renderer.update();
            });

            this.preloaded = true;
            resolve();
        })
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