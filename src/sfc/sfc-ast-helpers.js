const t = require('babel-types');

exports.getNextJSXElment = function getNextJSXElment (path) {
    let nextElement = null;
    for (let i = path.key + 1; ; i++) {
        const nextPath = path.getSibling(i);
        if (!nextPath.node) {
            break;
        } else if (t.isJSXElement(nextPath.node)) {
            nextElement = nextPath.node;
            nextPath.traverse({
                JSXAttribute (p) {
                    if (p.node.name.name === 'v-else') {
                        p.remove();
                    }
                }
            });
            nextPath.remove();
            break;
        }
    }

    return nextElement;
};

exports.genSFCRenderMethod = function genSFCRenderMethod (path, state, argument) {
    // computed props
    const computedProps = Object.keys(state.computeds);
    let blocks = [];
    
    if (computedProps.length) {
        computedProps.forEach(prop => {
            const v = state.computeds[prop];
            blocks = blocks.concat(v['_statements']);
        });
    }
    blocks = blocks.concat(t.returnStatement(argument));

    const render = t.classMethod(
        'method',
        t.identifier('render'),
        [],
        t.blockStatement(blocks)
    );

    path.node.body.push(render);
};
