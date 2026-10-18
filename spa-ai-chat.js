// SERENE TOUCH - AI Spa Receptionist Widget (Guest Mode)
(function () {
  const CHAT_API = '/api/chat';
  const STORAGE_KEY = 'serena_touch_guest_chat_v1';

  const INITIAL_GREETING = 'Hello! Welcome to Serene Touch. How can I assist you today? Feel free to ask about our treatments, check open time slots, or book an appointment.';

  // S_icon SVG markup
  const S_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="spa-s-logo-svg"><rect width="100" height="100" rx="20" fill="#14271f" stroke="#d8b875" stroke-width="3"/><text x="50" y="68" font-family="Georgia,serif" font-size="56" font-weight="bold" fill="#d8b875" text-anchor="middle">S</text></svg>`;

  // Inject UI
  const widgetHtml = `
    <button
      type="button"
      id="spa-ai-chat-btn"
      title="Chat with SERENE TOUCH SPA AI Receptionist"
      aria-label="Open SERENE TOUCH SPA AI Assistant"
      aria-expanded="false"
      aria-controls="spa-ai-chat-window"
    >
      <div class="spa-btn-content">
        ${S_ICON_SVG}
        <span class="spa-btn-badge-live">
          <span class="spa-pulse-dot"></span>
        </span>
      </div>
    </button>

    <div id="spa-ai-chat-window" role="dialog" aria-modal="true" aria-label="SERENE TOUCH SPA AI Chat" aria-hidden="true">
      <div class="spa-chat-header">
        <div class="spa-header-left">
          <div class="spa-header-logo-wrap">
            ${S_ICON_SVG}
          </div>
          <div class="spa-header-content">
            <div class="spa-title-row">
              <h4>SERENE TOUCH SPA AI</h4>
              <span class="spa-ai-agent-pill">AI Agent</span>
            </div>
            <div class="spa-status-row">
              <span class="spa-status-dot"></span>
              <span class="spa-status-text">SPA AI Receptionist • Live Availability</span>
            </div>
          </div>
        </div>
        <div class="spa-header-actions">
          <button type="button" class="spa-chat-clear-btn" id="spa-chat-clear-btn" title="Delete chat history" aria-label="Delete chat history">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
          <button type="button" class="spa-chat-close-btn" id="spa-chat-close-btn" title="Close chat and return to page" aria-label="Close chat">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="spa-ai-banner">
        <span class="spa-ai-banner-icon">🌿</span>
        <span>You are speaking with our autonomous <strong>SPA AI Receptionist</strong>. Inquire about therapies, check real-time openings, and book your appointment instantly.</span>
      </div>

      <div class="spa-chat-messages" id="spa-chat-messages"></div>

      <form class="spa-chat-input-bar" id="spa-chat-form">
        <input 
          type="text" 
          id="spa-chat-input" 
          aria-label="Message SERENE TOUCH SPA AI Receptionist"
          placeholder="Ask a question or request a booking..." 
          autocomplete="off"
          required
        />
        <button type="submit" id="spa-chat-submit-btn">
          <span>Send</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHtml);

  const chatBtn = document.getElementById('spa-ai-chat-btn');
  const chatWindow = document.getElementById('spa-ai-chat-window');
  const closeBtn = document.getElementById('spa-chat-close-btn');
  const clearBtn = document.getElementById('spa-chat-clear-btn');
  const chatForm = document.getElementById('spa-chat-form');
  const chatInput = document.getElementById('spa-chat-input');
  const messagesContainer = document.getElementById('spa-chat-messages');

  let savedScrollY = 0;

  function loadMessages() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
    return [{ role: 'assistant', content: INITIAL_GREETING }];
  }

  function saveMessages(msgs) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (_) {}
  }

  let messages = loadMessages();

  function renderAllMessages() {
    messagesContainer.innerHTML = '';
    messages.forEach(function (m) {
      appendMessageDOM(m.role, m.content);
    });
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendMessageDOM(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `spa-chat-msg ${role}`;

    if (role.includes('assistant')) {
      const meta = document.createElement('div');
      meta.className = 'spa-msg-meta';
      meta.innerHTML = `${S_ICON_SVG}<span class="spa-msg-author">Serene Touch SPA</span><span class="spa-msg-badge">AI Agent</span>`;
      msgDiv.appendChild(meta);

      const body = document.createElement('div');
      body.className = 'spa-msg-body';
      body.textContent = text;
      msgDiv.appendChild(body);
    } else {
      msgDiv.textContent = text;
    }

    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
  }

  renderAllMessages();

  function toggleChat() {
    const wasOpen = chatWindow.classList.contains('open');
    if (!wasOpen) {
      savedScrollY = window.scrollY || window.pageYOffset || 0;
    }
    const isOpen = chatWindow.classList.toggle('open');
    chatBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    chatWindow.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (isOpen) {
      chatInput.focus();
      scrollToBottom();
    } else {
      window.scrollTo({ top: savedScrollY, behavior: 'instant' in window ? 'instant' : 'auto' });
      chatBtn.focus();
    }
  }

  function clearHistory() {
    messages = [{ role: 'assistant', content: INITIAL_GREETING }];
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    renderAllMessages();
    chatInput.focus();
  }

  chatBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  clearBtn.addEventListener('click', clearHistory);

  chatForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    appendMessageDOM('user', text);
    messages.push({ role: 'user', content: text });
    saveMessages(messages);

    const loadingDiv = appendMessageDOM('assistant loading', 'Thinking...');

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          role: 'guest'
        })
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();
      let reply = data.text || "Sorry, I couldn't process that.";
      // Clean up any internal engine mentions if present
      reply = reply.replace(/Cal\.com/gi, 'Serene Touch')
                   .replace(/Cal\.diy/gi, 'Serene Touch')
                   .replace(/calcom\.run\.place/gi, 'spa.calcom.run.place');

      loadingDiv.className = 'spa-chat-msg assistant';
      const body = loadingDiv.querySelector('.spa-msg-body');
      if (body) {
        body.textContent = reply;
      } else {
        loadingDiv.textContent = reply;
      }
      messages.push({ role: 'assistant', content: reply });
      saveMessages(messages);
    } catch (err) {
      loadingDiv.className = 'spa-chat-msg assistant';
      const body = loadingDiv.querySelector('.spa-msg-body');
      const errText = 'Sorry, I had trouble connecting. Please try again or visit our booking page directly.';
      if (body) body.textContent = errText;
      else loadingDiv.textContent = errText;
    }
    scrollToBottom();
  });
})();
