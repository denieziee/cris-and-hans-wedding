// Connected Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdT01IhRBl3_WnvprzQj_x0Kr7RZbm568SPgf4hJHIFKT0qyiaT9uujwsBDe-nPs4N/exec";

// 1. Top-Right Small Envelope Icon -> Opens Scrollable Wedding Invitation Modal
(function initInvitationModal() {
  const inviteModal = document.getElementById("inviteModal");
  const openInviteBtn = document.getElementById("openInviteBtn");
  const closeInviteModalBtn = document.getElementById("closeInviteModalBtn");
  const inviteScrollBody = document.getElementById("inviteScrollBody");

  function openInvitation() {
    inviteModal.classList.add("is-open");
    inviteModal.setAttribute("aria-hidden", "false");
    if (inviteScrollBody) inviteScrollBody.scrollTop = 0;
  }

  function closeInvitation() {
    inviteModal.classList.remove("is-open");
    inviteModal.setAttribute("aria-hidden", "true");
  }

  if (openInviteBtn) openInviteBtn.addEventListener("click", openInvitation);
  if (closeInviteModalBtn) closeInviteModalBtn.addEventListener("click", closeInvitation);

  if (inviteModal) {
    inviteModal.addEventListener("click", (e) => {
      if (e.target === inviteModal) closeInvitation();
    });
  }

  // Live Countdown to December 22, 2026 at 4:00 PM (Philippine Time UTC+8)
  const targetDate = new Date("2026-12-22T16:00:00+08:00").getTime();

  function updateCountdown() {
    const cdDays = document.getElementById("cdDays");
    if (!cdDays) return;

    const diff = Math.max(0, targetDate - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    cdDays.textContent = String(days).padStart(2, "0");
    document.getElementById("cdHours").textContent = String(hours).padStart(2, "0");
    document.getElementById("cdMins").textContent = String(mins).padStart(2, "0");
    document.getElementById("cdSecs").textContent = String(secs).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();

// 2. Memory Album Automatic Crossfade Slideshow + Mobile Swipe
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

// 3. Live Wedding Wall & Photo Uploader
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
    uploadModal.classList.add("is-open");
    uploadModal.setAttribute("aria-hidden", "false");
  });
});

closeUploadModalBtn.addEventListener("click", () => {
  uploadModal.classList.remove("is-open");
  uploadModal.setAttribute("aria-hidden", "true");
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

closeLightboxBtn.addEventListener("click", () => lightboxModal.classList.remove("is-open"));
lightboxModal.addEventListener("click", (e) => {
  if (e.target === lightboxModal) lightboxModal.classList.remove("is-open");
});

refreshWallBtn.addEventListener("click", fetchLiveWall);

fetchLiveWall();
setInterval(fetchLiveWall, 15000);