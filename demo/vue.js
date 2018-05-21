import axios from 'axions';

import 'path/to/vue.less';
// Component Tip: https://github.com/vuejs/babel-plugin-transform-vue-jsx#component-tip
import Todo from './Todo.js';

export default {
    name: 'demo-test',
    props: {
        name: [String, Number],
        count: {
            type: [String, Number],
            default: 0
        },
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