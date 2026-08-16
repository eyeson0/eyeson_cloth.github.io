/* ============================================================
   EYESON — CAROUSEL.JS
   The signature three-model Main Collection carousel.
   Center model in focus; sides blurred and faded; auto-rotate,
   hover-to-focus, arrows, progress bars, swipe gestures.
   ============================================================ */

function initMainCollection() {
  const stage = document.getElementById("mcStage");
  if (!stage) return;

  let index = 0;               /* currently focused look */
  let timer = null;

  /* Position every model relative to the focused index */
  function layout() {
    const models = stage.querySelectorAll(".mc-model");
    const n = MAIN_COLLECTION.length;
    models.forEach((el, i) => {
      el.classList.remove("is-center", "is-left", "is-right");
      /* compute shortest circular distance */
      let d = i - index;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      if (d === 0) el.classList.add("is-center");
      else if (d === -1 || d === n - 1) el.classList.add("is-left");
      else el.classList.add("is-right");
    });
    /* Update details panel with an elegant fade */
    const details = document.getElementById("mcDetails");
    if (details) {
      details.classList.add("fading");
      setTimeout(() => { fillDetails(); details.classList.remove("fading"); }, 400);
    }
    /* Pagination 1 / 5 + progress bars */
    const count = document.getElementById("mcCount");
    if (count) count.textContent = index + 1 + " / " + n;
    stage.querySelectorAll(".mc-bar").forEach((b, i) => b.classList.toggle("active", i === index));
  }

  /* Fill the left/center/right detail blocks from the product data */
  function fillDetails() {
    const look = MAIN_COLLECTION[index];
    const p = getProduct(look.product);
    if (!p) return;
    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    set("mcLeft",
      "<h5>Collection</h5><p>" + esc(p.collection) + "</p>" +
      '<p class="mc-price">' + formatNPR(p.price) + "</p>" +
      '<!-- Shop Now button --><a class="btn btn-solid btn-sm" href="product.html?id=' + p.id + '" style="margin-top:16px">Shop Now</a>');
    set("mcCenter",
      "<h5>Product</h5><p><strong>" + esc(p.name) + "</strong> — " + esc(look.caption) + "</p>" +
      "<h5>Fabric</h5><p>" + esc(p.fabric) + "</p>" +
      "<h5>Sizes</h5><p>" + p.sizes.join(" · ") + "</p>" +
      '<h5>Colors</h5><div class="swatches">' + p.colors.map((c) => '<span class="swatch" style="background:' + c + '"></span>').join("") + "</div>" +
      "<h5>Description</h5><p class='text-soft'>" + esc(p.description) + "</p>");
    set("mcRight",
      "<h5>Fabric Details</h5><p>" + esc(p.fabric) + "</p>" +
      "<h5>Model Height</h5><p>" + esc(p.modelHeight) + "</p>" +
      "<h5>Available Colors</h5><p>" + p.colors.length + " colors</p>");
  }

  /* Move focus with wrap-around */
  function go(step) { index = (index + step + MAIN_COLLECTION.length) % MAIN_COLLECTION.length; layout(); restart(); }
  function focus(i) { index = i; layout(); restart(); }
  function restart() { clearInterval(timer); timer = setInterval(() => go(1), 6000); }

  /* Build the models once from MAIN_COLLECTION data.
     PREPEND (never overwrite) — the arrow buttons live inside the stage
     and must survive, otherwise users can't browse the looks. */
  stage.insertAdjacentHTML(
    "afterbegin",
    MAIN_COLLECTION.map((look, i) =>
      '<div class="mc-model" data-i="' + i + '" role="button" tabindex="0" aria-label="' + esc(look.caption) + '">' +
        imgFrame(look.modelImage, look.caption) +
      "</div>"
    ).join("")
  );

  /* Arrows */
  const prev = document.getElementById("mcPrev"), next = document.getElementById("mcNext");
  if (prev) prev.addEventListener("click", () => go(-1));
  if (next) next.addEventListener("click", () => go(1));

  /* Click / keyboard focus a side model (hover-follow intentionally removed) */
  stage.querySelectorAll(".mc-model").forEach((el) => {
    const i = +el.dataset.i;
    el.addEventListener("click", () => focus(i));
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") focus(i); });
  });

  /* Pagination bars are clickable */
  document.querySelectorAll(".mc-bar").forEach((b, i) => b.addEventListener("click", () => focus(i)));

  /* Swipe gestures for mobile */
  let startX = null;
  stage.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    startX = null;
  });

  /* Pause auto-rotate while the pointer explores the stage */
  stage.addEventListener("mouseenter", () => clearInterval(timer));
  stage.addEventListener("mouseleave", restart);
  /* Stop the rotation entirely once the section scrolls out of view */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((en) => en[0].isIntersecting ? restart() : clearInterval(timer),
      { threshold: 0.15 }).observe(stage);
  }

  layout();
  restart();
}
