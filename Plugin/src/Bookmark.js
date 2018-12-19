/* global chrome */
import React, { Component } from 'react';

class Bookmark extends Component {
    constructor(props) {
        super(props);
    }

    openBookmark(e, url) {
        chrome.tabs.create({ url: url, active: false }, (tab) => {});
    }

    render() {
        const details = this.props.details;
        const threshold = 30;
        return (
            <article className="bookmark" onClick={(ev) => this.openBookmark(ev, details.url)}>
                <h3 className="bookmarkCategory">{ details.category }</h3>
                <h2 className="bookmarkTitle">{ details.title.length > threshold ? `${details.title.substring(0, threshold)}...` : details.title }</h2>
            </article>
        );
    }
}

export default Bookmark;
