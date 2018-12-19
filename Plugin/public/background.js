
chrome.runtime.onInstalled.addListener(() => {
    console.log('my extension has just started');
    chrome.bookmarks.getTree((bookmarks) => {
        const root = bookmarks[0];
        console.log(root);
    });
    const defaultCategories = [
        'news',
        'sport',
        'cooking',
        'games',
        'music'
    ];
    chrome.storage.sync.set({'categories': defaultCategories}, function() {
          console.log('categories have been set to default');
    });
});

chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    //OnBookMarkAddedWrapper(id, bookmark, data.categories);
});
