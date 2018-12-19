import React, { Component } from 'react';

export default class AddPopup extends Component {

    constructor(props){
        super(props);
        this.state = {
            text: ''
        };
    }

    handleChange(ev) {
        this.setState({
            text: ev.target.value
        });
    }

    render() {
        return (
            <div className='popup'>
                <div className='popupInner'>
                    <div className='addPopup'>
                        <input
                        className='addPopupElement'
                        type='text'
                        placeholder = 'New category...'
                        text = { this.state.text }
                        onChange = { (ev) => this.handleChange(ev) }
                         />
                        <button className='addPopupElement' onClick = { (ev) => { this.props.addHandler(this.state.text) }}>OK</button>
                    </div>
                </div>
            </div>
        );
    }
}
