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
            time: now,
            toDolist: this.list,
            error: false
        }
    },

    computed: {
    	text () {
            const prevTime = this.time;
            this.test = 'sdas';
            console.log('from computed', this.name, prevTime);
        	return `${this.title}: ${this.msg}`;
        }
    },

    methods: {
    	testMethod () {
           console.log('testMethod', this.obj);
           return this.title;
        },

        outputTitle () {
            const title = this.testMethod();
            console.log('testMethod', title);
         }
    },

    created () {
        const prevTime = this.time;
        this.testMethod();
        const msg = 'this is a test msg';
        this.time = Date.now();
        console.log('mounted', msg, this.time);
    },

    render () {
        console.log('render');
        if (this.error) {
            return <h1>some error happend</h1>
        }

        return (
            <div>
                <p>{this.text}</p>
                <p>Total: {this.count}</p>
                <Todo list={this.toDolist}></Todo>
            </div>
        )
    },

    mounted () {
        this.time = Date.now();
        console.log('mounted', this.time)
    },

    updated () {
        this.time = Date.now();
        console.log('updated, props prop', this.shown)
    },

    beforeDestroy () {
        this.time = Date.now();
        console.log('beforeDestroy', this.time);
    },

    errorCaptured () {
        this.error = true;
        this.time = Date.now();
        console.log('errorCaptured', this.time);
    }
}