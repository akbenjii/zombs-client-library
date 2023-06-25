'use strict';

const {ATTRIBUTE_TYPE, PARAMETER_TYPE, PACKET} = require('../../Enumerations');
const ByteBuffer = require('bytebuffer');

module.exports = class Codec {
    constructor(currentGame) {
        this.currentGame = currentGame;

        this.attributeMaps = {};
        this.entityTypeNames = {};
        this.rpcMaps = [];
        this.rpcMapsByName = {};
        this.sortedUidsByType = {};
        this.removedEntities = {};
        this.absentEntitiesFlags = [];
        this.updatedEntityFlags = [];
    }

    encode(opcode, data) {
        const buffer = new ByteBuffer(100, true);
        this.currentGame.logger && this.currentGame.logger.outgoing(`[${PACKET[opcode]}] ${JSON.stringify(data)}`);

        switch (opcode) {
            case PACKET.ENTER_WORLD:
                buffer.writeUint8(PACKET.ENTER_WORLD);
                this.encodeEnterWorld(buffer, data);
                break;
            case PACKET.ENTER_WORLD2:
                buffer.writeUint8(PACKET.ENTER_WORLD2);
                this.encodeEnterWorld2(buffer);
                break;
            case PACKET.INPUT:
                buffer.writeUint8(PACKET.INPUT);
                this.encodeInput(buffer, data);
                break;
            case PACKET.PING:
                buffer.writeUint8(PACKET.PING);
                this.encodePing(buffer);
                break;
            case PACKET.RPC:
                buffer.writeUint8(PACKET.RPC);
                this.encodeRpc(buffer, data);
        }

        buffer.flip();
        buffer.compact();

        return buffer.toArrayBuffer();
    }

    decode(arrayBuffer) {
        const buffer = ByteBuffer.wrap(arrayBuffer, 'utf8', true);
        const opcode = buffer.readUint8();

        let decoded;
        switch (opcode) {
            case PACKET.PRE_ENTER_WORLD:
                decoded = this.decodePreEnterWorldResponse(buffer);
                break;
            case PACKET.ENTER_WORLD:
                decoded = this.decodeEnterWorldResponse(buffer);
                break;
            case PACKET.ENTITY_UPDATE:
                decoded = this.decodeEntityUpdate(buffer);
                break;
            case PACKET.PING:
                decoded = this.decodePing();
                break;
            case PACKET.RPC:
                decoded = this.decodeRpc(buffer);
        }

        decoded.opcode = opcode;

        this.currentGame.logger && this.currentGame.logger.incoming(`[${PACKET[opcode]}] ${JSON.stringify(decoded)}`);
        return decoded;
    }

    encodeEnterWorld(buffer, params) {
        buffer.writeVString(params.displayName);
        const extraBuf = new Uint8Array(params.extra);

        for (let i = 0; i < params.extra.byteLength; i++)
            buffer.writeUint8(extraBuf[i]);
    }

    encodeEnterWorld2(buffer) {
        const BlendField = this.currentGame._WebAssembly._MakeBlendField(187, 22);

        for (let i = 0; i < 16; i++)
            buffer.writeUint8(this.currentGame._WebAssembly.HEAPU8[BlendField + i]);

        this.currentGame._WebAssembly.destroy();
        this.currentGame._WebAssembly = null;
    }

    decodePreEnterWorldResponse(buffer) {
        this.currentGame._WebAssembly._MakeBlendField(24, 132);

        let BlendField = this.currentGame._WebAssembly._MakeBlendField(228, buffer.remaining());

        for (let i = 0; buffer.remaining();) {
            this.currentGame._WebAssembly.HEAPU8[BlendField + i] = buffer.readUint8();
            i++;
        }

        this.currentGame._WebAssembly._MakeBlendField(172, 36);

        BlendField = this.currentGame._WebAssembly._MakeBlendField(4, 152);

        const extra = new ArrayBuffer(64);
        const extraData = new Uint8Array(extra);

        for (let i = 0; i < 64; i++)
            extraData[i] = this.currentGame._WebAssembly.HEAPU8[BlendField + i];

        return {extra};
    }

    decodeEnterWorldResponse(buffer) {
        const EnterWorldResponse = {
            allowed: buffer.readUint32(),
            uid: buffer.readUint32(),
            startingTick: buffer.readUint32(),
            tickRate: buffer.readUint32(),
            effectiveTickRate: buffer.readUint32(),
            players: buffer.readUint32(),
            maxPlayers: buffer.readUint32(),
            chatChannel: buffer.readUint32(),
            effectiveDisplayName: this.safeReadVString(buffer),
            x1: buffer.readInt32(),
            y1: buffer.readInt32(),
            x2: buffer.readInt32(),
            y2: buffer.readInt32()
        }

        const dataLength = buffer.readUint32();

        this.attributeMaps = {};
        this.entityTypeNames = {};

        for (let h = 0; h < dataLength; h++) {
            const attributes = [];
            const attributeID = buffer.readUint32();
            const entityNames = buffer.readVString();
            const attributesLength = buffer.readUint32();

            for (let i = 0; i < attributesLength; i++) {
                attributes.push({
                    name: buffer.readVString(),
                    type: buffer.readUint32()
                });
            }

            this.attributeMaps[attributeID] = attributes;
            this.entityTypeNames[attributeID] = entityNames;
            this.sortedUidsByType[attributeID] = [];
        }

        const rpcLength = buffer.readUint32();

        this.rpcMaps = [];
        this.rpcMapsByName = {};

        for (let h = 0; h < rpcLength; h++) {
            const name = buffer.readVString();
            const parameterLength = buffer.readUint8();
            const isArray = buffer.readUint8() !== 0;
            const parameters = [];

            for (let i = 0; i < parameterLength; i++) {
                parameters.push({
                    'name': buffer.readVString(),
                    'type': buffer.readUint8()
                });
            }

            const rpc = {
                name,
                parameters,
                isArray,
                index: this.rpcMaps.length
            };

            this.rpcMaps.push(rpc);
            this.rpcMapsByName[name] = rpc;
        }

        return EnterWorldResponse;
    }

    decodeEntityUpdate(buffer) {
        const tick = buffer.readUint32();
        const removedEntityCount = buffer.readVarint32();
        const entityUpdateData = {};

        entityUpdateData.tick = tick;
        entityUpdateData.entities = {};

        for (const uid in this.removedEntities) {
            delete this.removedEntities[uid];
        }

        for (let i = 0; i < removedEntityCount; i++) {
            let uid = buffer.readUint32();
            this.removedEntities[uid] = 1;
        }

        const brandNewEntityTypeCount = buffer.readVarint32();

        for (let i = 0; i < brandNewEntityTypeCount; i++) {
            const brandNewEntityCountForThisType = buffer.readVarint32();
            const brandNewEntityType = buffer.readUint32();
            const brandNewEntityTypeString = this.entityTypeNames[brandNewEntityType];
            for (let j = 0; j < brandNewEntityCountForThisType; j++) {
                const brandNewEntityUid = buffer.readUint32();
                this.sortedUidsByType[brandNewEntityType].push(brandNewEntityUid);
            }
        }

        for (let i in this.sortedUidsByType) {
            const table = this.sortedUidsByType[i];
            const newEntityTable = [];

            for (let j = 0; j < table.length; j++) {
                let uid = table[j];

                if (!(uid in this.removedEntities))
                    newEntityTable.push(uid);
            }
            newEntityTable.sort(function (a, b) {
                if (a < b) return -1;
                if (a > b) return 1;

                return 0;
            });

            this.sortedUidsByType[i] = newEntityTable;
        }

        while (buffer.remaining()) {
            const entityType = buffer.readUint32();
            const entityTypeString = this.entityTypeNames[entityType];

            if (!(entityType in this.attributeMaps)) {
                throw new Error('Entity type is not in attribute map: ' + entityType);
            }

            const absentEntitiesFlagsLength = Math.floor((this.sortedUidsByType[entityType].length + 7) / 8);
            this.absentEntitiesFlags.length = 0;

            for (let i = 0; i < absentEntitiesFlagsLength; i++)
                this.absentEntitiesFlags.push(buffer.readUint8());

            const attributeMap = this.attributeMaps[entityType];
            for (let tableIndex = 0; tableIndex < this.sortedUidsByType[entityType].length; tableIndex++) {
                const uid = this.sortedUidsByType[entityType][tableIndex];
                const player = {uid: uid};

                if ((this.absentEntitiesFlags[Math.floor(tableIndex / 8)] & (1 << (tableIndex % 8))) !== 0) {
                    entityUpdateData.entities[uid] = true;
                    continue;
                }

                this.updatedEntityFlags.length = 0;
                for (let j = 0; j < Math.ceil(attributeMap.length / 8); j++)
                    this.updatedEntityFlags.push(buffer.readUint8());

                for (let j = 0; j < attributeMap.length; j++) {
                    const attribute = attributeMap[j];
                    const flagIndex = Math.floor(j / 8);
                    const bitIndex = j % 8;
                    let count = undefined;
                    let v = [];
                    if (this.updatedEntityFlags[flagIndex] & (1 << bitIndex)) {
                        switch (attribute.type) {
                            case ATTRIBUTE_TYPE.Uint32:
                                player[attribute.name] = buffer.readUint32();
                                break;
                            case ATTRIBUTE_TYPE.Int32:
                                player[attribute.name] = buffer.readInt32();
                                break;
                            case ATTRIBUTE_TYPE.Float:
                                player[attribute.name] = buffer.readInt32() / 100.0;
                                break;
                            case ATTRIBUTE_TYPE.String:
                                player[attribute.name] = this.safeReadVString(buffer);
                                break;
                            case ATTRIBUTE_TYPE.Vector2:
                                const x = buffer.readInt32() / 100.0;
                                const y = buffer.readInt32() / 100.0;

                                player[attribute.name] = {
                                    x: x,
                                    y: y
                                };

                                break;
                            case ATTRIBUTE_TYPE.ArrayVector2:
                                count = buffer.readInt32();
                                v = [];

                                for (let i = 0; i < count; i++) {
                                    const x_1 = buffer.readInt32() / 100.0;
                                    const y_1 = buffer.readInt32() / 100.0;

                                    v.push({
                                        x: x_1,
                                        y: y_1
                                    });
                                }

                                player[attribute.name] = v;
                                break;
                            case ATTRIBUTE_TYPE.ArrayUint32:
                                count = buffer.readInt32();
                                v = [];

                                for (let i = 0; i < count; i++) {
                                    const element = buffer.readInt32();
                                    v.push(element);
                                }

                                player[attribute.name] = v;
                                break;
                            case ATTRIBUTE_TYPE.Uint16:
                                player[attribute.name] = buffer.readUint16();
                                break;
                            case ATTRIBUTE_TYPE.Uint8:
                                player[attribute.name] = buffer.readUint8();
                                break;
                            case ATTRIBUTE_TYPE.Int16:
                                player[attribute.name] = buffer.readInt16();
                                break;
                            case ATTRIBUTE_TYPE.Int8:
                                player[attribute.name] = buffer.readInt8();
                                break;
                            case ATTRIBUTE_TYPE.Uint64:
                                player[attribute.name] = buffer.readUint32() + buffer.readUint32() * 4294967296;
                                break;
                            case ATTRIBUTE_TYPE.Int64:
                                let s64 = buffer.readUint32();
                                const s642 = buffer.readInt32();

                                if (s642 < 0) s64 *= -1;

                                s64 += s642 * 4294967296;
                                player[attribute.name] = s64;
                                break;
                            case ATTRIBUTE_TYPE.Double:
                                let s64d = buffer.readUint32();
                                const s64d2 = buffer.readInt32();

                                if (s64d2 < 0) s64d *= -1;

                                s64d += s64d2 * 4294967296;
                                s64d = s64d / 100.0;

                                player[attribute.name] = s64d;
                                break;
                            default:
                                throw new Error('Unsupported attribute type: ' + attribute.type);
                        }
                    }
                }
                entityUpdateData.entities[player.uid] = player;
            }
        }
        entityUpdateData.byteSize = buffer.capacity();
        return entityUpdateData;
    }

    decodePing() {
        return {};
    }

    encodeRpc(buffer, packet) {
        if (!(packet.name in this.rpcMapsByName)) {
            this.currentGame.logger && this.currentGame.logger.error(`RPC not in map: ${packet.name}`);
            return;
        }

        const rpc = this.rpcMapsByName[packet.name];
        buffer.writeUint32(rpc.index);

        for (let i = 0; i < rpc.parameters.length; i++) {
            const param = packet[rpc.parameters[i].name];

            switch (rpc.parameters[i].type) {
                case PARAMETER_TYPE.Float:
                    buffer.writeInt32(Math.floor(param * 100.0));
                    break;
                case PARAMETER_TYPE.Int32:
                    buffer.writeInt32(param);
                    break;
                case PARAMETER_TYPE.String:
                    buffer.writeVString(param);
                    break;
                case PARAMETER_TYPE.Uint32:
                    buffer.writeUint32(param);
                    break;
            }
        }
    }

    decodeRpcObject(buffer, parameters) {
        const decodedObject = {};

        for (let parameter of parameters) {
            switch (parameter.type) {
                case PARAMETER_TYPE.Uint32:
                    decodedObject[parameter.name] = buffer.readUint32();
                    break;
                case PARAMETER_TYPE.Int32:
                    decodedObject[parameter.name] = buffer.readInt32();
                    break;
                case PARAMETER_TYPE.Float:
                    decodedObject[parameter.name] = buffer.readInt32() / 100.0;
                    break;
                case PARAMETER_TYPE.String:
                    decodedObject[parameter.name] = this.safeReadVString(buffer);
                    break;
                case PARAMETER_TYPE.Uint64:
                    decodedObject[parameter.name] = buffer.readUint32() + 4294967296 * buffer.readUint32();
            }
        }
        return decodedObject;
    }

    decodeRpc(buffer) {
        const rpcIndex = buffer.readUint32();
        const rpc = this.rpcMaps[rpcIndex];

        const decodedRpc = {
            name: rpc.name,
            response: null
        };

        if (!rpc.isArray) decodedRpc.response = this.decodeRpcObject(buffer, rpc.parameters);
        else {
            const response = [];
            const count = buffer.readUint16();

            for (let i = 0; i < count; i++)
                response.push(this.decodeRpcObject(buffer, rpc.parameters));

            decodedRpc.response = response;
        }

        return decodedRpc;
    }

    encodeInput(buffer, input) {
        return buffer.writeVString(JSON.stringify(input));
    }

    encodePing(buffer) {
        return buffer.writeUint8(0);
    }

    safeReadVString(buffer) {
        let offset = buffer.offset;
        const len = buffer.readVarint32(offset);

        try {
            const func = buffer.readUTF8String.bind(buffer);
            offset += len.length;

            const str = func(len.value, ByteBuffer.METRICS_BYTES, offset);
            offset += str.length;
            buffer.offset = offset;

            return str.string;
        } catch (e) {
            offset += len.value;
            buffer.offset = offset;

            return '?';
        }
    }
}