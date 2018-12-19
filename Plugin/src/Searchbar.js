/* global chrome */
import React, { Component } from 'react';

class SearchBar extends Component
{
    constructor(props){
        super(props);
        this.state = {
            text: ''
        };
    }
    handleChange(event)
    {
        this.props.handler(event.target.value);
        this.setState({text: event.target.value });
    }
    render()
    {
        return (
                <input className='searchBar'
                    id = {this.props.id}
                    type="text"
                    placeholder={this.props.placeholder}
                    value={this.state.text}
                    onChange={(ev) => this.handleChange(ev)}
                    />
        )
    }
}

export default SearchBar;
