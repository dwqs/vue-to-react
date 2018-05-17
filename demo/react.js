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
