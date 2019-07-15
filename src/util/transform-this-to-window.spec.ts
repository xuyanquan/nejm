import generator from '@babel/generator';
import * as parser from '@babel/parser';
import { transformThis2Window } from './transform-this-to-window';

describe('transformThis2Window', () => {
    it('nejParser is function', () => {
        expect(transformThis2Window).toBeInstanceOf(Function);
    });

    it('正确转换 global this 为 window', () => {
        const code = `
var self = this;
var _platform  = this.navigator.platform,
    _useragent = this.navigator.userAgent;
    
_pro.__reset = function(_options){
    this.__super(_options);
    this.__root = _options.root;
    this.__dispatcher = _options.dispatcher;
    this.__mpool = {}; // umi in this group
};
        `;
        const ast = parser.parse(code);
        ast.program.body = transformThis2Window(ast.program.body);

        expect(generator(ast).code).toEqual(`
var globalThis = window;
var self = globalThis;
var _platform = globalThis.platform,
    _useragent = globalThis.userAgent;

_pro.__reset = function (_options) {
  this.__super(_options);

  this.__root = _options.root;
  this.__dispatcher = _options.dispatcher;
  this.__mpool = {}; // umi in this group
};
        `.trim());
    });
});
