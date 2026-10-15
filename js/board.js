import { initTaskForm, setFormAssignedTo } from "./task-form.js";
import { setFormSubtasks } from "./subtasks.js";
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


/**
 * Renders the board once tasks and contacts have loaded.
 */
function renderBoardWhenReady() {
    if (tasksLoaded && contactsLoaded) {
        displayTasks();
    }
}


/**
 * Initializes the board's data listeners and user interactions.
 */
function init() {
    initDBListeners();
    initSearchBar();
    initAddTaskButtons();
    initDragAndDrop();
    initTaskClickListener();
    initDialogListeners();
}


/**
 * Registers event listeners for task dialog interactions.
 */
function initDialogListeners() {
    taskDialogRef.addEventListener("click", backdropClose);
    taskDialogRef.addEventListener("change", handleSubtaskCompletion);
    taskDialogRef.addEventListener("close", clearTaskDialog);
}


/**
 * Subscribes to Firebase tasks and contacts updates.
 */
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
    });
}


/**
 * Registers the input listener for task search.
 */
function initSearchBar() {
    const searchInputRef = document.getElementById("search-task");
    searchInputRef.addEventListener("input", search);
}


/**
 * Registers click listeners for opening the task form.
 */
function initAddTaskButtons() {
    const addTaskBtnRefs = document.querySelectorAll(".add-task-btn");
    addTaskBtnRefs.forEach(button => {
        button.addEventListener("click", (event) => {
            openAddTask(event.currentTarget.dataset.status);
        });
    });
}


/**
 * Filters tasks by the search input and updates the board.
 * @param {Event} event - The input event.
 */
function search(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredTasks = filterTasks(tasks, searchTerm);

    displayTasks(filteredTasks);

    const noResultsMessage = document.getElementById("no-results-message");
    noResultsMessage.hidden = filteredTasks.length !== 0;
}


/**
 * Renders tasks in their respective board columns.
 * @param {Object[]} [taskList=tasks] - Tasks to render.
 */
export function displayTasks(taskList = tasks) {
    clearTaskHTML();
    taskList.forEach(task => {
        const containerRef = taskContainerMap[task.status];
        if (!containerRef) return;
        containerRef.innerHTML += returnTaskHTML(task, contacts);
    });
    renderEmptyColumnMessages();
    initDraggableTasks();
}


/**
 * Displays a placeholder message in each empty task column.
 */
function renderEmptyColumnMessages() {
    Object.values(taskContainerMap).forEach(element => {
        if (element.children.length === 0) {
            const columnTitle = element.closest(".task-col").querySelector(".taskgroup-header").textContent;
            element.innerHTML = returnNoTaskHTML(columnTitle);
        }
    });
}


/**
 * Clears all task containers on the board.
 */
function clearTaskHTML() {
    Object.values(taskContainerMap).forEach(taskContainer => {
        taskContainer.innerHTML = ""
    });
}


/**
 * Opens and initializes the task creation form.
 * @param {string} status - Initial status for the new task.
 */
function openAddTask(status) {
    taskDialogRef.innerHTML = returnAddTaskForm();

    setFormAssignedTo();
    setFormSubtasks();

    initTaskForm(status, null, closeTaskDialog);
    initCloseTaskButton();
    openTaskDialog();
}


/**
 * Registers the click listener for opening task details.
 */
function initTaskClickListener() {
    const boardWrapperRef = document.querySelector(".board-wrapper");
    boardWrapperRef.addEventListener("click", openTask);
}


/**
 * Opens the task dialog as a modal.
 */
function openTaskDialog() {
    taskDialogRef.showModal();
}


/**
 * Closes the task dialog.
 */
function closeTaskDialog() {
    taskDialogRef.close();
}


/**
 * Removes all content from the task dialog.
 */
function clearTaskDialog() {
    taskDialogRef.innerHTML = "";
}


/**
 * Registers the listener for closing the task dialog.
 */
function initCloseTaskButton() {
    const closeBtnRef = document.getElementById("close-task-dialog");
    closeBtnRef.addEventListener("click", closeTaskDialog);
}


/**
 * Registers the delete button listener for a task.
 * @param {Object} task - Task to delete.
 */
function initDeleteTaskButton(task) {
    const deleteBtnRef = document.getElementById("delete-task-btn");

    deleteBtnRef.addEventListener("click", async () => {
        await deleteTask(task.id);
        closeTaskDialog();
    });
}


/**
 * Closes the task dialog when its backdrop is clicked.
 * @param {MouseEvent} event - The click event.
 */
function backdropClose(event) {
    if (event.target === event.currentTarget) {
        closeTaskDialog();
    }
}


/**
 * Opens the details dialog for the clicked task.
 * @param {MouseEvent} event - The click event.
 */
function openTask(event) {
    const taskElement = event.target.closest(".task-box");

    if (!taskElement) return;

    const taskId = taskElement.dataset.taskId;
    const task = tasks.find(task => task.id === taskId);

    if (!task) return;

    taskDialogRef.innerHTML = returnTaskView(task, contacts);
    initTaskDialogButtons(task);
    openTaskDialog();
}


/**
 * Updates a subtask's completion state in Firebase.
 * @param {Event} event - The checkbox change event.
 */
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


/**
 * Registers the edit button listener for a task.
 * @param {Object} task - Task to edit.
 */
function initEditTaskButton(task) {
    const editTaskBtnRef = document.querySelector(".edit-task-btn");
    editTaskBtnRef.addEventListener("click", () => {
        openEditTask(task);
    });
}


/**
 * Initializes the task form with an existing task's data.
 * @param {Object} task - Task to edit.
 */
function openEditTask(task) {
    taskDialogRef.innerHTML = returnAddTaskForm();
    document.getElementById("task-form").classList.add("task-form-edit");

    fillBasicTaskForm(task);
    setFormAssignedTo(task.assignedTo);
    setFormSubtasks(task.subtasks);

    initTaskForm(task.status, task.id, closeTaskDialog);
    initCancelButton(task);
    initCloseTaskButton();
}


/**
 * Populates the task form with basic task details.
 * @param {Object} task - Task containing the form values.
 */
function fillBasicTaskForm(task) {
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("category").value = task.category;
    document.getElementById(task.priority).checked = true;
}


/**
 * Configures the cancel button for task editing.
 * @param {Object} task - Original task to restore on cancellation.
 */
function initCancelButton(task) {
    const cancelButtonRef = document.getElementById("cancel-btn");
    const submitButtonRef = document.getElementById("submit-btn-text");
    const cancelButtonTextRef = document.getElementById("cancel-btn-text");
    cancelButtonRef.type = "button";
    submitButtonRef.textContent = "Ok";
    cancelButtonTextRef.textContent = "Cancel";

    cancelButtonRef.addEventListener("click", () => {
        cancelEdit(task);
    });
}


/**
 * Discards unsaved edits and restores the task details view.
 * @param {Object} task - Original task to display.
 */
function cancelEdit(task) {
    taskDialogRef.innerHTML = returnTaskView(task, contacts);
    initTaskDialogButtons(task);
}


/**
 * Registers the close, edit, and delete button listeners.
 * @param {Object} task - Task associated with the dialog.
 */
function initTaskDialogButtons(task) {
    initCloseTaskButton();
    initEditTaskButton(task);
    initDeleteTaskButton(task);
}


/**
 * Stores the dragged task ID and applies the dragging style.
 * @param {DragEvent} event - The dragstart event.
 */
function startDragging(event) {
    currentDraggedTaskId = event.currentTarget.dataset.taskId;
    event.currentTarget.classList.add("dragging");
}


/**
 * Removes the dragging style and clears the dragged task ID.
 * @param {DragEvent} event - The dragend event.
 */
function stopDragging(event) {
    event.currentTarget.classList.remove("dragging");
    currentDraggedTaskId = null;
}


/**
 * Updates the dragged task's status in Firebase.
 * @param {DragEvent} event - The drop event.
 * @returns {Promise<void>}
 */
async function moveTaskTo(event) {
    event.preventDefault();

    const taskId = currentDraggedTaskId;
    const status = event.currentTarget.dataset.status;

    event.currentTarget.classList.remove("drag-area-highlight");

    await updateTaskStatus(taskId, status);
}


/**
 * Registers drag-and-drop listeners for all task columns.
 */
function initDragAndDrop() {
    const taskColumns = document.querySelectorAll(".task-column");
    taskColumns.forEach(column => {
        column.addEventListener("dragover", allowDrop);
        column.addEventListener("dragleave", removeHighlight);
        column.addEventListener("drop", moveTaskTo);
    });
}


/**
 * Registers dragstart and dragend listeners for all task cards.
 */
function initDraggableTasks() {
    const taskElements = document.querySelectorAll(".task-box");

    taskElements.forEach(task => {
        task.addEventListener("dragstart", startDragging);
        task.addEventListener("dragend", stopDragging);
    });
}


/**
 * Allows dropping and highlights the target column.
 * @param {DragEvent} event - The dragover event.
 */
function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add("drag-area-highlight")
}


/**
 * Removes the column highlight when the dragged element leaves it.
 * @param {DragEvent} event - The dragleave event.
 */
function removeHighlight(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
        return;
    }
    event.currentTarget.classList.remove("drag-area-highlight");
}


init();