import template from '@babel/template';
import { NodePath } from '@babel/traverse';
import * as types from '@babel/types';
import { IfStatement, Program } from '@babel/types';
import {
    generatorNejDependenciesAsCommonjs,
    nejCodeParser,
    generatorNejInjects,
    transformReturnToModuleExports, transformThis2Window
} from 'babel-helper-nej-transforms';
import * as path from 'path';
import { transformNejDepPath } from './util';

const buildWrapper = template.statements(`
    IMPORT_LIST
    NEJ_INJECT
    FN_BODY
`);

export default function () {
    return {
        visitor: {
            Program: {
                exit: (program: NodePath<Program>, options) => {
                    const {
                        fnBody, dependencies, nejInject
                    } = nejCodeParser(program, options);

                    if (!fnBody) {
                        return;
                    }

                    let {opts: {fileName, nejRoot}, filename} = options;
                    if (filename && nejInject) {
                        fileName = './' + path.relative(nejRoot, filename);
                    }

                    dependencies.forEach(dep => {
                        dep.source = transformNejDepPath(dep.rawSource, fileName);
                    });

                    const IMPORT_LIST = generatorNejDependenciesAsCommonjs(dependencies);
                    const NEJ_INJECT = generatorNejInjects(nejInject);
                    const FN_BODY = transformThis2Window(transformReturnToModuleExports(fnBody, nejInject));

                    program.node.body = buildWrapper({
                        IMPORT_LIST,
                        NEJ_INJECT,
                        FN_BODY
                    });
                }
            },
            IfStatement: {
                exit: (statement: NodePath<IfStatement>) => {
                    if (types.isIdentifier(statement.node.test) && (statement.node.test.name === 'CMPT' || statement.node.test.name === 'DEBUG')) {
                        statement.node.consequent = types.blockStatement([]);
                    }
                }
            }
        }
    };
}
