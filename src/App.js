/* global chrome */
import React, { Component } from 'react';
import Bookmark from './Bookmark';
import SearchBar from './Searchbar';
import { trie } from './Trie';
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            defaultBookmarks: null,
            currentBookmarks: null,
        };
    }

    __updateState() {
        chrome.bookmarks.getTree((bookmarks) => {
            const root = bookmarks[0];
            const elements = [];
            const lookUp = (object, folder) => {
                if ( 'children' in object)
                    object.children.forEach(child => lookUp(child, object.title));
                else
                {
                    elements.push({
                        category: folder,
                        title: object.title,
                        url: object.url,
                        id: object.id
                    });
                    trie.addWord(object.title, object.id);
                }
            };
            lookUp(root, null);
            this.setState( {
                defaultBookmarks: elements,
                currentBookmarks: elements
             } );
        });
    }

    componentDidMount() {
        this.__updateState();
    }

    renderBookmark(key) {
        return (
            <div className = "column">
                <Bookmark key = {key} index={key} details={ this.state.currentBookmarks[key] } />
            </div>
        )
    }

    addEveryTabAsBookmarkAndClose(ev)
    {
        chrome.bookmarks.getTree((bookmarks) => {
            const root = bookmarks[0];
            const elements = {};
            const lookUp = (object) => {
                if ( 'children' in object)
                    object.children.forEach(child => lookUp(child, object.title));
                else
                    elements[object.title] = true;
            };
            lookUp(root);
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
                });
                this.__updateState();
            });
        });
    }

    handleSearch(searchValue)
    {
        if (searchValue === '')
        {
            this.setState({
                currentBookmarks: this.state.defaultBookmarks
            });
        }
        else
        {
            const indices = trie.getAllWithPrefix(searchValue).reduce((acc, cur) => {
                acc[cur] = cur;
                return acc;
            }, {});
            const samples = [];
            for (let bookmark of this.state.defaultBookmarks)
            {
                if (indices[bookmark.id] !== undefined)
                    samples.push(bookmark);
            }
            this.setState({
                currentBookmarks: samples
            });
        }
    }

    render() {
        if (this.state.defaultBookmarks)
        {
            return (
                <div>
                    <div className='header'>
                        <div className='container'>
                            <SearchBar handler={ (value) => this.handleSearch(value) }/>
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
                        {this.state.currentBookmarks.map((el, idx) => this.renderBookmark(idx))}
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
