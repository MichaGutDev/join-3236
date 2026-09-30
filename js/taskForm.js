import { saveTask } from "./db.js";
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
    const addSubtaskBtnRef = document.getElementById("add-subtask-btn");

    addSubtaskBtnRef.addEventListener("click", addSubtask);
    formRef.addEventListener("submit", (event) => {
        event.preventDefault();
        getValues(taskStatus, editingTaskId, onSave);
    });
    formRef.addEventListener("input", handleFormValidation);
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
}

function addSubtask() {
  const subTaskInputRef = document.getElementById("new-subtask");
  subtasks.push({
    description: subTaskInputRef.value,
    completion: false
  });
  renderSubtasks(subtasks);
  document.getElementById("new-subtask").value = "";
}

function deleteSubtask(event) {
  const index = Number(event.currentTarget.dataset.index);
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
  updateSubtaskDelButtons();
}

function updateSubtaskDelButtons() {
  const deleteSubtaskButtons = document.querySelectorAll(".subtask-delete-btn");
  deleteSubtaskButtons.forEach(button => { button.addEventListener("click", deleteSubtask); });
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


function returnSubtaskHTML(subtask, index) {
  return `
        <li class="subtask-item">
            <span class="subtask-description">
                ${subtask.description}
            </span>

            <button
                type="button"
                class="subtask-delete-btn"
                aria-label="Subtask ${subtask.description} löschen"
                data-index="${index}"
            >
                Löschen
            </button>
        </li>
    `;
}