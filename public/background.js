
chrome.runtime.onInstalled.addListener(() => {
    console.log('my extension has just started');
});
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    console.log(`created a bookmark ${id}`);
});
