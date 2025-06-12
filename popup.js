const statusDiv = document.getElementById('status');
const copyInfoButton = document.getElementById('copyInfoBtn');
const bugfixCopyBranchButton = document.getElementById('bugfixCopyBranch');
const featureCopyBranchButton = document.getElementById('featureCopyBranch');
const technicalCopyBranchButton = document.getElementById('technicalCopyBranch');
const bugfixCopyCommitButton = document.getElementById('bugfixCopyCommit');
const featureCopyCommitButton = document.getElementById('featureCopyCommit');
const technicalCopyCommitButton = document.getElementById('technicalCopyCommit');


function displayStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.classList.toggle('error', isError);
  statusDiv.classList.toggle('success', !isError);

  // Clear status after 5 seconds for non-error messages
  if (!isError) {
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 5000);
  }
}

async function copyToClipboard(text, hidePopup = false) {
  try {
    await navigator.clipboard.writeText(text);
    displayStatus('Copied to clipboard!');
    if (hidePopup) {
      setTimeout(() => window.close(), 500);
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    displayStatus('Copy failed.', true);
  }
}

function formatJiraDetails({ ticketCode, title, url }) {
  return `[${ticketCode}](${url}) - ${processTitle(title, true)}`;
}

function formatPRDetails({ title, number, url }) {
  return `${title} ${url}`;
}

function processTitle(title, keepTechnical) {
  return title;
  const prefixesToRemove = keepTechnical ? ['Mobile', 'VN'] : ['Technical', 'Mobile', 'VN'];
  const regex = new RegExp(`\\[(${prefixesToRemove.join('|')})\\]`, 'g');
  return title.replace(regex, '').trim();
}


function formatBranchName(prefix, { ticketCode, title }) {
  const formattedTitle = processTitle(title, false)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '');
  return `${prefix}/${ticketCode}-${formattedTitle}`;
}

function formatCommitMessage(prefix, { ticketCode, title }) {
  return `[${ticketCode}][${prefix}] ${processTitle(title, false)}`;
}

async function getJiraDetails() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      displayStatus('No active tab found.', true);
      return null;
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJiraDetailsFromPage,
    });

    return result[0]?.result || null;
  } catch (error) {
    console.error('Error getting Jira details:', error);
    displayStatus('Failed to get Jira details.', true);
    return null;
  }
}

async function getPRDetails() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      displayStatus('No active tab found.', true);
      return null;
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPRDetailsFromPage,
    });

    return result[0]?.result || null;
  } catch (error) {
    console.error('Error getting PR details:', error);
    displayStatus('Failed to get PR details.', true);
    return null;
  }
}

function extractJiraDetailsFromPage() {
  const url = window.location.href;
  const baseUrl = url.split('?')[0];
  // Support both /browse/ and /issues/ URL patterns
  const ticketCodeMatch = baseUrl.match(/\/(browse|issues)\/([A-Z]+-\d+)/);
  const titleElement = document.querySelector('h1[data-testid="issue.views.issue-base.foundation.summary.heading"]');

  if (ticketCodeMatch && titleElement) {
    return {
      ticketCode: ticketCodeMatch[2], // Changed from [1] to [2] since we now capture the URL type as well
      title: titleElement.textContent.trim(),
      url: baseUrl,
    };
  }

  return null;
}

function extractPRDetailsFromPage() {
  const titleElement = document.querySelector('.js-issue-title');
  const prNumberElement = document.querySelector('.gh-header-title .f1-light');

  if (!titleElement || !prNumberElement) {
    return null;
  }

  const title = titleElement.innerText.trim();
  const prNumber = prNumberElement.innerText.replace('#', '').trim();

  return {
    title: title,
    number: prNumber,
    url: window.location.href
  };
}

async function handleCopyBranch(prefix) {
  const tabType = await getCurrentTabType();
  if(tabType == 'jira') {
    const jiraDetails = await getJiraDetails();
    if (jiraDetails) {
      await copyToClipboard(formatBranchName(prefix, jiraDetails), true);
    }
  } else {
    displayStatus('Please navigate to a Jira ticket page', true);
  }
}

async function handleCopyCommit(prefix) {
  const tabType = await getCurrentTabType();
  if(tabType == 'jira') {
    const jiraDetails = await getJiraDetails();
    if (jiraDetails) {
      await copyToClipboard(formatCommitMessage(prefix, jiraDetails), true);
    }
  } else {
    displayStatus('Please navigate to a Jira ticket page', true);
  }
}

//======================================= Event listeners =============================================


async function getCurrentTabType() {
  const tab = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab[0].url;

  // Check for Jira ticket pattern (supports both /browse/ and /issues/ URLs)
  if (url.includes('atlassian.net/browse/') || url.includes('atlassian.net/issues/')) {
    return 'jira';
  }

  // Check for GitHub PR pattern
  if (url.includes('github.com') && url.includes('/pull/')) {
    return 'github';
  }

  return 'unknown';
}

copyInfoButton.addEventListener('click', async () => {
  const tabType = await getCurrentTabType();
  if(tabType == 'jira') {
    const jiraDetails = await getJiraDetails();
    if (jiraDetails) {
      await copyToClipboard(formatJiraDetails(jiraDetails), true);
    }
  } else if (tabType == 'github') {
    const prDetails = await getPRDetails();
    if (prDetails) {
      await copyToClipboard(formatPRDetails(prDetails), true);
    }
  } else {
    displayStatus('Please navigate to a Jira ticket page, or a Github PR', true);
  }
});



bugfixCopyBranchButton.addEventListener('click', () => handleCopyBranch('bugfix'));
featureCopyBranchButton.addEventListener('click', () => handleCopyBranch('feature'));
technicalCopyBranchButton.addEventListener('click', () => handleCopyBranch('technical'));

bugfixCopyCommitButton.addEventListener('click', () => handleCopyCommit('bugfix'));
featureCopyCommitButton.addEventListener('click', () => handleCopyCommit('feature'));
technicalCopyCommitButton.addEventListener('click', () => handleCopyCommit('technical'));

