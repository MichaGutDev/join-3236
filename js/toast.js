/**
 * Shows the toast with a message for a short moment.
 *
 * @param {string} message - The text to display in the toast.
 * @param {Function} [onDone] - Called after the toast has been hidden.
 * @param {string} [iconSrc] - Path of an icon shown after the text.
 */
export function showToast(message, onDone, iconSrc) {
  const toastRef = document.getElementById("toast");

  toastRef.textContent = message;
  if (iconSrc) toastRef.append(createToastIcon(iconSrc));
  toastRef.style.display = "flex";

  setTimeout(() => {
    toastRef.style.display = "none";
    if (onDone) onDone();
  }, 1500);
}


/**
 * Creates the icon element for the toast.
 *
 * @param {string} iconSrc - Path of the icon.
 * @returns {HTMLImageElement} The icon element.
 */
function createToastIcon(iconSrc) {
  const iconRef = document.createElement("img");
  iconRef.src = iconSrc;
  iconRef.alt = "";
  return iconRef;
}