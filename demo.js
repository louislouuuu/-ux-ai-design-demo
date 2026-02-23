(function () {
  var menuDesign = document.getElementById("menu-design");
  var designPanel = document.getElementById("design-panel");
  var designPanelClose = document.getElementById("design-panel-close");
  var designPanelBackdrop = document.getElementById("design-panel-backdrop");

  // ----- Menu bar clock (Mac style: "Mon Feb 23 12:31 AM") -----
  var menuClock = document.getElementById("menu-clock");
  var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function updateMenuBarTime() {
    if (!menuClock) return;
    var now = new Date();
    var wd = weekdays[now.getDay()];
    var mon = months[now.getMonth()];
    var day = now.getDate();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 || 12;
    menuClock.textContent = wd + " " + mon + " " + day + " " + h12 + ":" + (m < 10 ? "0" : "") + m + " " + ampm;
  }
  updateMenuBarTime();
  setInterval(updateMenuBarTime, 1000);

  // ----- Design panel toggle -----
  function openPanel() {
    if (designPanel) designPanel.classList.add("is-open");
    if (designPanelBackdrop) designPanelBackdrop.classList.add("is-visible");
    if (designPanel) designPanel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    if (designPanel) designPanel.classList.remove("is-open");
    if (designPanelBackdrop) designPanelBackdrop.classList.remove("is-visible");
    if (designPanel) designPanel.setAttribute("aria-hidden", "true");
  }

  if (menuDesign) {
    menuDesign.addEventListener("click", openPanel);
  }
  if (designPanelClose) {
    designPanelClose.addEventListener("click", closePanel);
  }
  if (designPanelBackdrop) {
    designPanelBackdrop.addEventListener("click", closePanel);
  }

  // ----- Mode menu (Dark / Light theme) -----
  var THEME_KEY = "demo-theme";
  var modeTrigger = document.getElementById("mode-menu-trigger");
  var modeDropdown = document.getElementById("mode-dropdown");
  var modeMenuItems = document.querySelectorAll(".menu-dropdown-item[data-mode]");

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "forest";
    } catch (e) {
      return "";
    }
  }

  function setTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", value);
    modeMenuItems.forEach(function (item) {
      var mode = item.getAttribute("data-mode");
      var isActive = (mode === "light" && value === "forest") || (mode === "dark" && value !== "forest");
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  var saved = getTheme();
  document.documentElement.setAttribute("data-theme", saved);
  modeMenuItems.forEach(function (item) {
    var mode = item.getAttribute("data-mode");
    var isActive = (mode === "light" && saved === "forest") || (mode === "dark" && saved !== "forest");
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-current", isActive ? "true" : "false");
  });

  if (modeTrigger && modeDropdown) {
    modeTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      closeFileDropdown();
      var open = modeDropdown.classList.toggle("is-open");
      modeTrigger.setAttribute("aria-expanded", open);
      var vd = document.getElementById("view-dropdown");
      var vt = document.getElementById("view-menu-trigger");
      if (vd) vd.classList.remove("is-open");
      if (vt) vt.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("click", function () {
      modeDropdown.classList.remove("is-open");
      if (modeTrigger) modeTrigger.setAttribute("aria-expanded", "false");
    });
  }
  modeMenuItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var mode = item.getAttribute("data-mode");
      setTheme(mode === "light" ? "forest" : "");
      if (modeDropdown) modeDropdown.classList.remove("is-open");
      if (modeTrigger) modeTrigger.setAttribute("aria-expanded", "false");
    });
  });

  // ----- Dock: switch project and update menu bar app name -----
  var menuBarApp = document.getElementById("menu-bar-app");
  document.querySelectorAll(".dock-icon[data-project][data-label]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".dock-icon").forEach(function (b) {
        b.classList.remove("is-active");
        b.removeAttribute("aria-current");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-current", "page");
      if (menuBarApp) {
        menuBarApp.textContent = btn.getAttribute("data-label");
      }
    });
  });

  // ----- Desktop windows: open, close, move, resize -----
  var iconOldUx = document.getElementById("icon-old-ux");
  var iconNewUx = document.getElementById("icon-new-ux");
  var windowTraditional = document.getElementById("window-traditional");
  var windowAi = document.getElementById("window-ai");
  var desktopWindows = document.getElementById("desktop-windows");

  var DEFAULT_W = 520;
  var DEFAULT_H = 420;
  var MIN_W = 320;
  var MIN_H = 260;
  var CASCADE = 32;
  var MIN_TOP = 56;
  var windowState = {
    traditional: { left: 80, top: 100, width: DEFAULT_W, height: DEFAULT_H },
    ai: { left: 80 + CASCADE, top: 100 + CASCADE, width: DEFAULT_W, height: DEFAULT_H }
  };
  var zIndexCounter = 10;

  function applyWindowBounds(el, id) {
    var s = windowState[id];
    if (!s || !el) return;
    el.style.left = s.left + "px";
    el.style.top = s.top + "px";
    el.style.width = s.width + "px";
    el.style.height = s.height + "px";
  }

  function bringToFront(el) {
    zIndexCounter += 1;
    el.style.zIndex = zIndexCounter;
  }

  function openWindow(id) {
    var w = id === "traditional" ? windowTraditional : windowAi;
    if (w) {
      if (!w.classList.contains("is-open")) {
        applyWindowBounds(w, id);
      }
      w.classList.add("is-open");
      w.setAttribute("aria-hidden", "false");
      bringToFront(w);
    }
  }
  function closeWindow(id) {
    var w = id === "traditional" ? windowTraditional : windowAi;
    if (w) {
      w.classList.remove("is-open");
      w.setAttribute("aria-hidden", "true");
    }
  }

  // ----- File menu: open/close windows -----
  var fileMenuTrigger = document.getElementById("file-menu-trigger");
  var fileDropdown = document.getElementById("file-dropdown");
  var fileMenuItems = document.querySelectorAll(".menu-dropdown-item[data-file-action]");

  function closeFileDropdown() {
    if (fileDropdown) {
      fileDropdown.classList.remove("is-open");
      fileDropdown.setAttribute("aria-hidden", "true");
    }
    if (fileMenuTrigger) fileMenuTrigger.setAttribute("aria-expanded", "false");
  }

  if (fileMenuTrigger && fileDropdown) {
    fileMenuTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      // Only one top menu should stay open.
      var vd = document.getElementById("view-dropdown");
      var vt = document.getElementById("view-menu-trigger");
      var md = document.getElementById("mode-dropdown");
      var mt = document.getElementById("mode-menu-trigger");
      if (vd) vd.classList.remove("is-open");
      if (vt) vt.setAttribute("aria-expanded", "false");
      if (md) md.classList.remove("is-open");
      if (mt) mt.setAttribute("aria-expanded", "false");

      var isOpen = fileDropdown.classList.toggle("is-open");
      fileDropdown.setAttribute("aria-hidden", isOpen ? "false" : "true");
      fileMenuTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  fileMenuItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var action = item.getAttribute("data-file-action");
      if (action === "open-old") {
        openWindow("traditional");
      } else if (action === "open-new") {
        openWindow("ai");
      } else if (action === "open-both") {
        openWindow("traditional");
        openWindow("ai");
      } else if (action === "close-all") {
        closeWindow("traditional");
        closeWindow("ai");
      }
      closeFileDropdown();
    });
  });

  document.addEventListener("click", function (e) {
    if (fileMenuTrigger && fileDropdown && !fileMenuTrigger.contains(e.target) && !fileDropdown.contains(e.target)) {
      closeFileDropdown();
    }
  });
  if (fileDropdown) {
    fileDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  if (iconOldUx) {
    iconOldUx.addEventListener("click", function () {
      openWindow("traditional");
    });
  }
  if (iconNewUx) {
    iconNewUx.addEventListener("click", function () {
      openWindow("ai");
    });
  }
  document.querySelectorAll(".window-btn.window-close[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var id = btn.getAttribute("data-close");
      if (id) closeWindow(id);
    });
  });

  // Click window to focus (bring to front)
  [windowTraditional, windowAi].forEach(function (w) {
    if (!w) return;
    w.addEventListener("mousedown", function () {
      if (w.classList.contains("is-open")) bringToFront(w);
    });
  });

  // Drag title bar
  document.querySelectorAll(".window-title-bar[data-drag]").forEach(function (bar) {
    bar.addEventListener("mousedown", function (e) {
      if (e.target.closest("button")) return;
      var id = bar.getAttribute("data-drag");
      var w = id === "traditional" ? windowTraditional : windowAi;
      if (!w || !w.classList.contains("is-open")) return;
      e.preventDefault();
      bringToFront(w);
      var startX = e.clientX;
      var startY = e.clientY;
      var startLeft = windowState[id].left;
      var startTop = windowState[id].top;
      function onMove(e2) {
        var dx = e2.clientX - startX;
        var dy = e2.clientY - startY;
        windowState[id].left = Math.max(0, startLeft + dx);
        windowState[id].top = Math.max(MIN_TOP, startTop + dy);
        applyWindowBounds(w, id);
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  });

  // Resize handle (bottom-right)
  document.querySelectorAll(".window-resize-handle[data-resize]").forEach(function (handle) {
    handle.addEventListener("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var id = handle.getAttribute("data-resize");
      var w = id === "traditional" ? windowTraditional : windowAi;
      if (!w || !w.classList.contains("is-open")) return;
      bringToFront(w);
      var startX = e.clientX;
      var startY = e.clientY;
      var startW = windowState[id].width;
      var startH = windowState[id].height;
      var startLeft = windowState[id].left;
      var startTop = windowState[id].top;
      function onMove(e2) {
        var dw = e2.clientX - startX;
        var dh = e2.clientY - startY;
        var newW = Math.max(MIN_W, startW + dw);
        var newH = Math.max(MIN_H, startH + dh);
        windowState[id].width = newW;
        windowState[id].height = newH;
        applyWindowBounds(w, id);
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  });

  // ----- Bubble cards: quick actions (broker & bank) -----
  var bubbleCardsEl = document.getElementById("bubble-cards");
  var homeTransition = document.getElementById("home-transition");
  var homeView = document.getElementById("home-view");
  var homeBack = document.getElementById("home-back");

  var bubbleCards = document.querySelectorAll(".bubble-card");
  bubbleCards.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.getAttribute("data-action") || "";
      if (action === "build-home" || action === "ai-recommend") {
        if (bubbleCardsEl && homeTransition && homeView) {
          bubbleCardsEl.classList.add("is-hidden");
          homeTransition.classList.add("is-visible");
          homeTransition.setAttribute("aria-hidden", "false");
          setTimeout(function () {
            homeTransition.classList.remove("is-visible");
            homeTransition.setAttribute("aria-hidden", "true");
            homeView.classList.add("is-visible");
            homeView.setAttribute("aria-hidden", "false");
          }, 1800);
        }
      }
    });
  });

  if (homeBack && bubbleCardsEl && homeView) {
    homeBack.addEventListener("click", function () {
      homeView.classList.remove("is-visible");
      homeView.setAttribute("aria-hidden", "true");
      bubbleCardsEl.classList.remove("is-hidden");
    });
  }

  // ----- Guide notifications (dismiss → move to trash) -----
  var trashList = document.getElementById("trash-list");
  var trashEmpty = document.getElementById("trash-empty");

  function addToTrash(stepNum, text) {
    if (!trashList) return;
    var li = document.createElement("li");
    li.className = "trash-list-item";
    li.innerHTML = "<span class=\"trash-item-step\">" + stepNum + "</span> " + text;
    trashList.appendChild(li);
    if (trashEmpty) trashEmpty.style.display = "none";
  }

  document.querySelectorAll(".guide-close").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var note = btn.closest(".guide-note");
      if (note) {
        var stepEl = note.querySelector(".guide-step");
        var textEl = note.querySelector(".guide-text");
        var step = stepEl ? stepEl.textContent.trim() : "";
        var text = textEl ? textEl.innerHTML : "";
        addToTrash(step, text);
        note.classList.add("is-dismissed");
        setTimeout(function () { note.remove(); }, 300);
      }
    });
  });

  // ----- Trash panel: open / close -----
  var dockTrash = document.getElementById("dock-trash");
  var trashPanel = document.getElementById("trash-panel");
  var trashPanelClose = document.getElementById("trash-panel-close");
  var trashPanelBackdrop = document.getElementById("trash-panel-backdrop");

  function openTrashPanel() {
    if (trashPanel) {
      trashPanel.classList.add("is-open");
      trashPanel.setAttribute("aria-hidden", "false");
    }
    if (trashPanelBackdrop) {
      trashPanelBackdrop.classList.add("is-visible");
      trashPanelBackdrop.setAttribute("aria-hidden", "false");
    }
  }

  function closeTrashPanel() {
    if (trashPanel) {
      trashPanel.classList.remove("is-open");
      trashPanel.setAttribute("aria-hidden", "true");
    }
    if (trashPanelBackdrop) {
      trashPanelBackdrop.classList.remove("is-visible");
      trashPanelBackdrop.setAttribute("aria-hidden", "true");
    }
  }

  if (dockTrash) dockTrash.addEventListener("click", openTrashPanel);
  if (trashPanelClose) trashPanelClose.addEventListener("click", closeTrashPanel);
  if (trashPanelBackdrop) trashPanelBackdrop.addEventListener("click", closeTrashPanel);

  // ----- Toast notification -----
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg, duration) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, duration || 2200);
  }

  function anyWindowOpen() {
    return (windowTraditional && windowTraditional.classList.contains("is-open")) ||
           (windowAi && windowAi.classList.contains("is-open"));
  }

  // ----- View menu: dimension dropdown (replaces toolbar 1-4) -----
  var viewMenuTrigger = document.getElementById("view-menu-trigger");
  var viewDropdown = document.getElementById("view-dropdown");
  var dimensionMenuItems = document.querySelectorAll(".menu-dropdown-item[data-dimension]");
  var leftPanes = document.querySelectorAll(".comparison-half--traditional .dimension-pane");
  var rightPanes = document.querySelectorAll(".comparison-half--ai .dimension-pane");

  function setDimension(dim) {
    dimensionMenuItems.forEach(function (item) {
      var isActive = item.getAttribute("data-dimension") === String(dim);
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-current", isActive ? "true" : "false");
    });
    leftPanes.forEach(function (pane) {
      pane.classList.toggle("is-active", pane.getAttribute("data-dimension") === String(dim));
    });
    rightPanes.forEach(function (pane) {
      pane.classList.toggle("is-active", pane.getAttribute("data-dimension") === String(dim));
    });
  }

  function closeViewDropdown() {
    if (viewDropdown) {
      viewDropdown.classList.remove("is-open");
      viewDropdown.setAttribute("aria-hidden", "true");
    }
    if (viewMenuTrigger) viewMenuTrigger.setAttribute("aria-expanded", "false");
  }

  if (viewMenuTrigger && viewDropdown) {
    viewMenuTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      closeFileDropdown();
      var md = document.getElementById("mode-dropdown");
      var mt = document.getElementById("mode-menu-trigger");
      if (md) md.classList.remove("is-open");
      if (mt) mt.setAttribute("aria-expanded", "false");
      var isOpen = viewDropdown.classList.toggle("is-open");
      viewDropdown.setAttribute("aria-hidden", isOpen ? "false" : "true");
      viewMenuTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
  dimensionMenuItems.forEach(function (item) {
    item.addEventListener("click", function () {
      if (!anyWindowOpen()) {
        showToast("Open a window first — use File menu");
        closeViewDropdown();
        return;
      }
      setDimension(item.getAttribute("data-dimension"));
      closeViewDropdown();
    });
  });
  document.addEventListener("click", function (e) {
    if (viewMenuTrigger && viewDropdown && !viewMenuTrigger.contains(e.target) && !viewDropdown.contains(e.target)) {
      closeViewDropdown();
    }
  });
  if (viewDropdown) {
    viewDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
  // Set initial active dimension in menu
  setDimension("1");

  // ----- Chat bar: submit -----
  var chatForm = document.getElementById("chat-bar-form");
  var chatInput = document.getElementById("chat-bar-input");
  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = (chatInput.value || "").trim();
      if (text) {
        console.log("Chat:", text);
        chatInput.value = "";
      }
    });
  }
})();
