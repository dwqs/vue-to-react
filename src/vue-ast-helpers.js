const t = require('babel-types');
const chalk = require('chalk');

const nestedPropsVisitor = {
    ObjectProperty (path) {
        const parentKey = path.parentPath.parent.key;
        if (parentKey && parentKey.name === this.childKey) {
            const key = path.node.key;
            const node = path.node.value;

            if (key.name === 'type') {
                if (t.isIdentifier(node)) {
                    this.collect.props[this.childKey].type = node.name.toLowerCase();
                } else if (t.isArrayExpression(node)) {
                    const elements = [];
                    node.elements.forEach(n => {
                        elements.push(n.name.toLowerCase());
                    });
                    if (!elements.length) {
                        console.log(chalk.red(`Providing a type for the ${this.childKey} prop is a good practice.`));
                    }
                    /** 
                     * supports following syntax:
                     * propKey: { type: [Number, String], default: 0}
                    */
                    this.collect.props[this.childKey].type = elements.length > 1 ? 'typesOfArray' : elements[0] ? elements[0].toLowerCase() : elements;
                    this.collect.props[this.childKey].value = elements.length > 1 ? elements : elements[0] ? elements[0] : elements;
                } else {
                    console.log(chalk.red(`The type in ${this.childKey} prop only supports identifier or array expression, eg: Boolean, [String]`));
                }
            }

            if (t.isLiteral(node)) {
                if (key.name === 'default') {
                    if (this.collect.props[this.childKey].type === 'typesOfArray') {
                        this.collect.props[this.childKey].defaultValue = node.value;
                    } else {
                        this.collect.props[this.childKey].value = node.value;
                    }
                }

                if (key.name === 'required') {
                    this.collect.props[this.childKey].required = node.value;
                }
            }
        }
    },

    ArrowFunctionExpression (path) {
        const parentKey = path.parentPath.parentPath.parent.key;
        if (parentKey && parentKey.name === this.childKey) {
            const body = path.node.body;
            if (t.isArrayExpression(body)) {
                // Array
                this.collect.props[this.childKey].value = body;
            } else if (t.isBlockStatement(body)) {
                // Object/Block array
                const childNodes = body.body;
                if (childNodes.length === 1 && t.isReturnStatement(childNodes[0])) {
                    this.collect.props[this.childKey].value = childNodes[0].argument;
                }
            }

            // validator
            if (path.parent.key && path.parent.key.name === 'validator') {
                path.traverse({
                    ArrayExpression (path) {
                        this.collect.props[this.childKey].validator = path.node;
                    }
                }, { collect: this.collect, childKey: this.childKey });
            }
        }
    }
};

exports.collectVueProps = function collectVueProps (path, collect) {
    const childs = path.node.value.properties;
    const parentKey = path.node.key.name; // props;
    
    if (childs.length) {
        path.traverse({
            ObjectProperty (propPath) {
                const parentNode = propPath.parentPath.parent;
                if (parentNode.key && parentNode.key.name === parentKey) {
                    const childNode = propPath.node;
                    const childKey = childNode.key.name;
                    const childVal = childNode.value;

                    if (!collect.props[childKey]) {
                        if (t.isArrayExpression(childVal)) {
                            const elements = [];
                            childVal.elements.forEach(node => {
                                elements.push(node.name.toLowerCase());
                            });
                            collect.props[childKey] = {
                                type: elements.length > 1 ? 'typesOfArray' : elements[0] ? elements[0].toLowerCase() : elements,
                                value: elements.length > 1 ? elements : elements[0] ? elements[0] : elements,
                                required: false,
                                validator: false
                            };
                        } else if (t.isObjectExpression(childVal)) {
                            collect.props[childKey] = {
                                type: '',
                                value: undefined,
                                required: false,
                                validator: false
                            };
                            path.traverse(nestedPropsVisitor, { collect, childKey });
                        } else {
                            console.log(chalk.red(`Not supports expression for the ${this.childKey} prop.`));
                        }
                    }
                }
            }
        });
    }
};

const nestedMethodsVisitor = {
    VariableDeclaration (path) {
        const declarations = path.node.declarations;
        declarations.forEach(d => {
            if (t.isMemberExpression(d.init)) {
                d.init.object = t.memberExpression(t.thisExpression(), t.identifier('state'));
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
                    if (memPath.parent) {
                        memPath.replaceWith(
                            t.memberExpression(t.thisExpression(), t.identifier('state'))
                        );
                        memPath.stop();
                    }
                }
            });
        }

        this.blocks.push(path.node);
    }
};

function createClassMethod (path, name) {
    const body = path.node.body;
    const blocks = [];
    let params = [];

    if (name === 'componentDidCatch') {
        params = [t.identifier('error'), t.identifier('info')];
    }
    path.traverse(nestedMethodsVisitor, { blocks });
    return t.classMethod('method', t.identifier(name), params, t.blockStatement(blocks));
}

exports.handleCycleMethods = function handleCycleMethods (path, collect, cycle) {
    const name = path.node.key.name;
    if (cycle[name]) {
        const method = createClassMethod(path, cycle[name]);
        collect.cycle[cycle[name]] = method;
    }
};
