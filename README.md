# Cris & Hans — Digital Wedding Invitation & Live Wedding Wall

### Live Website
**Visit the Wedding Invitation & Live Photo Wall:**  
👉 **[https://denieziee.github.io/cris-and-hans-wedding/](https://denieziee.github.io/cris-and-hans-wedding/)**[cite: 6]

---

### Architecture & Google Apps Script Backend
This site connects to a **Google Apps Script Web App (`Code.gs`)** to power real-time guest photo uploads, live gallery rendering, and active visitor tracking without requiring a dedicated server:

* **Google Drive Photo Storage (`FOLDER_ID`):** Guest photos uploaded via the site are decoded from Base64, saved directly into a shared Google Drive folder (`1CwUZke7roeZrrI8714my4pslSrSNTOYZ`), and automatically set to *Anyone with the link can view* so thumbnails load immediately on the live wall.
* **Guest Name & Wish Metadata:** Each uploaded file stores the guest's name and optional wedding wish inside the Google Drive file description (`Guest Name — Wedding Wish`), which `doGet` parses and returns sorted newest-first.
* **Real-Time Online Guest Counter:** Uses `PropertiesService` and `LockService` (`trackAndCountOnlineGuests`) to track active visitor session IDs within a 65-second rolling window via lightweight `ping` heartbeats.

---

### Google Apps Script (`Code.gs`)

```javascript
const FOLDER_ID = "1CwUZke7roeZrrI8714my4pslSrSNTOYZ";

// Atomic tracker for active visitors within the last 65 seconds
function trackAndCountOnlineGuests(sessionId) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
  } catch (e) {
    // Proceed even if lock times out
  }

  try {
    const props = PropertiesService.getScriptProperties();
    const listKey = "active_guest_sessions_v2";
    const now = Date.now();
    const activeWindowMs = 65000;

    let sessions = {};
    try {
      const raw = props.getProperty(listKey);
      if (raw) sessions = JSON.parse(raw);
    } catch (err) {
      sessions = {};
    }

    if (sessionId) {
      sessions[sessionId] = now;
    }

    let onlineCount = 0;
    const cleaned = {};
    Object.keys(sessions).forEach((id) => {
      if (now - sessions[id] <= activeWindowMs) {
        cleaned[id] = sessions[id];
        onlineCount++;
      }
    });

    props.setProperty(listKey, JSON.stringify(cleaned));
    return Math.max(1, onlineCount);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

// 1. Serves the list of all uploaded photos + live online guest count
function doGet(e) {
  try {
    const sessionId = (e && e.parameter && e.parameter.sid) ? String(e.parameter.sid) : "";
    const onlineCount = trackAndCountOnlineGuests(sessionId);

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    const photos = [];

    while (files.hasNext()) {
      const file = files.next();
      const mime = file.getMimeType();
      if (mime && mime.startsWith("image/")) {
        const fileId = file.getId();
        photos.push({
          id: fileId,
          url: "[https://drive.google.com/thumbnail?id=](https://drive.google.com/thumbnail?id=)" + fileId + "&sz=w1000",
          fallbackUrl: "[https://lh3.googleusercontent.com/d/](https://lh3.googleusercontent.com/d/)" + fileId + "=w1000",
          guest: file.getDescription() || "Wedding Guest",
          date: file.getDateCreated().toISOString()
        });
      }
    }

    // Sort newest first
    photos.sort((a, b) => new Date(b.date) - new Date(a.date));

    return ContentService.createTextOutput(JSON.stringify({
      photos: photos,
      onlineCount: onlineCount
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      photos: [],
      onlineCount: 1,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. Handles both live visitor heartbeat pings and new photo uploads
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Lightweight presence ping from active guests
    if (data.action === "ping") {
      const count = trackAndCountOnlineGuests(data.sid || "");
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        onlineCount: count
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Save uploaded photo to Google Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const decoded = Utilities.base64Decode(data.base64);
    const blob = Utilities.newBlob(decoded, data.mimeType, data.filename);

    const file = folder.createFile(blob);
    file.setDescription(data.guest + (data.message ? " — " + data.message : ""));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      url: "[https://drive.google.com/thumbnail?id=](https://drive.google.com/thumbnail?id=)" + fileId + "&sz=w1000"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}