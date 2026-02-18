(function () {
  var starfieldEl = document.getElementById("starfield");
  var bubblesEl = document.getElementById("bubbles");
  var designTrigger = document.getElementById("design-trigger");
  var designPanel = document.getElementById("design-panel");
  var designPanelClose = document.getElementById("design-panel-close");
  var designPanelBackdrop = document.getElementById("design-panel-backdrop");

  // ----- 3D Water (Three.js) -----
  var waterContainer = document.getElementById("water-container");
  if (waterContainer && typeof THREE !== "undefined") {
    var oceanEl = waterContainer.parentElement;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.set(0, 4, 28);
    camera.lookAt(0, 0, -30);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x0a080c);
    waterContainer.appendChild(renderer.domElement);

    var waterVertexShader = [
      "uniform float uTime;",
      "varying float vWave;",
      "varying vec3 vPosition;",
      "varying float vCrest;",
      "void main() {",
      "  vec3 pos = position;",
      "  float ky = 0.12;",
      "  float kx = 0.05;",
      "  float swell = sin(pos.y * ky + pos.x * kx + uTime * 0.5) * 2.2;",
      "  float swell2 = sin(pos.y * 0.1 - pos.x * 0.06 + uTime * 0.35) * 1.0;",
      "  float chop = sin(pos.x * 0.2 + pos.y * 0.15 + uTime * 0.8) * 0.4;",
      "  float h = swell + swell2 + chop;",
      "  pos.z += h;",
      "  vWave = h;",
      "  float crest = smoothstep(0.4, 1.6, h) * smoothstep(2.6, 1.6, h);",
      "  vCrest = crest;",
      "  vPosition = pos;",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);",
      "}"
    ].join("\n");

    var waterFragmentShader = [
      "varying float vWave;",
      "varying vec3 vPosition;",
      "varying float vCrest;",
      "void main() {",
      "  vec3 dark = vec3(0.05, 0.05, 0.1);",
      "  vec3 mid = vec3(0.09, 0.08, 0.14);",
      "  vec3 soft = vec3(0.38, 0.42, 0.48);",
      "  vec3 col = mix(dark, mid, smoothstep(-1.0, 2.0, vWave));",
      "  float crestGlow = vCrest * (0.9 + 0.1 * sin(vPosition.x * 0.3 + vPosition.y * 0.2));",
      "  col += soft * crestGlow * 0.12;",
      "  gl_FragColor = vec4(col, 1.0);",
      "}"
    ].join("\n");

    var waterGeo = new THREE.PlaneGeometry(140, 140, 80, 80);
    waterGeo.rotateX(-Math.PI / 2);
    var waterMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      side: THREE.DoubleSide
    });
    var waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0, -40);
    scene.add(waterMesh);

    function resizeWater3d() {
      if (!oceanEl) return;
      var w = oceanEl.clientWidth;
      var h = oceanEl.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    function animateWater() {
      if (!waterMat.uniforms.uTime) return;
      waterMat.uniforms.uTime.value += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animateWater);
    }

    resizeWater3d();
    window.addEventListener("resize", resizeWater3d);
    animateWater();
  }

  // ----- Starfield: many stars, random positions, twinkle -----
  var starCount = 120;
  var starSizes = ["", "star--medium", "star--large"];

  function createStar() {
    var s = document.createElement("div");
    s.className = "star " + (starSizes[Math.floor(Math.random() * starSizes.length)]);
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 3 + "s";
    s.style.animationDuration = 2 + Math.random() * 2 + "s";
    return s;
  }

  if (starfieldEl) {
    for (var i = 0; i < starCount; i++) {
      starfieldEl.appendChild(createStar());
    }
  }

  // ----- Bubbles: disabled for clean two-layer look -----
  var bubbleCount = 0;
  var minSize = 8;
  var maxSize = 28;

  function randomIn(min, max) {
    return min + Math.random() * (max - min);
  }

  function createBubble() {
    var b = document.createElement("div");
    b.className = "bubble";
    var size = randomIn(minSize, maxSize);
    b.style.width = size + "px";
    b.style.height = size + "px";
    // Prefer sides: 30% left strip, 40% middle (sparse), 30% right strip
    var r = Math.random();
    var xPercent;
    if (r < 0.35) {
      xPercent = randomIn(0, 18);
    } else if (r < 0.65) {
      xPercent = randomIn(40, 60);
    } else {
      xPercent = randomIn(82, 100);
    }
    b.style.left = xPercent + "%";
    b.style.animationDuration = randomIn(6, 14) + "s";
    b.style.animationDelay = randomIn(-2, 8) + "s";
    return b;
  }

  if (bubblesEl) {
    for (var i = 0; i < bubbleCount; i++) {
      bubblesEl.appendChild(createBubble());
    }
  }

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

  if (designTrigger) {
    designTrigger.addEventListener("click", openPanel);
  }
  if (designPanelClose) {
    designPanelClose.addEventListener("click", closePanel);
  }
  if (designPanelBackdrop) {
    designPanelBackdrop.addEventListener("click", closePanel);
  }

  // ----- Theme switcher (Space ⇄ Forest) -----
  var themeSwitcher = document.getElementById("theme-switcher");
  var themeSwitcherLabel = document.getElementById("theme-switcher-label");
  var THEME_KEY = "demo-theme";

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function setTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", value);
    if (themeSwitcherLabel) {
      themeSwitcherLabel.textContent = value === "forest" ? "Space" : "Forest";
    }
  }

  function toggleTheme() {
    var current = getTheme();
    setTheme(current === "forest" ? "" : "forest");
  }

  var saved = getTheme();
  document.documentElement.setAttribute("data-theme", saved);
  if (themeSwitcherLabel) {
    themeSwitcherLabel.textContent = saved === "forest" ? "Space" : "Forest";
  }
  if (themeSwitcher) {
    themeSwitcher.addEventListener("click", toggleTheme);
  }

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

  // ----- Dimension tabs: switch comparison dimension -----
  var dimensionTabs = document.querySelectorAll(".dimension-tab");
  var leftPanes = document.querySelectorAll(".comparison-half--traditional .dimension-pane");
  var rightPanes = document.querySelectorAll(".comparison-half--ai .dimension-pane");

  function setDimension(dim) {
    dimensionTabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-dimension") === String(dim);
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    leftPanes.forEach(function (pane) {
      pane.classList.toggle("is-active", pane.getAttribute("data-dimension") === String(dim));
    });
    rightPanes.forEach(function (pane) {
      pane.classList.toggle("is-active", pane.getAttribute("data-dimension") === String(dim));
    });
  }

  dimensionTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setDimension(tab.getAttribute("data-dimension"));
    });
  });

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
