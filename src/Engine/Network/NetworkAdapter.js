'use strict';

const { PACKET } = require('../../Enumerations');

const { WebSocket } = require('ws');

const BinCodec = require('./Codec');
const EventEmitter = require('events');

module.exports = class BinNetworkAdapter {
    constructor(currentGame) {
        this.ping = 0;

        this.pingStart = null;
        this.pingCompletion = null;

        this.connected = false;
        this.connecting = false;

        this.codec = new BinCodec(currentGame);
        this.emitter = new EventEmitter();

        this.emitter.setMaxListeners(50);

        this.addConnectHandler(this.sendPingIfNecessary.bind(this));
        this.addPingHandler(this.onPing.bind(this));

        this.emitter.on('connected', function(event) {
            //logger.debug('Successfully connected to Websocket: ', event);
            this.connecting = false;
            this.connected = true;
        });

        this.emitter.on('close', function(event) {
            //logger.debug('Websocket connection has been closed: ', event);

            this.connecting = false;
            this.connected = false;

            //if (currentGame.world.getInWorld()) {
            //    setTimeout(this.reconnect.bind(this), 1000);
            //} else if (!currentGame.world.getInWorld() && this.connectionOptions.fallbackPort) {
            //    var fallbackPort = this.connectionOptions.fallbackPort;
            //    delete this.connectionOptions.fallbackPort;
            //    //logger.debug('Switching to fallback port: %d', fallbackPort);
            //    this.connectionOptions.port = fallbackPort;
            //    this.reconnect();
            //}
        });
    }

    async connect(options) {
        this.connectionOptions = options;

        this.connected = false;
        this.connecting = true;

        this.socket = new WebSocket(`wss://${options.hostname}`, {
            headers: {
                Origin: "https://zombs.io",
                Host: options.hostname,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
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
        this.socket.close();

        this.socket = null;
    }

    reconnect() {
        //logger.debug('Attempting to reconnect...', this.connectionOptions);
        return this.connect(this.connectionOptions);
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

    onConnectionStart({ extra }) {
        this.sendEnterWorld({
            displayName: 'benji',
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
        this.addPacketHandler(PACKET.PRE_ENTER_WORLD, preEnterWorldPacket => {
            callback(preEnterWorldPacket);
        });
    }

    addEnterWorldHandler(callback) {
        this.addPacketHandler(PACKET.ENTER_WORLD, function(response) {
            callback(response);
        });
    }

    addEntityUpdateHandler(callback) {
        this.addPacketHandler(PACKET.ENTITY_UPDATE, function(response) {
            callback(response);
        });
    }

    addPingHandler(callback) {
        this.addPacketHandler(PACKET.PING, function(response) {
            callback(response);
        });
    }

    addRpcHandler(rpc, callback) {
        this.addPacketHandler(PACKET.RPC, function(response) {
            if (rpc === response.name)
                return callback(response.response);
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