import { updateTaskStatus } from "./db.js";

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