const through = require('through2');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-create-nejmmap';

function createNejm(lines) {
    const moduleNames = [];
    const modules = [];

    const GEN_IMPORT = /import (.*?) from (.*?);/;

    lines.forEach(line => {
        if (!line.startsWith('export')) {
            const result = GEN_IMPORT.exec(line);
            if (result) {
                const [, moduleName, module] = result;
                moduleNames.push(moduleName);
                modules.push(module.replace('./', ''));
            }
        }
    });
    let name2source = [];
    let source2name = [];

    moduleNames.forEach((moduleName, i) => {
        const module = modules[i];

        name2source.push(`'${moduleName}': ${module}`);
        source2name.push(`${module}: '${moduleName}'`)
    });


    const template = `
        export const name2source = {
            ${name2source.join(',')}
        };

        export const source2name = {
            ${source2name.join(',')}
        };
    `;

    return Buffer.from(template);
}

module.exports = function () {
    return through.obj(function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            const lines = file.contents.toString().split('\n');
            file.contents = createNejm(lines);
        }

        this.push(file);
        cb();
    });
};
