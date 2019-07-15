import template from '@babel/template';
import { NodePath } from '@babel/traverse';
import * as types from '@babel/types';
import { Program, Statement } from '@babel/types';
import * as path from 'path';
import { transformNejDepPath } from './util';
import { NejInjectType } from './util/interfaces/nej-inject.interface';
import { nejParser } from './util/nej-parser';
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

                    if (filename && nejInject) {
                        fileName = './' + path.relative(nejRoot, filename);
                    }

                    const IMPORT_LIST = [];
                    const NEJ_INJECT_LIST = [];
                    const FN_BODY = transformThis2Window(fnBody);

                    dependence.forEach(({dep, alias}) => {
                        const specifiers = [types.importNamespaceSpecifier(types.identifier(alias))];
                        IMPORT_LIST.push(types.importDeclaration(specifiers, types.stringLiteral(transformNejDepPath(dep, fileName))));
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
                        }

                        NEJ_INJECT_LIST.push(statement);
                    });


                    program.node.body = buildWrapper({
                        IMPORT_LIST,
                        NEJ_INJECT_LIST,
                        FN_BODY
                    });
                }
            }
        }
    };
}
