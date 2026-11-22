// Connected Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdT01IhRBl3_WnvprzQj_x0Kr7RZbm568SPgf4hJHIFKT0qyiaT9uujwsBDe-nPs4N/exec";

// Helper: Lock & Unlock Background Page Scrolling
let savedScrollY = 0;

function revealVisibleSections() {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  document.querySelectorAll(".scroll-fade").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < vh - 20 && rect.bottom > 20) {
      el.classList.add("is-visible");
    }
  });
}

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
  window.scrollTo({
    top: savedScrollY,
    left: 0,
    behavior: "instant"
  });
  requestAnimationFrame(revealVisibleSections);
}

// 1. Muted Entry Video (entry.mp4) Controller (Plays Once Per Session)
(function initEntryVideo() {
  const entryCurtain = document.getElementById("entryCurtain");
  const entryVideo = document.getElementById("entryVideo");
  const skipEntryBtn = document.getElementById("skipEntryBtn");
  let dismissed = false;

  // Skip intro immediately on repeat visits/refreshes in the same browser session
  if (sessionStorage.getItem("ch_intro_seen") === "1") {
    if (entryVideo) entryVideo.pause();
    if (entryCurtain) entryCurtain.remove();
    document.body.classList.add("has-entered");
    requestAnimationFrame(revealVisibleSections);
    return;
  }

  lockBackgroundScroll();

  function completeEntry() {
    if (dismissed) return;
    dismissed = true;
    sessionStorage.setItem("ch_intro_seen", "1");
    if (entryVideo) {
      entryVideo.pause();
    }
    if (entryCurtain) {
      entryCurtain.classList.add("is-done");
    }
    unlockBackgroundScroll();
    document.body.classList.add("has-entered");
    requestAnimationFrame(revealVisibleSections);
  }

  if (skipEntryBtn) {
    skipEntryBtn.addEventListener("click", completeEntry);
  }

  if (entryVideo) {
    entryVideo.muted = true;
    entryVideo.addEventListener("ended", completeEntry);
    entryVideo.addEventListener("error", completeEntry);

    const playPromise = entryVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        completeEntry();
      });
    }
  } else {
    completeEntry();
  }

  setTimeout(completeEntry, 17500);
})();

// 2. Smooth Scroll Fade-In & Fade-Out Animation + Floating Thumb-Zone Button
const scrollObserver = new IntersectionObserver(
  (entries) => {
    if (document.body.classList.contains("is-scroll-locked")) return;
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

(function initFloatingShareButton() {
  const fabUploadBtn = document.getElementById("fabUploadBtn");
  const heroSection = document.getElementById("heroSection");
  if (!fabUploadBtn || !heroSection) return;

  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        fabUploadBtn.classList.toggle("is-visible", !entry.isIntersecting);
      });
    },
    { threshold: 0.1 }
  );

  heroObserver.observe(heroSection);
})();

// 3. Full-Page Embedded Netlify Invitation Modal
(function initInvitationModal() {
  const openInviteBtns = [
    document.getElementById("openInviteBtn"),
    document.getElementById("heroOpenInviteBtn")
  ];
  const closeInviteModalBtn = document.getElementById("closeInviteModalBtn");
  const envelopeOverlay = document.getElementById("envelopeOverlay");
  const invitationFrame = document.getElementById("invitationFrame");
  const inviteIframeLoader = document.getElementById("inviteIframeLoader");

  if (invitationFrame && inviteIframeLoader) {
    invitationFrame.addEventListener("load", () => {
      if (invitationFrame.src && invitationFrame.src !== "about:blank") {
        inviteIframeLoader.classList.add("is-hidden");
      }
    });
  }

  function openInvitationModal() {
    if (!envelopeOverlay) return;
    lockBackgroundScroll();

    if (invitationFrame) {
      const targetUrl = invitationFrame.dataset.src;
      if (inviteIframeLoader) inviteIframeLoader.classList.remove("is-hidden");
      if (invitationFrame.src !== targetUrl) {
        invitationFrame.src = targetUrl;
      } else if (inviteIframeLoader) {
        inviteIframeLoader.classList.add("is-hidden");
      }
    }

    envelopeOverlay.classList.add("is-active");
    envelopeOverlay.setAttribute("aria-hidden", "false");
  }

  function closeInvitationModal() {
    if (!envelopeOverlay || !envelopeOverlay.classList.contains("is-active")) return;
    envelopeOverlay.classList.remove("is-active");
    envelopeOverlay.setAttribute("aria-hidden", "true");
    unlockBackgroundScroll();
  }

  openInviteBtns.forEach((btn) => {
    if (btn) btn.addEventListener("click", openInvitationModal);
  });

  if (closeInviteModalBtn) {
    closeInviteModalBtn.addEventListener("click", closeInvitationModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && envelopeOverlay && envelopeOverlay.classList.contains("is-active")) {
      closeInvitationModal();
    }
  });
})();

// 4. Memory Album Automatic Crossfade Slideshow + Mobile Swipe
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

// 5. Live Wedding Wall & Dual Camera / Gallery Photo Uploader (with Optimistic UI)
const uploadModal = document.getElementById("uploadModal");
const openUploadBtns = [
  document.getElementById("headerUploadBtn"),
  document.getElementById("mainUploadBtn"),
  document.getElementById("fabUploadBtn")
];
const closeUploadModalBtn = document.getElementById("closeUploadModalBtn");
const openCameraBtn = document.getElementById("openCameraBtn");
const openGalleryBtn = document.getElementById("openGalleryBtn");
const cameraCaptureInput = document.getElementById("cameraCaptureInput");
const photoFilesInput = document.getElementById("photoFilesInput");
const selectedPreviewWrap = document.getElementById("selectedPreviewWrap");
const selectedPreviewBar = document.getElementById("selectedPreviewBar");
const selectedThumbStrip = document.getElementById("selectedThumbStrip");
const clearSelectedFilesBtn = document.getElementById("clearSelectedFilesBtn");
const uploadForm = document.getElementById("uploadForm");
const uploadProgressWrap = document.getElementById("uploadProgressWrap");
const uploadProgressFill = document.getElementById("uploadProgressFill");
const uploadProgressText = document.getElementById("uploadProgressText");
const submitUploadBtn = document.getElementById("submitUploadBtn");
const uploadToast = document.getElementById("uploadToast");
const guestNameInput = document.getElementById("guestNameInput");

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

let queuedUploadFiles = [];
let toastTimer = null;

function showUploadToast(text) {
  if (!uploadToast) return;
  uploadToast.textContent = text;
  uploadToast.classList.add("is-visible");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    uploadToast.classList.remove("is-visible");
  }, 3600);
}

// Auto-fill guest name from previous upload
if (guestNameInput) {
  const savedGuestName = localStorage.getItem("ch_guest_name");
  if (savedGuestName) guestNameInput.value = savedGuestName;
  guestNameInput.addEventListener("input", () => {
    localStorage.setItem("ch_guest_name", guestNameInput.value.trim());
  });
}

const VISITOR_SESSION_ID =
  sessionStorage.getItem("ch_visitor_sid") ||
  (() => {
    const id = "g_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
    sessionStorage.setItem("ch_visitor_sid", id);
    return id;
  })();

function closeUploadModal() {
  uploadModal.classList.remove("is-open");
  uploadModal.setAttribute("aria-hidden", "true");
  unlockBackgroundScroll();
}

openUploadBtns.forEach((btn) => {
  if (!btn) return;
  btn.addEventListener("click", () => {
    lockBackgroundScroll();
    if (guestNameInput && !guestNameInput.value) {
      const savedName = localStorage.getItem("ch_guest_name");
      if (savedName) guestNameInput.value = savedName;
    }
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

// Mobile-Reliable Direct Trigger for Take a Photo & From Gallery
if (openCameraBtn && cameraCaptureInput) {
  openCameraBtn.addEventListener("click", () => {
    cameraCaptureInput.click();
  });
}

if (openGalleryBtn && photoFilesInput) {
  openGalleryBtn.addEventListener("click", () => {
    photoFilesInput.click();
  });
}

function renderSelectedQueue() {
  if (!queuedUploadFiles.length) {
    if (selectedPreviewWrap) selectedPreviewWrap.style.display = "none";
    if (selectedThumbStrip) selectedThumbStrip.innerHTML = "";
    if (selectedPreviewBar) selectedPreviewBar.textContent = "";
    return;
  }

  if (selectedPreviewWrap) selectedPreviewWrap.style.display = "block";
  if (selectedPreviewBar) {
    selectedPreviewBar.textContent = `${queuedUploadFiles.length} photo${queuedUploadFiles.length > 1 ? "s" : ""} ready to post`;
  }

  if (selectedThumbStrip) {
    selectedThumbStrip.innerHTML = "";
    queuedUploadFiles.forEach((file, idx) => {
      const box = document.createElement("div");
      box.className = "selected-thumb-box";

      const thumb = document.createElement("img");
      thumb.className = "selected-thumb-item";
      thumb.alt = file.name;
      const objUrl = URL.createObjectURL(file);
      thumb.src = objUrl;
      thumb.onload = () => URL.revokeObjectURL(objUrl);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn-remove-thumb";
      removeBtn.setAttribute("aria-label", "Remove photo");
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        queuedUploadFiles.splice(idx, 1);
        renderSelectedQueue();
      });

      box.appendChild(thumb);
      box.appendChild(removeBtn);
      selectedThumbStrip.appendChild(box);
    });
  }
}

function addFilesToQueue(fileList) {
  const incoming = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
  if (!incoming.length) return;
  queuedUploadFiles = queuedUploadFiles.concat(incoming);
  renderSelectedQueue();
}

if (cameraCaptureInput) {
  cameraCaptureInput.addEventListener("change", () => {
    addFilesToQueue(cameraCaptureInput.files);
    cameraCaptureInput.value = "";
  });
}

if (photoFilesInput) {
  photoFilesInput.addEventListener("change", () => {
    addFilesToQueue(photoFilesInput.files);
    photoFilesInput.value = "";
  });
}

if (clearSelectedFilesBtn) {
  clearSelectedFilesBtn.addEventListener("click", () => {
    queuedUploadFiles = [];
    renderSelectedQueue();
  });
}

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
          dataUrl,
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

// Left-to-Right Uncropped Masonry Row-Span Calculator
function resizeMasonryItem(item) {
  if (!weddingWallGrid || !item) return;
  const rowHeight = parseInt(window.getComputedStyle(weddingWallGrid).getPropertyValue("grid-auto-rows"), 10) || 8;
  const marginBottom = parseFloat(window.getComputedStyle(item).marginBottom) || 14;
  const contentHeight = item.getBoundingClientRect().height;
  const rowSpan = Math.ceil((contentHeight + marginBottom) / rowHeight);
  item.style.gridRowEnd = `span ${rowSpan}`;
}

function resizeAllMasonryItems() {
  if (!weddingWallGrid) return;
  weddingWallGrid.querySelectorAll(".wall-item").forEach(resizeMasonryItem);
}

window.addEventListener("resize", resizeAllMasonryItems);

function createWallCardElement({ candidateUrls, displayGuest, displayWish, dateValue, isOptimistic = false }) {
  const article = document.createElement("article");
  article.className = "wall-item scroll-fade is-visible";

  if (isOptimistic) {
    const badge = document.createElement("span");
    badge.className = "just-shared-badge";
    badge.textContent = "Just shared";
    article.appendChild(badge);
  }

  let urlIndex = 0;
  const img = document.createElement("img");
  img.referrerPolicy = "no-referrer";
  img.src = candidateUrls[0];
  img.alt = `Uploaded by ${displayGuest}`;
  img.loading = "lazy";

  img.onload = () => {
    resizeMasonryItem(article);
  };

  img.onerror = () => {
    urlIndex++;
    if (urlIndex < candidateUrls.length) {
      img.src = candidateUrls[urlIndex];
    }
  };

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

  const photoDateObj = new Date(dateValue || Date.now());
  const formattedDate = photoDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const formattedTime12 = photoDateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  const formattedDateTime = `${formattedDate} • ${formattedTime12}`;

  article.addEventListener("click", () => {
    openLightbox(img.src, displayGuest, displayWish, formattedDateTime);
  });

  return article;
}

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!queuedUploadFiles.length) {
    alert("Please tap Take a Photo or From Gallery to select at least one photo.");
    return;
  }

  const files = [...queuedUploadFiles];
  const guest = (guestNameInput ? guestNameInput.value.trim() : "") || "Wedding Guest";
  const message = document.getElementById("guestWishInput").value.trim();
  const optimisticPreviews = [];

  localStorage.setItem("ch_guest_name", guest);

  submitUploadBtn.disabled = true;
  uploadProgressWrap.style.display = "block";

  for (let i = 0; i < files.length; i++) {
    uploadProgressText.textContent = `Uploading photo ${i + 1} of ${files.length}...`;
    uploadProgressFill.style.width = `${Math.round((i / files.length) * 100)}%`;

    try {
      const compressed = await compressImageToBase64(files[i]);
      optimisticPreviews.push(compressed.dataUrl);
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
  uploadProgressText.textContent = "Posted!";

  setTimeout(() => {
    document.getElementById("guestWishInput").value = "";
    queuedUploadFiles = [];
    renderSelectedQueue();
    uploadProgressWrap.style.display = "none";
    uploadProgressFill.style.width = "0%";
    submitUploadBtn.disabled = false;
    closeUploadModal();

    // Immediately prepend new photos so guest sees instant feedback
    if (weddingWallGrid && optimisticPreviews.length) {
      const emptyPlaceholder = weddingWallGrid.querySelector(".wall-loading");
      if (emptyPlaceholder) emptyPlaceholder.remove();

      optimisticPreviews.reverse().forEach((dataUrl) => {
        const card = createWallCardElement({
          candidateUrls: [dataUrl],
          displayGuest: guest,
          displayWish: message,
          dateValue: Date.now(),
          isOptimistic: true
        });
        weddingWallGrid.prepend(card);
        requestAnimationFrame(() => resizeMasonryItem(card));
      });
    }

    showUploadToast(`Shared ${files.length} ${files.length === 1 ? "photo" : "photos"} to Cris & Hans' Wall!`);

    // Sync with Drive after Google finishes indexing the uploaded file
    setTimeout(fetchLiveWall, 3500);
  }, 500);
});

function openLightbox(url, guest, wish, dateTimeText) {
  lockBackgroundScroll();
  lightboxImg.src = url;
  lightboxGuest.textContent = guest;
  if (lightboxWish) lightboxWish.textContent = wish ? `“${wish}”` : "";
  if (lightboxDate) lightboxDate.textContent = `Shared ${dateTimeText}`;
  lightboxModal.classList.add("is-open");
}

async function fetchLiveWall() {
  try {
    const res = await fetch(APPS_SCRIPT_URL);

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      photoCount.textContent = "Permission Check Needed";
      weddingWallGrid.innerHTML = `<div class="wall-loading">Apps Script returned HTML instead of JSON. In Apps Script, verify <strong>Who has access</strong> is set to <strong>Anyone</strong>.</div>`;
      return;
    }

    if (data.error) {
      photoCount.textContent = "Drive Error";
      weddingWallGrid.innerHTML = `<div class="wall-loading">Google Drive Error: ${data.error}</div>`;
      return;
    }

    const photos = Array.isArray(data) ? data : (data.photos || []);
    const onlineCount = (!Array.isArray(data) && typeof data.onlineCount === "number")
      ? Math.max(1, data.onlineCount)
      : 1;

    if (onlineCountText) {
      onlineCountText.textContent = `${onlineCount} Online`;
    }

    photoCount.textContent = `${photos.length} ${photos.length === 1 ? "Memory" : "Memories"}`;

    if (!photos.length) {
      weddingWallGrid.innerHTML = `
        <div class="wall-loading">
          <div class="wall-empty-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
          </div>
          <h3 class="wall-empty-title">No Guest Photos Yet</h3>
          <p class="wall-empty-sub">Tap <strong>+ Upload Your Photos</strong> above to be the very first to share a memory from Cris & Hans’ celebration!</p>
        </div>
      `;
      return;
    }

    weddingWallGrid.innerHTML = "";
    photos.forEach((photo) => {
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

      let displayGuest = (photo.guest || "Wedding Guest").trim();
      let displayWish = (photo.message || "").trim();

      if (!displayWish && displayGuest.includes(" — ")) {
        const parts = displayGuest.split(" — ");
        displayGuest = parts[0].trim();
        displayWish = parts.slice(1).join(" — ").trim();
      }

      const article = createWallCardElement({
        candidateUrls,
        displayGuest,
        displayWish,
        dateValue: photo.date,
        isOptimistic: false
      });

      weddingWallGrid.appendChild(article);
      scrollObserver.observe(article);
    });

    requestAnimationFrame(resizeAllMasonryItems);
  } catch (err) {
    console.error("Live wall sync error:", err);
    photoCount.textContent = "Sync Error";
    weddingWallGrid.innerHTML = `<div class="wall-loading">Connection blocked (${err.message}).</div>`;
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

// Escape key support for Upload, Lightbox, and QR modals
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (uploadModal && uploadModal.classList.contains("is-open")) {
    closeUploadModal();
  }
  if (lightboxModal && lightboxModal.classList.contains("is-open")) {
    lightboxModal.classList.remove("is-open");
    unlockBackgroundScroll();
  }
  const qrModalEl = document.getElementById("qrModal");
  if (qrModalEl && qrModalEl.classList.contains("is-open")) {
    qrModalEl.classList.remove("is-open");
    qrModalEl.setAttribute("aria-hidden", "true");
    unlockBackgroundScroll();
  }
});

async function pingPresence() {
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "ping",
        sid: VISITOR_SESSION_ID
      })
    });
  } catch (err) {}
}

if (refreshWallBtn) {
  refreshWallBtn.addEventListener("click", async () => {
    if (refreshWallBtn.disabled) return;

    const labelSpan = refreshWallBtn.querySelector("span");
    refreshWallBtn.disabled = true;
    refreshWallBtn.classList.add("is-spinning");
    if (labelSpan) labelSpan.textContent = "Refreshing...";

    try {
      await pingPresence();
      await fetchLiveWall();
    } finally {
      setTimeout(() => {
        refreshWallBtn.classList.remove("is-spinning");
        if (labelSpan) labelSpan.textContent = "Refresh";
        refreshWallBtn.disabled = false;
        refreshWallBtn.blur();
      }, 500);
    }
  });
}

(async function initLiveSync() {
  await pingPresence();
  setTimeout(fetchLiveWall, 600);
})();

setInterval(async () => {
  await pingPresence();
  setTimeout(fetchLiveWall, 600);
}, 15000);

// 6. Content Protection (Our Story) + Device-Specific Photo Preview (Live Wall Only)
(function initAntiCopyAndPhotoPreview() {
  document.addEventListener("contextmenu", (e) => {
    // Allow saving/downloading guest photos inside Lightbox, protect engagement album & UI
    if (e.target.closest("#lightboxImg") || e.target.matches("input, textarea")) {
      return;
    }
    e.preventDefault();
  });

  document.addEventListener("copy", (e) => {
    if (!e.target.matches("input, textarea")) {
      e.preventDefault();
    }
  });

  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });

  const holdOverlay = document.createElement("div");
  holdOverlay.className = "photo-hold-preview";
  holdOverlay.setAttribute("aria-hidden", "true");
  holdOverlay.innerHTML = `
    <div class="photo-hold-card">
      <img src="" alt="Photo preview" />
      <div class="photo-hold-caption">
        <strong></strong>
        <span></span>
      </div>
    </div>
  `;
  document.body.appendChild(holdOverlay);

  const holdImg = holdOverlay.querySelector("img");
  const holdTitle = holdOverlay.querySelector("strong");
  const holdSub = holdOverlay.querySelector("span");

  const isDesktopHoverDevice = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let previewTimer = null;
  let isPreviewActive = false;
  let activeDesktopImg = null;

  function showPhotoPreview(imgEl, isDesktop) {
    const wallCard = imgEl.closest(".wall-item");
    if (!wallCard) return;

    holdImg.src = imgEl.currentSrc || imgEl.src;

    const guestEl = wallCard.querySelector(".guest-tag");
    const wishEl = wallCard.querySelector(".guest-wish-preview");
    holdTitle.textContent = guestEl ? guestEl.textContent : "Wedding Guest";
    holdSub.textContent = wishEl
      ? wishEl.textContent
      : (isDesktop ? "Click photo for full view" : "Release to close preview");

    isPreviewActive = true;
    holdOverlay.classList.add("is-visible");
  }

  function hidePhotoPreview() {
    if (previewTimer) {
      clearTimeout(previewTimer);
      previewTimer = null;
    }
    activeDesktopImg = null;
    if (isPreviewActive) {
      isPreviewActive = false;
      holdOverlay.classList.remove("is-visible");
    }
  }

  // Mobile / Touchscreen: Long-Press (320ms) on Live Wall Photos Only
  document.addEventListener("touchstart", (e) => {
    const targetImg = e.target.closest(".wall-item img");
    if (!targetImg) return;

    previewTimer = setTimeout(() => {
      showPhotoPreview(targetImg, false);
    }, 320);
  }, { passive: true });

  document.addEventListener("touchmove", () => {
    if (previewTimer && !isPreviewActive) {
      clearTimeout(previewTimer);
      previewTimer = null;
    }
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    if (isPreviewActive) {
      e.preventDefault();
    }
    hidePhotoPreview();
  });

  document.addEventListener("touchcancel", hidePhotoPreview);

  // Desktop / Mouse Cursor: Hover Over Live Wall Photos Only
  document.addEventListener("mouseover", (e) => {
    if (!isDesktopHoverDevice()) return;
    if (document.body.classList.contains("is-scroll-locked")) return;

    const targetImg = e.target.closest(".wall-item img");
    if (!targetImg || targetImg === activeDesktopImg) return;

    activeDesktopImg = targetImg;
    if (previewTimer) clearTimeout(previewTimer);

    previewTimer = setTimeout(() => {
      if (activeDesktopImg === targetImg) {
        showPhotoPreview(targetImg, true);
      }
    }, 180);
  });

  document.addEventListener("mouseout", (e) => {
    if (!isDesktopHoverDevice() || !activeDesktopImg) return;

    const leftImg = e.target.closest(".wall-item img");
    if (leftImg && leftImg === activeDesktopImg) {
      if (!e.relatedTarget || !leftImg.contains(e.relatedTarget)) {
        hidePhotoPreview();
      }
    }
  });

  window.addEventListener("scroll", () => {
    if (isDesktopHoverDevice() && isPreviewActive) {
      hidePhotoPreview();
    }
  }, { passive: true });

  document.addEventListener("click", () => {
    if (isDesktopHoverDevice() && isPreviewActive) {
      hidePhotoPreview();
    }
  });
})();

// 7. Scan-to-Join Website QR Code Modal & Printable Table Card Generator
(function initWebsiteQrModal() {
  const openQrModalBtn = document.getElementById("openQrModalBtn");
  const closeQrModalBtn = document.getElementById("closeQrModalBtn");
  const qrModal = document.getElementById("qrModal");
  const websiteQrImg = document.getElementById("websiteQrImg");
  const downloadQrCardBtn = document.getElementById("downloadQrCardBtn");
  const copySiteLinkBtn = document.getElementById("copySiteLinkBtn");

  if (!qrModal || !websiteQrImg) return;

  const liveSiteUrl = window.location.origin + window.location.pathname;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=12&color=45130a&bgcolor=ffffff&data=${encodeURIComponent(liveSiteUrl)}`;

  function openQrModal() {
    lockBackgroundScroll();
    websiteQrImg.src = qrApiUrl;
    qrModal.classList.add("is-open");
    qrModal.setAttribute("aria-hidden", "false");
  }

  function closeQrModal() {
    qrModal.classList.remove("is-open");
    qrModal.setAttribute("aria-hidden", "true");
    unlockBackgroundScroll();
  }

  if (openQrModalBtn) openQrModalBtn.addEventListener("click", openQrModal);
  if (closeQrModalBtn) closeQrModalBtn.addEventListener("click", closeQrModal);

  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) closeQrModal();
  });

  if (copySiteLinkBtn) {
    copySiteLinkBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(liveSiteUrl);
        copySiteLinkBtn.textContent = "Link Copied!";
        setTimeout(() => {
          copySiteLinkBtn.textContent = "Copy Website Link";
        }, 2200);
      } catch (err) {
        copySiteLinkBtn.textContent = liveSiteUrl;
      }
    });
  }

  if (downloadQrCardBtn) {
    downloadQrCardBtn.addEventListener("click", async () => {
      downloadQrCardBtn.disabled = true;
      downloadQrCardBtn.textContent = "Generating Print Card...";

      try {
        const res = await fetch(qrApiUrl);
        const blob = await res.blob();
        const qrBitmap = await createImageBitmap(blob);

        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext("2d");

        const grad = ctx.createRadialGradient(540, 675, 100, 540, 675, 820);
        grad.addColorStop(0, "#d4631e");
        grad.addColorStop(0.55, "#8f240e");
        grad.addColorStop(1, "#5c1308");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#ffe2a4";
        ctx.lineWidth = 6;
        ctx.strokeRect(48, 48, 984, 1254);
        ctx.lineWidth = 2;
        ctx.strokeRect(66, 66, 948, 1218);

        ctx.fillStyle = "#fff0cc";
        ctx.textAlign = "center";
        ctx.font = "600 32px Georgia, serif";
        ctx.fillText("LIVE WEDDING WALL", 540, 175);

        ctx.font = "italic 96px Georgia, serif";
        ctx.fillText("Cris & Hans", 540, 290);

        ctx.font = "600 34px Georgia, serif";
        ctx.fillText("12 . 22 . 26  •  VILLA NATURA TAAL", 540, 355);

        const boxX = 270;
        const boxY = 420;
        const boxSize = 540;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxSize, boxSize, 32);
        ctx.fill();
        ctx.strokeStyle = "#e9a33b";
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.drawImage(qrBitmap, boxX + 35, boxY + 35, boxSize - 70, boxSize - 70);

        ctx.fillStyle = "#fff0cc";
        ctx.font = "bold 40px Georgia, serif";
        ctx.fillText("Scan to Share Your Photos", 540, 1060);

        ctx.fillStyle = "rgba(255, 246, 234, 0.9)";
        ctx.font = "28px sans-serif";
        ctx.fillText("Open your phone camera, scan the code,", 540, 1125);
        ctx.fillText("and upload candid moments to our live gallery!", 540, 1168);

        const link = document.createElement("a");
        link.download = "Cris-and-Hans-Wedding-QR.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        window.open(qrApiUrl, "_blank");
      } finally {
        downloadQrCardBtn.disabled = false;
        downloadQrCardBtn.textContent = "Download Print-Ready QR Card";
      }
    });
  }
})();