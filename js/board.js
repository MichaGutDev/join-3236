import { initTaskForm } from "./add_task.js";
import { returnTaskHTML, returnAddTaskForm, returnTaskView } from "./templates.js";
import { listenToTasks, updateTaskStatus } from "./db.js";
import { filterTasks } from "./search.js";
import { database } from "./firebase-config.js";
import { ref, push, set, update } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
let tasks = [];
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
}

function initTaskClickListener() {
    const boardWrapperRef = document.querySelector(".board-wrapper");
    boardWrapperRef.addEventListener("click", openTask);
}

function initTaskView(task) {
    // work in progress
}

function openTask(event) {
    const taskElement = event.target.closest(".task-box");

    if (!taskElement) return;

    const taskId = taskElement.dataset.taskId;
    const task = tasks.find(task => task.id === taskId);

    if (!task) return;

    taskDialogRef.innerHTML = returnTaskView(task);
    openTaskDialog();
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

/**
 * Calculates the percentage of completed subtasks.
 *
 * @param {Array} subtaskList - List of subtasks belonging to a task.
 * @returns {number} Percentage of completed subtasks.
 */
export function returnSubtaskCompletionPercent(subtaskList) {
    let completionData = returnSubtaskValues(subtaskList);
    let percentCompletion = completionData[0] / completionData[1] * 100;
    if (!percentCompletion) {
        percentCompletion = 0;
    }
    return percentCompletion
}

/**
 * Returns the number of completed subtasks and total subtasks.
 *
 * @param {{completion: boolean}[]} subtaskList - List of subtasks.
 * @returns {string} Completion count in the format "completed / total".
 */
export function returnSubtaskCompletionNum(subtaskList) {
    let completionData = returnSubtaskValues(subtaskList);
    return `${completionData[0]}/${completionData[1]}`
}

/**
 * Counts completed subtasks and returns completion statistics.
 *
 * @param {{subtask: string, completion: boolean}[]} subtaskList
 * @returns {[number, number]} Completed subtasks and total subtasks.
 */
function returnSubtaskValues(subtaskList) {
    let counter = 0;
    subtaskList.forEach(subtask => {
        if (subtask.completion === true) {
            counter++;
        }
    });
    return [counter, subtaskList.length]
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

/**
 * Renders the Dialog Content by ID and selected Mode, else opens normal add-Task-Form
 * @param {string} id 
 * @param {string} mode 
 * @returns 
 */
function renderDialogContent(id, mode) {
    if (id && mode === "edit") {
        insertTaskForm();
        insertTaskToEdit(tasks.id); //in progress
        return
    } else if (id && mode === "view") {
        renderTaskView(id); // open task
        return
    } else {
        insertTaskForm();
    }
}

function insertTaskForm() {
    renderTaskForm();
    initTaskForm();
}

function renderTaskForm() {
    taskDialogContentRef.innerHTML = "";
    taskDialogContentRef.innerHTML = returnAddTaskForm();
}

function insertTaskToEdit(task) {
    fillBasicTaskForm(task); // Works, check again tho
    renderContacts(contacts, task.assignedTo);

    // fillSubtasks(task.subtasks);
}

function fillBasicTaskForm(task) { // CURRENTLY TEST
    Object.entries(test).forEach(([key, val]) => {
        if (key !== "subtasks" && key !== "assignedTo" && key !== "id") {
            document.getElementById(`${key}`).value = val;
        }
    });
}

function renderContacts(contacts, assignedTo = []) {
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