import template from '@babel/template';
import { NodePath } from '@babel/traverse';
import * as types from '@babel/types';
import { IfStatement, Program, Statement } from '@babel/types';
import {
    generatorNejDependencies,
    nejCodeParser,
    generatorNejInjects,
    transformReturnToExport,
    transformThis2Window, generatorNejDependenciesAsCommonjs, transformReturnToModuleExports, NejInjectType
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
                    options.isNejCode = true;

                    let {
                        fnBody, dependencies, nejInject
                    } = nejCodeParser(program, options);

                    if (!fnBody) {
                        return;
                    }

                    let {opts: {fileName, nejRoot}, filename} = options;
                    if (filename && nejInject) {
                        fileName = './' + path.relative(nejRoot, filename);
                    }

                    if (!nejInject) {
                        console.log(filename);
                    }

                    dependencies.forEach(dep => {
                        dep.source = transformNejDepPath(dep.rawSource, fileName);
                    });

                    const IMPORT_LIST = generatorNejDependenciesAsCommonjs(dependencies);

                    const NEJ_INJECT = nejInject.map((inject, index) => {
                        let statement: Statement;
                        const {type, alias} = inject;
                        switch (type) {
                            case NejInjectType.array:
                                statement = types.variableDeclaration('var', [
                                    types.variableDeclarator(types.identifier(alias), types.arrayExpression())
                                ]);
                                break;
                            case NejInjectType.function:
                                statement = types.variableDeclaration('var', [
                                    types.variableDeclarator(types.identifier(alias), types.functionExpression(null, [], types.blockStatement([])))
                                ]);
                                break;
                            case NejInjectType.object:
                                if (index === 0) { // 第一个注入变量通常导出
                                    statement = types.variableDeclaration('var', [
                                        types.variableDeclarator(types.identifier(alias), types.identifier('exports'))
                                    ]);
                                } else {
                                    statement = types.variableDeclaration('var', [
                                        types.variableDeclarator(types.identifier(alias), types.objectExpression([]))
                                    ]);
                                }

                                break;
                            default:
                                statement = types.variableDeclaration('var', [
                                    types.variableDeclarator(types.identifier(alias))
                                ]);
                        }

                        return statement;
                    });

                    if (types.isReturnStatement(fnBody[fnBody.length - 1])) {
                        fnBody = fnBody.slice(0, fnBody.length - 1);
                    }

                    const FN_BODY = transformThis2Window(fnBody);

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
