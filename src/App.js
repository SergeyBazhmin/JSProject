/* global chrome */
import React, { Component } from 'react';
import Bookmark from './Bookmark';
import SearchBar from './Searchbar';
import { titleTrie, categoryTrie } from './Trie';
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
                    titleTrie.addWord(object.title.toLowerCase(), object.id);
                    categoryTrie.addWord(folder.toLowerCase(), object.id);
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


    __getAllWithPrefix(trie, prefix)
    {
        if (prefix === '')
            return this.state.defaultBookmarks.reduce((obj, val) => {
                obj[val.id] = val.id;
                return obj;
            },{});
        else
        {
            const indices = trie.getAllWithPrefix(prefix).reduce((acc, cur) => {
                acc[cur] = cur;
                return acc;
            }, {});
            const samples = this.state.defaultBookmarks
                                            .filter(obj => obj.id in indices)
                                            .reduce((obj, bookmark) => {
                                                obj[bookmark.id] = bookmark.id;
                                                return obj;
                                            }, {});
            return samples;
        }
    }

    __handleCategories()
    {
        const categoryValue = document.getElementById('categoryBar').value.toLowerCase();
        return this.__getAllWithPrefix(categoryTrie, categoryValue);
    }
    __handleTitles()
    {
        const titleValue = document.getElementById('titleBar').value.toLowerCase();
        return this.__getAllWithPrefix(titleTrie, titleValue);
    }
    handleSearch()
    {
        const categoryIndices = this.__handleCategories();
        const titleIndices = this.__handleTitles();
        const intersection = Object.keys(categoryIndices)
                                        .filter(key => key in titleIndices)
                                        .reduce((obj, id) =>{
                                            obj[id] = id;
                                            return obj;
                                        }, {});
        const currentBookmarks = this.state.defaultBookmarks.filter(bookmark => bookmark.id in intersection);
        this.setState({
            currentBookmarks: currentBookmarks
        });
    }

    render() {
        if (this.state.defaultBookmarks)
        {
            return (
                <div>
                    <div className='header'>
                        <div className='container'>
                            <SearchBar placeholder = 'Category...' handler={ () => this.handleSearch() } id='categoryBar'/>
                            <SearchBar placeholder = 'Looking for...' handler={ () => this.handleSearch() } id='titleBar'/>
                            <div className ='rightSide'>
                                <button id='actionButton' onClick={(e) => this.addEveryTabAsBookmarkAndClose(e)}>Close</button>
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
