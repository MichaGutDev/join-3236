import { returnSubtaskHTML, returnSubtaskEditHTML } from "./subtask-templates.js";
const subtasks = [];


/**
 * Registers event listeners for subtask interactions.
 */
export function initSubtaskListeners() {
  const addSubtaskBtnRef = document.getElementById("add-subtask-btn");
  const subTaskInputRef = document.getElementById("new-subtask");
  const subtaskListRef = document.getElementById("subtask-list");
  const clearSubtaskButtonRef = document.getElementById("clear-subtask-btn");

  subTaskInputRef.addEventListener("input", toggleSubtaskInputActions);
  clearSubtaskButtonRef.addEventListener("click", clearSubtaskInput);
  addSubtaskBtnRef.addEventListener("click", addSubtask);
  subTaskInputRef.addEventListener("keydown", handleSubtaskKeydown);
  subtaskListRef.addEventListener("click", handleSubtaskClick);
  subtaskListRef.addEventListener("dblclick", doubleClickEdit);
  subtaskListRef.addEventListener("keydown", handleSubtaskEditKeydown);
}


/**
 * Renders the current subtasks in the task form.
 */
export function renderSubtasks() {
  const subTaskListRef = document.getElementById("subtask-list");
  subTaskListRef.innerHTML = subtasks
  .map((subtask, index) => returnSubtaskHTML(subtask, index))
  .join("");
}


/**
 * Replaces the current subtasks with copies of the provided subtasks.
 * @param {{description: string, completion: boolean}[]} [taskSubtasks=[]] - Subtasks to load.
 */
export function setFormSubtasks(taskSubtasks = []) {
  clearSubtasks();
  taskSubtasks.forEach(subtask => {
    subtasks.push({ ...subtask });
  });
}


/**
 * Clears the subtask state, list, and input field.
 */
export function resetSubtasks() {
    clearSubtasks();
    renderSubtasks();
    clearSubtaskInput();
}


/**
 * Returns a shallow copy of the current subtasks.
 * @returns {{description: string, completion: boolean}[]}
 */
export function getSubtasks() {
  return [...subtasks];
}


/**
 * Adds a new subtask from the input and updates the display.
 */
function addSubtask() {
  const subTaskInputRef = document.getElementById("new-subtask");
  const description = subTaskInputRef.value.trim();

  if (description === "") return;

  subtasks.push({
    description,
    completion: false
  });

  renderSubtasks();
  clearSubtaskInput();
}


/**
 * Toggles input action buttons based on the entered text.
 * @param {Event} event - The input event.
 */
function toggleSubtaskInputActions(event) {
  const actionsRef = document.querySelector(".subtask-input-actions");
  const hasValue = event.target.value.trim() !== "";
  actionsRef.classList.toggle("d-none", !hasValue);
}


/**
 * Clears the subtask input and hides its action buttons.
 */
function clearSubtaskInput() {
  const subTaskInputRef = document.getElementById("new-subtask");
  const actionsRef = document.querySelector(".subtask-input-actions");
  subTaskInputRef.value = "";
  actionsRef.classList.add("d-none");
}


/**
 * Removes all subtasks from the internal state.
 */
function clearSubtasks() {
    subtasks.length = 0;
}


/**
 * Confirms a subtask edit when Enter is pressed.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleSubtaskEditKeydown(event) {
  const inputRef = event.target.closest(".subtask-edit-input");
  if (!inputRef || event.key !== "Enter") return;

  event.preventDefault();

  const subtaskElementRef = inputRef.closest(".subtask-item");
  const index = Number(subtaskElementRef.dataset.index);

  confirmSubtaskEdit(index, subtaskElementRef);
}


/**
 * Removes a subtask by its index and updates the display.
 * @param {number} index - Index of the subtask to remove.
 */
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}


/**
 * Adds a subtask when Enter is pressed.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleSubtaskKeydown(event) {
  if (event.key !== "Enter") return;

  event.preventDefault();
  addSubtask();
}


/**
 * Opens the subtask editor on double-click.
 * @param {MouseEvent} event - The double-click event.
 */
function doubleClickEdit(event) {
  if (event.target.closest(".subtask-edit-input")) return;

  const subtaskElementRef = event.target.closest(".subtask-item");
  if (!subtaskElementRef) return;

  const index = Number(subtaskElementRef.dataset.index);
  editSubtask(index);
}


/**
 * Handles edit, delete, and confirm actions on subtask items.
 * @param {MouseEvent} event - The click event.
 */
function handleSubtaskClick(event) {
  const subtaskElementRef = event.target.closest(".subtask-item");
  if (!subtaskElementRef) return;

  const index = Number(subtaskElementRef.dataset.index);
  const editButtonRef = event.target.closest(".subtask-edit-btn");
  const deleteButtonRef = event.target.closest(".subtask-delete-btn, .subtask-edit-delete-btn");
  const confirmEditButtonRef = event.target.closest(".subtask-edit-confirm-btn");

  if (editButtonRef) editSubtask(index);
  else if (deleteButtonRef) deleteSubtask(index);
  else if (confirmEditButtonRef) confirmSubtaskEdit(index, subtaskElementRef);
}


/**
 * Saves a subtask's edited description and updates the display.
 * @param {number} index - Index of the subtask to update.
 * @param {HTMLElement} subtaskElementRef - The subtask element being edited.
 */
function confirmSubtaskEdit(index, subtaskElementRef) {
  const inputRef = subtaskElementRef.querySelector(".subtask-edit-input");
  const description = inputRef.value.trim();
  if (description === "") return;
  subtasks[index].description = description;
  renderSubtasks();
}


/**
 * Replaces a subtask's display with its editable template.
 * @param {number} index - Index of the subtask to edit.
 */
function editSubtask(index) {
  const subtaskListRef = document.getElementById("subtask-list");
  const subtaskElement = subtaskListRef.querySelector(`[data-index="${index}"]`);
  const subtask = subtasks[index];
  subtaskElement.innerHTML = returnSubtaskEditHTML(subtask, index);
}