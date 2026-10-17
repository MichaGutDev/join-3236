import { updateTaskStatus } from "./db.js";
import { showToast } from "./toast.js";

let currentDraggedTaskId = null;


/**
 * Registers drag-and-drop listeners for all task columns.
 */
export function initDragAndDrop() {
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
export function initDraggableTasks() {
    const taskElements = document.querySelectorAll(".task-box");

    taskElements.forEach(task => {
        task.addEventListener("dragstart", startDragging);
        task.addEventListener("dragend", stopDragging);
    });
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
 * Allows dropping and highlights the target column.
 * @param {DragEvent} event - The dragover event.
 */
function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add("drag-area-highlight");
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

    if (!taskId || !status) return;

    await updateTaskStatus(taskId, status);
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


/**
 * Registers the click listener for mobile task movement.
 */
export function initMobileTaskMovement() {
    const boardRef = document.querySelector(".board-wrapper");
    boardRef.addEventListener("click", handleMobileTaskMovement);
}


/**
 * Handles mobile task movement and menu interactions.
 * @param {MouseEvent} event - The click event.
 */
function handleMobileTaskMovement(event) {
    const statusButtonRef = event.target.closest(".mobile-move-task-list button[data-status]");
    const moveButtonRef = event.target.closest(".task-move-btn");

    if (statusButtonRef) {
        event.stopPropagation();
        moveTaskToStatus(statusButtonRef);
    } else if (moveButtonRef) {
        event.stopPropagation();
        toggleMoveTaskMenu(moveButtonRef);
    } else {
        closeMoveTaskMenus();
    }
}


/**
 * Updates a task's status in Firebase and closes the move menu.
 * @param {HTMLButtonElement} statusButtonRef - Selected status button.
 * @returns {Promise<void>}
 */
async function moveTaskToStatus(statusButtonRef) {
    const taskRef = statusButtonRef.closest(".task-box");
    const taskId = taskRef.dataset.taskId;
    const newStatus = statusButtonRef.dataset.status;
    try {
        await updateTaskStatus(taskId, newStatus);
        showToast("Task moved successfully");
    } catch (error) {
        console.error("Failed to move task:", error);
    } finally {
        closeMoveTaskMenus();
    }
}


/**
 * Toggles the selected move menu and closes other open menus.
 * @param {HTMLButtonElement} moveButtonRef - Move menu trigger button.
 */
function toggleMoveTaskMenu(moveButtonRef) {
    const containerRef = moveButtonRef.closest(".task-move");
    const menuRef = containerRef.querySelector(".mobile-move-task-list");
    const wasOpen = !menuRef.classList.contains("d-none");

    closeMoveTaskMenus();

    if (wasOpen) return;

    menuRef.classList.remove("d-none");
    moveButtonRef.setAttribute("aria-expanded", "true");
}


/**
 * Closes all open move menus and resets their accessibility attributes.
 */
function closeMoveTaskMenus() {
    document.querySelectorAll(".mobile-move-task-list:not(.d-none)")
        .forEach(menu => {
            menu.classList.add("d-none");
            const buttonRef = menu.closest(".task-move").querySelector(".task-move-btn");
            buttonRef.setAttribute("aria-expanded", "false");
        });
}