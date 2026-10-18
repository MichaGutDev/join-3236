import { saveTask } from "./db.js";
import { showToast } from "./toast.js";
import { getSubtasks, initSubtaskListeners, resetSubtasks, renderSubtasks } from "./subtasks.js";
import { initAssignedTo, getSelectedContactIds, resetAssignedTo } from "./assigned-to.js";
import { initCategorySelect, resetCategory } from "./category-select.js";

let formRef;
let createTaskBtnRef;
const requiredFieldIds = ["title", "dueDate", "category"];
let isSaving = false;


/**
 * Initializes the task form, its listeners, validation, and subtasks.
 *
 * @param {string} [taskStatus="To Do"] - Initial task status.
 * @param {string|null} [editingTaskId=null] - ID of the task being edited.
 * @param {Function|null} [onSave=null] - Callback after a successful save.
 */
export function initTaskForm(taskStatus = "To Do", editingTaskId = null, onSave = null) {
  formRef = document.querySelector("#task-form");
  createTaskBtnRef = document.getElementById("create-task-btn");
  initAssignedTo();
  initCategorySelect();
  setMinimumDueDate();
  initTaskListeners(taskStatus, editingTaskId, onSave);
  handleFormValidation();
  renderSubtasks();
}


/**
 * Registers the task form's event listeners.
 *
 * @param {string} taskStatus - Initial task status.
 * @param {string|null} editingTaskId - ID of the task being edited.
 * @param {(() => void)|null} onSave - Callback after a successful save.
 */
function initTaskListeners(taskStatus, editingTaskId, onSave) {
  initSubtaskListeners();
  initRequiredFieldListeners();
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
 * Validates the form and initiates the task saving process.
 *
 * @param {string} status - Task status.
 * @param {string|null} editingTaskId - ID of the task being edited.
 * @param {(() => void)|null} onSave - Callback after a successful save.
 * @returns {Promise<void>}
 */
async function getValues(status, editingTaskId, onSave) {
    if (isSaving || !validateForm(getRequiredFields())) return;

    const formData = new FormData(formRef);
    const task = createTaskObject(formData, status);

    isSaving = true;
    handleFormValidation();

    await saveFormTask(task, editingTaskId, onSave);
}


/**
 * Saves a task and restores the form state after completion.
 *
 * @param {Object} task - Task data to save.
 * @param {string|null} editingTaskId - ID of the task being edited.
 * @param {(() => void)|null} onSave - Callback after a successful save.
 * @returns {Promise<void>}
 */
async function saveFormTask(task, editingTaskId, onSave) {
    try {
        await saveTask(task, editingTaskId);
        handleSavedTask(onSave);
    } catch (error) {
        console.error(error);
        showToast("Task could not be saved. Please try again.");
    } finally {
        isSaving = false;
        handleFormValidation();
    }
}


/**
 * Resets the form after saving and calls the callback.
 *
 * @param {(() => void)|null} onSave - Callback after a successful save.
 */
function handleSavedTask(onSave) {
  formRef.reset();
  if (onSave) {
    onSave();
  }
}


/**
 * Creates a task object from form data and the current selections.
 *
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
    assignedTo: getSelectedContactIds(),
    status,
    subtasks: getSubtasks(),
  };
}


/**
 * Resets the selected contacts, subtasks, and validation state.
 */
function handleFormReset() {
  resetAssignedTo();
  resetCategory();
  resetSubtasks();
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
 *
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
 *
 * @param {{title: string, dueDate: string, category: string}} requiredFields - Fields to validate.
 * @returns {boolean} Whether all required fields are filled.
 */
function validateForm(requiredFields) {
  return Object.values(requiredFields).every(value => value !== "");
}


/**
 * Updates the validation state of a required field on blur.
 *
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
  createTaskBtnRef.disabled = isSaving || !validateForm(requiredFields);
}


/**
 * Returns the current local date in YYYY-MM-DD format.
 *
 * @returns {string} The formatted date.
 */
function getCurrentDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}