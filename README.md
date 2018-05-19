[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## vue-to-react
🛠️ 👉 Try to transform Vue component([jsx syntax](https://github.com/vuejs/babel-plugin-transform-vue-jsx)) to React component.
>It is under developing, so it's not stable now. The 1st stable version will come soon and be released v1.0.0.

## Check the demo
```
git clone git@github.com:dwqs/vue-to-react.git

cd vue-to-react && npm i

node src/index.js
```

#### Input
```js
// demo/vue.js
import axios from 'axions';

import 'path/to/vue.less';
// Component Tip: https://github.com/vuejs/babel-plugin-transform-vue-jsx#component-tip
import Todo from './Todo.js';

export default {
    name: 'demo-test',
    props: {
        name: [String, Number],
        shown: {
            type: Boolean,
            default: false
        },
        list: {
            type: Array,
            default: () => []
        },
        obj: {
            type: Object,
            default: () => {
                return {
                	test: '1111',
                    message: 'hello'
                }
            }
        },
        level: {
            type: Number,
            required: true,
            validator: (val) => [1, 2, 3].indexOf(val) > -1
        },
        size: {
            type: String,
            default: 'small',
          	validator: (val) => ['large', 'small'].indexOf(val) > -1
        }
    },
    data () {
        const now = Date.now();
        return {
            title: 'vue to react',
            msg: 'Hello world',
            time: now
        }
    },

    render () {
        return (
            <div>
                <p>{this.title}</p>
                <p>{this.msg}</p>
                <Todo></Todo>
            </div>
        )
    }
}
```

#### Output
```js
// demo/react.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Component Tip: https://github.com/vuejs/babel-plugin-transform-vue-jsx#component-tip
import Todo from './Todo.js';
import 'path/to/vue.less';
import axios from 'axions';

export default class DemoTest extends Component {
    constructor(props) {
        super(props);

        const now = Date.now();
        this.state = {
            title: 'vue to react',
            msg: 'Hello world',
            time: now
        };
    }
    static propTypes = {
        name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        shown: PropTypes.boolean,
        list: PropTypes.array,
        obj: PropTypes.object,
        level: PropTypes.oneOf([1, 2, 3]),
        size: PropTypes.oneOf(['large', 'small'])
    };
    static defaultProps = {
        shown: false,
        list: [],
        obj: { test: '1111', message: 'hello' },
        size: 'small'
    };

    render() {
        return (
            <div>
                <p>{this.state.title}</p>
                <p>{this.state.msg}</p>
                <Todo />
            </div>
        );
    }
}
```

## LICENSE
MIT