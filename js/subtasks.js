import { returnSubtaskHTML, returnSubtaskEditHTML } from "./templates.js";
const subtasks = [];


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


export function renderSubtasks() {
  const subTaskListRef = document.getElementById("subtask-list");
  subTaskListRef.innerHTML = subtasks
  .map((subtask, index) => returnSubtaskHTML(subtask, index))
  .join("");
}

export function setFormSubtasks(taskSubtasks = []) {
  clearSubtasks();
  taskSubtasks.forEach(subtask => {
    subtasks.push({ ...subtask });
  });
}


export function resetSubtasks() {
    clearSubtasks();
    renderSubtasks();
    clearSubtaskInput();
}


export function getSubtasks() {
  return [...subtasks];
}


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


function toggleSubtaskInputActions(event) {
  const actionsRef = document.querySelector(".subtask-input-actions");
  const hasValue = event.target.value.trim() !== "";
  actionsRef.classList.toggle("d-none", !hasValue);
}


function clearSubtaskInput() {
  const subTaskInputRef = document.getElementById("new-subtask");
  const actionsRef = document.querySelector(".subtask-input-actions");
  subTaskInputRef.value = "";
  actionsRef.classList.add("d-none");
}


function clearSubtasks() {
    subtasks.length = 0;
}


function handleSubtaskEditKeydown(event) {
  const inputRef = event.target.closest(".subtask-edit-input");
  if (!inputRef || event.key !== "Enter") return;

  event.preventDefault();

  const subtaskElementRef = inputRef.closest(".subtask-item");
  const index = Number(subtaskElementRef.dataset.index);

  confirmSubtaskEdit(index, subtaskElementRef);
}


function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

function handleSubtaskKeydown(event) {
  if (event.key !== "Enter") return;

  event.preventDefault();
  addSubtask();
}


function doubleClickEdit(event) {
  if (event.target.closest(".subtask-edit-input")) return;

  const subtaskElementRef = event.target.closest(".subtask-item");
  if (!subtaskElementRef) return;

  const index = Number(subtaskElementRef.dataset.index);
  editSubtask(index);
}


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


function confirmSubtaskEdit(index, subtaskElementRef) {
  const inputRef = subtaskElementRef.querySelector(".subtask-edit-input");
  const description = inputRef.value.trim();
  if (description === "") return;
  subtasks[index].description = description;
  renderSubtasks();
}


function editSubtask(index) {
  const subtaskListRef = document.getElementById("subtask-list");
  const subtaskElement = subtaskListRef.querySelector(`[data-index="${index}"]`);
  const subtask = subtasks[index];
  subtaskElement.innerHTML = returnSubtaskEditHTML(subtask, index);
}