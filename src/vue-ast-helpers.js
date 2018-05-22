const t = require('babel-types');
const { log, getIdentifier } = require('./utils');

const nestedMethodsVisitor = {
    VariableDeclaration (path) {
        const declarations = path.node.declarations;
        declarations.forEach(d => {
            if (t.isMemberExpression(d.init)) {
                const key = d.init.property.name;
                d.init.object = t.memberExpression(t.thisExpression(), getIdentifier(this.state, key));
            }
        });
        this.blocks.push(path.node);
    },

    ExpressionStatement (path) {
        const expression = path.node.expression;
        if (t.isAssignmentExpression(expression)) {
            const right = expression.right;
            const letfNode = expression.left.property;
            path.node.expression = t.callExpression(
                t.memberExpression(t.thisExpression(), t.identifier('setState')),
                [t.objectExpression([
                    t.objectProperty(letfNode, right)
                ])]
            );
        }

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

        this.blocks.push(path.node);
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
        this.blocks.push(path.node);
    }
};

function createClassMethod (path, state, name) {
    const body = path.node.body;
    const blocks = [];
    let params = [];

    if (name === 'componentDidCatch') {
        params = [t.identifier('error'), t.identifier('info')];
    }
    path.traverse(nestedMethodsVisitor, { blocks, state });
    return t.classMethod('method', t.identifier(name), params, t.blockStatement(blocks));
}

function createRenderMethod (path, state, name) {
    if (path.node.params.length) {
        log(`
            Maybe you will call $createElement or h method in your render, but react does not support it.
            And it's maybe cause some unknown error in transforming
        `);
    }
    path.traverse({
        ThisExpression (thisPath) {
            const parentNode = thisPath.parentPath.parentPath.parent;
            const isValid = t.isJSXElement(parentNode) || t.isCallExpression(parentNode) || (t.isJSXAttribute(parentNode) && !parentNode.name.name.startsWith('on'));
            if (isValid) {
                // prop
                const key = thisPath.parent.property.name;
                if (state.data[key] || state.props[key]) {
                    thisPath.replaceWith(
                        t.memberExpression(t.thisExpression(), getIdentifier(state, key))
                    );
                } else {
                    // from computed
                    thisPath.parentPath.replaceWith(
                        t.identifier(key)
                    );
                }
                thisPath.stop();
            }
        },
        JSXAttribute (attrPath) {
            const attrNode = attrPath.node;
            if (attrNode.name.name === 'class') {
                attrPath.replaceWith(
                    t.jSXAttribute(t.jSXIdentifier('className'), attrNode.value)
                );
            }
        }
    });
    let blocks = [];

    // computed props
    const computedProps = Object.keys(state.computeds);
    if (computedProps.length) {
        computedProps.forEach(prop => {
            const v = state.computeds[prop];
            blocks = blocks.concat(v['_statements']);
        });
    }
    blocks = blocks.concat(path.node.body.body);
    return t.classMethod('method', t.identifier(name), [], t.blockStatement(blocks));
}

exports.handleCycleMethods = function handleCycleMethods (path, collect, state, name, cycleName) {
    if (name === 'render') {
        collect.classMethods[cycleName] = createRenderMethod(path, state, name);
    } else {
        collect.classMethods[cycleName] = createClassMethod(path, state, cycleName);
    }
};

exports.handleGeneralMethods = function handleGeneralMethods (path, collect, state, name) {
    collect.classMethods[name] = createClassMethod(path, state, name);
};
