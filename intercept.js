if (self.displayName === undefined) {
  self.displayName = window.crypto.randomUUID();

  self.addEventListener("message", (event) => {
    const source = { uuid: undefined, url: undefined, origin: undefined };
    try {
      source.origin = event.origin;
      source.uuid = event.source.displayName;
      source.url = event.source.location.href;
    } catch (err) {
      console.log(err);
    }
    chrome.runtime.sendMessage({
      type: "message",
      message: event.data,
      source: source,
      target: {
        uuid: event.target.displayName,
        url: event.target.location.href,
      },
    });
  });
}
