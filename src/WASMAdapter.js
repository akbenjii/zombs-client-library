'use strict';

const fs = require('fs');

module.exports = class WASMAdapter {

    constructor() {
        this.textEncoder = new TextDecoder('utf8');
    }


    a_a(a) {
        console.log(a);
        let _0xe0df65 = eval(this._0x9cecb9(a));

        if (!_0xe0df65) return 0;
        _0xe0df65 += '';

        const _0xc49a5d = this.a_a, _0xa1a152 = this._0x1fee29(_0xe0df65);
        return (!_0xc49a5d.bufferSize || _0xc49a5d.bufferSize < _0xa1a152 + 1) && (_0xc49a5d.bufferSize && this._free(_0xc49a5d.buffer), _0xc49a5d.bufferSize = _0xa1a152 + 1, _0xc49a5d.buffer = this._malloc(_0xc49a5d.bufferSize)), this._0x201d20(_0xe0df65, _0xc49a5d.buffer, _0xc49a5d.bufferSize), _0xc49a5d.buffer;
    }

    a_b(a) {
        console.log(a);
        return 0 | eval(this._0x9cecb9(a));
    }

    a_c() {
        console.log('perfor');
        return performance.now();
    }

    a_d() {
        console.log('d');
        //logger.error("WAssembly.a_a -> fatal error");
        console.log('FATAL ERROR')
        process.exit(-1);
    }

    a_e(a) {
        console.log(a);
        var _0x3df9cc = this.HEAPU8.length;
        a >>>= 0;
        var _0x8925b5 = 2147483648;

        if (a > _0x8925b5)
            return !1;
        for (var _0x2b4b15 = function (_0x10cd25, _0xdcc808) {
            return _0x10cd25 + (_0xdcc808 - _0x10cd25 % _0xdcc808) % _0xdcc808;
        }, _0x9ca036 = 1; _0x9ca036 <= 4; _0x9ca036 *= 2) {
            var _0x46ee00 = _0x3df9cc * (1 + 0.2 / _0x9ca036);
            _0x46ee00 = Math.min(_0x46ee00, a + 100663296);
            var _0x24dcd5 = Math.min(_0x8925b5, _0x2b4b15(Math.max(a, _0x46ee00), 65536)), _0x2833bd = _0x16c459(_0x24dcd5);
            if (_0x2833bd)
                return !0;
        }
        return !1;
    }

    a_f(a, b, c) {
        console.log(a, b, c);
        this.HEAPU8.copyWithin(a, b, b + c);
    }

    init() {
        const buffer = fs.readFileSync(require('path').join(__dirname, '../bin/zombs_wasm.wasm'));

        const imports = {
            a: {
                'a': (...args) => this.a_a(...args),
                'b': (...args) => this.a_b(...args),
                'c': (...args) => this.a_c(...args),
                'd': (...args) => this.a_d(...args),
                'e': (...args) => this.a_e(...args),
                'f': (...args) => this.a_f(...args)
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

                this.instantiateWasm();
                resolve();
            });
        });
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

    instantiateWasm(_0x268f51) {
        _0x268f51 = _0x268f51 || [], _0x268f51.unshift('./this.program');

        var _0xa1c54c = _0x268f51.length, _0x2126c6 = this.stackAlloc(4 * (_0xa1c54c + 1)), _0x3137a5 = _0x2126c6 >> 2;

        _0x268f51.forEach(function (_0x516b72) {
            this.HEAP32[_0x3137a5++] = this._0x29493a(_0x516b72);
        }.bind(this)), this.HEAP32[_0x3137a5] = 0;

        try {
            const _0x25ddad = this._main(_0xa1c54c, _0x2126c6);
            return this._0x554486(_0x25ddad, !0), _0x25ddad;
        } catch (_0x3e75ce) {
            console.log(_0x3e75ce)
        }
    }

    _0x554486(_0x622abf) {
    }

    _0x29493a(_0x40e1b5) {
        var _0x282616 = this._0x1fee29(_0x40e1b5) + 1, _0x3a463c = this.stackAlloc(_0x282616);
        return this._0x4b56f8(_0x40e1b5, this.HEAP8, _0x3a463c, _0x282616), _0x3a463c;
    }

    _0x1fee29(_0x174d42) {
        for (var _0x4a7853 = 0, _0x2d1a82 = 0; _0x2d1a82 < _0x174d42.length; ++_0x2d1a82) {
            var _0x22b351 = _0x174d42.charCodeAt(_0x2d1a82);
            _0x22b351 <= 127 ? _0x4a7853++ : _0x22b351 <= 2047 ? _0x4a7853 += 2 : _0x22b351 >= 55296 && _0x22b351 <= 57343 ? (_0x4a7853 += 4, ++_0x2d1a82) : _0x4a7853 += 3;
        }
        return _0x4a7853;
    }

    _0x9cecb9(_0x37d469, _0x86eb95) {
        console.log('ganfg')
        return _0x37d469 ? this._0x46533c(this.HEAPU8, _0x37d469, _0x86eb95) : '';
    }

    _0x46533c(_0x567b3c, _0x2972f8, _0x3a2c40) {
        for (var _0x21fb6e = _0x2972f8 + _0x3a2c40, _0x3b6cca = _0x2972f8; _0x567b3c[_0x3b6cca] && !(_0x3b6cca >= _0x21fb6e);)
            ++_0x3b6cca;
        if (_0x3b6cca - _0x2972f8 > 16 && _0x567b3c.buffer && this.textEncoder)
            return this.textEncoder.decode(_0x567b3c.subarray(_0x2972f8, _0x3b6cca));
        for (var _0x5ba9d4 = ''; _0x2972f8 < _0x3b6cca;) {
            var _0x5d5f02 = _0x567b3c[_0x2972f8++];
            if (128 & _0x5d5f02) {
                var _0x448137 = 63 & _0x567b3c[_0x2972f8++];
                if (192 != (224 & _0x5d5f02)) {
                    var _0x26ff87 = 63 & _0x567b3c[_0x2972f8++];
                    if (_0x5d5f02 = 224 == (240 & _0x5d5f02) ? (15 & _0x5d5f02) << 12 | _0x448137 << 6 | _0x26ff87 : (7 & _0x5d5f02) << 18 | _0x448137 << 12 | _0x26ff87 << 6 | 63 & _0x567b3c[_0x2972f8++], _0x5d5f02 < 65536)
                        _0x5ba9d4 += String.fromCharCode(_0x5d5f02);
                    else {
                        var _0x3cbc5d = _0x5d5f02 - 65536;
                        _0x5ba9d4 += String.fromCharCode(55296 | _0x3cbc5d >> 10, 56320 | 1023 & _0x3cbc5d);
                    }
                } else
                    _0x5ba9d4 += String.fromCharCode((31 & _0x5d5f02) << 6 | _0x448137);
            } else
                _0x5ba9d4 += String.fromCharCode(_0x5d5f02);
        }
        return _0x5ba9d4;
    }

    _0x201d20(_0x3dd82e, _0xc6b498, _0x380e58) {
        return this._0x4b56f8(_0x3dd82e, this.HEAPU8, _0xc6b498, _0x380e58);
    }

    _0x4b56f8(_0x1351cf, _0x3a56e2, _0x525938, _0x1cc27a) {
        if (!(_0x1cc27a > 0))
            return 0;
        for (var _0x14cc6a = _0x525938, _0x42db80 = _0x525938 + _0x1cc27a - 1, _0x24873e = 0; _0x24873e < _0x1351cf.length; ++_0x24873e) {
            var _0x35dd1c = _0x1351cf.charCodeAt(_0x24873e);
            if (_0x35dd1c >= 55296 && _0x35dd1c <= 57343) {
                var _0x3bf91f = _0x1351cf.charCodeAt(++_0x24873e);
                _0x35dd1c = 65536 + ((1023 & _0x35dd1c) << 10) | 1023 & _0x3bf91f;
            }
            if (_0x35dd1c <= 127) {
                if (_0x525938 >= _0x42db80)
                    break;
                _0x3a56e2[_0x525938++] = _0x35dd1c;
            } else {
                if (_0x35dd1c <= 2047) {
                    if (_0x525938 + 1 >= _0x42db80)
                        break;
                    _0x3a56e2[_0x525938++] = 192 | _0x35dd1c >> 6, _0x3a56e2[_0x525938++] = 128 | 63 & _0x35dd1c;
                } else {
                    if (_0x35dd1c <= 65535) {
                        if (_0x525938 + 2 >= _0x42db80)
                            break;
                        _0x3a56e2[_0x525938++] = 224 | _0x35dd1c >> 12, _0x3a56e2[_0x525938++] = 128 | _0x35dd1c >> 6 & 63, _0x3a56e2[_0x525938++] = 128 | 63 & _0x35dd1c;
                    } else {
                        if (_0x525938 + 3 >= _0x42db80)
                            break;
                        _0x3a56e2[_0x525938++] = 240 | _0x35dd1c >> 18, _0x3a56e2[_0x525938++] = 128 | _0x35dd1c >> 12 & 63, _0x3a56e2[_0x525938++] = 128 | _0x35dd1c >> 6 & 63, _0x3a56e2[_0x525938++] = 128 | 63 & _0x35dd1c;
                    }
                }
            }
        }
        return _0x3a56e2[_0x525938] = 0, _0x525938 - _0x14cc6a;
    }
}

'use strict';

const fs = require('fs');

module.exports = class WAssembly {
    constructor(window) {
        this.window = window;
        this.textEncoder = new TextDecoder('utf8');
    }

    #a_a(a) {
        logger.debug('zombs_wasm; (Trace) -> Module A Function A');
        let _0x37c280 = this.window.eval(this.#decodeParam(a));

        if (!_0x37c280) return 0;
        _0x37c280 += '';

        const _0x5c3737 = this.#_0x31ce17(_0x37c280);

        return (!this.#a_e.bufferSize || this.#a_e.bufferSize < _0x5c3737 + 0x1) && (this.#a_e.bufferSize && this._free(this.#a_e.buffer), this.#a_e.bufferSize = _0x5c3737 + 0x1, this.#a_e.buffer = this._malloc(this.#a_e.bufferSize)), this.#_0x309f86(_0x37c280, this.#a_e.buffer, this.#a_e.bufferSize), this.#a_e.buffer;
    }

    #a_b(a) {
        logger.debug('zombs_wasm; (Trace) -> Module A Function B');
        const decoded = this.#decodeParam(a);

        if (decoded.includes('document.getElementById("hud").children.length')) return 24;
        return 0x0 | this.window.eval(decoded);
    }

    #a_c() {
        logger.debug('zombs_wasm; (Trace) -> Module A Function C');
        return this.window.performance.now();
    }

    #a_d() {
        logger.error("WAssembly.a_a -> fatal error");
        process.exit(-1);
    }

    #a_e(a, b, c) {
        logger.debug('zombs_wasm; (Trace) -> Module A Function E');
        this.HEAPU8.copyWithin(a, b, b + c)
    }

    #a_f(a) {
        logger.debug('zombs_wasm; (Trace) -> Module A Function F');

        a >>>= 0x0;
        const _0x4ec8ab = 0x80000000;

        if (a > _0x4ec8ab) return false;

        for (let i = 1; i <= 4; i *= 2) {
            let _0x2c9c55 = this.HEAPU8.length * (0x1 + 0.2 / i);
            _0x2c9c55 = Math.min(_0x2c9c55, a + 0x6000000);

            const _0x21150c = Math.min(_0x4ec8ab, this.#_0x22cf5c(Math.max(0x1000000, a, _0x2c9c55), 0x10000));
            const _0x542766 = this.#grow(_0x21150c);

            if (_0x542766) return true;
        }
        return false;
    }

    init() {
        const buffer = fs.readFileSync(require('path').join(__dirname, '../../bin/zombs_wasm.wasm'));
        const imports = {
            a: {
                'a': (...args) => this.#a_a(...args),
                'b': (...args) => this.#a_b(...args),
                'c': (...args) => this.#a_c(...args),
                'd': (...args) => this.#a_d(...args),
                'e': (...args) => this.#a_e(...args),
                'f': (...args) => this.#a_f(...args)
            }
        }

        return new Promise(resolve => {
            WebAssembly.instantiate(buffer, imports).then(module => {
                this.memory = module.instance.exports.g;
                this.#instantiateHeap(this.memory.buffer);
                this.table = module.instance.exports.h;

                this.___wasm_call_ctors = module.instance.exports.i;
                this._main = module.instance.exports.j;
                this._MakeBlendField = module.instance.exports.k;
                this.stackSave = module.instance.exports.l;
                this.stackRestore = module.instance.exports.m;
                this.stackAlloc = module.instance.exports.n;
                this._malloc = module.instance.exports.o;
                this._free = module.instance.exports.p;

                this.#instantiateWasm();
                resolve();
            });
        });
    }

    #instantiateWasm() {
        this.___wasm_call_ctors();

        let arr = [];
        let length = arr.length + 1;

        let alloc = this.stackAlloc(4 * (length + 1));
        this.HEAP32[alloc >> 2] = this.#getAlloc('./this.program');

        for (let i = 1; i < length; i++)
            this.HEAP32[(alloc >> 2) + i] = this.#getAlloc(arr[i - 1]);

        this.HEAP32[(alloc >> 2) + length] = 0x0;

        try { this._main(length, alloc) }
        catch (e) { logger.error(`WAssembly._main caught error : ${e.stack.toString()}`) }
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

    #getAlloc(_0x49404f) {
        const _0x4fd158 = this.#_0x31ce17(_0x49404f) + 0x1;
        const alloc = this.stackAlloc(_0x4fd158);

        this.#_0x722087(_0x49404f, this.HEAP8, alloc, _0x4fd158);
        return alloc;
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

    #_0x22cf5c(_0x105af5, _0x43e4dd) {
        _0x105af5 % _0x43e4dd > 0x0 && (_0x105af5 += _0x43e4dd - _0x105af5 % _0x43e4dd)
        return _0x105af5;
    }

    #decodeParam(_0x69fd2, _0x27b2ce) {
        return _0x69fd2 ? this.#_0x5ea49f(this.HEAPU8, _0x69fd2, _0x27b2ce) : '';
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

    #_0x309f86(_0x483075, _0x3a8ac4, _0x4179e5) {
        return this.#_0x722087(_0x483075, this.HEAPU8, _0x3a8ac4, _0x4179e5);
    }

    #grow(_0x159464) {
        try {
            this.memory.grow(_0x159464 - this.memory.buffer.byteLength + 0xffff >>> 0x10)
            this.#instantiateHeap(this.memory.buffer);

            return 1;
        } catch (e) {
            logger.error(`WAssembly.grow -> ${e.stack.toString()}`)
        }
    }
}