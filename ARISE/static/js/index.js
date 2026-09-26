"use strict";

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
