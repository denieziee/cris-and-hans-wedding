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

// 1. Muted Entry Video (entry.mp4 — 15.1s Monogram Animation) Controller + Scroll Lock
(function initEntryVideo() {
  const entryCurtain = document.getElementById("entryCurtain");
  const entryVideo = document.getElementById("entryVideo");
  const skipEntryBtn = document.getElementById("skipEntryBtn");
  let dismissed = false;

  // Lock page scrolling immediately while the entry video is active
  lockBackgroundScroll();

  function completeEntry() {
    if (dismissed) return;
    dismissed = true;
    if (entryVideo) {
      entryVideo.pause();
    }
    if (entryCurtain) {
      entryCurtain.classList.add("is-done");
    }
    unlockBackgroundScroll();
    document.body.classList.add("has-entered");
  }

  if (skipEntryBtn) {
    skipEntryBtn.addEventListener("click", completeEntry);
  }

  if (entryVideo) {
    entryVideo.muted = true;
    entryVideo.addEventListener("ended", completeEntry);
    entryVideo.addEventListener("error", completeEntry);

    const playPromise = entryVideo.play();
    if (playPromise !== 0) {
      playPromise.catch(() => {
        completeEntry();
      });
    }
  } else {
    completeEntry();
  }

  // Allow full 15.13s entry.mp4 to finish smoothly before safety fallback
  setTimeout(completeEntry, 17500);
})();

// 2. Smooth Scroll Fade-In & Fade-Out Animation When Scrolling Up/Down
const scrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -30px 0px"
  }
);

function observeScrollFades() {
  document.querySelectorAll(".scroll-fade").forEach((el) => {
    scrollObserver.observe(el);
  });
}
observeScrollFades();

// 3. Live Countdown Timer (December 22, 2026 at 4:00 PM Philippine Time UTC+8)
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

// 4. Dynamic Page-1 Crop for invitation.webp (Ensures Page 1 Is Hidden Across All Screen Widths)
(function initDynamicPage1Crop() {
  const img = document.getElementById("invitationWebpImg");
  if (!img) return;

  function applyExactPage1Offset() {
    if (!img.naturalWidth || !img.naturalHeight) return;
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

// 5. Full-Page Top-and-Bottom Bi-Fold Envelope Open & Fold-Close Animation (Slow & Smooth)
(function initFullPageBiFoldEnvelope() {
  const openInviteBtns = [
    document.getElementById("openInviteBtn"),
    document.getElementById("heroOpenInviteBtn")
  ];
  const closeInviteModalBtn = document.getElementById("closeInviteModalBtn");
  const envelopeOverlay = document.getElementById("envelopeOverlay");
  const bifoldTop = document.getElementById("bifoldTop");
  const bifoldBottom = document.getElementById("bifoldBottom");
  const bifoldSeal = document.getElementById("bifoldSeal");
  const inviteWebpScroll = document.getElementById("inviteWebpScroll");
  const protectedWebpWrap = document.getElementById("protectedWebpWrap");

  let isAnimating = false;

  if (protectedWebpWrap) {
    protectedWebpWrap.addEventListener("contextmenu", (e) => e.preventDefault());
    protectedWebpWrap.addEventListener("dragstart", (e) => e.preventDefault());
  }

  function openBiFoldEnvelope() {
    if (isAnimating) return;
    isAnimating = true;

    lockBackgroundScroll();

    bifoldTop.classList.remove("is-unfolded");
    bifoldBottom.classList.remove("is-unfolded");
    bifoldSeal.classList.remove("is-broken");
    if (inviteWebpScroll) inviteWebpScroll.scrollTop = 0;

    envelopeOverlay.classList.add("is-active");
    envelopeOverlay.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      bifoldSeal.classList.add("is-broken");
      bifoldTop.classList.add("is-unfolded");
    }, 450);

    setTimeout(() => {
      bifoldBottom.classList.add("is-unfolded");
    }, 1350);

    setTimeout(() => {
      isAnimating = false;
    }, 2700);
  }

  function closeBiFoldEnvelope() {
    if (isAnimating || !envelopeOverlay.classList.contains("is-active")) return;
    isAnimating = true;

    bifoldBottom.classList.remove("is-unfolded");

    setTimeout(() => {
      bifoldTop.classList.remove("is-unfolded");
    }, 850);

    setTimeout(() => {
      bifoldSeal.classList.remove("is-broken");
    }, 1950);

    setTimeout(() => {
      envelopeOverlay.classList.remove("is-active");
      envelopeOverlay.setAttribute("aria-hidden", "true");
      unlockBackgroundScroll();
      isAnimating = false;
    }, 2650);
  }

  openInviteBtns.forEach((btn) => {
    if (btn) btn.addEventListener("click", openBiFoldEnvelope);
  });

  if (closeInviteModalBtn) closeInviteModalBtn.addEventListener("click", closeBiFoldEnvelope);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && envelopeOverlay.classList.contains("is-active")) {
      closeBiFoldEnvelope();
    }
  });
})();

// 6. Memory Album Automatic Crossfade Slideshow + Mobile Swipe
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

// 7. Live Wedding Wall & Photo Uploader
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

function closeUploadModal() {
  uploadModal.classList.remove("is-open");
  uploadModal.setAttribute("aria-hidden", "true");
  unlockBackgroundScroll();
}

openUploadBtns.forEach((btn) => {
  if (!btn) return;
  btn.addEventListener("click", () => {
    lockBackgroundScroll();
    uploadModal.classList.add("is-open");
    uploadModal.setAttribute("aria-hidden", "false");
  });
});

if (closeUploadModalBtn) {
  closeUploadModalBtn.addEventListener("click", closeUploadModal);
}

if (uploadModal) {
  uploadModal.addEventListener("click", (e) => {
    if (e.target === uploadModal) closeUploadModal();
  });
}

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

// 1. Replace your uploadForm submit listener with this:
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
  uploadProgressText.textContent = "Saving to gallery...";

  // Wait 3 seconds so Google Drive finishes indexing the new file before fetching
  setTimeout(async () => {
    uploadForm.reset();
    selectedPreviewBar.textContent = "";
    uploadProgressWrap.style.display = "none";
    uploadProgressFill.style.width = "0%";
    submitUploadBtn.disabled = false;
    closeUploadModal();

    await fetchLiveWall();
    // Second sync check 3 seconds later in case Drive took extra time
    setTimeout(fetchLiveWall, 3000);
  }, 3000);
});

// 2. Replace your fetchLiveWall() function with this:
async function fetchLiveWall() {
  try {
    // Cache-busting timestamp (_t) ensures mobile browsers don't show stale empty results
    const urlWithSession = `${APPS_SCRIPT_URL}?sid=${encodeURIComponent(VISITOR_SESSION_ID)}&_t=${Date.now()}`;
    const res = await fetch(urlWithSession);
    const data = await res.json();

    const photos = Array.isArray(data) ? data : (data.photos || []);
    const onlineCount = (!Array.isArray(data) && typeof data.onlineCount === "number")
      ? Math.max(1, data.onlineCount)
      : 1;

    if (onlineCountText) {
      onlineCountText.textContent = `${onlineCount} Online`;
    }

    photoCount.textContent = `${photos.length} ${photos.length === 1 ? "Memory" : "Memories"}`;

    if (!photos.length) {
      weddingWallGrid.innerHTML = `<div class="wall-loading">No guest photos yet. Be the first to capture a memory!</div>`;
      return;
    }

    weddingWallGrid.innerHTML = "";
    photos.forEach((photo) => {
      const article = document.createElement("article");
      article.className = "wall-item scroll-fade";

      // Extract File ID whether Code.gs sends photo.id or only photo.url
      let fileId = photo.id || "";
      if (!fileId && photo.url) {
        const match = photo.url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
      }

      const candidateUrls = fileId
        ? [
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
            `https://lh3.googleusercontent.com/d/${fileId}=w1000`,
            `https://drive.google.com/uc?export=view&id=${fileId}`
          ]
        : [photo.url];

      let urlIndex = 0;
      const img = document.createElement("img");
      img.referrerPolicy = "no-referrer";
      img.src = candidateUrls[0];
      img.alt = `Uploaded by ${photo.guest}`;
      img.loading = "lazy";

      img.onerror = () => {
        urlIndex++;
        if (urlIndex < candidateUrls.length) {
          img.src = candidateUrls[urlIndex];
        }
      };

      let displayGuest = (photo.guest || "Wedding Guest").trim();
      let displayWish = (photo.message || "").trim();

      if (!displayWish && displayGuest.includes(" — ")) {
        const parts = displayGuest.split(" — ");
        displayGuest = parts[0].trim();
        displayWish = parts.slice(1).join(" — ").trim();
      }

      const caption = document.createElement("div");
      caption.className = "wall-caption";

      const guestSpan = document.createElement("span");
      guestSpan.className = "guest-tag";
      guestSpan.textContent = displayGuest;
      caption.appendChild(guestSpan);

      if (displayWish) {
        const wishSpan = document.createElement("p");
        wishSpan.className = "guest-wish-preview";
        wishSpan.textContent = `“${displayWish}”`;
        caption.appendChild(wishSpan);
      }

      article.appendChild(img);
      article.appendChild(caption);

      const formattedTime = new Date(photo.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      article.addEventListener("click", () => {
        openLightbox(img.src, displayGuest, displayWish, formattedTime);
      });

      weddingWallGrid.appendChild(article);
      scrollObserver.observe(article);
    });
  } catch (err) {
    console.error("Live wall sync error:", err);
    photoCount.textContent = "Live Sync Ready";
  }
}

const weddingWallGrid = document.getElementById("weddingWallGrid");
const photoCount = document.getElementById("photoCount");
const onlineCountText = document.getElementById("onlineCountText");
const refreshWallBtn = document.getElementById("refreshWallBtn");
const lightboxModal = document.getElementById("lightboxModal");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxGuest = document.getElementById("lightboxGuest");
const lightboxWish = document.getElementById("lightboxWish");
const lightboxDate = document.getElementById("lightboxDate");
const closeLightboxBtn = document.getElementById("closeLightboxBtn");

// Unique per-tab session ID to count active guests online
const VISITOR_SESSION_ID =
  sessionStorage.getItem("ch_visitor_sid") ||
  (() => {
    const id = "g_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
    sessionStorage.setItem("ch_visitor_sid", id);
    return id;
  })();

function openLightbox(url, guest, wish, time) {
  lockBackgroundScroll();
  lightboxImg.src = url;
  lightboxGuest.textContent = guest;
  if (lightboxWish) lightboxWish.textContent = wish ? `“${wish}”` : "";
  lightboxDate.textContent = `Shared at ${time}`;
  lightboxModal.classList.add("is-open");
}

async function fetchLiveWall() {
  try {
    const urlWithSession = `${APPS_SCRIPT_URL}?sid=${encodeURIComponent(VISITOR_SESSION_ID)}`;
    const res = await fetch(urlWithSession);
    const data = await res.json();

    const photos = Array.isArray(data) ? data : (data.photos || []);
    const onlineCount = (!Array.isArray(data) && typeof data.onlineCount === "number")
      ? Math.max(1, data.onlineCount)
      : 1;

    if (onlineCountText) {
      onlineCountText.textContent = `${onlineCount} Online`;
    }

    photoCount.textContent = `${photos.length} ${photos.length === 1 ? "Memory" : "Memories"}`;

    if (!photos.length) {
      weddingWallGrid.innerHTML = `<div class="wall-loading">No guest photos yet. Be the first to capture a memory!</div>`;
      return;
    }

    weddingWallGrid.innerHTML = "";
    photos.forEach((photo) => {
      const article = document.createElement("article");
      article.className = "wall-item scroll-fade";

      // Build primary + fallback Google Drive image URLs
      const primaryUrl = photo.id
        ? `https://drive.google.com/thumbnail?id=${photo.id}&sz=w1000`
        : photo.url;
      const backupUrl = photo.id
        ? `https://lh3.googleusercontent.com/d/${photo.id}=w1000`
        : (photo.fallbackUrl || photo.url);

      const img = document.createElement("img");
      img.referrerPolicy = "no-referrer";
      img.src = primaryUrl;
      img.alt = `Uploaded by ${photo.guest}`;
      img.loading = "lazy";

      let triedBackup = false;
      img.onerror = () => {
        if (!triedBackup && backupUrl && img.src !== backupUrl) {
          triedBackup = true;
          img.src = backupUrl;
        }
      };

      let displayGuest = (photo.guest || "Wedding Guest").trim();
      let displayWish = (photo.message || "").trim();

      if (!displayWish && displayGuest.includes(" — ")) {
        const parts = displayGuest.split(" — ");
        displayGuest = parts[0].trim();
        displayWish = parts.slice(1).join(" — ").trim();
      }

      const caption = document.createElement("div");
      caption.className = "wall-caption";

      const guestSpan = document.createElement("span");
      guestSpan.className = "guest-tag";
      guestSpan.textContent = displayGuest;
      caption.appendChild(guestSpan);

      if (displayWish) {
        const wishSpan = document.createElement("p");
        wishSpan.className = "guest-wish-preview";
        wishSpan.textContent = `“${displayWish}”`;
        caption.appendChild(wishSpan);
      }

      article.appendChild(img);
      article.appendChild(caption);

      const formattedTime = new Date(photo.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      article.addEventListener("click", () => {
        openLightbox(img.src, displayGuest, displayWish, formattedTime);
      });

      weddingWallGrid.appendChild(article);
      scrollObserver.observe(article);
    });
  } catch (err) {
    console.error("Live wall sync error:", err);
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