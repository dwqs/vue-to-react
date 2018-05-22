const t = require('babel-types');
const chalk = require('chalk');

const { getIdentifier, log } = require('./utils');

const nestedMethodsVisitor = {
    VariableDeclaration (path) {
        const declarations = path.node.declarations;
        declarations.forEach(d => {
            if (t.isMemberExpression(d.init)) {
                const key = d.init.property.name;
                d.init.object = t.memberExpression(t.thisExpression(), getIdentifier(this.state, key));
            }
        });
        this.statements.push(path.node);
    },

    ExpressionStatement (path) {
        const expression = path.node.expression;
        if (t.isCallExpression(expression) && !t.isThisExpression(expression.callee.object)) {
            path.traverse({
                ThisExpression (memPath) {
                    const key = memPath.parent.property.name;
                    memPath.replaceWith(
                        t.memberExpression(t.thisExpression(), getIdentifier(this.state, key))
                    );
                    memPath.stop();
                }
            }, { state: this.state });
        }

        if (t.isAssignmentExpression(expression)) {
            return log(`Don't do assignment in ${this.key} computed prop`);
        }

        this.statements.push(path.node);
    },

    ReturnStatement (path) {
        path.traverse({
            ThisExpression (memPath) {
                const key = memPath.parent.property.name;
                memPath.replaceWith(
                    t.memberExpression(t.thisExpression(), getIdentifier(this.state, key))
                );
                memPath.stop();
            }
        }, { state: this.state });
        const varNode = t.variableDeclaration('const', [t.variableDeclarator(t.identifier(this.key), path.node.argument)]);
        this.statements.push(varNode);
    }
};

module.exports = function collectVueComputed (path, state) {
    const childs = path.node.value.properties;
    const parentKey = path.node.key.name; // computed;

    if (childs.length) {
        path.traverse({
            ObjectMethod (propPath) {
                const parentNode = propPath.parentPath.parent;
                if (parentNode.key && parentNode.key.name === parentKey) {
                    const key = propPath.node.key.name;
                    if (!state.computeds[key]) {
                        const body = propPath.node.key.name;
                        const statements = [];
                        propPath.traverse(nestedMethodsVisitor, { statements, state, key });
                        state.computeds[key] = {
                            _statements: statements
                        };
                    }
                }
            }
        });
    }
};
