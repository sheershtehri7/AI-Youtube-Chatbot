let isProcessing = false;
let retryCount = 0;
const maxRetries = 3;
let lastSidebarHeight = null; // Store height before minimizing

// Content script for AI YouTube Chatbot
console.log('AI YouTube Chatbot content script loaded');

// Prevent multiple injections
if (window.aiChatbotInjected) {
  console.log('Content script already injected, skipping...');
} else {
  window.aiChatbotInjected = true;

  let sidebar = null;
  let isActive = false;
  let isProcessed = false;
  let isDragging = false;
  let isResizing = false;
  let isMinimized = false; // Track minimize state
  let dragOffset = { x: 0, y: 0 };
  let startSize = { width: 0, height: 0 };
  let startPos = { x: 0, y: 0 };

  // Default sidebar properties
  let sidebarProps = {
    width: Math.min(400, window.innerWidth * 0.25),
    height: window.innerHeight * 0.8,
    x: window.innerWidth - Math.min(400, window.innerWidth * 0.25) - 20,
    y: (window.innerHeight - window.innerHeight * 0.8) / 2,
    minWidth: 320,
    minHeight: 400
  };

  // Check if we're on a YouTube video page
  function isYouTubeVideoPage() {
    return window.location.href.includes('youtube.com/watch');
  }

  // Extract video ID from URL
  function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : null;
  }

  // Get current video title
  function getVideoTitle() {
    const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer') || 
                        document.querySelector('h1.title') ||
                        document.querySelector('.ytd-video-primary-info-renderer h1');
    return titleElement ? titleElement.textContent.trim() : 'YouTube Video';
  }

  // Update sidebar position and size
  function updateSidebarTransform() {
    if (!sidebar) return;
    
    // Ensure sidebar stays within viewport
    const maxX = window.innerWidth - sidebarProps.width;
    const maxY = window.innerHeight - sidebarProps.height;
    
    sidebarProps.x = Math.max(0, Math.min(maxX, sidebarProps.x));
    sidebarProps.y = Math.max(0, Math.min(maxY, sidebarProps.y));
    
    sidebar.style.width = sidebarProps.width + 'px';
    sidebar.style.height = sidebarProps.height + 'px';
    sidebar.style.left = sidebarProps.x + 'px';
    sidebar.style.top = sidebarProps.y + 'px';
  }

  // Handle window resize
  function handleWindowResize() {
    if (sidebar && isActive) {
      updateSidebarTransform();
    }
  }

  // Create and show sidebar
  function createSidebar() {
    if (sidebar) {
      sidebar.remove();
      sidebar = null;
    }

    if (!isYouTubeVideoPage()) return;

    sidebar = document.createElement('div');
    sidebar.id = 'ai-chatbot-sidebar';
    sidebar.style.cssText = `
      position: fixed;
      width: ${sidebarProps.width}px;
      height: ${sidebarProps.height}px;
      left: ${sidebarProps.x}px;
      top: ${sidebarProps.y}px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      z-index: 999999;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      backdrop-filter: blur(10px);
      user-select: none;
    `;

    // Header with drag handle
    const header = document.createElement('div');
    header.id = 'ai-header';
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: move;
      user-select: none;
      border-radius: 10px 10px 0 0;
      position: relative;
    `;
    header.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 28px; height: 28px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">AI Assistant</h3>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="ai-minimize-btn" style="background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 14px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" title="Minimize">
            −
          </button>
          <button id="ai-close-btn" style="background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 16px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" title="Close">
            ×
          </button>
        </div>
      </div>
    `;

    // Video info section
    const videoInfo = document.createElement('div');
    videoInfo.id = 'ai-video-info';
    videoInfo.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      background: white;
      flex-shrink: 0;
    `;

    const videoTitle = getVideoTitle();
    videoInfo.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <div style="flex: 1; min-width: 0;">
          <h4 style="margin: 0; font-size: 13px; font-weight: 600; color: #1e293b; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${videoTitle}</h4>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Ready for AI chat</p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b;">
        <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></div>
        <span>Video detected</span>
      </div>
    `;

    // Main content area
    const mainContent = document.createElement('div');
    mainContent.id = 'ai-main-content';
    mainContent.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      overflow: hidden;
      min-height: 0;
    `;

    // Resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.id = 'ai-resize-handle';
    resizeHandle.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #94a3b8, #64748b);
      cursor: se-resize;
      border-radius: 10px 0 10px 0;
      z-index: 1000000;
    `;
    resizeHandle.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="position: absolute; bottom: 4px; right: 4px;">
        <path d="M9 9l6 6M15 9l6 6"/>
      </svg>
    `;

    sidebar.appendChild(header);
    sidebar.appendChild(videoInfo);
    sidebar.appendChild(mainContent);
    sidebar.appendChild(resizeHandle);
    document.body.appendChild(sidebar);

    // Animate in
    setTimeout(() => {
      sidebar.style.opacity = '1';
    }, 100);

    setupDragAndResize();
    setupButtons();
    isActive = true;
    isMinimized = false; // Reset minimize state
    showInitialState();
  }

  // Setup drag and resize functionality
  function setupDragAndResize() {
    const header = document.getElementById('ai-header');
    const resizeHandle = document.getElementById('ai-resize-handle');

    // Drag functionality
    header.addEventListener('mousedown', startDrag);
    
    // Resize functionality
    resizeHandle.addEventListener('mousedown', startResize);

    // Global mouse events
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragResize);
  }

  function startDrag(e) {
    if (e.target.closest('button')) return; // Don't drag when clicking buttons
    
    isDragging = true;
    dragOffset.x = e.clientX - sidebarProps.x;
    dragOffset.y = e.clientY - sidebarProps.y;
    sidebar.style.transition = 'none';
    e.preventDefault();
  }

  function startResize(e) {
    isResizing = true;
    startSize.width = sidebarProps.width;
    startSize.height = sidebarProps.height;
    startPos.x = e.clientX;
    startPos.y = e.clientY;
    sidebar.style.transition = 'none';
    e.preventDefault();
    e.stopPropagation();
  }

  function handleMouseMove(e) {
    if (isDragging) {
      sidebarProps.x = e.clientX - dragOffset.x;
      sidebarProps.y = e.clientY - dragOffset.y;
      updateSidebarTransform();
    } else if (isResizing) {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      
      sidebarProps.width = Math.max(sidebarProps.minWidth, startSize.width + deltaX);
      sidebarProps.height = Math.max(sidebarProps.minHeight, startSize.height + deltaY);
      
      updateSidebarTransform();
    }
  }

  function stopDragResize() {
    if (isDragging || isResizing) {
      sidebar.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    isDragging = false;
    isResizing = false;
  }

  // Setup header buttons
  function setupButtons() {
    const closeBtn = document.getElementById('ai-close-btn');
    const minimizeBtn = document.getElementById('ai-minimize-btn');

    if (closeBtn) {
      closeBtn.addEventListener('mouseover', () => {
        closeBtn.style.background = 'rgba(239, 68, 68, 0.8)';
      });
      closeBtn.addEventListener('mouseout', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      });
      closeBtn.addEventListener('click', closeSidebar);
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener('mouseover', () => {
        minimizeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
      });
      minimizeBtn.addEventListener('mouseout', () => {
        minimizeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      });
      minimizeBtn.addEventListener('click', toggleMinimize);
    }
  }

  // Toggle minimize
  function toggleMinimize() {
    const mainContent = document.getElementById('ai-main-content');
    const videoInfo = document.getElementById('ai-video-info');
    const minimizeBtn = document.getElementById('ai-minimize-btn');
    
    if (!mainContent || !videoInfo || !minimizeBtn) {
      console.error('Error in toggleMinimize: Missing DOM elements');
      return;
    }

    isMinimized = !isMinimized;
    
    if (isMinimized) {
      lastSidebarHeight = sidebarProps.height; // Store current height
      mainContent.style.display = 'none';
      videoInfo.style.display = 'none';
      sidebarProps.height = 60; // Just header height
      minimizeBtn.innerHTML = '+';
      minimizeBtn.title = 'Restore';
    } else {
      mainContent.style.display = 'flex';
      videoInfo.style.display = 'block';
      sidebarProps.height = lastSidebarHeight || sidebarProps.minHeight;
      minimizeBtn.innerHTML = '−';
      minimizeBtn.title = 'Minimize';
    }
    
    updateSidebarTransform();
  }

  // Close sidebar
  function closeSidebar() {
    if (sidebar) {
      sidebar.style.opacity = '0';
      sidebar.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (sidebar) {
          sidebar.remove();
          sidebar = null;
        }
      }, 300);
    }
    isActive = false;
    isMinimized = false; // Reset minimize state
    isProcessed = false; // Reset processed state
  }

  // Show initial state (before processing)
  function showInitialState() {
    const mainContent = document.getElementById('ai-main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div style="padding: 20px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #3b82f6;">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1e293b;">Ready to Process Video</h3>
        <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
          Process this video to enable AI chat functionality.
        </p>
        
        <button id="ai-process-btn" style="
          width: 100%;
          padding: 12px 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
          <span id="process-btn-text">Process Video</span>
        </button>
      </div>
    `;

    const processBtn = document.getElementById('ai-process-btn');
    if (processBtn) {
      processBtn.addEventListener('click', processVideo);
    }
  }

  // Process video
  async function processVideo() {
    if (isProcessing || retryCount >= maxRetries) return;
    isProcessing = true;
    const processBtn = document.getElementById('ai-process-btn');
    const btnText = document.getElementById('process-btn-text');
    
    if (!processBtn || !btnText) {
      isProcessing = false;
      console.error('Error in processVideo: Missing DOM elements');
      return;
    }

    try {
      processBtn.disabled = true;
      processBtn.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      processBtn.style.cursor = 'not-allowed';
      
      btnText.innerHTML = `
        <span style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          <div style="width: 14px; height: 14px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          Processing...
        </span>
      `;

      const videoId = extractVideoId(window.location.href);
      if (!videoId) {
        throw new Error('Could not extract video ID');
      }

      console.log('Processing video ID:', videoId);
      
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'PROCESS_VIDEO',
          videoId: videoId
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      console.log('Server response:', response);

      if (response && response.success) {
        console.log('Video processed successfully');
        isProcessed = true;
        retryCount = 0; // Reset retry count on success
        setTimeout(() => showChatInterface(), 500);
      } else {
        throw new Error(response && response.error ? response.error : 'Failed to process video');
      }
    } catch (error) {
      console.error('Error processing video:', error, error.stack);
      processBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      processBtn.style.cursor = 'pointer';
      btnText.innerHTML = 'Retry Processing';
      processBtn.disabled = false;

      let errorMessage = 'Failed to process video. Please try again.';
      if (error.message.includes('No captions available')) {
        errorMessage = 'This video does not have captions available. Please enable captions on YouTube or try another video.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Could not connect to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('Forbidden')) {
        errorMessage = 'Access denied: Please ensure the extension has proper permissions and try again.';
      }

      addMessage(errorMessage, 'bot', true);

      if (retryCount < maxRetries && !error.message.includes('No captions available')) {
        console.log(`Retrying (${retryCount + 1}/${maxRetries})...`);
        setTimeout(processVideo, 1000); // Retry after 1 second
      } else {
        retryCount = 0; // Reset retry count after max retries
      }
    } finally {
      isProcessing = false;
    }
  }

  // Show chat interface
  function showChatInterface() {
    const mainContent = document.getElementById('ai-main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
        <div style="padding: 16px; border-bottom: 1px solid #e2e8f0; background: white; flex-shrink: 0;">
          <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #374151;">
            💡 Quick Questions
          </h4>
          <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">
            ${['Summarize the main points', 'What are the key takeaways?', 'Explain the main concept'].map(question => `
              <button class="ai-question-btn" style="
                width: 100%;
                text-align: left;
                padding: 8px 12px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                font-size: 11px;
                color: #475569;
                cursor: pointer;
                transition: all 0.2s;
                line-height: 1.4;
              " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
                ${question}
              </button>
            `).join('')}
          </div>
        </div>

        <div id="ai-messages-area" style="
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f8fafc;
          min-height: 0;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        ">
          <div style="text-align: center; padding: 20px 0;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #3b82f6;">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Ask questions about the video content</h4>
            // <p style="margin: 0; font-size: 11px; color: #64748b;">Ask questions about the video content</p>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding: 16px; background: white; flex-shrink: 0;">
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">
            <textarea id="ai-chat-input" placeholder="Ask a question about the video..." style="
              flex: 1;
              padding: 10px 12px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 12px;
              resize: none;
              min-height: 36px;
              max-height: 80px;
              font-family: inherit;
              outline: none;
              transition: border-color 0.2s;
            " rows="1" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
            <button id="ai-send-btn" style="
              padding: 10px 12px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
              min-width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
              flex-shrink: 0;
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    setupChatHandlers();
  }

  // Setup chat event handlers
  function setupChatHandlers() {
    const chatInput = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-send-btn');

    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 80) + 'px';
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', sendMessage);
    }

    document.querySelectorAll('.ai-question-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (chatInput) {
          chatInput.value = btn.textContent.trim();
          chatInput.focus();
        }
      });
    });
  }

  // Send message
  async function sendMessage() {
    const chatInput = document.getElementById('ai-chat-input');
    if (!chatInput || !chatInput.value.trim()) return;

    const question = chatInput.value.trim();
    chatInput.value = '';
    chatInput.style.height = 'auto';

    addMessage(question, 'user');
    showTypingIndicator();

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'ASK_QUESTION',
          question: question
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      hideTypingIndicator();

      if (response && response.success) {
        addMessage(response.answer, 'bot');
      } else {
        throw new Error(response && response.error ? response.error : 'Failed to get response');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      hideTypingIndicator();
      addMessage('Sorry, I encountered an error. Please try again.', 'bot', true);
    }
  }

  // Add message to chat
  function addMessage(text, sender, isError = false) {
    const messagesArea = document.getElementById('ai-messages-area');
    if (!messagesArea) return;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      ${sender === 'user' ? 'justify-content: flex-end' : 'justify-content: flex-start'}
    `;

    const messageBubble = document.createElement('div');
    messageBubble.style.cssText = `
      max-width: 85%;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 12px;
      line-height: 1.4;
      word-wrap: break-word;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      ${sender === 'user' 
        ? 'background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white;' 
        : isError 
          ? 'background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;' 
          : 'background: white; border: 1px solid #e2e8f0; color: #1e293b;'
      }
    `;
    messageBubble.textContent = text;

    const timestamp = document.createElement('div');
    timestamp.style.cssText = `
      font-size: 10px;
      color: ${sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : '#9ca3af'};
      margin-top: 4px;
      text-align: ${sender === 'user' ? 'right' : 'left'};
    `;
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(messageBubble);
    messageDiv.appendChild(timestamp);
    messagesArea.appendChild(messageDiv);

    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    const messagesArea = document.getElementById('ai-messages-area');
    if (!messagesArea) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'ai-typing-indicator';
    typingDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-start;
    `;

    typingDiv.innerHTML = `
      <div style="
        padding: 10px 12px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      ">
        <div style="width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: ai-bounce 1.4s infinite ease-in-out;"></div>
        <div style="width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: ai-bounce 1.4s infinite ease-in-out; animation-delay: 0.1s;"></div>
        <div style="width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: ai-bounce 1.4s infinite ease-in-out; animation-delay: 0.2s;"></div>
      </div>
    `;

    messagesArea.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // Hide typing indicator
  function hideTypingIndicator() {
    const typingIndicator = document.getElementById('ai-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Add CSS animations and scrollbar styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ai-bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* Custom scrollbar for messages area */
    #ai-messages-area::-webkit-scrollbar {
      width: 6px;
    }
    
    #ai-messages-area::-webkit-scrollbar-track {
      background: transparent;
    }
    
    #ai-messages-area::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    
    #ai-messages-area::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    /* Prevent text selection during drag/resize */
    #ai-chatbot-sidebar.dragging,
    #ai-chatbot-sidebar.resizing {
      user-select: none;
      pointer-events: none;
    }
    
    #ai-chatbot-sidebar.dragging *,
    #ai-chatbot-sidebar.resizing * {
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  function initialize() {
    if (isYouTubeVideoPage()) {
      console.log('YouTube video page detected');
    }
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Handle window resize
  window.addEventListener('resize', handleWindowResize);

  // Handle URL changes (for YouTube SPA navigation)
  let currentUrl = window.location.href;
  let currentVideoId = extractVideoId(currentUrl);
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      const newVideoId = extractVideoId(window.location.href);
      currentUrl = window.location.href;
      
      if (isYouTubeVideoPage()) {
        console.log('New YouTube video page detected:', newVideoId);
        if (isActive && sidebar && newVideoId !== currentVideoId) {
          // Close sidebar when navigating to a different video
          closeSidebar();
        }
        currentVideoId = newVideoId;
      } else {
        // Not on a video page, close sidebar if open
        if (isActive) {
          closeSidebar();
        }
        currentVideoId = null;
      }
    }
  });
  urlObserver.observe(document.body, { childList: true, subtree: true });

  // Handle messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    if (message.type === 'TOGGLE_CHAT') {
      if (isActive && sidebar) {
        closeSidebar();
      } else if (isYouTubeVideoPage()) {
        createSidebar();
      }
      sendResponse({ success: true });
      return true;
    }

    if (message.type === 'OPEN_CHAT') {
      if (!isActive && isYouTubeVideoPage()) {
        createSidebar();
      }
      sendResponse({ success: true });
      return true;
    }
  });

  console.log('AI YouTube Chatbot content script initialized');
}