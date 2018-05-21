const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const babelTraverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const t = require('babel-types');
const chalk = require('chalk');
// const template = require('babel-template');
// const compiler = require('vue-template-compiler');

const { parseName } = require('./utils');
const { 
    genImports, genConstructor, genRender,
    genStaticProps
} = require('./react-ast-helpers');
const { 
    collectVueProps
} = require('./vue-ast-helpers');

const output = require('./output');

let componentName = '';

// AST for vue component(jsx syntax)
const source = fs.readFileSync(path.resolve(__dirname, '../demo/vue.js'));
const vast = babylon.parse(source.toString(), {
    sourceType: 'module',
    plugins: ['jsx']
});

const collect = { 
    imports: [],
    data: [],
    classMethods: {},
    props: {},
    computeds: {},
    cycle: {}
};

babelTraverse(vast, {
    Program (path) {
        const nodeLists = path.node.body;
        let count = 0;

        for (let i = 0; i < nodeLists.length; i++) {
            const node = nodeLists[i];
            // const childPath = path.get(`body.${i}`);
            if (t.isExportDefaultDeclaration(node)) {
                count++;
            }
        }

        if (count > 1 || !count) {
            const msg = !count ? 'Must hava one' : 'Only one';
            console.log(chalk.red(`${msg} export default declaration in youe vue component file`));
            process.exit();
        }
    },

    ImportDeclaration (path) {
        collect.imports.push(path.node);
    },

    ObjectProperty (path) {
        const name = path.node.key.name;
        if (name === 'name' && t.isStringLiteral(path.node.value)) {
            componentName = path.node.value.value;
        }

        if (name === 'props') {
            collectVueProps(path, collect);
        }
    },

    ObjectMethod (path) {
        if (path.node.key.name === 'data') {
            const body = path.node.body;
            collect.data = [].concat(body.body);
        }

        if (path.node.key.name === 'render') {
            if (path.node.params.length) {
                console.log(chalk.red(`
                    [vue-to-react]: Maybe you will call $createElement or h method in your render, but react does not support it.
                    And it's maybe cause some unknown error in transforming
                `));
            }
            path.traverse({
                ThisExpression (memPath) {
                    memPath.replaceWith(
                        t.memberExpression(t.thisExpression(), t.identifier('state'))
                    );
                    memPath.stop();
                }
            });
            collect.classMethods[path.node.key.name] = path.node;
        }
    }
});

// AST for react component
const tpl = `export default class ${parseName(componentName)} extends Component {}`;
const rast = babylon.parse(tpl, {
    sourceType: 'module'
});

babelTraverse(rast, {
    Program (path) {
        genImports(path, collect);
    },

    ClassBody (path) {
        genConstructor(path, collect);
        genStaticProps(path, collect);
        genRender(path, collect);
    }
});

const { code } = generate(rast, {
    quotes: 'single',
    retainLines: true
});

output(code);
