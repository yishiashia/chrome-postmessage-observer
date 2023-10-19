const messages = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Log messages here
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTabId = String(tabs[0].id);
    if (messages[currentTabId] === undefined) {
      messages[currentTabId] = [];
    }

    if (
      sender.url.startsWith("chrome-extension://") &&
      sender.url.endsWith("popup.html")
    ) {
      // From popup.html
      if (request.sidePanelOpen === true) {
        // send messages to popup.html
        chrome.runtime.sendMessage({ messages: messages[currentTabId] });
      }
    } else {
      // From main page and iframes
      if (request.type == "refresh") {
        messages[currentTabId].splice(0, messages[currentTabId].length);
        chrome.runtime.sendMessage({ messages: messages[currentTabId] });
      } else if (request.type == "message") {
        // save into array
        messages[currentTabId].push(
          `${
            request.source.url === undefined
              ? "origin," + request.source.origin
              : "url," + request.source.url
          }|${
            typeof request.message === "string"
              ? request.message
              : JSON.stringify(request.message)
          }|${request.target.url}|${Date.now()}`
        );

        // sendMessage to popup.html
        chrome.runtime.sendMessage({ messages: messages[currentTabId] });
      }
    }
  });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  const tabId = activeInfo.tabId;
  if (messages[tabId] === undefined) {
    messages[tabId] = [];
  }
  chrome.runtime.sendMessage({ messages: messages[tabId] });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url?.startsWith("chrome://")) return undefined;

  chrome.scripting.executeScript({
    target: { tabId: tabId, allFrames: true },
    files: ["intercept.js"],
  });
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
