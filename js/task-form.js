import { saveTask } from "./db.js";
import { returnSubtaskHTML, returnSubtaskEditHTML } from "./templates.js";
let formRef;
let createTaskBtnRef;
const subtasks = [];

export function initTaskForm(taskStatus = "To Do", editingTaskId = null, onSave = null) {
  formRef = document.querySelector("#task-form");
  createTaskBtnRef = document.getElementById("create-task-btn");
  setMinimumDueDate();
  initTaskListeners(taskStatus, editingTaskId, onSave);
  handleFormValidation();
}

function initTaskListeners(taskStatus, editingTaskId, onSave) {
  initSubtaskListeners();
  formRef.addEventListener("reset", handleFormReset);
  formRef.addEventListener("submit", (event) => {
    event.preventDefault();
    getValues(taskStatus, editingTaskId, onSave);
  });
  formRef.addEventListener("input", handleFormValidation);
}

function initSubtaskListeners() {
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

function setMinimumDueDate() {
  const dueDateRef = document.getElementById("dueDate");
  dueDateRef.min = getCurrentDate();
}

export function renderContacts(contacts, assignedTo = []) {
  const selectRef = document.getElementById("assigned-to");
  selectRef.innerHTML = "<option value=''>Select contacts to assign</option>";
  contacts.forEach(contact => {
    const option = document.createElement("option");
    option.value = contact.id;
    option.textContent = contact.name;
    option.selected = assignedTo.includes(contact.id);
    selectRef.appendChild(option);
  });
}

export function setFormSubtasks(taskSubtasks = []) {
  subtasks.length = 0;
  taskSubtasks.forEach(subtask => {
    subtasks.push({ ...subtask });
  });
  renderSubtasks(subtasks);
}

async function getValues(status, editingTaskId, onSave) {
  const formData = new FormData(formRef);
  const task = createTaskObject(formData, status);
  await saveTask(task, editingTaskId);
  resetTaskForm();
  if (onSave) {
    onSave();
  }
}

function createTaskObject(formData, status = "To Do") {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    category: formData.get("category"),
    assignedTo: formData.getAll("assignedTo").filter(contactId => contactId !== ""),
    status,
    subtasks: [...subtasks],
  };
}

function resetTaskForm() {
  formRef.reset();
  subtasks.length = 0;
  renderSubtasks(subtasks);
  clearSubtaskInput();
}

function handleFormReset() {
  subtasks.length = 0;
  renderSubtasks(subtasks);
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





function handleSubtaskEditKeydown(event) {
  const inputRef = event.target.closest(".subtask-edit-input");
  if (!inputRef || event.key !== "Enter") return;

  event.preventDefault();

  const subtaskElementRef = inputRef.closest(".subtask-item");
  const index = Number(subtaskElementRef.dataset.index);

  confirmSubtaskEdit(index, subtaskElementRef);
}




function addSubtask() {
  const subTaskInputRef = document.getElementById("new-subtask");
  const description = subTaskInputRef.value.trim();

  if (description === "") return;

  subtasks.push({
    description,
    completion: false
  });

  renderSubtasks(subtasks);
  clearSubtaskInput();
}

function deleteSubtask(index) {
  subtasks.splice(index, 1)
  renderSubtasks(subtasks);
}

function renderSubtasks(subtasks) {
  const subTaskListRef = document.getElementById("subtask-list");
  subTaskListRef.innerHTML = "";
  for (let index = 0; index < subtasks.length; index++) {
    const subtask = subtasks[index];
    subTaskListRef.innerHTML += returnSubtaskHTML(subtask, index);
  }
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
  const subtaskDeleteButtonRef = event.target.closest(".subtask-delete-btn");
  const subtaskEditButtonRef = event.target.closest(".subtask-edit-btn");
  const cancelEditButtonRef = event.target.closest(".subtask-edit-cancel-btn");
  const confirmEditButtonRef = event.target.closest(".subtask-edit-confirm-btn");


  if (subtaskEditButtonRef) editSubtask(index);
  if (subtaskDeleteButtonRef) deleteSubtask(index);
  if (cancelEditButtonRef) renderSubtasks(subtasks);
  if (confirmEditButtonRef) confirmSubtaskEdit(index, subtaskElementRef);
}

function confirmSubtaskEdit(index, subtaskElementRef) {
  const inputRef = subtaskElementRef.querySelector(".subtask-edit-input");
  const description = inputRef.value.trim();
  if (description === "") return;
  subtasks[index].description = description;
  renderSubtasks(subtasks);
}

function editSubtask(index) {
  const subtaskListRef = document.getElementById("subtask-list");
  const subtaskElement = subtaskListRef.querySelector(`[data-index="${index}"]`);
  const subtask = subtasks[index];
  subtaskElement.innerHTML = returnSubtaskEditHTML(subtask, index);
}























function getRequiredFields() {
  const formData = new FormData(formRef);
  return {
    title: formData.get("title").trim(),
    dueDate: formData.get("dueDate"),
    category: formData.get("category"),
  };
}

function validateForm(requiredFields) {
  return Object.values(requiredFields).every(value => value !== "");
}

function handleRequired(requiredFields) {
  Object.entries(requiredFields).forEach(([key, value]) => {
    const errorRef = document.getElementById(`${key}-error`);
    errorRef.classList.toggle("d-none", value !== "");
  });
}

function handleFormValidation() {
  const requiredFields = getRequiredFields();
  handleRequired(requiredFields);
  createTaskBtnRef.disabled = !validateForm(requiredFields);
}



function getCurrentDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function updateFormContacts(contacts) {
  const selectRef = document.getElementById("assigned-to");
  if (!selectRef) return;

  const selectedContacts = [...selectRef.selectedOptions].map(option => option.value).filter(contactId => contactId !== "");

  renderContacts(contacts, selectedContacts);
}


