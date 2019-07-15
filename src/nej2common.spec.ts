import { transform } from '@babel/core';
import * as path from 'path';
import nej2common from './nej2common';

function expectCodeEqual(expected: string, received: string) {
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
            import * as _global from "./global";
            import * as _util from "./util";
            import * as _element from "./platform/element";
            
            var _p = {};
            var _o = {};
            var _f = function () {};
            var _r = [];
            
            var globalThis = window;
            _p._$$ModuleSlothOperation = _k._$klass();
        `);
    });

    it('正确转换函数主体', () => {
        const code = `
            NEJ.define([], function() {
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
        `);
    });
});
