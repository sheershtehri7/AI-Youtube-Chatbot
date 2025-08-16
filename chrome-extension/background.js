// Background script for AI YouTube Chatbot extension

console.log('AI YouTube Chatbot background script loaded');

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AI YouTube Chatbot extension installed successfully!');
    chrome.storage.local.set({
      isEnabled: true,
      autoProcess: false,
      theme: 'light'
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked, tab URL:', tab.url);
  
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    try {
      // First inject the content script if it's not already injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Small delay to ensure content script is ready
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_CHAT' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Message sending failed:', chrome.runtime.lastError.message);
          } else {
            console.log('Message sent successfully:', response);
          }
        });
      }, 100);
    } catch (error) {
      console.error('Failed to inject content script:', error);
    }
  } else {
    // Show notification that we're not on a YouTube video page
    chrome.action.setBadgeText({ text: '!', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }, 3000);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.type === 'GET_CURRENT_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ tab: tabs[0] });
      } else {
        sendResponse({ error: 'No active tab found' });
      }
    });
    return true;
  }

  if (message.type === 'PROCESS_VIDEO') {
    processVideo(message.videoId, sendResponse);
    return true;
  }

  if (message.type === 'ASK_QUESTION') {
    askQuestion(message.question, sendResponse);
    return true;
  }

  if (message.type === 'TOGGLE_SIDEBAR') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_CHAT' });
      }
    });
    sendResponse({ success: true });
  }
});

// Function to process video
async function processVideo(videoId, sendResponse) {
  try {
    console.log('Processing video:', videoId);
    const response = await fetch('http://localhost:8000/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_id: videoId })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Video processed successfully:', result);
      sendResponse({ success: true, message: 'Video processed successfully' });
    } else {
      const error = await response.json();
      console.error('Failed to process video:', error);
      sendResponse({ success: false, error: error.detail || 'Failed to process video' });
    }
  } catch (error) {
    console.error('Network error:', error);
    sendResponse({ success: false, error: 'Network error: ' + error.message });
  }
}

// Function to ask question
async function askQuestion(question, sendResponse) {
  try {
    console.log('Asking question:', question);
    const response = await fetch('http://localhost:8000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: question })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Got answer:', result);
      sendResponse({ success: true, answer: result.answer });
    } else {
      const error = await response.json();
      console.error('Failed to get answer:', error);
      sendResponse({ success: false, error: error.detail || 'Failed to get answer' });
    }
  } catch (error) {
    console.error('Network error:', error);
    sendResponse({ success: false, error: 'Network error: ' + error.message });
  }
}

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
    // Inject content script when YouTube video page loads
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch((error) => {
      console.log('Content script injection failed:', error);
    });
  }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.isEnabled) {
      console.log('Extension enabled state changed:', changes.isEnabled.newValue);
    }
    if (changes.theme) {
      console.log('Theme changed:', changes.theme.newValue);
    }
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('AI YouTube Chatbot extension started');
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log('Extension update available');
  chrome.runtime.reload();
});