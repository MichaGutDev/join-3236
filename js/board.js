import { initTaskForm, renderContacts } from "./add_task.js";
import { returnTaskHTML, returnAddTaskForm, returnTaskView, returnSubtaskCompletionHTML } from "./templates.js";
import { listenToTasks, updateTaskStatus, updateSubtaskCompletion, listenToContacts } from "./db.js";
import { filterTasks } from "./search.js";
import { getInitials } from "./contact-templates.js";
let tasks = [];
let contacts = [];
let currentDraggedTaskId;
const taskContainerMap = {
    "To Do": document.getElementById('to_do'),
    "In Progress": document.getElementById('in_progress'),
    "Awaiting Feedback": document.getElementById('await_feedback'),
    "Done": document.getElementById('done'),
}
const taskDialogRef = document.getElementById("task-dialog");
const taskDialogContentRef = document.getElementById("task-dialog-content");
const searchInputRef = document.getElementById('search-task');
searchInputRef.addEventListener("input", search);

function init() {
    initDragAndDrop();
    initTaskClickListener()
    listenToTasks((updatedTasks) => {
        tasks = updatedTasks;
        displayTasks();
    });
    listenToContacts((updatedContacts) => {
        contacts = updatedContacts;});
}

function initSubtaskClickListener() {
    const taskDialogRef = document.getElementById("task-dialog");
    taskDialogRef.addEventListener("change", handleSubtaskCompletion);
}

function handleSubtaskCompletion(event) {
    const subtaskElement = event.target.closest(".subtask-item-input");

    if (!subtaskElement) return;

    const taskElement = event.target.closest(".task-detail");

    const taskId = taskElement.dataset.taskId;
    const subtaskIndex = subtaskElement.dataset.subtaskIndex;
    const completion = subtaskElement.checked;

    updateSubtaskCompletion(taskId, subtaskIndex, completion);
}


function initTaskClickListener() {
    const boardWrapperRef = document.querySelector(".board-wrapper");
    boardWrapperRef.addEventListener("click", openTask);
}

function openTask(event) {
    const taskElement = event.target.closest(".task-box");

    if (!taskElement) return;

    const taskId = taskElement.dataset.taskId;
    const task = tasks.find(task => task.id === taskId);

    if (!task) return;

    taskDialogRef.innerHTML = returnTaskView(task);
    initSubtaskClickListener();
    initEditTaskButton(task)
    openTaskDialog();
}

function initEditTaskButton(task) {
    const editTaskBtnRef = document.querySelector(".edit-task-btn");
    editTaskBtnRef.addEventListener("click", () => {
        openEditTask(task);
    });
}

function openEditTask(task){
    taskDialogRef.innerHTML = "";
    taskDialogRef.innerHTML += returnAddTaskForm(task);
    initTaskForm();
    // html clear(listener zurücksetzen?) -> form rein 
    // initForm & form listener etc. 
    // insertTask
}

/**
 * Renders all tasks into the respective containers.
 * 
 * @param {Array} [taskList=tasks] - Optional list of tasks to render.
 */
export function displayTasks(taskList = tasks) {
    clearTaskHTML();
    taskList.forEach(task => {
        taskContainerMap[task.status].innerHTML += returnTaskHTML(task)
    });
    initDraggableTasks();
}

function search() {
    const searchTerm = searchInputRef.value.toLowerCase();
    const filteredTasks = filterTasks(tasks, searchTerm);
    displayTasks(filteredTasks);
    const noResultsMessage = document.getElementById("no-results-message");
    noResultsMessage.hidden = filteredTasks.length !== 0;
}

/**
 * Clears all HTML Task Containers.
 */
function clearTaskHTML() {
    Object.values(taskContainerMap).forEach(taskContainer => { taskContainer.innerHTML = "" });
}

export function returnSubtaskProgressHTML(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";
    }
    const subtaskStats = getSubtaskStats(subtasks);
    return returnSubtaskCompletionHTML(subtaskStats);
}

function getSubtaskStats(subtasks) {
    const subtaskStats = {
        completed: 0,
        total: 0,
        percentage: 0
    };
    subtaskStats.completed = subtasks.filter(subtask => subtask.completion).length;
    subtaskStats.total = subtasks.length;
    subtaskStats.percentage = Math.round(subtaskStats.completed / subtaskStats.total * 100);
    return subtaskStats;
}

export function returnAssignedToHTML(assignedToList, showName = false) {
    if (!assignedToList || assignedToList.length === 0) {
        return "";
    }

    const assignedToHTML = assignedToList.map(contactID =>
        returnContactHTML(
            contacts.find(contact => contact.id === contactID),
            showName
        )
    );
    return assignedToHTML.join("");
}

function returnContactHTML(contact, showName = false) {
    if (!contact) {
        return "";
    }
    return `
    <div class="user-avatar" style="background: ${contact.color};">${getInitials(contact.name)}</div>
    ${showName ? returnNameHTML(contact.name) : ""}
    `;
}

function returnNameHTML(name) {
    return `
        <span>${name}</span>
    `;
}

/**
 * Closes Task Dialog Modal
 */
function closeTaskDialog() {
    taskDialogRef.close();
}

/**
 * Renders the Dialog Content and opens the Modal
 * @param {string} id 
 * @param {string} mode 
 */
function openTaskDialog() {
    document.getElementById('close-task-dialog').addEventListener("click", closeTaskDialog);
    taskDialogRef.showModal();
}

function insertTaskToEdit(task) {
    fillBasicTaskForm(task); // Works, check again tho
    renderContacts(contacts, task.assignedTo);

    // fillSubtasks(task.subtasks);
}

// export function renderContacts(contacts, assignedTo = []) {
//     const selectRef = document.getElementById("assigned-to");
//     selectRef.innerHTML = "";
//     contacts.forEach(contact => {
//         const option = document.createElement("option");
//         option.value = contact.id;
//         option.textContent = contact.name;
//         option.selected = assignedTo.includes(contact.id);
//         selectRef.appendChild(option);
//     });
// }

/**
 * Stores the id of the dragged task and applies a visual dragging style to the element.
 * 
 * @param {DragEvent} event 
 */
function startDragging(event) {
    currentDraggedTaskId = event.currentTarget.dataset.taskId;
    event.currentTarget.classList.add("dragging");
}

/**
 * Removes the visual dragging style from the element.
 * 
 * @param {DragEvent} event 
 */
function stopDragging(event) {
    event.currentTarget.classList.remove("dragging");
}

// /**
//  * Finds the dragged task by its id, updates its status, removes the drop-target highlight, and re-renders the board.
//  * 
//  * @param {string} status 
//  */
async function moveTaskTo(event) {
    event.preventDefault();
    const status = event.currentTarget.dataset.status;
    await updateTaskStatus(currentDraggedTaskId, status);
    document.querySelector(".drag-area-highlight")?.classList.remove("drag-area-highlight");
}

function initDragAndDrop() {
    const taskColumns = document.querySelectorAll(".task-column");
    taskColumns.forEach(column => {
        column.addEventListener("dragover", allowDrop);
        column.addEventListener("dragenter", highlight);
        column.addEventListener("dragleave", removeHighlight);
        column.addEventListener("drop", moveTaskTo);
    });
}

function initDraggableTasks() {
    const taskElements = document.querySelectorAll(".task-box");

    taskElements.forEach(task => {
        task.addEventListener("dragstart", startDragging);
        task.addEventListener("dragend", stopDragging);
    });
}

function allowDrop(event) {
    event.preventDefault();
}

function highlight(event) {
    event.currentTarget.classList.add("drag-highlight");
}

function removeHighlight(event) {
    event.currentTarget.classList.remove("drag-highlight");
}

init();