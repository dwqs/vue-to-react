const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const babelTraverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const t = require('babel-types');
// const template = require('babel-template');
// const compiler = require('vue-template-compiler');

const { parseName } = require('./utils');
const { 
    genImports, genConstructor, genRender,
    collectVueProps, genStaticProps
} = require('./ast-helpers');
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
        // const nodeLists = path.node.body;
        // for (let i = 0; i < nodeLists.length; i++) {
        //     const node = nodeLists[i];
        //     // const childPath = path.get(`body.${i}`);
        //     if (t.isExportDefaultDeclaration(node)) {
        //         const declaration = node.declaration;
        //         console.log(t.isObjectExpression(declaration));
        //         break;
        //     }
        // }
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
