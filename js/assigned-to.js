import { listenToContacts } from "./db.js";
import { filterContacts } from "./search.js";
import { returnSelectableContactHTML, returnAssignedContactsHTML } from "./contact-templates.js";

let contacts = [];
let selectedContactIds = [];
let unsubscribeFromContacts = null;
let isOutsideClickRegistered = false;


/**
 * Toggles a contact's selection and updates the selected contacts display.
 * @param {string} contactId - ID of the contact to toggle.
 */
function toggleAssignedContact(contactId) {
  if (selectedContactIds.includes(contactId)) {
    selectedContactIds = selectedContactIds.filter(id => id !== contactId);
  } else {
    selectedContactIds.push(contactId);
  }
  renderSelectedContacts();
}


/**
 * Sets the assigned contacts and updates their display.
 * @param {string[]} [assignedTo=[]] - IDs of assigned contacts.
 */
export function setFormAssignedTo(assignedTo = []) {
  selectedContactIds = [...assignedTo];
  renderAssignedToContacts();
  renderSelectedContacts();
}


/**
 * Initializes the Firebase contacts listener and updates the form on changes.
 */
function initContacts() {
  if (unsubscribeFromContacts) return;
  unsubscribeFromContacts = listenToContacts((updatedContacts) => {
    contacts = updatedContacts;
    if (!document.getElementById("task-form")) return;
    updateAssignedToContacts();
    renderSelectedContacts();
  });
}


/**
 * Registers event listeners for the assigned contacts dropdown.
 */
function initAssignedToListeners() {
  const assignedToButtonRef = document.getElementById("assigned-to-trigger");
  const assignedToSearchRef = document.getElementById("search-assigned-to");
  const assignedToDropdownArrowRef = document.getElementById("assigned-to-arrow");
  const assignedToRef = document.querySelector(".assigned-to");
  assignedToButtonRef.addEventListener("click", toggleAssignedToDropdown);
  assignedToDropdownArrowRef.addEventListener("click", toggleAssignedToDropdown);
  assignedToSearchRef.addEventListener("input", updateAssignedToContacts);
  assignedToRef.addEventListener("keydown", handleAssignedToKeydown);
}


/**
 * Closes the assigned contacts dropdown when Escape is pressed.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleAssignedToKeydown(event) {
  const dropdownRef = document.getElementById("assigned-to-wrapper");
  const isOpen = !dropdownRef.classList.contains("d-none");
  if (event.key === "Escape" && isOpen) {
    event.preventDefault();
    event.stopPropagation();
    toggleAssignedToDropdown();
  }
}


/**
 * Filters contacts by the search input and updates the dropdown.
 */
function updateAssignedToContacts() {
  const searchTerm = document.getElementById("search-assigned-to").value;
  const filteredContacts = filterContacts(contacts, searchTerm);
  renderAssignedToContacts(filteredContacts);
}


/**
 * Toggles the contacts dropdown and updates focus and accessibility attributes.
 */
function toggleAssignedToDropdown() {
  const triggerRef = document.getElementById("assigned-to-trigger");
  const searchInputRef = document.getElementById("search-assigned-to");
  const dropdownRef = document.getElementById("assigned-to-wrapper");
  const arrowRef = document.getElementById("assigned-to-arrow");

  dropdownRef.classList.toggle("d-none");
  triggerRef.classList.toggle("d-none");
  searchInputRef.classList.toggle("d-none");

  const isOpen = !dropdownRef.classList.contains("d-none");
  handleAssignedToFocus(searchInputRef, arrowRef, isOpen);  
  updateAssignedToAria(triggerRef, arrowRef, isOpen);
}


/**
 * Manages input focus and resets the search when closing the dropdown.
 * @param {HTMLInputElement} searchInputRef - Contact search input.
 * @param {HTMLElement} arrowRef - Dropdown arrow button.
 * @param {boolean} isOpen - Whether the dropdown is open.
 */
function handleAssignedToFocus(searchInputRef, arrowRef, isOpen) {
  if (isOpen) {
    searchInputRef.focus();
  } else {
    searchInputRef.value = "";
    updateAssignedToContacts();
    arrowRef.focus();
  }
}


/**
 * Updates accessibility attributes based on the dropdown state.
 * @param {HTMLElement} triggerRef - Dropdown trigger button.
 * @param {HTMLElement} arrowRef - Dropdown arrow button.
 * @param {boolean} isOpen - Whether the dropdown is open.
 */
function updateAssignedToAria(triggerRef, arrowRef, isOpen) {
  triggerRef.setAttribute("aria-expanded", String(isOpen));
  arrowRef.setAttribute("aria-expanded", String(isOpen));
  arrowRef.setAttribute("aria-label", isOpen ? "Hide contacts" : "Show contacts");
}


/**
 * Renders contacts in the dropdown with their selection states.
 * @param {Object[]} [contactList=contacts] - Contacts to display.
 */
function renderAssignedToContacts(contactList = contacts) {
  const assignedToRef = document.getElementById("assigned-to-dropdown");
  assignedToRef.innerHTML = contactList
    .map(contact => {
      const isSelected = selectedContactIds.includes(contact.id);
      return returnSelectableContactHTML(contact, isSelected);
    })
    .join("");
}


/**
 * Handles checkbox changes to toggle contact selection.
 * @param {Event} event - The change event.
 */
function handleContactSelection(event) {
  if (!event.target.matches(".assigned-contact-checkbox")) return;
  const contactId = event.target.value;
  toggleAssignedContact(contactId);
}


/**
 * Registers the change listener for contact selection.
 */
function initContactListener() {
  const assignedToDropDownRef = document.getElementById("assigned-to-dropdown");
  assignedToDropDownRef.addEventListener("change", handleContactSelection)
}


/**
 * Renders the currently selected contacts.
 */
function renderSelectedContacts() {
  const selectedContactsRef = document.getElementById("selected-contacts");
  selectedContactsRef.innerHTML = returnAssignedContactsHTML(
    selectedContactIds,
    contacts
  );
}


/**
 * Initializes the contacts listener and the listeners of the assigned contacts dropdown.
 */
export function initAssignedTo() {
  initContacts();
  initContactListener();
  initAssignedToListeners();
  initOutsideClickClose();
  document.querySelector(".assigned-to").addEventListener("keydown", moveAssignedToFocus);
}


/**
 * Returns a copy of the selected contact IDs.
 * @returns {string[]} IDs of the selected contacts.
 */
export function getSelectedContactIds() {
  return [...selectedContactIds];
}


/**
 * Clears the selected contacts and updates the dropdown and the selected contacts display.
 */
export function resetAssignedTo() {
  selectedContactIds = [];
  updateAssignedToContacts();
  renderSelectedContacts();
}


/**
 * Registers the document click listener once to close the dropdown on outside clicks.
 */
function initOutsideClickClose() {
  if (isOutsideClickRegistered) return;
  isOutsideClickRegistered = true;
  document.addEventListener("click", closeOnOutsideClick);
}


/**
 * Closes the open contacts dropdown when a click happens outside of it.
 * @param {MouseEvent} event - The click event.
 */
function closeOnOutsideClick(event) {
  const assignedToRef = document.querySelector(".assigned-to");
  const dropdownRef = document.getElementById("assigned-to-wrapper");
  if (!assignedToRef || assignedToRef.contains(event.target)) return;
  if (!dropdownRef.classList.contains("d-none")) {
    toggleAssignedToDropdown();
  }
}


/**
 * Moves the focus to the next or previous contact with the arrow keys.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function moveAssignedToFocus(event) {
  const contactRef = event.target.closest(".assigned-contact");
  let targetRef = null;
  if (event.key === "ArrowDown") targetRef = contactRef ? contactRef.nextElementSibling : document.querySelector(".assigned-contact");
  if (event.key === "ArrowUp" && contactRef) targetRef = contactRef.previousElementSibling;
  if (!targetRef) return;
  event.preventDefault();
  targetRef.querySelector("input").focus();
}
