import { saveTask, listenToContacts } from "./db.js";
import { filterContacts } from "./search.js";
import { returnSubtaskHTML, returnSubtaskEditHTML, returnContactHTML2, returnAssignedToHTML } from "./templates.js";
import { showToast } from "./toast.js";
let formRef;
let createTaskBtnRef;
const subtasks = [];
let contacts = [];
const requiredFieldIds = ["title", "dueDate", "category"];
let selectedContactIds = [];
let unsubscribeFromContacts = null;


function toggleAssignedContact(contactId) {
  if (selectedContactIds.includes(contactId)) {
    selectedContactIds = selectedContactIds.filter(id => id !== contactId);
  } else {
    selectedContactIds.push(contactId);
  }
  renderSelectedContacts();
}


export function setFormAssignedTo(assignedTo = []) {
  selectedContactIds = [...assignedTo];
  renderAssignedToContacts();
  renderSelectedContacts();
}


function initContacts() {
  if (unsubscribeFromContacts) return;
  unsubscribeFromContacts = listenToContacts((updatedContacts) => {
    contacts = updatedContacts;
    if (!document.getElementById("task-form")) return;
    updateAssignedToContacts();
    renderSelectedContacts();
  });
}


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


function handleAssignedToKeydown(event) {
  const dropdownRef = document.getElementById("assigned-to-wrapper");
  const isOpen = !dropdownRef.classList.contains("d-none");
  if (event.key === "Escape" && isOpen) {
    event.preventDefault();
    event.stopPropagation();
    toggleAssignedToDropdown();
  }
}


function updateAssignedToContacts() {
  const searchTerm = document.getElementById("search-assigned-to").value;
  const filteredContacts = filterContacts(contacts, searchTerm);
  renderAssignedToContacts(filteredContacts);
}


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


function renderAssignedToContacts(contactList = contacts) {
  const assignedToRef = document.getElementById("assigned-to-dropdown");
  assignedToRef.innerHTML = contactList
    .map(contact => {
      const isSelected = selectedContactIds.includes(contact.id);
      return returnContactHTML2(contact, isSelected);
    })
    .join("");
}


function handleContactSelection(event) {
  if (!event.target.matches(".assigned-contact-checkbox")) return;
  const contactId = event.target.value;
  toggleAssignedContact(contactId);
}


function initContactListener() {
  const assignedToDropDownRef = document.getElementById("assigned-to-dropdown");
  assignedToDropDownRef.addEventListener("change", handleContactSelection)
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


export function setFormSubtasks(taskSubtasks = []) {
  subtasks.length = 0;
  taskSubtasks.forEach(subtask => {
    subtasks.push({ ...subtask });
  });
  renderSubtasks();
}


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


function createTaskObject(formData, status) {
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


function handleFormReset() {
  subtasks.length = 0;
  selectedContactIds = [];
  renderSubtasks();
  updateAssignedToContacts();
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

  renderSubtasks();
  clearSubtaskInput();
}


function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}


function renderSubtasks() {
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
  renderSubtasks();
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