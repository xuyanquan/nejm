import { transformFileSync } from '@babel/core';
import * as fs from 'fs';
import * as path from 'path';
import nej2common from '../src/nej2common';

function expectCodeEqual(expected: string, received: string) {
    expected = expected.trim().split('\n').map(line => line.trim()).filter(line => line.trim()).join('\n');
    received = received.trim().split('\n').map(line => line.trim()).filter(line => line.trim()).join('\n');

    expect(expected).toEqual(received);
}

describe('nej2common', () => {
    const option = {
        'plugins': [
            [path.join(__dirname, '../dist/nej2common.js'), {
                nejRoot: path.join(__dirname, '../src/nejRoot')
            }]
        ]
    };

    it('从文件中读取, 转换正确', () => {
        const result = transformFileSync(path.join(__dirname, '../src/nejRoot/base/element.js'), option);
        expectCodeEqual(result.code, fs.readFileSync(path.join(__dirname, './element.js')).toString());
    });
});
