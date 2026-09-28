import { database } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { saveTask, listenToContacts } from "./db.js";
// import { field } from '/firebase/firestore/pipelines';
const subtasks = [];
let formRef;
let contacts = [];
let contactsRendered = false;
let createTaskBtnRef;

function init() {
  listenToContacts((updatedContacts) => {
    contacts = updatedContacts;
    if (!contactsRendered) {
      renderContacts(contacts);
      contactsRendered = true;
    }
  })
  // renderContacts(contacts);
}

//_________(add) Task Form________________


export function initTaskForm(taskStatus = "To Do", editingTaskId = null) {
  formRef = document.querySelector("#task-form");
  const addSubtaskBtnRef = document.getElementById("add-subtask-btn");
  createTaskBtnRef = document.getElementById('create-task-btn');
  const dueDateRef = document.getElementById("dueDate");
  dueDateRef.min = getCurrentDate();

  addSubtaskBtnRef.addEventListener("click", addSubtask);
  formRef.addEventListener("submit", (event) => {
    event.preventDefault();
    getValues(taskStatus, editingTaskId);
  });

  handleFormValidation();
  formRef.addEventListener("input", handleFormValidation);



}

async function getValues(status, editingTaskId) {
  const formData = new FormData(formRef);
  const task = createTaskObject(formData, status);
  await saveTask(task, editingTaskId);
  resetTaskForm();
}

function createTaskObject(formData, status = "To Do") {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    category: formData.get("category"),
    assignedTo: formData.getAll("assignedTo"),
    status,
    subtasks: [...subtasks],
  };
}

function resetTaskForm() {
  formRef.reset();
  subtasks.length = 0;
  renderSubtasks(subtasks);
  renderContacts(contacts);
}

function handleFormValidation() {
  const requiredFields = getRequiredFields();
  handleRequired(requiredFields);
  createTaskBtnRef.disabled = !validateForm(requiredFields);
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

function getCurrentDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//_________Subtasks________________


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

export function renderSubtasks(subtasks) {
  const subTaskListRef = document.getElementById('subtask-list');
  subTaskListRef.innerHTML = "";
  for (let index = 0; index < subtasks.length; index++) {
    const subtask = subtasks[index];
    subTaskListRef.innerHTML += returnSubtaskHTML(subtask, index);
  }
  updateSubtaskDelButtons();
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

function updateSubtaskDelButtons() {
  const deleteSubtaskButtons = document.querySelectorAll(".subtask-delete-btn");
  deleteSubtaskButtons.forEach(button => { button.addEventListener("click", deleteSubtask); });
}

export function setFormSubtasks(taskSubtasks = []) {
  subtasks.length = 0;
  taskSubtasks.forEach(subtask => {
    subtasks.push({ ...subtask });
  });
  renderSubtasks(subtasks);
}


//_________Contacts________________


export function renderContacts(contacts, assignedTo = []) {
  const selectRef = document.getElementById("assigned-to");
  selectRef.innerHTML = "";
  contacts.forEach(contact => {
    const option = document.createElement("option");
    option.value = contact.id;
    option.textContent = contact.name;
    option.selected = assignedTo.includes(contact.id);
    selectRef.appendChild(option);
  });
}

init();
initTaskForm();