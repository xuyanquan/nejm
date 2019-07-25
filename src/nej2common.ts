import template from '@babel/template';
import { NodePath } from '@babel/traverse';
import * as types from '@babel/types';
import { IfStatement, Program, Statement } from '@babel/types';
import * as path from 'path';
import { transformNejDepPath } from './util';
import { NejInjectType } from './util/interfaces/nej-inject.interface';
import { nejParser } from './util/nej-parser';
import { transformReturnToExport } from './util/transform-return-to-export';
import { transformThis2Window } from './util/transform-this-to-window';

const buildWrapper = template.statements(`
    IMPORT_LIST
    NEJ_INJECT_LIST
    FN_BODY
`);

export default function () {
    return {
        visitor: {
            Program: {
                exit: (program: NodePath<Program>, options) => {
                    const {
                        fnBody, nejInject, dependence
                    } = nejParser(program);
                    let {opts: {fileName, nejRoot}, filename} = options;

                    if (fnBody === undefined) {
                        return;
                    }

                    if (filename && nejInject) {
                        fileName = './' + path.relative(nejRoot, filename);
                    }

                    const IMPORT_LIST = [];
                    const NEJ_INJECT_LIST = [];
                    const FN_BODY = transformReturnToExport(transformThis2Window(fnBody), nejInject);

                    dependence.forEach(({dep, alias}) => {
                        IMPORT_LIST.push(types.variableDeclaration('const', [
                            types.variableDeclarator(
                                types.identifier(alias),
                                types.callExpression(types.identifier('require'), [types.stringLiteral(transformNejDepPath(dep, fileName))])
                            )
                        ]))
                    });

                    nejInject.forEach(({type, alias}) => {
                        let statement: Statement;
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
                                statement = types.variableDeclaration('var', [
                                    types.variableDeclarator(types.identifier(alias), types.objectExpression([]))
                                ]);
                                break;
                            default:
                                statement = types.variableDeclaration('var', [
                                    types.variableDeclarator(types.identifier(alias))
                                ]);
                        }

                        NEJ_INJECT_LIST.push(statement);
                    });

                    program.node.body = buildWrapper({
                        IMPORT_LIST,
                        NEJ_INJECT_LIST,
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
