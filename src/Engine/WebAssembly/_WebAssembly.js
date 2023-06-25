'use strict';

const fs = require('fs');
const buffer = fs.readFileSync(require('path').join(__dirname, '../../../bin/zombs_wasm.wasm'));

const {JSDOM} = require('jsdom');

module.exports = class _WebAssembly {

    constructor(currentGame) {
        this.currentGame = currentGame;
        this.decoder = new TextDecoder();

        const {window} = new JSDOM(``, {runScripts: "dangerously", resources: "usable"});
        this.window = window;
    }

    #a_a() {
        let address = this.currentGame.network.connectionOptions.ipAddress;

        if (!address) return 0;
        address = address.toString();

        const addrByteSize = this.#calculateUtf8ByteSize(address);
        const result = {}

        if (!result.bufferSize || result.bufferSize < addrByteSize + 1) {
            if (result.bufferSize) {
                this._free(result.buffer);
            }
            result.bufferSize = addrByteSize + 1;
            result.buffer = this._malloc(result.bufferSize);
        }

        this.#utf8Encode(address, result.buffer, result.bufferSize);
        return result.buffer;
    }


    #a_b(address) {
        const check = this.#decode(address);

        if (check.startsWith('typeof window === "undefined"')) return 0;
        if (check.startsWith("typeof process !== 'undefined'")) return 0;
        if (check.startsWith("Game.currentGame.network.connected")) return 1;
        if (check.startsWith('Game.currentGame.world.myUid === null')) return 0;
        if (check.startsWith('document.getElementById("hud").children.length')) return 24;
    }

    #a_c() {
        return this.window.performance.now();
    }

    #noop() {
    }

    async init() {
        const imports = {
            a: {
                a: (...args) => this.#a_a(...args),
                b: (...args) => this.#a_b(...args),
                c: (...args) => this.#a_c(...args),
                d: (...args) => this.#noop(),
                e: (...args) => this.#noop(),
                f: (...args) => this.#noop()
            }
        }

        return new Promise(resolve => {
            WebAssembly.instantiate(buffer, imports).then(module => {
                this.memory = module.instance.exports.g;
                this.#instantiateHeap(this.memory.buffer);

                this.table = module.instance.exports.k;

                this.___wasm_call_ctors = module.instance.exports.h;
                this._main = module.instance.exports.i;
                this._MakeBlendField = module.instance.exports.j;
                this._malloc = module.instance.exports.l;
                this._free = module.instance.exports.m;
                this.stackSave = module.instance.exports.n;
                this.stackRestore = module.instance.exports.o;
                this.stackAlloc = module.instance.exports.p;

                this.___wasm_call_ctors();
                this._main(0, 0);

                resolve();
            });
        });
    }

    #instantiateHeap(buffer) {
        this.HEAP8 = new Int8Array(buffer);
        this.HEAP16 = new Int16Array(buffer);
        this.HEAP32 = new Int32Array(buffer);
        this.HEAPU8 = new Uint8Array(buffer);
        this.HEAPU16 = new Uint16Array(buffer);
        this.HEAPU32 = new Uint32Array(buffer);
        this.HEAPF32 = new Float32Array(buffer);
        this.HEAPF64 = new Float64Array(buffer);
    }

    destroy() {
        if (this.window) this.#destroyWindow();
        this.#destroyHeap();

        this.memory = null;
        this.table = null;
        this.___wasm_call_ctors = null;
        this._main = null;
        this._MakeBlendField = null;
        this._malloc = null;
        this._free = null;
        this.stackSave = null;
        this.stackRestore = null;
        this.stackAlloc = null;

        this.decoder = null;
    }

    #destroyHeap() {
        this.HEAP8 = null;
        this.HEAP16 = null;
        this.HEAP32 = null;
        this.HEAPU8 = null;
        this.HEAPU16 = null;
        this.HEAPU32 = null;
        this.HEAPF32 = null;
        this.HEAPF64 = null;
    }

    #destroyWindow() {
        this.window.close()
        this.window = null;
    }

    /** Utilities **/

    #utf8Encode(inputStr, buffer, bufferSize) {
        if (!(bufferSize > 0)) return 0;

        const bufferStart = buffer;
        const bufferEnd = buffer + bufferSize - 1;

        for (let i = 0; i < inputStr.length; ++i) {
            let charCode = inputStr.charCodeAt(i);
            if (charCode >= 0xd800 && charCode <= 0xdfff) {
                const nextCharCode = inputStr.charCodeAt(++i);
                charCode = 0x10000 + ((0x3ff & charCode) << 10) | 0x3ff & nextCharCode;
            }
            if (charCode <= 0x7f) {
                if (buffer >= bufferEnd)
                    break;
                this.HEAPU8[buffer++] = charCode;
            } else {
                if (charCode <= 0x7ff) {
                    if (buffer + 1 >= bufferEnd)
                        break;
                    this.HEAPU8[buffer++] = 0xc0 | charCode >> 6;
                    this.HEAPU8[buffer++] = 0x80 | 0x3f & charCode;
                } else {
                    if (charCode <= 0xffff) {
                        if (buffer + 2 >= bufferEnd)
                            break;
                        this.HEAPU8[buffer++] = 0xe0 | charCode >> 12;
                        this.HEAPU8[buffer++] = 0x80 | charCode >> 6 & 0x3f;
                        this.HEAPU8[buffer++] = 0x80 | 0x3f & charCode;
                    } else {
                        if (buffer + 3 >= bufferEnd)
                            break;
                        this.HEAPU8[buffer++] = 0xf0 | charCode >> 18;
                        this.HEAPU8[buffer++] = 0x80 | charCode >> 12 & 0x3f;
                        this.HEAPU8[buffer++] = 0x80 | charCode >> 6 & 0x3f;
                        this.HEAPU8[buffer++] = 0x80 | 0x3f & charCode;
                    }
                }
            }
        }

        this.HEAPU8[buffer] = 0;
        return buffer - bufferStart;
    }

    #calculateUtf8ByteSize(inputString) {
        let byteSize = 0;
        for (let i = 0; i < inputString.length; ++i) {
            let charCode = inputString.charCodeAt(i);

            // handling surrogate pairs for characters outside the BMP (Basic Multilingual Plane)
            if (charCode >= 0xd800 && charCode <= 0xdfff) {
                charCode = 0x10000 + ((0x3ff & charCode) << 10) | 0x3ff & inputString.charCodeAt(++i);
            }

            // determine the bytes size
            if (charCode <= 0x7f) {
                ++byteSize;
            } else if (charCode <= 0x7ff) {
                byteSize += 2;
            } else if (charCode <= 0xffff) {
                byteSize += 3;
            } else {
                byteSize += 4;
            }
        }

        return byteSize;
    }

    #decode(address) {
        return this.decoder.decode(this.HEAPU8.slice(address, this.HEAPU8.indexOf(0, address)));
    }
}