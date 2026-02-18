(function () {
  var messagesEl = document.getElementById("chat-messages");
  var contextView = document.getElementById("context-view");
  var chatInput = document.getElementById("chat-input");
  var sendBtn = document.getElementById("send-btn");
  var newChatBtn = document.getElementById("new-chat");
  var body = document.body;

  // Time-based context (mock). Replace with real signals later (location, calendar, etc.)
  function getContext() {
    var hour = new Date().getHours();
    if (hour >= 5 && hour < 10) {
      return {
        headline: "Good morning · Today's summary",
        sub: "Generated for you now",
        cards: [
          { title: "Your portfolio", value: "+1.2%", meta: "this week", desc: "Ahead of the market. Top mover: NVDA." },
          { title: "Market pulse", value: "Moderate volatility", meta: "today", desc: "AI expects a calm session. Fed speech at 2pm ET may shift sentiment." },
          { title: "For you", value: "Consider Tesla +5%", meta: "personalized", desc: "Based on your recent interest in green energy, we suggest a small tilt toward TSLA." }
        ]
      };
    }
    if (hour >= 10 && hour < 14) {
      return {
        headline: "Midday · Quick snapshot",
        sub: "Generated for you now",
        cards: [
          { title: "Portfolio", value: "+0.4%", meta: "today", desc: "In line with S&P 500. No rebalance needed." },
          { title: "Market", value: "Range-bound", meta: "session", desc: "Low volume so far. Eyes on earnings after bell." },
          { title: "For you", value: "No action", meta: "personalized", desc: "Your targets are on track. We'll nudge if something changes." }
        ]
      };
    }
    if (hour >= 14 && hour < 18) {
      return {
        headline: "Afternoon · Market update",
        sub: "Generated for you now",
        cards: [
          { title: "Portfolio", value: "+0.8%", meta: "today", desc: "Tech leading. Consider locking partial gains if you're risk-down." },
          { title: "Volatility", value: "Picking up", meta: "post-Fed", desc: "Fed tone was hawkish. AI suggests staying diversified." },
          { title: "For you", value: "Review bonds", meta: "personalized", desc: "Given your timeline, adding 5% to short-duration bonds could smooth returns." }
        ]
      };
    }
    if (hour >= 18 && hour < 22) {
      return {
        headline: "Evening · Today's wrap",
        sub: "Generated for you now",
        cards: [
          { title: "Portfolio", value: "+1.1%", meta: "today", desc: "Solid day. Week-to-date: +2.3%." },
          { title: "Tomorrow", value: "Earnings heavy", meta: "preview", desc: "AAPL, AMZN report. Expect gap moves; we'll flag if your holdings are affected." },
          { title: "For you", value: "Sleep well", meta: "personalized", desc: "No overnight risk on your current positions. Check back in the morning." }
        ]
      };
    }
    // Night or early morning
    return {
      headline: "Night · Rest mode",
      sub: "Generated for you now",
      cards: [
        { title: "Portfolio", value: "Unchanged", meta: "markets closed", desc: "Asian session open; limited impact on your holdings." },
        { title: "Tomorrow", value: "Preview ready", meta: "morning", desc: "We'll surface a fresh summary when you open the app." },
        { title: "For you", value: "No action", meta: "personalized", desc: "Everything is set. Focus on rest." }
      ]
    };
  }

  function renderContext() {
    if (!contextView) return;
    var ctx = getContext();
    var html = '<p class="context-headline">' + escapeHtml(ctx.headline) + '</p>';
    if (ctx.sub) html += '<p class="context-sub">' + escapeHtml(ctx.sub) + '</p>';
    html += '<div class="context-cards">';
    ctx.cards.forEach(function (card) {
      html += '<div class="context-card">';
      html += '<div class="context-card-header">';
      html += '<span class="context-card-title">' + escapeHtml(card.title) + '</span>';
      if (card.meta) html += '<span class="context-card-meta">' + escapeHtml(card.meta) + '</span>';
      html += '</div>';
      if (card.value) html += '<p class="context-card-value">' + escapeHtml(card.value) + '</p>';
      html += '<p class="context-card-desc">' + escapeHtml(card.desc) + '</p>';
      html += '</div>';
    });
    html += '</div>';
    contextView.innerHTML = html;
    contextView.classList.remove("hidden");
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function hideContextView() {
    if (contextView) contextView.classList.add("hidden");
    if (body) body.classList.add("has-messages");
  }

  function showContextView() {
    if (contextView) contextView.classList.remove("hidden");
    if (body) body.classList.remove("has-messages");
    renderContext();
  }

  function addMessage(role, text) {
    hideContextView();
    var wrap = document.createElement("div");
    wrap.className = "msg msg--" + role;
    var avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = role === "user" ? "You" : "AI";
    var bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = text;
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    wrap.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  function sendUserMessage(text) {
    text = (text || "").trim();
    if (!text) return;
    addMessage("user", text);
    chatInput.value = "";
    setTimeout(function () {
      addMessage(
        "assistant",
        "Got it. \"" + text + "\" — we'll connect this to the backend and AI next. You can keep asking or open \"New view\" to see a fresh context."
      );
    }, 600);
  }

  // Initial load: show contextual first view
  renderContext();

  if (sendBtn && chatInput) {
    sendBtn.addEventListener("click", function () {
      sendUserMessage(chatInput.value);
    });
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage(chatInput.value);
      }
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener("click", function () {
      var msgs = messagesEl.querySelectorAll(".msg");
      msgs.forEach(function (m) {
        m.remove();
      });
      showContextView();
      chatInput.value = "";
      chatInput.focus();
    });
  }
})();
