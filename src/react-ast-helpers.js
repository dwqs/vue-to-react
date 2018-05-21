const t = require('babel-types');
const chalk = require('chalk');

const { genDefaultProps, genPropTypes } = require('./utils');

exports.genImports = function genImports (path, collect) {
    const nodeLists = path.node.body;
    const importReact = t.importDeclaration(
        [
            t.importDefaultSpecifier(t.identifier('React')),
            t.importSpecifier(t.identifier('Component'), t.identifier('Component'))
        ],
        t.stringLiteral('react')
    );
    if (Object.keys(collect.props).length) {
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

exports.genConstructor = function genConstructor (path, collect) {
    const nodeLists = path.node.body;
    const blocks = [
        t.expressionStatement(t.callExpression(t.super(), [t.identifier('props')]))
    ];
    if (collect.data.length) {
        collect.data.forEach(node => {
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

exports.genStaticProps = function genStaticProps (path, collect) {
    const props = collect.props;
    const nodeLists = path.node.body;
    if (Object.keys(props).length) {
        nodeLists.push(genPropTypes(props));
        nodeLists.push(genDefaultProps(props));
    }
};

exports.genClassMethods = function genClassMethods (path, collect) {
    
};

exports.genRender = function genRender (path, collect) {
    const nodeLists = path.node.body;
    if (!collect.classMethods['render']) {
        console.log(chalk.red('Must support render method in your vue component'));
        process.exit();
    }

    if (collect.classMethods['render']) {
        nodeLists.push(collect.classMethods['render']);
    }
};
