const categoryPlaceholder = "Select task category";


/**
 * Registers the listeners of the category dropdown.
 */
export function initCategorySelect() {
  document.getElementById("category-trigger").addEventListener("click", toggleCategoryOptions);
  document.getElementById("category-options").addEventListener("click", selectCategory);
  document.querySelector(".category-select").addEventListener("keydown", closeCategoryOnEscape);
  document.addEventListener("click", closeCategoryOnOutsideClick);
}


/**
 * Checks whether the category options are visible.
 * 
 * @returns {boolean} True if the options are open.
 */
function isCategoryOpen() {
  return !document.getElementById("category-options").classList.contains("d-none");
}


/**
 * Opens the category options if they are closed, otherwise closes them.
 */
function toggleCategoryOptions() {
  if (isCategoryOpen()) {
    closeCategoryOptions();
  } else {
    document.getElementById("category-options").classList.remove("d-none");
    document.getElementById("category-trigger").setAttribute("aria-expanded", "true");
  }
}


/**
 * Closes the category options and checks the required field.
 */
function closeCategoryOptions() {
  document.getElementById("category-options").classList.add("d-none");
  document.getElementById("category-trigger").setAttribute("aria-expanded", "false");
  checkCategory();
}


/**
 * Takes the clicked option as category and informs the form.
 * 
 * @param {MouseEvent} event - The click event.
 */
function selectCategory(event) {
  const optionRef = event.target.closest(".category-select-option");
  if (!optionRef) return;
  setFormCategory(optionRef.dataset.value);
  closeCategoryOptions();
  document.getElementById("category-trigger").focus();
  document.getElementById("category").dispatchEvent(new Event("input", { bubbles: true }));
}


/**
 * Closes the open category options when Escape is pressed.
 * 
 * @param {KeyboardEvent} event - The keyboard event.
 */
function closeCategoryOnEscape(event) {
  if (event.key !== "Escape" || !isCategoryOpen()) return;
  event.preventDefault();
  event.stopPropagation();
  closeCategoryOptions();
  document.getElementById("category-trigger").focus();
}


/**
 * Closes the open category options when a click happens outside of them.
 * 
 * @param {MouseEvent} event - The click event.
 */
function closeCategoryOnOutsideClick(event) {
  const selectRef = document.querySelector(".category-select");
  if (selectRef && !selectRef.contains(event.target) && isCategoryOpen()) {
    closeCategoryOptions();
  }
}


/**
 * Sets the category value and the text shown in the dropdown.
 * 
 * @param {string} [value=""] - The category, or an empty string for the placeholder.
 */
export function setFormCategory(value = "") {
  const textRef = document.getElementById("category-selected");
  document.getElementById("category").value = value;
  textRef.textContent = value || categoryPlaceholder;
  textRef.classList.toggle("category-select-placeholder", !value);
}


/**
 * Shows or hides the required error depending on the chosen category.
 */
function checkCategory() {
  const hasError = document.getElementById("category").value === "";
  document.getElementById("category-error").classList.toggle("d-none", !hasError);
  document.querySelector(".category-select-control").classList.toggle("field-error", hasError);
}


/**
 * Resets the category to the placeholder, closes the options and removes the error.
 */
export function resetCategory() {
  setFormCategory("");
  document.getElementById("category-options").classList.add("d-none");
  document.getElementById("category-trigger").setAttribute("aria-expanded", "false");
  document.getElementById("category-error").classList.add("d-none");
  document.querySelector(".category-select-control").classList.remove("field-error");
}
