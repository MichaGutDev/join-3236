export function showToast(message) {
  const toastRef = document.getElementById("toast");

  toastRef.textContent = message;
  toastRef.style.display = "flex";

  setTimeout(() => {
    toastRef.style.display = "none";
  }, 1500);
}