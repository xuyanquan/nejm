import { transform } from '@babel/core';
import * as path from 'path';
import nej2common from './nej2common';

export function expectCodeEqual(expected: string, received: string) {
    expected = expected.trim().split('\n').map(line => line.trim()).filter(line => line.trim()).join('\n');
    received = received.trim().split('\n').map(line => line.trim()).filter(line => line.trim()).join('\n');

    expect(expected).toEqual(received);
}

describe('nej2common', () => {
    const option = {
        'plugins': [
            [path.join(__dirname, '../dist/nej2common.js'), {
                fileName: './base/test.js'
            }]
        ]
    };

    it('nej2common is Function', () => {
        expect(nej2common).toBeInstanceOf(Function);
    });

    it('正确转换依赖和注入信息', () => {
        const code = `
            NEJ.define([
                './global.js',
                'base/util',
                '{platform}element.js'
            ], function(_global, _util, _element, _p, _o, _f, _r) {
                _p._$$ModuleSlothOperation = _k._$klass();
            })
        `;
        const result = transform(code, option);
        expectCodeEqual(result.code, `
            const _global = require("./global");
            const _util = require("./util");
            const _element = require("./platform/element");
            
            var _p = {};
            var _o = {};
            var _f = function () {};
            var _r = [];
            
            var globalThis = window;
            _p._$$ModuleSlothOperation = _k._$klass();
            
            module.exports = _p;
        `);
    });

    describe('转换函数主体', () => {
        it('转换带有 return 语句的函数体', () => {
            const code = `
            NEJ.define([], function() {
                var _platform = this.navigator.platform,
                    _useragent = this.navigator.userAgent;
                var _pro = {};
                _pro.__doBuild = function () {
                    this.__body = _e._$html2node(
                        _t0._$getTextTemplate('tpl-sloth-operation-view')
                    );
                    var _flag = _e._$getByClassName(this.__body, 'j-flag');
                    this.__export = {
                        parent: _flag[0]
                    };
                };
                return _pro;       
            })
        `;
            const result = transform(code, option);
            expectCodeEqual(result.code, `
            var globalThis = window;
            var _platform = globalThis.navigator.platform,
                _useragent = globalThis.navigator.userAgent;
            var _pro = {};
            _pro.__doBuild = function () {
                this.__body = _e._$html2node(_t0._$getTextTemplate('tpl-sloth-operation-view'));
                var _flag = _e._$getByClassName(this.__body, 'j-flag');
                this.__export = {
                    parent: _flag[0]
                };
            };
            module.exports = _pro;
        `);
        });

        it('转换带有注入变量且没有 return 语句的函数体', () => {
            const code = `
            NEJ.define([], function(_p) {
                var _platform = this.navigator.platform,
                    _useragent = this.navigator.userAgent;
                _pro.__doBuild = function () {
                    this.__body = _e._$html2node(
                        _t0._$getTextTemplate('tpl-sloth-operation-view')
                    );
                    var _flag = _e._$getByClassName(this.__body, 'j-flag');
                    this.__export = {
                        parent: _flag[0]
                    };
                };
            })
        `;
            const result = transform(code, option);
            expectCodeEqual(result.code, `
            var _p = {};
            var globalThis = window;
            var _platform = globalThis.navigator.platform,
                _useragent = globalThis.navigator.userAgent;
            _pro.__doBuild = function () {
                this.__body = _e._$html2node(_t0._$getTextTemplate('tpl-sloth-operation-view'));
                var _flag = _e._$getByClassName(this.__body, 'j-flag');
                this.__export = {
                    parent: _flag[0]
                };
            };
            module.exports = _p;
        `);
        });
    });

    it('去掉 DEBUG 和 CMPT', () => {
        const code = `
        define([], function() {
            if (1 === 1) {
                if (1 === 1) {
                    console.log('1 = 1');
                }
            }
            
            if (CMPT) {
                NEJ = this.NEJ || {}; // copy object properties
                return NEJ;
            }
            
            if (DEBUG) {
                NEJ = this.NEJ || {}; // copy object properties
                return NEJ;
            }
            
            function a() {
                if (1 === 1) {
                    if (1 === 1) {
                        console.log('1 = 1');
                    }
                }
            }
        })
        `;
        const result = transform(code, option);
        expectCodeEqual(result.code, `
            var globalThis = window;
            if (1 === 1) {
                if (1 === 1) {
                    console.log('1 = 1');
                }
            }
            
            if (CMPT) {}
            
            if (DEBUG) {}
            
            function a() {
                if (1 === 1) {
                    if (1 === 1) {
                        console.log('1 = 1');
                    }
                }
            }
        `)
    });
});
