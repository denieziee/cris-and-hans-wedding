// Connected Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdT01IhRBl3_WnvprzQj_x0Kr7RZbm568SPgf4hJHIFKT0qyiaT9uujwsBDe-nPs4N/exec";

// Helper: Lock & Unlock Background Page Scrolling
let savedScrollY = 0;

function lockBackgroundScroll() {
  if (document.body.classList.contains("is-scroll-locked")) return;
  savedScrollY = window.scrollY || window.pageYOffset;
  document.body.style.top = `-${savedScrollY}px`;
  document.body.classList.add("is-scroll-locked");
}

function unlockBackgroundScroll() {
  if (!document.body.classList.contains("is-scroll-locked")) return;
  document.body.classList.remove("is-scroll-locked");
  document.body.style.top = "";
  window.scrollTo(0, savedScrollY);
}

// 1. Ornate Archway & Blur-to-Focus Website Entry Animation (Tap-to-Skip Supported)
(function initEntryAndFullscreen() {
  const entryCurtain = document.getElementById("entryCurtain");
  let dismissed = false;

  function completeEntry() {
    if (dismissed) return;
    dismissed = true;
    if (entryCurtain) entryCurtain.classList.add("is-done");
    document.body.classList.add("has-entered");
  }

  if (entryCurtain) {
    entryCurtain.addEventListener("click", completeEntry);
    entryCurtain.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") completeEntry();
    });
  }

  window.addEventListener("load", () => {
    setTimeout(() => window.scrollTo(0, 1), 60);
    setTimeout(completeEntry, 2350);
  });
})();

// 2. Live Countdown Timer (December 22, 2026 at 4:00 PM Philippine Time UTC+8)
(function initLiveCountdown() {
  const targetTimestamp = new Date("2026-12-22T16:00:00+08:00").getTime();

  function tickCountdown() {
    const cdDays = document.getElementById("cdDays");
    const cdHours = document.getElementById("cdHours");
    const cdMins = document.getElementById("cdMins");
    const cdSecs = document.getElementById("cdSecs");
    if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

    const diff = Math.max(0, targetTimestamp - Date.now());

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    cdDays.textContent = String(days).padStart(2, "0");
    cdHours.textContent = String(hours).padStart(2, "0");
    cdMins.textContent = String(mins).padStart(2, "0");
    cdSecs.textContent = String(secs).padStart(2, "0");
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);
})();

// 3. Dynamic Page-1 Crop for invitation.webp (Ensures Page 1 Is Hidden Across All Screen Widths)
(function initDynamicPage1Crop() {
  const img = document.getElementById("invitationWebpImg");
  if (!img) return;

  function applyExactPage1Offset() {
    if (!img.naturalWidth || !img.naturalHeight) return;
    // Standard invitation page aspect ratio is ~1 : 1.414 (A4 / 5x7 portrait)
    const pageAspect = 1.414;
    const totalPagesEstimate = Math.max(2, Math.round((img.naturalHeight / img.naturalWidth) / pageAspect));
    const singlePagePercent = (img.naturalHeight / img.naturalWidth / totalPagesEstimate) * 100;
    img.style.marginTop = `-${singlePagePercent.toFixed(2)}%`;
  }

  if (img.complete) {
    applyExactPage1Offset();
  } else {
    img.addEventListener("load", applyExactPage1Offset);
  }
})();

// 4. Burgundy Envelope Suite Entry & Close Animation -> Protected Invitation Viewer
(function initAnimatedEnvelopeWebp() {
  const openInviteBtn = document.getElementById("openInviteBtn");
  const closeInviteModalBtn = document.getElementById("closeInviteModalBtn");
  const envelopeOverlay = document.getElementById("envelopeOverlay");
  const envelopeAnimStage = document.getElementById("envelopeAnimStage");
  const burgundySuite = document.getElementById("burgundySuite");
  const envStatusLabel = document.getElementById("envStatusLabel");
  const inviteViewerShell = document.getElementById("inviteViewerShell");
  const inviteWebpScroll = document.getElementById("inviteWebpScroll");
  const protectedWebpWrap = document.getElementById("protectedWebpWrap");

  let isAnimating = false;

  if (protectedWebpWrap) {
    protectedWebpWrap.addEventListener("contextmenu", (e) => e.preventDefault());
    protectedWebpWrap.addEventListener("dragstart", (e) => e.preventDefault());
  }

  function openEnvelopeSequence() {
    if (isAnimating) return;
    isAnimating = true;

    lockBackgroundScroll();

    burgundySuite.classList.remove("is-present", "is-fanned");
    envelopeAnimStage.classList.remove("is-faded");
    inviteViewerShell.classList.remove("is-shown");
    envStatusLabel.textContent = "Opening your invitation...";
    if (inviteWebpScroll) inviteWebpScroll.scrollTop = 0;

    envelopeOverlay.classList.add("is-active");
    envelopeOverlay.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      burgundySuite.classList.add("is-present");
    });

    setTimeout(() => {
      burgundySuite.classList.add("is-fanned");
    }, 220);

    setTimeout(() => {
      envelopeAnimStage.classList.add("is-faded");
      inviteViewerShell.classList.add("is-shown");
      isAnimating = false;
    }, 1500);
  }

  function closeEnvelopeSequence() {
    if (isAnimating || !envelopeOverlay.classList.contains("is-active")) return;
    isAnimating = true;

    envStatusLabel.textContent = "Closing invitation...";

    inviteViewerShell.classList.remove("is-shown");
    envelopeAnimStage.classList.remove("is-faded");

    setTimeout(() => {
      burgundySuite.classList.remove("is-fanned");
    }, 260);

    setTimeout(() => {
      burgundySuite.classList.remove("is-present");
      envelopeOverlay.classList.remove("is-active");
      envelopeOverlay.setAttribute("aria-hidden", "true");
      unlockBackgroundScroll();
      isAnimating = false;
    }, 1000);
  }

  if (openInviteBtn) openInviteBtn.addEventListener("click", openEnvelopeSequence);
  if (closeInviteModalBtn) closeInviteModalBtn.addEventListener("click", closeEnvelopeSequence);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && envelopeOverlay.classList.contains("is-active")) {
      closeEnvelopeSequence();
    }
  });
})();

// 5. Memory Album Automatic Crossfade Slideshow + Mobile Swipe
(function initPrenupSlideshow() {
  const slides = Array.from(document.querySelectorAll(".prenup-slide"));
  const dots = Array.from(document.querySelectorAll(".slide-dot"));
  const prevSlideBtn = document.getElementById("prevSlideBtn");
  const nextSlideBtn = document.getElementById("nextSlideBtn");
  const prenupSlideshow = document.getElementById("prenupSlideshow");

  if (!slides.length) return;

  let currentSlide = 0;
  let slideTimer = null;
  let touchStartX = 0;

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === currentSlide));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === currentSlide));
  }

  function startSlideshow() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(() => showSlide(currentSlide + 1), 3500);
  }

  if (prevSlideBtn) {
    prevSlideBtn.addEventListener("click", () => {
      showSlide(currentSlide - 1);
      startSlideshow();
    });
  }

  if (nextSlideBtn) {
    nextSlideBtn.addEventListener("click", () => {
      showSlide(currentSlide + 1);
      startSlideshow();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.index));
      startSlideshow();
    });
  });

  if (prenupSlideshow) {
    prenupSlideshow.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    prenupSlideshow.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        showSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
        startSlideshow();
      }
    }, { passive: true });
  }

  startSlideshow();
})();

// 6. Live Wedding Wall & Photo Uploader
const uploadModal = document.getElementById("uploadModal");
const openUploadBtns = [
  document.getElementById("headerUploadBtn"),
  document.getElementById("mainUploadBtn")
];
const closeUploadModalBtn = document.getElementById("closeUploadModalBtn");
const photoFilesInput = document.getElementById("photoFilesInput");
const selectedPreviewBar = document.getElementById("selectedPreviewBar");
const uploadForm = document.getElementById("uploadForm");
const uploadProgressWrap = document.getElementById("uploadProgressWrap");
const uploadProgressFill = document.getElementById("uploadProgressFill");
const uploadProgressText = document.getElementById("uploadProgressText");
const submitUploadBtn = document.getElementById("submitUploadBtn");

openUploadBtns.forEach((btn) => {
  if (!btn) return;
  btn.addEventListener("click", () => {
    lockBackgroundScroll();
    uploadModal.classList.add("is-open");
    uploadModal.setAttribute("aria-hidden", "false");
  });
});

closeUploadModalBtn.addEventListener("click", () => {
  uploadModal.classList.remove("is-open");
  uploadModal.setAttribute("aria-hidden", "true");
  unlockBackgroundScroll();
});

photoFilesInput.addEventListener("change", () => {
  const files = Array.from(photoFilesInput.files);
  selectedPreviewBar.textContent = files.length
    ? `${files.length} photo${files.length > 1 ? "s" : ""} ready to upload`
    : "";
});

function compressImageToBase64(file, maxWidth = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({
          base64: dataUrl.split(",")[1],
          mimeType: "image/jpeg",
          filename: file.name.replace(/\.[^/.]+$/, "") + ".jpg"
        });
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const files = Array.from(photoFilesInput.files);
  if (!files.length) return;

  const guest = document.getElementById("guestNameInput").value.trim() || "Wedding Guest";
  const message = document.getElementById("guestWishInput").value.trim();

  submitUploadBtn.disabled = true;
  uploadProgressWrap.style.display = "block";

  for (let i = 0; i < files.length; i++) {
    uploadProgressText.textContent = `Uploading photo ${i + 1} of ${files.length}...`;
    uploadProgressFill.style.width = `${Math.round((i / files.length) * 100)}%`;

    try {
      const compressed = await compressImageToBase64(files[i]);
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          base64: compressed.base64,
          mimeType: compressed.mimeType,
          filename: `${Date.now()}_${compressed.filename}`,
          guest,
          message
        })
      });
    } catch (err) {
      console.error("Upload error:", err);
    }
  }

  uploadProgressFill.style.width = "100%";
  uploadProgressText.textContent = "All photos posted! Refreshing wall...";

  setTimeout(() => {
    uploadForm.reset();
    selectedPreviewBar.textContent = "";
    uploadProgressWrap.style.display = "none";
    uploadProgressFill.style.width = "0%";
    submitUploadBtn.disabled = false;
    uploadModal.classList.remove("is-open");
    unlockBackgroundScroll();
    fetchLiveWall();
  }, 1200);
});

const weddingWallGrid = document.getElementById("weddingWallGrid");
const photoCount = document.getElementById("photoCount");
const refreshWallBtn = document.getElementById("refreshWallBtn");
const lightboxModal = document.getElementById("lightboxModal");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxGuest = document.getElementById("lightboxGuest");
const lightboxDate = document.getElementById("lightboxDate");
const closeLightboxBtn = document.getElementById("closeLightboxBtn");

function openLightbox(url, guest, time) {
  lockBackgroundScroll();
  lightboxImg.src = url;
  lightboxGuest.textContent = guest;
  lightboxDate.textContent = `Shared at ${time}`;
  lightboxModal.classList.add("is-open");
}

async function fetchLiveWall() {
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const photos = await res.json();

    photoCount.textContent = `${photos.length} ${photos.length === 1 ? "Photo" : "Photos"}`;

    if (!photos.length) {
      weddingWallGrid.innerHTML = `<div class="wall-loading">No guest photos yet. Be the first to upload a memory!</div>`;
      return;
    }

    weddingWallGrid.innerHTML = "";
    photos.forEach((photo) => {
      const article = document.createElement("article");
      article.className = "wall-item";

      const img = document.createElement("img");
      img.src = photo.url;
      img.alt = `Uploaded by ${photo.guest}`;
      img.loading = "lazy";

      const caption = document.createElement("div");
      caption.className = "wall-caption";

      const guestSpan = document.createElement("span");
      guestSpan.className = "guest-tag";
      guestSpan.textContent = photo.guest;

      caption.appendChild(guestSpan);
      article.appendChild(img);
      article.appendChild(caption);

      const formattedTime = new Date(photo.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      article.addEventListener("click", () => {
        openLightbox(photo.url, photo.guest, formattedTime);
      });

      weddingWallGrid.appendChild(article);
    });
  } catch (err) {
    photoCount.textContent = "Live Sync Ready";
  }
}

closeLightboxBtn.addEventListener("click", () => {
  lightboxModal.classList.remove("is-open");
  unlockBackgroundScroll();
});
lightboxModal.addEventListener("click", (e) => {
  if (e.target === lightboxModal) {
    lightboxModal.classList.remove("is-open");
    unlockBackgroundScroll();
  }
});

refreshWallBtn.addEventListener("click", fetchLiveWall);

fetchLiveWall();
setInterval(fetchLiveWall, 15000);