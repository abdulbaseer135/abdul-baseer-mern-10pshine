// Sonar: shared native <dialog> helpers (jsdom fallback in tests)
export const openDialog = (dialog) => {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
};

export const closeDialog = (dialog) => {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
};
