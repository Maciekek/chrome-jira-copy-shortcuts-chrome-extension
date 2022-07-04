async function getCurrentTab() {
  const queryOptions = {active: true, lastFocusedWindow: true};
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function writeToClipboard(text) {
  const input = document.createElement('textarea');
  document.body.appendChild(input);
  input.value = text;
  input.focus();
  input.select();
  document.execCommand("copy");
  input.remove();
}

const getTicketIdFromUrl = (url) => {
  if (url.includes('selectedIssue')) {
    const urlDetails = new URL(url)
    return urlDetails.searchParams.get('selectedIssue');
  }

  if (url.includes('browse')) {
    const urlDetails = new URL(url);

    return urlDetails.pathname.split('/').reverse()[0]
  }
}

const copy = (value, tab) => {
  return chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: writeToClipboard,
    args: [value],
  });
}

const getTitle = () => {
  return document.querySelector("[data-test-id='issue.views.issue-base.foundation.summary.heading']").innerText
}

const showAlert = () => {
  alert('Copy jira ticket Id works only on \'atlassian.net\' webpage.')
}

chrome.commands.onCommand.addListener((command) => {
  getCurrentTab().then(tab => {
    if (!tab.url.includes('atlassian.net')) {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: showAlert,
      });
      return;
    }

    if (command === 'copyTicketId') {
      const ticketId = getTicketIdFromUrl(tab.url)
      copy(ticketId, tab)

      return;
    }

    if (command === 'copyTicketTitle') {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: getTitle,
      }, (data) => {
        copy(data[0].result, tab)

      });
      return;
    }

    if (command === 'copyMarkdownTicketLinkWithId') {
      const ticketId = getTicketIdFromUrl(tab.url);

      copy(`[${ticketId}](${tab.url})`, tab)
    }
  })
});
