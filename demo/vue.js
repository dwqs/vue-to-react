import axios from 'axions';

import 'path/to/vue.less';
// Component Tip: https://github.com/vuejs/babel-plugin-transform-vue-jsx#component-tip
import Todo from './Todo.js';

export default {
    name: 'demo-test',
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