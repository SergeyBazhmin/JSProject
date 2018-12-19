/* global chrome */
import React, { Component } from 'react';
import Category from './Category';
import AddPopup from './AddPopup';

export default class CategoryMenu extends Component {
    constructor(props)
    {
        super(props);
        this.state = {
            categories: null,
            showInput: false,
        };
    }

    componentDidMount()
    {
        chrome.storage.sync.get(['categories'], (result) =>{
            this.setState({
                categories: result.categories
            })
        });
    }
    componentWillUnmount()
    {
        chrome.storage.sync.set({ 'categories': this.state.categories },() => {});
    }

    deleteCategory(name) {
        const newCategories = this.state.categories.filter(cat => cat !== name);
        this.setState({
            categories: newCategories
        });
    }

    addCategory(name) {
        if (name === '')
            return;
        this.setState({
            showInput: !this.state.showInput,
            categories: [...this.state.categories, name]
        });
    }
    showInputField() {
        this.setState({
            showInput: !this.state.showInput
        });
    }

    render()
    {
        return (
            <div className = 'popup'>
                <div className = 'popupInner'>
                    { this.state.showInput ? <AddPopup addHandler = { (name) => this.addCategory(name) } />: null}
                    <div className='title'>
                        <h3>My categories</h3>
                    </div>
                    <button className='floating' onClick = { (ev) => { this.showInputField() } }>Add</button>
                    <button className = 'floating' onClick = { (ev) => this.props.handler() }>Close</button>
                    { this.state.categories ?
                        <div className='categoryList'>
                            { this.state.categories.map((el, idx) => <Category key = {idx} category = {el} handler = { () => this.deleteCategory(el) }/>) }
                        </div>
                        : <p>Empty list...</p> }
                    </div>
            </div>
        )
    }
}
