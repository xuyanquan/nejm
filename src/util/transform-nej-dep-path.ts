import { dirname, relative } from 'path';

/**
 * 转换 nej 中的依赖关系为相对路径的文件引用
 *
 * @param {string} nejPath
 * @param {string} filePath
 */
export function transformNejDepPath(nejPath: string, filePath: string) {
    let relativePath: string = nejPath;

    if (!nejPath.endsWith('.js')) {
        // base/util
        nejPath = './' + nejPath;

        relativePath = relative(dirname(filePath), nejPath);
    } else if (nejPath.startsWith('{platform')) {
        // {platform}element.js
        relativePath = nejPath.replace(/^{platform}/, './platform/');
    } else {
        // ./util.js
        relativePath = nejPath.replace(/\.js$/, '');
    }

    if (!relativePath.startsWith('.')) {
        // relative 同级目录会省略前面的 './', eg: ./util => util
        // 需要手动补充
        relativePath = './' + relativePath;
    }

    return relativePath;
}
