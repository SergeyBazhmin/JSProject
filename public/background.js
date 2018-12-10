
chrome.runtime.onInstalled.addListener(() => {
    console.log('my extension has just started');
    chrome.bookmarks.getTree((bookmarks) => {
        const root = bookmarks[0];
        console.log(root);
    });
});
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    console.log(`created a bookmark ${id}`);
});
