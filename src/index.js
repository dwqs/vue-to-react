const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const babelTraverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const t = require('babel-types');
// const template = require('babel-template');
// const compiler = require('vue-template-compiler');

const { initProps, initData, initComputed } = require('./collect-state');
const { parseName, log } = require('./utils');
const { 
    genImports, genConstructor,
    genStaticProps, genClassMethods
} = require('./react-ast-helpers');
const { 
    collectVueProps, handleCycleMethods, 
    handleGeneralMethods
} = require('./vue-ast-helpers');

const output = require('./output');

const state = {
    name: undefined,
    data: {},
    props: {},
    computeds: {}
};

// Life-cycle methods relations mapping
const cycle = {
    'created': 'componentWillMount',
    'mounted': 'componentDidMount',
    'updated': 'componentDidUpdate',
    'beforeDestroy': 'componentWillUnmount',
    'errorCaptured': 'componentDidCatch',
    'render': 'render'
};

const collect = { 
    imports: [],
    classMethods: {}
};

// AST for vue component(jsx syntax)
module.exports = function transform (src, targetPath) {
    const source = fs.readFileSync(src);
    const vast = babylon.parse(source.toString(), {
        sourceType: 'module',
        plugins: ['jsx']
    });

    initProps(vast, state);
    initData(vast, state);
    initComputed(vast, state);

    babelTraverse(vast, {
        ImportDeclaration (path) {
            collect.imports.push(path.node);
        },
    
        ObjectMethod (path) {
            const name = path.node.key.name;
            if (path.parentPath.parent.key && path.parentPath.parent.key.name === 'methods') {
                handleGeneralMethods(path, collect, state, name);
            } else if (cycle[name]) {
                handleCycleMethods(path, collect, state, name, cycle[name]);
            } else {
                if (name === 'data' || state.computeds[name]) {
                    return;
                }
                log(`The ${name} method maybe be not support now`);
            }
        }
    });
    
    // AST for react component
    const tpl = `export default class ${parseName(state.name)} extends Component {}`;
    const rast = babylon.parse(tpl, {
        sourceType: 'module'
    });
    
    babelTraverse(rast, {
        Program (path) {
            genImports(path, collect, state);
        },
    
        ClassBody (path) {
            genConstructor(path, state);
            genStaticProps(path, state);
            genClassMethods(path, collect);
        }
    });
    
    const { code } = generate(rast, {
        quotes: 'single',
        retainLines: true
    });
    
    output(code, targetPath);
    log('Transform successed!!!', 'success');
};
