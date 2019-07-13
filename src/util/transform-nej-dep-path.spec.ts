import { transformNejDepPath } from './transform-nej-dep-path';

describe('resolveNejPath', () => {
    it('transformNEJDep is Function', () => {
        expect(transformNejDepPath).toBeInstanceOf(Function);
    });

    describe('形如 "base/util"', () => {
        it('同级目录文件, 返回 => "./util"', () => {
            expect(transformNejDepPath('base/util', './base/element.js')).toEqual('./util');
        });

        it('同级目录中子目录文件, 返回 => "../util"', () => {
            expect(transformNejDepPath('base/util', './base/platform/element.js')).toEqual('../util');
        });

        it('其他目录文件, 返回相对文件路径的文件地址', () => {
            expect(transformNejDepPath('base/util', './util/index.js')).toEqual('../base/util');
            expect(transformNejDepPath('base/util', './util/xhr/xhr.js')).toEqual('../../base/util');
            expect(transformNejDepPath('base/util', './util/xhr/platform/xhr.js')).toEqual('../../../base/util');
        });
    });

    it('形如 "./base/util.js", 去掉后缀名', () => {
        expect(transformNejDepPath('./base/util.js', '.')).toEqual('./base/util');
        expect(transformNejDepPath('./base/util.js', './util/xhr/xhr.js')).toEqual('./base/util');
    });

    it('形如 "{platform}config.js, 返回 ./platform/config"', () => {
        expect(transformNejDepPath('{platform}config.js', '.')).toEqual('./platform/config');
        expect(transformNejDepPath('{platform}config.js', './util/xhr/xhr.js')).toEqual('./platform/config');
    });
});
