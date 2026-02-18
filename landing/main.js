(function () {
  var heroInput = document.getElementById("hero-input");
  var heroSubmit = document.getElementById("hero-submit");
  var ctaScroll = document.getElementById("cta-scroll");

  if (heroSubmit) {
    heroSubmit.addEventListener("click", function () {
      if (heroInput) heroInput.focus();
      // Later: send input to chat / API
    });
  }

  if (ctaScroll) {
    ctaScroll.addEventListener("click", function (e) {
      if (heroInput) {
        e.preventDefault();
        heroInput.scrollIntoView({ behavior: "smooth", block: "center" });
        heroInput.focus();
      }
    });
  }
})();
