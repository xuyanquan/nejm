import template from '@babel/template';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { Program, Statement } from '@babel/types';
import { transformNejDepPath } from './util';
import { NejInjectType } from './util/interfaces/nej-inject.interface';
import { nejParser } from './util/nej-parser';
import { transformThis2Window } from './util/transform-this-to-window';

const buildWrapper = template.statements(`
    IMPORT_LIST
    NEJ_INJECT_LIST
    FN_BODY
`);

export default function (babelConfig) {
    return {
        visitor: {
            Program: {
                exit: (program: NodePath<Program>, {opts}) => {
                    const {
                        fnBody, nejInject, dependence
                    } = nejParser(program);
                    const {fileName} = opts;

                    const IMPORT_LIST = [];
                    const NEJ_INJECT_LIST = [];
                    const FN_BODY = transformThis2Window(fnBody);

                    dependence.forEach(({dep, alias}) => {
                        const specifiers = [t.importNamespaceSpecifier(t.identifier(alias))];
                        IMPORT_LIST.push(t.importDeclaration(specifiers, t.stringLiteral(transformNejDepPath(dep, fileName))));
                    });

                    nejInject.forEach(({type, alias}) => {
                        let statement: Statement;
                        switch (type) {
                            case NejInjectType.array:
                                statement = t.variableDeclaration('var', [
                                    t.variableDeclarator(t.identifier(alias), t.arrayExpression())
                                ]);
                                break;
                            case NejInjectType.function:
                                statement = t.variableDeclaration('var', [
                                    t.variableDeclarator(t.identifier(alias), t.functionExpression(null, [], t.blockStatement([])))
                                ]);
                                break;
                            case NejInjectType.object:
                                statement = t.variableDeclaration('var', [
                                    t.variableDeclarator(t.identifier(alias), t.objectExpression([]))
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
