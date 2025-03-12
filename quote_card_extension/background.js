chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "selectText",
        title: "生成金句卡片",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "selectText") {
        chrome.storage.local.set({ selectedText: info.selectionText }, () => {
            console.log('Text stored:', info.selectionText);
        });
    }
});

function createQuoteCard(selectedText) {
    // 这里将实现生成金句卡片的逻辑
    console.log("生成金句卡片: ", selectedText);
} 