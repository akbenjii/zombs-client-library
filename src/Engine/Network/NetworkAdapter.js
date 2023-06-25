'use strict';

const {PACKET} = require('../../Enumerations');
const {WebSocket} = require('ws');

const Codec = require('./Codec');
const EventEmitter = require('events');

const {getRandomUserAgent} = require('../../Utilities/randomUserAgent');

module.exports = class NetworkAdapter {
    constructor(currentGame) {
        this.currentGame = currentGame;
        this.ping = 0;

        this.pingStart = null;
        this.pingCompletion = null;

        this.connected = false;
        this.connecting = false;

        this.codec = new Codec(currentGame);
        this.emitter = new EventEmitter();

        this.emitter.setMaxListeners(50);

        this.addConnectHandler(this.sendPingIfNecessary.bind(this));
        this.addPingHandler(this.onPing.bind(this));

        this.emitter.on('connected', event => {
            //logger.debug('Successfully connected to Websocket: ', event);

            this.connecting = false;
            this.connected = true;
        });

        this.emitter.on('close', event => {
            //logger.debug('Websocket connection has been closed: ', event);

            this.connecting = false;
            this.connected = false;
        });
    }

    connect(serverId) {
        if(!this.currentGame.preloaded) throw new Error('[FATAL] please asynchronously call Game.prototype.preload before trying to connect');
        this.connectionOptions = this.currentGame.servers[serverId];

        if(!this.connectionOptions) throw new Error('[FATAL] couldn\'t load servers.');

        this.connected = false;
        this.connecting = true;

        this.socket = new WebSocket(`wss://${this.connectionOptions.hostname}`, {
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                Origin: "https://zombs.io",
                Host: this.connectionOptions.hostname,
                'User-Agent': getRandomUserAgent()
            }
        });

        this.bindEventListeners();
    }

    bindEventListeners() {
        this.socket.addEventListener('open', this.emitter.emit.bind(this.emitter, 'connected'));
        this.socket.addEventListener('message', this.onMessage.bind(this));
        this.socket.addEventListener('close', this.emitter.emit.bind(this.emitter, 'close'));
        this.socket.addEventListener('error', this.emitter.emit.bind(this.emitter, 'error'));

        this.addPreEnterWorldHandler(this.onConnectionStart.bind(this));
        this.addEnterWorldHandler(this.sendEnterWorld2.bind(this));
    }

    disconnect() {
        this.emitter.removeAllListeners();
        this.socket.close();

        this.socket = null;
    }

    getPing() {
        return this.ping;
    }

    sendPacket(event, data) {
        if (!this.connected) {
            return;
        }

        this.socket.send(this.codec.encode(event, data));
    }

    onMessage(event) {
        this.sendPingIfNecessary();
        const message = this.codec.decode(event.data);
        this.emitter.emit(PACKET[message.opcode], message);
    }

    sendPingIfNecessary() {
        this.connecting = false;
        this.connected = true;
        const pingInProgress = (this.pingStart != null);
        if (pingInProgress) {
            return;
        }
        if (this.pingCompletion != null) {
            const msSinceLastPing = (new Date().getTime() - this.pingCompletion.getTime());
            if (msSinceLastPing <= 5000) {
                return;
            }
        }
        this.pingStart = new Date();

        this.sendPing({
            nonce: 0
        });
    }

    onPing() {
        const now = new Date();
        this.ping = (now.getTime() - this.pingStart.getTime()) / 2;
        this.pingStart = null;
        this.pingCompletion = now;
    }

    onConnectionStart({extra}) {
        this.sendEnterWorld({
            displayName: this.currentGame.config.username,
            extra
        });
    }

    /** NetworkAdapter **/

    sendEnterWorld(data) {
        this.sendPacket(PACKET.ENTER_WORLD, data);
    }

    sendEnterWorld2() {
        this.sendPacket(PACKET.ENTER_WORLD2, {});
    }

    sendInput(data) {
        this.sendPacket(PACKET.INPUT, data);
    }

    sendPing(data) {
        this.sendPacket(PACKET.PING, data);
    }

    sendRpc(data) {
        this.sendPacket(PACKET.RPC, data);
    }

    addPreEnterWorldHandler(callback) {
        this.addPacketHandler(PACKET.PRE_ENTER_WORLD, packet => {
            callback(packet);
        });
    }

    addEnterWorldHandler(callback) {
        this.addPacketHandler(PACKET.ENTER_WORLD, packet => {
            callback(packet);
        });
    }

    addEntityUpdateHandler(callback) {
        this.addPacketHandler(PACKET.ENTITY_UPDATE, packet => {
            callback(packet);
        });
    }

    addPingHandler(callback) {
        this.addPacketHandler(PACKET.PING, response => {
            callback(response);
        });
    }

    addRpcHandler(rpc, callback) {
        this.addPacketHandler(PACKET.RPC, rpc => {
            if (rpc === rpc.name)
                return callback(rpc.response);
        });
    }

    addConnectHandler(callback) {
        this.emitter.on('connected', callback);
    }

    addCloseHandler(callback) {
        this.emitter.on('close', callback);
    }

    addErrorHandler(callback) {
        this.emitter.on('error', callback);
    }

    addPacketHandler(opcode, callback) {
        this.emitter.on(PACKET[opcode], callback);
    }
}