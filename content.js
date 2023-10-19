if (self.isLoadContentScript !== true) {
  self.isLoadContentScript = true;

  // Send message to sw.js to clear cache
  chrome.runtime.sendMessage({
    type: "refresh",
  });
}
