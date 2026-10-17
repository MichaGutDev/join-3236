import { escapeHTML } from "./html-utils.js";

/**
 * Returns the HTML for a subtask with edit and delete actions.
 * @param {{description: string, completion: boolean}} subtask - Subtask to display.
 * @param {number} index - Index of the subtask.
 * @returns {string} Subtask HTML.
 */
export function returnSubtaskHTML(subtask, index) {
    const escapedDescription = escapeHTML(subtask.description);
    return `
        <li class="subtask-item" data-index="${index}">
            <span class="subtask-description">
                ${escapedDescription}
            </span>
            <div class="subtask-item-actions">
                <button type="button" class="subtask-icon-btn subtask-edit-btn" aria-label="Edit subtask">
                    <img src="../assets/icons/edit-icon.svg" alt="">
                </button>
                <div class="subtask-input-divider"></div>
                <button type="button" class="subtask-icon-btn subtask-delete-btn" aria-label="Delete subtask">
                    <img src="../assets/icons/trash-icon.svg" alt="">
                </button>
            </div>
        </li>
    `;
}


/**
 * Returns the subtask progress HTML if subtasks exist.
 * @param {{description: string, completion: boolean}[]} subtasks - Task subtasks.
 * @returns {string} Progress HTML or an empty string.
 */
export function returnSubtaskProgressHTML(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";
    }
    const subtaskStats = getSubtaskStats(subtasks);
    return returnSubtaskCompletionHTML(subtaskStats);
}


/**
 * Returns the HTML for the subtask progress indicator.
 * @param {{completed: number, total: number, percentage: number}} subtaskStats - Subtask statistics.
 * @returns {string} Progress indicator HTML.
 */
function returnSubtaskCompletionHTML(subtaskStats) {
    return `
        <div class="subtask-progress-container">
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${subtaskStats.percentage}%">
                </div>
            </div>
            <span>${subtaskStats.completed}/${subtaskStats.total} Subtasks</span>
        </div>
    `;
}


/**
 * Calculates the completion statistics of subtasks.
 * @param {{completion: boolean}[]} subtasks - Subtasks to evaluate.
 * @returns {{completed: number, total: number, percentage: number}}
 */
function getSubtaskStats(subtasks) {
    const completed = subtasks.filter(subtask => subtask.completion).length;
    const total = subtasks.length;
    const percentage = Math.round(completed / total * 100);
    return {
        completed,
        total,
        percentage
    };
}


/**
 * Returns the HTML for a task's subtask checklist.
 * @param {{description: string, completion: boolean}[]} subtasks - Task subtasks.
 * @returns {string} Subtask checklist HTML.
 */
export function returnSubtasksHTML(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";
    }

    return `
        <section class="task-subtasks">
            <h3>Subtasks</h3>

            <ul class="task-subtask-list">
                ${subtasks.map(({ description, completion }, index) => {
        const escapedDescription = escapeHTML(description);
        return `
                        <li class="subtask-item" data-subtask-index="${index}">
                                <input
                                    class="subtask-item-input"
                                    type="checkbox"
                                    
                                    ${completion ? "checked" : ""}
                            >
                            <span class="subtask-description">
                                ${escapedDescription}
                            </span>
                        </li>
                        `;
    }).join("")}
            </ul>
        </section>
    `;
}


/**
 * Returns the editable HTML template for a subtask.
 * @param {{description: string, completion: boolean}} subtask - Subtask to edit.
 * @param {number} index - Index of the subtask.
 * @returns {string} Subtask edit HTML.
 */
export function returnSubtaskEditHTML(subtask, index) {
    return `
    <input type="text" id="subtask-edit-${index}" class="task-input subtask-edit-input" value="${escapeHTML(subtask.description)}">
    <button type="button" class="subtask-icon-btn subtask-edit-delete-btn" aria-label="Delete subtask">
        <img src="../assets/icons/trash-icon.svg" alt="">
    </button>
    <div class="subtask-input-divider"></div>
    <button type="button" class="subtask-icon-btn subtask-edit-confirm-btn" aria-label="Save subtask">
        <img src="../assets/icons/check-icon.svg" alt="">
    </button>
  `
}