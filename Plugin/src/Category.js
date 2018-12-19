import React, { Component } from 'react';

export default class Category extends Component {
    constructor(props)
    {
        super(props);
    }
    render()
    {
        return (
            <div className = 'category'>
                { this.props.category }
                <button className='deleteCategory' onClick={ (ev) => this.props.handler() }>-</button>
            </div>
        )
    }
}
