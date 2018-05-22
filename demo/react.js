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
            time: now,
            toDolist: props.list,
            error: false
        };
    }
    static propTypes = {
        name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        shown: PropTypes.boolean,
        list: PropTypes.array,
        obj: PropTypes.object,
        level: PropTypes.oneOf([1, 2, 3]),
        size: PropTypes.oneOf(['large', 'small'])
    };
    static defaultProps = {
        count: 0,
        shown: false,
        list: [],
        obj: { test: '1111', message: 'hello' },
        size: 'small'
    };
    testMethod() {
        console.log('testMethod');
    }
    componentWillMount() {
        const prevTime = this.state.time;
        this.testMethod();
        const msg = 'this is a test msg';
        this.setState({ time: Date.now() });
        console.log('mounted', msg, this.state.time);
    }
    render() {
        const prevTime = this.state.time;
        console.log('from computed', this.props.name, prevTime);
        const text = `${this.state.title}: ${this.state.msg}`;

        if (this.state.error) {
            return <h1>some error happend</h1>;
        }

        return (
            <div>
                <p>{this.state.text}</p>
                <Todo list={this.state.toDolist} />
            </div>
        );
    }
    componentDidMount() {
        this.setState({ time: Date.now() });
        console.log('mounted', this.state.time);
    }
    componentDidUpdate() {
        this.setState({ time: Date.now() });
        console.log('updated', this.state.time);
    }
    componentWillUnmount() {
        this.setState({ time: Date.now() });
        console.log('beforeDestroy', this.state.time);
    }
    componentDidCatch(error, info) {
        this.setState({ error: true });
        this.setState({ time: Date.now() });
        console.log('errorCaptured', this.state.time);
    }
}
