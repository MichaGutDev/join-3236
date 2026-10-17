import { initTaskForm } from "./task-form.js";
import { setFormAssignedTo } from "./assigned-to.js";
import { setFormCategory } from "./category-select.js";
import { setFormSubtasks } from "./subtasks.js";
import { returnTaskHTML, returnAddTaskForm, returnTaskView, returnNoTaskHTML } from "./templates.js";
import { listenToTasks, updateSubtaskCompletion, listenToContacts, deleteTask } from "./db.js";
import { filterTasks } from "./search.js";
import { initDraggableTasks, initDragAndDrop, initMobileTaskMovement } from "./move-tasks.js";

let tasks = [];
let contacts = [];
let tasksLoaded = false;
let contactsLoaded = false;
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
    initMobileTaskMovement();
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
    const groupedTasks = groupTasksByStatus(taskList);
    renderGroupedTasks(groupedTasks);
    renderEmptyColumnMessages();
    initDraggableTasks();
}


/**
 * Groups tasks by their valid board status.
 * @param {Object[]} taskList - Tasks to group.
 * @returns {Object.<string, Object[]>} Tasks grouped by status.
 */
function groupTasksByStatus(taskList) {
    return taskList.reduce((acc, task) => {
        if (!taskContainerMap[task.status]) return acc;
        if (!acc[task.status]) {
            acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
    }, {});
}


/**
 * Renders grouped tasks into their respective board columns.
 * @param {Object.<string, Object[]>} groupedTasks - Tasks grouped by status.
 */
function renderGroupedTasks(groupedTasks) {
    Object.entries(taskContainerMap).forEach(([status, container]) => {
        const statusTasks = groupedTasks[status] || [];
        container.innerHTML = statusTasks
            .map(task => returnTaskHTML(task, contacts))
            .join("");
    });
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
    if (event.target.closest(".task-move")) return;
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
    setFormCategory(task.category);
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


init();