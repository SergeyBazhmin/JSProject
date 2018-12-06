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
        this.setState({text: event.target.value });
    }
    render()
    {
        return (
                <input id='searchBar'
                    type="text"
                    placeholder="Looking for..."
                    value={this.state.text}
                    onChange={(ev) => this.handleChange(ev)}
                    />
        )
    }
}

export default SearchBar;
