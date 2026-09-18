import { initTaskForm } from "./add_task.js";
import { returnTaskHTML, returnAddTaskForm } from "./templates.js";
import { listenToTasks } from "./db.js";
import { filterTasks } from "./search.js";
let tasks = [];
let currentDraggedTaskId;
const taskContainerMap = {
    "To Do": document.getElementById('to_do'),
    "In Progress": document.getElementById('in_progress'),
    "Awaiting Feedback": document.getElementById('await_feedback'),
    "Done": document.getElementById('done'),
}
const taskDialogRef = document.getElementById("task-edit-dialog");
const taskDialogContentRef = document.getElementById("task-dialog-content");
const searchInputRef = document.getElementById('search-task');
searchInputRef.addEventListener("input", search);

function init() {
    initDragAndDrop();
    listenToTasks((updatedTasks) => {
        tasks = updatedTasks;
        displayTasks();
    });
}

init();

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
function openTaskDialog(id = null, mode) {
    renderDialogContent(id, mode);
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
    currentDraggedTaskId = Number(event.currentTarget.dataset.taskId);
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
function moveTaskTo(event) {
    event.preventDefault();

    const status = event.currentTarget.dataset.status;
    const draggedTask = tasks.find(task => task.id === currentDraggedTaskId);
    if (!draggedTask) return;
    draggedTask.status = status;
    document.querySelector('.drag-area-highlight')?.classList.remove('drag-area-highlight');
    displayTasks();
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