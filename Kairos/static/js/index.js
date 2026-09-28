"use strict";

const introVideo = document.querySelector("#intro-video");
const playIntroButton = document.querySelector("#play-intro-video");
const introVideoStatus = document.querySelector("#intro-video-status");

if (introVideo && playIntroButton && introVideoStatus) {
  introVideo.controls = false;
  playIntroButton.hidden = false;
  playIntroButton.addEventListener("click", async () => {
    // Defer the media URL until an explicit play request to avoid background downloads.
    introVideo.src = introVideo.dataset.src;
    introVideo.controls = true;
    playIntroButton.hidden = true;
    introVideo.focus();
    try {
      await introVideo.play();
    } catch (error) {
      introVideoStatus.textContent = "Playback did not start. Use the video controls or download the video.";
    }
  }, { once: true });
  introVideo.addEventListener("playing", () => {
    introVideoStatus.textContent = "";
  });
  introVideo.addEventListener("error", () => {
    introVideoStatus.textContent = "Unable to load the video. Please reload the page or use the download link.";
  });
}

const copyButton = document.querySelector("#copy-bibtex");
const citation = document.querySelector("#bibtex");
const copyStatus = document.querySelector("#copy-status");

if (copyButton && citation && copyStatus) {
  let resetTimer;
  copyButton.addEventListener("click", async () => {
    clearTimeout(resetTimer);
    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error("Clipboard is unavailable");
      }
      await navigator.clipboard.writeText(citation.textContent.trim());
      copyButton.textContent = "Copied!";
      copyStatus.textContent = "Citation copied to clipboard.";
    } catch (error) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
      copyButton.textContent = "Copy";
      copyStatus.textContent = "Automatic copying is unavailable. The citation is selected; copy it using your browser or keyboard.";
    }
    resetTimer = setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 2500);
  });
}

async function loadDownloadSnapshot() {
  const totalElement = document.querySelector("#download-total");
  const statusElement = document.querySelector("#download-status");
  if (!totalElement || !statusElement) return;

  const models = [
    "mldi-lab/Kairos_50m",
    "mldi-lab/Kairos_23m",
    "mldi-lab/Kairos_10m",
  ];

  try {
    const response = await fetch("./static/data/downloads.json", {
      cache: "no-cache",
    });
    if (!response.ok) throw new Error("Snapshot unavailable");
    const snapshot = await response.json();
    if (
      snapshot.metric !== "downloadsAllTime" ||
      !Array.isArray(snapshot.models) ||
      snapshot.models.length !== models.length ||
      typeof snapshot.updated_at !== "string" ||
      !Number.isFinite(Date.parse(snapshot.updated_at))
    ) {
      throw new Error("Incomplete snapshot");
    }

    const reportedTotal = snapshot.source === "project-maintainer";
    const counts = models.map(modelId => {
      const entries = snapshot.models.filter(model => model.id === modelId);
      if (entries.length !== 1) throw new Error("Invalid model coverage");
      const count = entries[0].downloads;
      if (reportedTotal && count === null) return null;
      if (!Number.isSafeInteger(count) || count < 0) {
        throw new Error("Missing cumulative count");
      }
      return count;
    });
    const total = reportedTotal
      ? snapshot.total
      : counts.reduce((sum, count) => sum + count, 0);
    if (!Number.isSafeInteger(total) || total < 0) throw new Error("Invalid total");
    if (reportedTotal && !counts.every(count => count === null)) {
      throw new Error("Reported total must not include unverified model counts");
    }

    totalElement.textContent = total.toLocaleString("en-US");
    const date = new Date(snapshot.updated_at).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
    });
    statusElement.textContent = `As of ${date}`;
  } catch (error) {
    // Keep the dated static snapshot visible when a refresh is unavailable.
  }
}

loadDownloadSnapshot();
