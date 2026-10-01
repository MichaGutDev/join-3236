import { initTaskForm, renderContacts, setFormSubtasks, updateFormContacts } from "./taskForm.js";
import { returnTaskHTML, returnAddTaskForm, returnTaskView, returnNoTaskHTML } from "./templates.js";
import { listenToTasks, updateTaskStatus, updateSubtaskCompletion, listenToContacts, deleteTask } from "./db.js";
import { filterTasks } from "./search.js";

let tasks = [];
let contacts = [];
let tasksLoaded = false;
let contactsLoaded = false;
let currentDraggedTaskId = null;
const taskContainerMap = {
    "To Do": document.getElementById('to_do'),
    "In Progress": document.getElementById('in_progress'),
    "Awaiting Feedback": document.getElementById('await_feedback'),
    "Done": document.getElementById('done'),
}
const taskDialogRef = document.getElementById("task-dialog");


function renderBoardWhenReady() {
    if (tasksLoaded && contactsLoaded) {
        displayTasks();
    }
}


function init() {
    initDBListeners();
    initSearchBar();
    initAddTaskButtons();
    initDragAndDrop();
    initTaskClickListener();
    initDialogListeners();
}


function initDialogListeners() {
    taskDialogRef.addEventListener("click", backdropClose);
    taskDialogRef.addEventListener("change", handleSubtaskCompletion);
}


function initDBListeners() {
    listenToTasks((updatedTasks) => {
        tasks = updatedTasks;
        tasksLoaded = true;
        renderBoardWhenReady();
    });

    listenToContacts((updatedContacts) => {
        contacts = updatedContacts;
        contactsLoaded = true;
        renderBoardWhenReady();
        updateFormContacts(updatedContacts);
    });
}


function initSearchBar() {
    const searchInputRef = document.getElementById("search-task");
    searchInputRef.addEventListener("input", search);
}


function initAddTaskButtons() {
    const addTaskBtnRefs = document.querySelectorAll(".add-task-btn");
    addTaskBtnRefs.forEach(button => {
        button.addEventListener("click", (event) => {
            openAddTask(event.currentTarget.dataset.status);
        });
    });
}


//_________render Tasks & search________________
function search(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredTasks = filterTasks(tasks, searchTerm);

    displayTasks(filteredTasks);

    const noResultsMessage = document.getElementById("no-results-message");
    noResultsMessage.hidden = filteredTasks.length !== 0;
}


/**
 * Renders all tasks into the respective containers.
 * 
 * @param {Array} [taskList=tasks] - Optional list of tasks to render.
 */
export function displayTasks(taskList = tasks) {
    clearTaskHTML();
    taskList.forEach(task => {
        taskContainerMap[task.status].innerHTML += returnTaskHTML(task, contacts)
    });
    renderEmptyColumnMessages()
    initDraggableTasks();
}


function renderEmptyColumnMessages() {
    Object.values(taskContainerMap).forEach(element => {
        if (element.children.length === 0) {
            element.innerHTML = returnNoTaskHTML();
        }
    });
}


/**
 * Clears all HTML Task Containers.
 */
function clearTaskHTML() {
    Object.values(taskContainerMap).forEach(taskContainer => {
        taskContainer.innerHTML = ""
    });
}


function openAddTask(status) {
    taskDialogRef.innerHTML = returnAddTaskForm();

    renderContacts(contacts);
    setFormSubtasks();

    initTaskForm(status, null, closeTaskDialog);
    initCloseTaskButton();
    openTaskDialog();
}


function initTaskClickListener() {
    const boardWrapperRef = document.querySelector(".board-wrapper");
    boardWrapperRef.addEventListener("click", openTask);
}


// ____DIALOG____
/**
 * Renders the Dialog Content and opens the Modal
 */
function openTaskDialog() {
    taskDialogRef.showModal();
}


/**
 * Closes Task Dialog Modal
 */
function closeTaskDialog() {
    taskDialogRef.close();
}


function initCloseTaskButton() {
    const closeBtnRef = document.getElementById("close-task-dialog");
    closeBtnRef.addEventListener("click", closeTaskDialog);
}


function initDeleteTaskButton(task) {
    const deleteBtnRef = document.getElementById("delete-task-btn");

    deleteBtnRef.addEventListener("click", async () => {
        await deleteTask(task.id);
        closeTaskDialog();
    });
}


function backdropClose(event) {
    if (event.target === event.currentTarget) {
        closeTaskDialog();
    }
}
// ____DIALOG____ENDE


//_________open Task________________
function openTask(event) {
    const taskElement = event.target.closest(".task-box");

    if (!taskElement) return;

    const taskId = taskElement.dataset.taskId;
    const task = tasks.find(task => task.id === taskId);

    if (!task) return;

    taskDialogRef.innerHTML = returnTaskView(task, contacts);
    initTaskDialogButtons(task)
    openTaskDialog();
}


function handleSubtaskCompletion(event) {
    const subtaskInputRef = event.target.closest(".subtask-item-input");
    if (!subtaskInputRef) return;

    const subtaskElementRef = event.target.closest(".subtask-item");
    const taskElementRef = event.target.closest(".task-detail");

    const taskId = taskElementRef.dataset.taskId;
    const subtaskIndex = subtaskElementRef.dataset.subtaskIndex;
    const completion = subtaskInputRef.checked;

    updateSubtaskCompletion(taskId, subtaskIndex, completion);
}


function initEditTaskButton(task) {
    const editTaskBtnRef = document.querySelector(".edit-task-btn");
    editTaskBtnRef.addEventListener("click", () => {
        openEditTask(task);
    });
}


//_________Edit Task________________
function openEditTask(task) {
    taskDialogRef.innerHTML = returnAddTaskForm();

    fillBasicTaskForm(task);
    renderContacts(contacts, task.assignedTo);
    setFormSubtasks(task.subtasks);

    initTaskForm(task.status, task.id, closeTaskDialog);
    initCancelButton(task);
    initCloseTaskButton();
}


function fillBasicTaskForm(task) {
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("category").value = task.category;
    document.getElementById(task.priority).checked = true;
}


function initCancelButton(task) {
    const cancelButtonRef = document.getElementById("cancel-btn");
    const submitButtonRef = document.getElementById("submit-btn-text");
    const cancelButtonTextRef = document.getElementById("cancel-btn-text");
    cancelButtonRef.type = "button";
    submitButtonRef.textContent = "Ok";
    cancelButtonTextRef.textContent = "Cancel"

    cancelButtonRef.addEventListener("click", () => {
        cancelEdit(task);
    });
}


function cancelEdit(task) {
    taskDialogRef.innerHTML = returnTaskView(task, contacts);
    initTaskDialogButtons(task);
}


function initTaskDialogButtons(task) {
    initCloseTaskButton();
    initEditTaskButton(task);
    initDeleteTaskButton(task);
}


//_________Drag and Drop________________
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
    currentDraggedTaskId = null;
}


// /**
//  * Finds the dragged task by its id, updates its status, removes the drop-target highlight, and re-renders the board.
//  * 
//  * @param {string} status 
//  */
async function moveTaskTo(event) {
    event.preventDefault();

    const taskId = currentDraggedTaskId;
    const status = event.currentTarget.dataset.status;

    event.currentTarget.classList.remove("drag-area-highlight");

    await updateTaskStatus(taskId, status);
}


function initDragAndDrop() {
    const taskColumns = document.querySelectorAll(".task-column");
    taskColumns.forEach(column => {
        column.addEventListener("dragover", allowDrop);
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
    event.currentTarget.classList.add("drag-area-highlight")
}


function removeHighlight(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
        return;
    }
    event.currentTarget.classList.remove("drag-area-highlight");
}

init();