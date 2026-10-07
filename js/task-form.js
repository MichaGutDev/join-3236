import { saveTask, listenToContacts } from "./db.js";
import { returnSubtaskHTML, returnSubtaskEditHTML, returnContactHTML2, returnAssignedToHTML } from "./templates.js";
import { showToast } from "./toast.js";
let formRef;
let createTaskBtnRef;
const subtasks = [];
let contacts = [];
const requiredFieldIds = ["title", "dueDate", "category"];
let selectedContactIds = [];


function toggleAssignedContact(contactId) {
  if (selectedContactIds.includes(contactId)) {
    selectedContactIds = selectedContactIds.filter(id => id !== contactId);
  } else {
    selectedContactIds.push(contactId);
  }
  renderAssignedToContacts();
  renderSelectedContacts();
}


export function setFormAssignedTo(assignedTo = []) {
  selectedContactIds = [...assignedTo];
  renderAssignedToContacts();
}


function initContacts() {
  listenToContacts((updatedContacts) => {
    contacts = updatedContacts;
    // updateFormContacts(contacts);

    renderAssignedToContacts();
    renderSelectedContacts();
  });
}


function initAssignedToListeners() {
  const assignedToButtonRef = document.getElementById("assigned-to-trigger");
  assignedToButtonRef.addEventListener("click", toggleAssignedToDropdown)
}


function toggleAssignedToDropdown() {
  const assignedToRef = document.getElementById("assigned-to-dropdown");
  assignedToRef.classList.toggle("d-none")
}

function renderAssignedToContacts() {
  const assignedToRef = document.getElementById("assigned-to-dropdown");
  assignedToRef.innerHTML = contacts
    .map(contact => {
      const isSelected = selectedContactIds.includes(contact.id);
      return returnContactHTML2(contact, isSelected);
    })
    .join("");
}

function handleContactSelection(event) {
  const selectedContact = event.target.closest(".assigned-contact");
  if (!selectedContact) return;
  toggleAssignedContact(selectedContact.dataset.contactId);
  console.log(selectedContact.dataset.contactId);
  console.log(selectedContactIds);
}

function initContactListener() {
  const assignedToDropDownRef = document.getElementById("assigned-to-dropdown");
  assignedToDropDownRef.addEventListener("click", handleContactSelection)
}

function renderSelectedContacts() {
  const selectedContactsRef = document.getElementById("selected-contacts");
  selectedContactsRef.innerHTML = returnAssignedToHTML(
    selectedContactIds,
    contacts
  );
}


export function initTaskForm(taskStatus = "To Do", editingTaskId = null, onSave = null) {
  formRef = document.querySelector("#task-form");
  createTaskBtnRef = document.getElementById("create-task-btn");
  initContacts();
  initContactListener();
  setMinimumDueDate();
  initTaskListeners(taskStatus, editingTaskId, onSave);
  handleFormValidation();
}


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


function initRequiredFieldListeners() {
  requiredFieldIds.forEach(id => {
    formRef.querySelector(`#${id}`).addEventListener("blur", handleRequired);
  });
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


// export function renderContacts(contacts, assignedTo = []) {
//   const selectRef = document.getElementById("assigned-to");
//   selectRef.innerHTML = "<option value=''>Select contacts to assign</option>";
//   contacts.forEach(contact => {
//     const option = document.createElement("option");
//     option.value = contact.id;
//     option.textContent = contact.name;
//     option.selected = assignedTo.includes(contact.id);
//     selectRef.appendChild(option);
//   });
// }


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
  if (!validateForm(getRequiredFields())) return;
  try {
    await saveTask(task, editingTaskId);
    resetTaskForm();
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


function createTaskObject(formData, status = "To Do") {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    category: formData.get("category"),
    assignedTo: [...selectedContactIds],
    status,
    subtasks: [...subtasks],
  };
}


function resetTaskForm() {
  formRef.reset();
}


function handleFormReset() {
  subtasks.length = 0;
  selectedContactIds = [];
  renderSubtasks(subtasks);
  renderAssignedToContacts();
  renderSelectedContacts();
  clearSubtaskInput();
  resetRequiredFields();
}


function resetRequiredFields() {
  requiredFieldIds.forEach(id => {
    document.getElementById(id).classList.remove("field-error");
    document.getElementById(`${id}-error`).classList.add("d-none");
  });
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


function handleRequired(event) {
  const fieldRef = event.target;
  const inputValue = fieldRef.value.trim();
  const errorRef = document.getElementById(`${fieldRef.id}-error`);

  errorRef.classList.toggle("d-none", inputValue !== "");
  fieldRef.classList.toggle("field-error", inputValue === "");
}

function handleFormValidation() {
  const requiredFields = getRequiredFields();
  createTaskBtnRef.disabled = !validateForm(requiredFields);
}


function getCurrentDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// export function updateFormContacts(contacts) {
//   const selectRef = document.getElementById("assigned-to");
//   if (!selectRef) return;

//   const selectedContacts = [...selectRef.selectedOptions].map(option => option.value).filter(contactId => contactId !== "");

//   renderContacts(contacts, selectedContacts);
// }