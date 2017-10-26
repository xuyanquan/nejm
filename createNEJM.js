const through = require('through2');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-create-nejm';

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
                modules.push(module);
            }
        }
    });
    
    const returnData = moduleNames.map(moduleName => {
        return `${moduleName}: ${moduleName}`;
    });
    
    const template = `
        define([
            ${modules.join(',')}
        ], function(${moduleNames.join(', ')}) {
            return {
                ${returnData.join(',\n')}
            }
        });
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

