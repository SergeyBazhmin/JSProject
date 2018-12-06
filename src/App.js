/* global chrome */
import React, { Component } from 'react';
import Bookmark from './Bookmark';
import SearchBar from './Searchbar';
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bookmarks: null,
        };
    }

    componentDidMount() {
        chrome.bookmarks.getTree((bookmarks) => {
            const root = bookmarks[0];
            const elements = [];
            root.children.forEach(( folder ) =>{
                folder.children.forEach(( bookmark ) => {
                    const { title, url } = bookmark;
                    elements.push({ category: 'sport', title, url });
                });
            });
            this.setState( { bookmarks: elements } );
        });
    }

    renderBookmark(key) {
        return (
            <div className = "column">
                <Bookmark key = {key} index={key} details={ this.state.bookmarks[key] } />
            </div>
        )
    }
    addEveryTabAsBookmarkAndClose(ev)
    {
        chrome.bookmarks.getTree((bookmarks) => {
            const root = bookmarks[0];
            const elements = {};
            root.children.forEach(( folder ) =>{
                folder.children.forEach(( bookmark ) => {
                    const { title } = bookmark;
                    elements[title] = true;
                });
            });
            chrome.tabs.query({}, (tabs) => {
                const addNew = [];
                tabs.forEach((el) => {
                    if (elements[el.title] === undefined)
                        addNew.push({title: el.title, url: el.url});
                });
                addNew.forEach((bookmark) => {
                    chrome.bookmarks.create(bookmark,  (res) => {});
                });
                chrome.tabs.getSelected(null, (current) =>{
                    const toRemove = [];
                    tabs.forEach((t) => {
                        if (current.id !== t.id)
                            toRemove.push(t.id);
                    });
                    chrome.tabs.remove(toRemove, () => {});
                })
            });
        });
    }

    render() {
        if (this.state.bookmarks)
        {
            return (
                <div>
                    <div className='header'>
                        <div className='container'>
                            <SearchBar />
                            <div className ='rightSide'>
                                <button id='actionButton' onClick={(e) => this.addEveryTabAsBookmarkAndClose(e)}>COOL</button>
                                <select id= 'selectCategory'>
                                    <option>lol</option>
                                    <option>kek</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        {this.state.bookmarks.map((el, idx) => this.renderBookmark((idx)))}
                    </div>
                </div>
            );
        }
        else
        {
            return (<p>Loading...</p>);
        }
    }
}
export default App;
