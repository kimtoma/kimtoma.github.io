(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    API_ENDPOINT: 'https://gemini-proxy.kimtoma.workers.dev/chat',
    STORAGE_KEY_MESSAGES: 'chat_messages',
    STORAGE_KEY_THEME: 'theme',
  };

  // State
  let messages = [];
  let isProcessing = false;

  // DOM Elements
  const messagesContainer = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const themeToggle = document.getElementById('themeToggle');
  const typingIndicator = document.querySelector('.typing');

  // Initialize
  function init() {
    setupTheme();
    loadMessages();
    setupEventListeners();
    renderMessages();

    // Configure marked.js
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) {
            console.error('Highlight error:', e);
          }
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true,
    });
  }

  // Theme Management
  function setupTheme() {
    const storedTheme = localStorage.getItem(CONFIG.STORAGE_KEY_THEME);
    const theme = storedTheme || 'dark';
    setTheme(theme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.STORAGE_KEY_THEME, theme);
    updateThemeIcon(theme);
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '🌞' : '🌚';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // Message Management
  function loadMessages() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_MESSAGES);
      if (stored) {
        messages = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
      messages = [];
    }
  }

  function saveMessages() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  }

  function addMessage(role, content) {
    messages.push({
      role,
      content,
      timestamp: Date.now(),
    });
    saveMessages();
  }

  function clearMessages() {
    if (confirm('모든 대화 내용을 삭제하시겠습니까?')) {
      messages = [];
      saveMessages();
      renderMessages();
    }
  }

  // Rendering
  function renderMessages() {
    if (messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 3rem;">💬</div>
          <h2>안녕하세요!</h2>
          <p>무엇을 도와드릴까요?</p>
        </div>
      `;
      return;
    }

    messagesContainer.innerHTML = '';
    messages.forEach(msg => {
      const messageEl = createMessageElement(msg.role, msg.content);
      messagesContainer.appendChild(messageEl);
    });

    scrollToBottom();
  }

  function createMessageElement(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (role === 'user') {
      contentDiv.textContent = content;
    } else {
      // Render markdown for AI messages
      contentDiv.innerHTML = marked.parse(content);
      // Apply syntax highlighting to code blocks
      contentDiv.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
      });
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTypingIndicator() {
    typingIndicator.classList.add('active');
    scrollToBottom();
  }

  function hideTypingIndicator() {
    typingIndicator.classList.remove('active');
  }

  // API Communication
  async function sendMessage(userMessage) {
    if (isProcessing || !userMessage.trim()) return;

    isProcessing = true;
    sendBtn.disabled = true;
    messageInput.disabled = true;

    // Add user message
    addMessage('user', userMessage.trim());
    renderMessages();
    messageInput.value = '';

    showTypingIndicator();

    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.trim(),
          history: messages.slice(0, -1), // Exclude the just-added user message
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add AI response
      addMessage('ai', data.response);
      renderMessages();

    } catch (error) {
      console.error('Send message error:', error);

      // Show error message
      const errorMessage = `죄송합니다. 오류가 발생했습니다.\n\n${error.message}\n\n잠시 후 다시 시도해주세요.`;
      addMessage('ai', errorMessage);
      renderMessages();
    } finally {
      hideTypingIndicator();
      isProcessing = false;
      sendBtn.disabled = false;
      messageInput.disabled = false;
      messageInput.focus();
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Send button
    sendBtn.addEventListener('click', () => {
      sendMessage(messageInput.value);
    });

    // Enter key to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageInput.value);
      }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = messageInput.scrollHeight + 'px';
    });

    // Clear button
    clearBtn.addEventListener('click', clearMessages);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Start the app
  init();
})();
