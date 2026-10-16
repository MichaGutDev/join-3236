import { saveTask, listenToContacts } from "./db.js";
import { filterContacts } from "./search.js";
import { returnContactHTML2, returnAssignedToHTML } from "./templates.js";
import { showToast } from "./toast.js";
import { getSubtasks, initSubtaskListeners, resetSubtasks, renderSubtasks } from "./subtasks.js";

let formRef;
let createTaskBtnRef;
let contacts = [];
const requiredFieldIds = ["title", "dueDate", "category"];
let selectedContactIds = [];
let unsubscribeFromContacts = null;


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
  if (isOpen) {
    searchInputRef.focus();
  } else {
    searchInputRef.value = "";
    updateAssignedToContacts();
    arrowRef.focus();
  }

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
      return returnContactHTML2(contact, isSelected);
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
  selectedContactsRef.innerHTML = returnAssignedToHTML(
    selectedContactIds,
    contacts
  );
}


/**
 * Initializes the task form, its listeners, validation, and subtasks.
 * @param {string} [taskStatus="To Do"] - Initial task status.
 * @param {string|null} [editingTaskId=null] - ID of the task being edited.
 * @param {Function|null} [onSave=null] - Callback after a successful save.
 */
export function initTaskForm(taskStatus = "To Do", editingTaskId = null, onSave = null) {
  formRef = document.querySelector("#task-form");
  createTaskBtnRef = document.getElementById("create-task-btn");
  initContacts();
  initContactListener();
  setMinimumDueDate();
  initTaskListeners(taskStatus, editingTaskId, onSave);
  handleFormValidation();
  renderSubtasks();
}


/**
 * Registers the task form's event listeners.
 * @param {string} taskStatus - Initial task status.
 * @param {string|null} editingTaskId - ID of the task being edited.
 * @param {(() => void)|null} onSave - Callback after a successful save.
 */
function initTaskListeners(taskStatus, editingTaskId, onSave) {
  initSubtaskListeners();
  initRequiredFieldListeners();
  initAssignedToListeners();
  formRef.addEventListener("reset", handleFormReset);
  formRef.addEventListener("submit", (event) => {
    event.preventDefault();
    getValues(taskStatus, editingTaskId, onSave);
  });
  formRef.addEventListener("input", handleFormValidation);
}


/**
 * Registers blur listeners for all required fields.
 */
function initRequiredFieldListeners() {
  requiredFieldIds.forEach(id => {
    formRef.querySelector(`#${id}`).addEventListener("blur", handleRequired);
  });
}


/**
 * Sets the minimum due date to the current date.
 */
function setMinimumDueDate() {
  const dueDateRef = document.getElementById("dueDate");
  dueDateRef.min = getCurrentDate();
}


/**
 * Validates and saves the task, then resets the form on success.
 * @param {string} status - Task status.
 * @param {string|null} editingTaskId - ID of the task being edited.
 * @param {(() => void)|null} onSave - Callback after a successful save.
 * @returns {Promise<void>}
 */
async function getValues(status, editingTaskId, onSave) {
  const formData = new FormData(formRef);
  const task = createTaskObject(formData, status);
  if (!validateForm(getRequiredFields())) return;
  try {
    await saveTask(task, editingTaskId);
    formRef.reset();
    if (onSave) {
      onSave();
    }
  } catch (error) {
    console.error(error);
    showToast("Task could not be saved. Please try again.");
  } finally {
    handleFormValidation();
  }
}


/**
 * Creates a task object from form data and the current selections.
 * @param {FormData} formData - Task form data.
 * @param {string} status - Task status.
 * @returns {{title: string, description: string, dueDate: string, priority: string, category: string, assignedTo: string[], status: string, subtasks: {description: string, completion: boolean}[]}}
 */
function createTaskObject(formData, status) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    category: formData.get("category"),
    assignedTo: [...selectedContactIds],
    status,
    subtasks: getSubtasks(),
  };
}


/**
 * Resets the selected contacts, subtasks, and validation state.
 */
function handleFormReset() {
  selectedContactIds = [];
  resetSubtasks();
  updateAssignedToContacts();
  renderSelectedContacts();
  resetRequiredFields();
}


/**
 * Clears validation errors from all required fields.
 */
function resetRequiredFields() {
  requiredFieldIds.forEach(id => {
    document.getElementById(id).classList.remove("field-error");
    document.getElementById(`${id}-error`).classList.add("d-none");
  });
}


/**
 * Retrieves the current values of all required form fields.
 * @returns {{title: string, dueDate: string, category: string}}
 */
function getRequiredFields() {
  const formData = new FormData(formRef);
  return {
    title: formData.get("title").trim(),
    dueDate: formData.get("dueDate"),
    category: formData.get("category"),
  };
}


/**
 * Checks whether all required fields have values.
 * @param {{title: string, dueDate: string, category: string}} requiredFields - Fields to validate.
 * @returns {boolean} Whether all required fields are filled.
 */
function validateForm(requiredFields) {
  return Object.values(requiredFields).every(value => value !== "");
}


/**
 * Updates the validation state of a required field on blur.
 * @param {FocusEvent} event - The blur event.
 */
function handleRequired(event) {
  const fieldRef = event.target;
  const inputValue = fieldRef.value.trim();
  const errorRef = document.getElementById(`${fieldRef.id}-error`);

  errorRef.classList.toggle("d-none", inputValue !== "");
  fieldRef.classList.toggle("field-error", inputValue === "");
}


/**
 * Enables or disables the submit button based on form validity.
 */
function handleFormValidation() {
  const requiredFields = getRequiredFields();
  createTaskBtnRef.disabled = !validateForm(requiredFields);
}


/**
 * Returns the current local date in YYYY-MM-DD format.
 * @returns {string} The formatted date.
 */
function getCurrentDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}