/* global chrome */
import React, { Component } from 'react';
import Bookmark from './Bookmark';
import SearchBar from './Searchbar';
import { titleTrie, categoryTrie } from './Trie';
import CategoryMenu from './CategoryMenu';

class App extends Component {
    static categoryFolderIds = {};
    constructor(props) {
        super(props);
        this.state = {
            defaultBookmarks: null,
            currentBookmarks: null,
            showPopup: false,
        };
    }

    __updateState() {
        chrome.bookmarks.getTree((bookmarks) => {
            const root = bookmarks[0];
            const elements = [];
            const categories = {};
            const lookUp = (object, folder) => {
                if ( 'children' in object) {
                    categories[object.title] = object.id;
                    object.children.forEach(child => lookUp(child, object.title));
                }
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
            App.categoryFolderIds = categories;
            this.setState( {
                defaultBookmarks: elements,
                currentBookmarks: elements,
            }, () => this.handleSearch() );
        });
    }

    static onBookmarkAdded(id, bookmark, categories){
        if (!bookmark.hasOwnProperty('url') || bookmark.url === null) return;
        alert('bookmark');
        App.getCategoryW2V(bookmark.title, categories)
            .then(res => res.json())
            .then(result => {App.moveBookmarkToNewCategory(bookmark, result.category)});
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

    addEveryTabAsBookmarkAndClose(categories)
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
                tabs.filter(el => el.title === undefined).forEach((el) => {
                    App.getCategoryW2V()
                        .then(res => res.json())
                        .then(
                            result => {addNew.push({title: el.title, url: el.url, parentId: categories[result.category]})},
                            error => App.onW2VError(error));
                });
                addNew.forEach((bookmark) => {
                    chrome.bookmarks.create(bookmark,  (res) => {});
                });
                chrome.tabs.getSelected(null, (current) =>{
                    const toRemove = [];
                    tabs.filter(t => current.id !== t.id).forEach((t) => {toRemove.push(t.id);});
                    chrome.tabs.remove(toRemove, () => {this.__updateState()});
                });
            });
        });
    }

    static onW2VError(error){
        console.log(error);
    }

    tryCreateCategoryFolders(){
        chrome.storage.sync.get('categories', data => {
            data.categories.filter(c => !(c in this.state.categoryFolderIds)).forEach(category => {
                chrome.bookmarks.create({'title': category}, res => {this.__updateState()});
            });
        });
    }

    reorganizeBookmarks(categories) {
        this.state.currentBookmarks.forEach(bookmark => {
            App.getCategoryW2V(bookmark.title, categories)
                .then(res => res.json())
                .then(
                    result => App.moveBookmarkToNewCategory(bookmark, result['prediction']),
                    error => App.onW2VError(error));
        });
        this.__updateState()
    }

    static moveBookmarkToNewCategory(bookmark, newCategory){
        //this.state.currentBookmarks[index].category = newCategory;
        chrome.bookmarks.move(bookmark.id, {parentId: App.categoryFolderIds[newCategory]});
    }

    static getCategoryW2V(query, categories){
        return fetch('http://35.205.191.219:5000/predict-category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                categories: categories,
            })
        })
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
    showCategoryList()
    {
        this.setState({
            showPopup: !this.state.showPopup
        });
    }
    onListClosed()
    {
        this.setState({
            showPopup: !this.state.showPopup
        });
        this.tryCreateCategoryFolders();
    }

    render() {
        if (this.state.defaultBookmarks)
        {
            return (
                <div >
                    { this.state.showPopup ?
                        <CategoryMenu handler = { (ev) => this.onListClosed() }/>
                        : null
                    }
                    <span className='upperContainer'>
                        <button className='floating' onClick={(e) => chrome.storage.sync.get('categories', data => {
                            this.addEveryTabAsBookmarkAndClose(data.categories) }) }>Close</button>
                        <button className='floating' onClick={(e) =>{ chrome.storage.sync.get('categories', data => {
                            this.reorganizeBookmarks(data.categories) })}}>Reorganize</button>
                        <button className='floating' onClick={(e) =>{ this.showCategoryList() }}>Categories</button>
                    </span>
                    <span className='header'>
                        <span className='container'>
                            <SearchBar placeholder = 'Category...' handler={ () => this.handleSearch() } id='categoryBar'/>
                            <SearchBar placeholder = 'Looking for...' handler={ () => this.handleSearch() } id='titleBar'/>
                        </span>
                    </span>

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
