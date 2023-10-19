console.log("Popup script loaded.");

let alreadyInjected = false;

const colors = [
  "#40a6ff",
  "#6A9955",
  "#CE9178",
  "#B5CEA8",
  "#569CD6",
  "#DCDCAA",
  "#9CDCFE",
  "#4EC9B0",
  "#C586C0",
];

function getOriginFromUrl(url) {
  const urlObj = new URL(url);
  return urlObj.origin;
}

// Add event listener for when the popup is shown
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Popup shown.");

  let [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!alreadyInjected) {
    chrome.scripting.executeScript(
      {
        target: { tabId: currentTab.id },
        files: ["content.js"],
      },
      function (results) {
        alreadyInjected = true;
        console.log("Content script injected.");
      }
    );
    chrome.runtime.sendMessage({ sidePanelOpen: true });

    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      // Log messages here
      if (Array.isArray(request.messages)) {
        const origins = [];
        const div = document.getElementById("messages");
        div.textContent = "";

        request.messages.reverse().forEach((m) => {
          const arr = m.split("|");

          const source = arr[0].split(",");

          let o1 = getOriginFromUrl(source[1]);
          let o2 = getOriginFromUrl(arr[2]);
          if (o1 == o2) {
            // Same origin, using url instead
            o1 = source[1];
            o2 = arr[2];
          }
          if (!origins.includes(o1)) {
            origins.push(o1);
          }
          if (!origins.includes(o2)) {
            origins.push(o2);
          }

          const msgDiv = document.createElement("div");
          msgDiv.classList.add("message");

          const timeSpan = document.createElement("span");
          timeSpan.classList.add("time-span");

          timeSpan.textContent = `[${new Date(
            parseInt(arr[3])
          ).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            fractionalSecondDigits: 3,
            hour12: false,
          })}]`;

          const flowDiv = document.createElement("div");
          flowDiv.classList.add("msg-flow");
          const sourceSpan = document.createElement("span");
          sourceSpan.classList.add("bold");
          sourceSpan.style.color = colors[origins.indexOf(o1) % colors.length];
          sourceSpan.textContent = source[1];
          if (source[0] === "origin") {
            const b = document.createElement("b");
            b.classList.add("origin-hint");
            b.textContent = " (Origin)";
            sourceSpan.appendChild(b);
          }
          flowDiv.appendChild(sourceSpan);
          const arrow = document.createElement("span");
          arrow.classList.add("arrow");
          arrow.innerHTML = "&#10509;";

          const targetSpan = document.createElement("span");
          targetSpan.classList.add("bold");
          targetSpan.style.color = colors[origins.indexOf(o2) % colors.length];
          targetSpan.textContent = arr[2];

          flowDiv.append(arrow, targetSpan, document.createElement("br"));
          msgDiv.append(timeSpan, flowDiv, document.createElement("br"));

          const hr1 = document.createElement("hr");
          hr1.classList.add("dashed");

          const contentDiv = document.createElement("div");
          contentDiv.classList.add("msg-content");
          contentDiv.textContent = arr[1];

          div.append(msgDiv, hr1, contentDiv, document.createElement("hr"));
        });
      }
    });
  }
});
