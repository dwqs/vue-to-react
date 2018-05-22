const t = require('babel-types');
const chalk = require('chalk');

const { genDefaultProps, genPropTypes } = require('./utils');

exports.genImports = function genImports (path, collect, state) {
    const nodeLists = path.node.body;
    const importReact = t.importDeclaration(
        [
            t.importDefaultSpecifier(t.identifier('React')),
            t.importSpecifier(t.identifier('Component'), t.identifier('Component'))
        ],
        t.stringLiteral('react')
    );
    if (Object.keys(state.props).length) {
        const importPropTypes = t.importDeclaration(
            [
                t.importDefaultSpecifier(t.identifier('PropTypes'))
            ],
            t.stringLiteral('prop-types')
        );
        collect.imports.push(importPropTypes);
    }
    collect.imports.push(importReact);
    collect.imports.forEach(node => nodeLists.unshift(node));
};

exports.genConstructor = function genConstructor (path, state) {
    const nodeLists = path.node.body;
    const blocks = [
        t.expressionStatement(t.callExpression(t.super(), [t.identifier('props')]))
    ];
    if (state.data['_statements']) {
        state.data['_statements'].forEach(node => {
            if (t.isReturnStatement(node)) {
                const props = node.argument.properties;
                // supports init data property with props property
                props.forEach(n => {
                    if (t.isMemberExpression(n.value)) {
                        n.value = t.memberExpression(t.identifier('props'), t.identifier(n.value.property.name));
                    }
                });

                blocks.push(
                    t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.thisExpression(), t.identifier('state')), node.argument))
                );
            } else {
                blocks.push(node);
            }
        });
    }
    const ctro = t.classMethod(
        'constructor', 
        t.identifier('constructor'), 
        [t.identifier('props')],
        t.blockStatement(blocks)
    );
    nodeLists.push(ctro);
};

exports.genStaticProps = function genStaticProps (path, state) {
    const props = state.props;
    const nodeLists = path.node.body;
    if (Object.keys(props).length) {
        nodeLists.push(genPropTypes(props));
        nodeLists.push(genDefaultProps(props));
    }
};

exports.genClassMethods = function genClassMethods (path, collect) {
    const nodeLists = path.node.body;
    const methods = collect.classMethods;
    if (Object.keys(methods).length) {
        Object.keys(methods).forEach(key => {
            nodeLists.push(methods[key]);
        });
    }
};
