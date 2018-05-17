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
export default {
    name: 'demo-test',
    data () {
        return {
            title: 'vue to react',
            msg: 'Hello world'
        }
    },

    render () {
        return (
            <div>
                <p>{this.title}</p>
                <p>{this.msg}</p>
            </div>
        )
    }
}
```

#### Output
```js
import React, { Component } from 'react';

export default class DemoTest extends Component {
    constructor (props) {
        super(props);
        this.state = {
            title: 'vue to react', msg: 'Hello world' 
        };
    }

    render () {
        return (
            <div>
                <p>{this.state.title}</p>
                <p>{this.state.msg}</p>
            </div>
        );
    }
}
```

## LICENSE
MIT