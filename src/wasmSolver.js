'use strict';

const fs = require("fs");
const buffer = fs.readFileSync(require('path').join(__dirname, '../bin/zombs_wasm.wasm'));

module.exports = class wasmSolver {

    constructor() {
        this.decoder = new TextDecoder();
    }

    decode(address) {
        return this.decoder.decode(this.HEAPU8.slice(address, this.HEAPU8.indexOf(0, address)));
    }

    #a_a(address) {
        //console.log('a_a', this.#decodeParam(address));
        let _0x37c280 = "45.32.175.4" //this.window.eval(this.#decodeParam(a));

        if (!_0x37c280) return 0;
        _0x37c280 += '';

        const _0x5c3737 = this.#_0x31ce17(_0x37c280);

        return (!this.#a_a.bufferSize || this.#a_a.bufferSize < _0x5c3737 + 0x1) && (this.#a_a.bufferSize && this._free(this.#a_a.buffer), this.#a_a.bufferSize = _0x5c3737 + 0x1, this.#a_a.buffer = this._malloc(this.#a_a.bufferSize)), this.#_0x309f86(_0x37c280, this.#a_a.buffer, this.#a_a.bufferSize), console.log(this.#a_a.buffer), this.#a_a.buffer;
    }

    #decodeParam(_0x69fd2, _0x27b2ce) {
        return _0x69fd2 ? this.#_0x5ea49f(this.HEAPU8, _0x69fd2, _0x27b2ce) : '';
    }

    #_0x309f86(_0x483075, _0x3a8ac4, _0x4179e5) {
        return this.#_0x722087(_0x483075, this.HEAPU8, _0x3a8ac4, _0x4179e5);
    }

    #_0x722087(_0x1758de, _0xed46ea, _0x1af071, _0xab45f) {
        if (!(_0xab45f > 0x0)) return 0x0;

        const _0x151898 = _0x1af071;
        const _0x4c8912 = _0x1af071 + _0xab45f - 0x1;

        for (let i = 0x0; i < _0x1758de.length; ++i) {
            let _0x4f8126 = _0x1758de.charCodeAt(i);
            if (_0x4f8126 >= 0xd800 && _0x4f8126 <= 0xdfff) {
                const _0x556e3f = _0x1758de.charCodeAt(++i);
                _0x4f8126 = 0x10000 + ((0x3ff & _0x4f8126) << 0xa) | 0x3ff & _0x556e3f;
            }
            if (_0x4f8126 <= 0x7f) {
                if (_0x1af071 >= _0x4c8912)
                    break;
                _0xed46ea[_0x1af071++] = _0x4f8126;
            } else {
                if (_0x4f8126 <= 0x7ff) {
                    if (_0x1af071 + 0x1 >= _0x4c8912)
                        break;
                    _0xed46ea[_0x1af071++] = 0xc0 | _0x4f8126 >> 0x6;
                    _0xed46ea[_0x1af071++] = 0x80 | 0x3f & _0x4f8126;
                } else {
                    if (_0x4f8126 <= 0xffff) {
                        if (_0x1af071 + 0x2 >= _0x4c8912)
                            break;
                        _0xed46ea[_0x1af071++] = 0xe0 | _0x4f8126 >> 0xc;
                        _0xed46ea[_0x1af071++] = 0x80 | _0x4f8126 >> 0x6 & 0x3f;
                        _0xed46ea[_0x1af071++] = 0x80 | 0x3f & _0x4f8126;
                    } else {
                        if (_0x1af071 + 0x3 >= _0x4c8912)
                            break;
                        _0xed46ea[_0x1af071++] = 0xf0 | _0x4f8126 >> 0x12;
                        _0xed46ea[_0x1af071++] = 0x80 | _0x4f8126 >> 0xc & 0x3f;
                        _0xed46ea[_0x1af071++] = 0x80 | _0x4f8126 >> 0x6 & 0x3f;
                        _0xed46ea[_0x1af071++] = 0x80 | 0x3f & _0x4f8126;
                    }
                }
            }
        }

        _0xed46ea[_0x1af071] = 0x0;
        return _0x1af071 - _0x151898;
    }

    #_0x5ea49f(_0x588906, _0x3fa574, _0x3f49df) {
        for (var _0x384bd6 = _0x3fa574 + _0x3f49df, _0x64e5ec = _0x3fa574; _0x588906[_0x64e5ec] && !(_0x64e5ec >= _0x384bd6);)
            ++_0x64e5ec;
        if (_0x64e5ec - _0x3fa574 > 0x10 && _0x588906.subarray && this.textEncoder)
            return this.textEncoder.decode(_0x588906.subarray(_0x3fa574, _0x64e5ec));
        for (var _0x23f3f3 = ''; _0x3fa574 < _0x64e5ec;) {
            var _0x322e91 = _0x588906[_0x3fa574++];
            if (0x80 & _0x322e91) {
                var _0x393a0f = 0x3f & _0x588906[_0x3fa574++];
                if (0xc0 != (0xe0 & _0x322e91)) {
                    var _0x1093d2 = 0x3f & _0x588906[_0x3fa574++];
                    if (_0x322e91 = 0xe0 == (0xf0 & _0x322e91) ? (0xf & _0x322e91) << 0xc | _0x393a0f << 0x6 | _0x1093d2 : (0x7 & _0x322e91) << 0x12 | _0x393a0f << 0xc | _0x1093d2 << 0x6 | 0x3f & _0x588906[_0x3fa574++], _0x322e91 < 0x10000)
                        _0x23f3f3 += String.fromCharCode(_0x322e91);
                    else {
                        var _0xca855 = _0x322e91 - 0x10000;
                        _0x23f3f3 += String.fromCharCode(0xd800 | _0xca855 >> 0xa, 0xdc00 | 0x3ff & _0xca855);
                    }
                } else
                    _0x23f3f3 += String.fromCharCode((0x1f & _0x322e91) << 0x6 | _0x393a0f);
            } else
                _0x23f3f3 += String.fromCharCode(_0x322e91);
        }
        return _0x23f3f3;
    }

    #_0x31ce17(_0x10db1a) {
        let _0x502ddd = 0;
        for (let i = 0; i < _0x10db1a.length; ++i) {
            let _0x4c7b50 = _0x10db1a.charCodeAt(i);

            _0x4c7b50 >= 0xd800 && _0x4c7b50 <= 0xdfff && (_0x4c7b50 = 0x10000 + ((0x3ff & _0x4c7b50) << 0xa) | 0x3ff & _0x10db1a.charCodeAt(++i));
            _0x4c7b50 <= 0x7f ? ++_0x502ddd : _0x502ddd += _0x4c7b50 <= 0x7ff ? 0x2 : _0x4c7b50 <= 0xffff ? 0x3 : 0x4;
        }
        return _0x502ddd;
    }

    #a_b(address) {
        const check = this.decode(address);
        //console.log('b', check);

        if (check.startsWith('typeof window === "undefined"')) return 0;
        if (check.startsWith("typeof process !== 'undefined'")) return 0;
        if (check.startsWith("Game.currentGame.network.connected ? 1 : 0")) return 1;
        if (check.startsWith('Game.currentGame.world.myUid === null ? 0 : Game.currentGame.world.myUid')) return 0;
        if (check.startsWith('document.getElementById("hud").children.length')) return 24;

        console.log(check, 'b unhandled')
    }

    #a_c() {
        //return performance.now();
    }

    #a_d() {
        console.log('d', 'FATAL')
    }

    #a_e(a) {
        console.log('e', a)
    }

    #a_f(a, b, c) {
        console.log('f', a, b, c);
    }

    async init() {
        const imports = {
            a: {
                a: (...args) => this.#a_a(...args),
                b: (...args) => this.#a_b(...args),
                c: (...args) => this.#a_c(...args),
                d: (...args) => this.#a_d(...args),
                e: (...args) => this.#a_e(...args),
                f: (...args) => this.#a_f(...args)
            }
        }

        return new Promise(resolve => {
            WebAssembly.instantiate(buffer, imports).then(module => {
                this.memory = module.instance.exports.g;
                this.instantiateHeap(this.memory.buffer);

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

                console.log('instantiated')
                resolve();
            })
        })


    }

    instantiateHeap(buffer) {
        this.HEAP8 = new Int8Array(buffer);
        this.HEAP16 = new Int16Array(buffer);
        this.HEAP32 = new Int32Array(buffer);
        this.HEAPU8 = new Uint8Array(buffer);
        this.HEAPU16 = new Uint16Array(buffer);
        this.HEAPU32 = new Uint32Array(buffer);
        this.HEAPF32 = new Float32Array(buffer);
        this.HEAPF64 = new Float64Array(buffer);
    }
}