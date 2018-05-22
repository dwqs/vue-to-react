const t = require('babel-types');
const chalk = require('chalk');

exports.parseName = function parseName (name) {
    name = name || 'my-react-compoennt';
    const val = name.toLowerCase().split('-');
    let str = '';
    val.forEach(v => {
        v = v[0].toUpperCase() + v.substr(1);
        str += v;
    });
    return str;
};

exports.log = function log (msg, type = 'error') {
    if (type === 'error') {
        return console.log(chalk.red(`[vue-to-react]: ${msg}`));
    }
    console.log(chalk.green(msg));
};

exports.getIdentifier = function getIdentifier (state, key) {
    return state.data[key] ? t.identifier('state') : t.identifier('props');
};

exports.genPropTypes = function genPropTypes (props) {
    const properties = [];
    const keys = Object.keys(props);

    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        const obj = props[key];
        const identifier = t.identifier(key);

        let val = t.memberExpression(t.identifier('PropTypes'), t.identifier('any'));
        if (obj.type === 'typesOfArray' || obj.type === 'array') {
            if (obj.type === 'typesOfArray') {
                const elements = [];
                obj.value.forEach(val => {
                    elements.push(t.memberExpression(t.identifier('PropTypes'), t.identifier(val)));
                });
                val = t.callExpression(
                    t.memberExpression(t.identifier('PropTypes'), t.identifier('oneOfType')),
                    [t.arrayExpression(elements)]
                );
            } else {
                val = obj.required 
                    ? t.memberExpression(t.identifier('PropTypes'), t.identifier('array'), t.identifier('isRequired'))
                    : t.memberExpression(t.identifier('PropTypes'), t.identifier('array'));
            }
        } else if (obj.validator) {
            val = t.callExpression(
                t.memberExpression(t.identifier('PropTypes'), t.identifier('oneOf')),
                [t.arrayExpression(obj.validator.elements)]
            );
        } else {
            val = obj.required 
                ? t.memberExpression(t.identifier('PropTypes'), t.identifier(obj.type), t.identifier('isRequired'))
                : t.memberExpression(t.identifier('PropTypes'), t.identifier(obj.type));
        }

        properties.push(t.objectProperty(identifier, val));
    }

    // Babel does't support to create static class property???
    return t.classProperty(t.identifier('static propTypes'), t.objectExpression(properties), null, []);
};

exports.genDefaultProps = function genDefaultProps (props) {
    const properties = [];
    const keys = Object.keys(props).filter(key => typeof props[key].value !== 'undefined');

    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        const obj = props[key];
        const identifier = t.identifier(key);

        let val = t.stringLiteral('error');
        if (obj.type === 'typesOfArray') {
            const type = typeof obj.defaultValue;
            if (type !== 'undefined') {
                const v = obj.defaultValue;
                val = type === 'number' ? t.numericLiteral(Number(v)) : type === 'string' ? t.stringLiteral(v) : t.booleanLiteral(v);
            } else {
                continue;
            }
        } else if (obj.type === 'array') {
            val = t.arrayExpression(obj.value.elements);
        } else if (obj.type === 'object') {
            val = t.objectExpression(obj.value.properties);
        } else {
            switch (obj.type) {
                case 'string':
                    val = t.stringLiteral(obj.value);
                    break;
                case 'boolean':
                    val = t.booleanLiteral(obj.value);
                    break;
                case 'number':
                    val = t.numericLiteral(Number(obj.value));
                    break;
            }
        }

        properties.push(t.objectProperty(identifier, val));
    }

    // Babel does't support to create static class property???
    return t.classProperty(t.identifier('static defaultProps'), t.objectExpression(properties), null, []);
};
