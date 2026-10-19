import { returnAssignedContactsHTML } from "./contact-templates.js";
import { escapeHTML } from "./html-utils.js";
import { returnSubtasksHTML, returnSubtaskProgressHTML } from "./subtask-templates.js";


const taskStatuses = ["To Do", "In Progress", "Awaiting Feedback", "Done"];


/**
 * Returns the HTML template for the task creation form.
 *
 * @returns {string} Task form HTML.
 */
export function returnAddTaskForm() {
    return ` <button type="button" id="close-task-dialog" class="task-close-btn" aria-label="Close task"></button>
            <section class="form-wrapper">
            <h1>Add Task</h1>
            <form id="task-form" class="task-form" novalidate>
                <div class="task-form-columns">
                    <div class="task-form-column">
                        <!-- Title -->
                        <div class="form-group">
                            <label for="title">Title<span class="error-message">*</span></label>
                            <input type="text" id="title" name="title" class="task-input" placeholder="Enter a title" autocomplete="off">
                            <span id="title-error" class="form-error d-none">This field is required</span>
                        </div>

                        <!-- Description -->
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" class="task-input task-textarea"
                                placeholder="Enter a description"></textarea>
                        </div>

                        <!-- Due Date -->
                        <div class="form-group">
                            <label for="dueDate">Due Date<span class="error-message">*</span></label>
                            <input type="date" id="dueDate" name="dueDate" class="task-input task-date-input" required>
                            <span id="dueDate-error" class="form-error d-none">This field is required</span>
                        </div>
                    </div>

                    <div class="task-form-divider"></div>

                    <div class="task-form-column">
                        <!-- Priority -->
                        <div class="form-group">
                            <fieldset class="priority">
                                <legend>Priority</legend>

                                <label class="priority-high">
                                    <input type="radio" name="priority" value="urgent" id="urgent">
                                    <span>Urgent</span><img src="../assets/icons/prio-urgent.svg" alt="">
                                </label>

                                <label class="priority-medium">
                                    <input type="radio" name="priority" value="medium" id="medium" checked>
                                    <span>Medium</span><img src="../assets/icons/prio-medium.svg" alt="">
                                </label>

                                <label class="priority-low">
                                    <input type="radio" name="priority" value="low" id="low">
                                    <span>Low</span><img src="../assets/icons/prio-low.svg" alt="">
                                </label>
                            </fieldset>
                        </div>

                        <div class="form-group">
                            <label for="assigned-to-trigger">Assigned to</label>

                            <div class="assigned-to form-group">
                                    <div class="assigned-to-control">
                                        <button type="button" id="assigned-to-trigger" aria-expanded="false"
                                            aria-controls="assigned-to-wrapper">
                                            <span>Select contacts to assign</span>
                                        </button>

                                        <input id="search-assigned-to" type="text" placeholder="Find Contacts"
                                            aria-label="Search contacts to assign" class="d-none">

                                        <button type="button" id="assigned-to-arrow" aria-label="Show contacts"
                                            aria-expanded="false" aria-controls="assigned-to-wrapper">
                                            <img src="../assets/icons/arrow-drop-down.svg" alt="">
                                        </button>
                                    </div>


                                <div id="assigned-to-wrapper" class="d-none">
                                    <p id="no-results-message" class="no-results-message" hidden>
                                        No matching contacts found.
                                    </p>

                                    <div id="assigned-to-dropdown" class="assigned-to-dropdown">
                                        <!-- Contacts kommen hier rein -->
                                    </div>
                                </div>
                            </div>
                            <div id="selected-contacts">
                            </div>
                        </div>



                        <!-- Category -->
                        <div class="form-group">
                            <label for="category-trigger">Category<span class="error-message">*</span></label>
                            <div class="category-select">
                                <div class="category-select-control">
                                    <button type="button" id="category-trigger" class="category-select-trigger"
                                        aria-expanded="false" aria-controls="category-options">
                                        <span id="category-selected" class="category-select-text category-select-placeholder">Select task category</span>
                                        <img src="../assets/icons/arrow-drop-down.svg" alt="">
                                    </button>
                                </div>
                                <div id="category-options" class="category-select-options d-none">
                                    <button type="button" class="category-select-option" data-value="Technical Task">Technical Task</button>
                                    <button type="button" class="category-select-option" data-value="User Story">User Story</button>
                                </div>
                            </div>
                            <input type="hidden" id="category" name="category" value="">
                            <span id="category-error" class="form-error d-none">This field is required</span>
                        </div>

                        <!-- Subtasks -->
                        <div class="form-group subtask-container">
                            <label for="new-subtask">Subtasks</label>

                            <div class="subtask-input">
                                <input type="text" id="new-subtask" class="task-input" placeholder="Add new subtask" autocomplete="off">

                                <div class="subtask-input-actions d-none">
                                    <button type="button" id="clear-subtask-btn" class="subtask-icon-btn subtask-clear-btn"
                                        aria-label="Clear subtask input">
                                        <img src="../assets/icons/cancel-icon.svg" alt="">
                                    </button>
                                    <div class="subtask-input-divider"></div>
                                    <button type="button" id="add-subtask-btn" class="subtask-icon-btn subtask-confirm-btn"
                                        aria-label="Add subtask">
                                        <img src="../assets/icons/check-icon.svg" alt="">
                                    </button>
                                </div>
                            </div>

                            <ul id="subtask-list" class="subtask-list">
                                <!-- Subtasks hier rendern -->
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <p class="required-note"><span class="error-message">*</span>This field is required</p>

                    <div class="form-actions-buttons">
                        <button type="reset" class="btn btn-secondary" id="cancel-btn"><span id="cancel-btn-text">Clear</span>
                            <img src="../assets/icons/cancel-icon.svg" alt=""></button>
                        <button type="submit" class="btn btn-primary" id="create-task-btn" disabled><span id="submit-btn-text">Create Task</span>
                            <img src="../assets/icons/check-icon.svg" alt=""></button>
                    </div>
                </div>
            </form>
        </section>
        `
}


/**
 * Returns the HTML for a task card on the board.
 *
 * @param {Object} task - Task to display.
 * @param {Object[]} contacts - Available contacts.
 * @returns {string} Task card HTML.
 */
export function returnTaskHTML(task, contacts) {
    const escapedTitle = escapeHTML(task.title);
    const escapedDescription = escapeHTML(task.description);
    return `
        <li class="task-box" draggable="true" data-task-id="${task.id}">
            <div class="task-card-header"> 
                <h3 class="${task.category.replace(/\s+/g, '-').toLowerCase()} task-category">${task.category}</h3>
                <div class="task-move">
                    <button type="button" class="task-move-btn"
                        aria-label="Move task" aria-expanded="false">
                        <img src="../assets/icons/mobile-move-task.svg" alt="">
                    </button>

                    <ul class="mobile-move-task-list d-none">
                        <li class="move-task-heading">Move to</li>
                        ${returnMoveTaskMenuHTML(task.status)}
                    </ul>
                </div>
            </div>
            <div class="task-text">
                <h4>${escapedTitle}</h4>
                <span class="task-descr">${escapedDescription}</span>
            </div>
            ${returnSubtaskProgressHTML(task.subtasks)}
            <div class="initials-container">
                ${returnAssignedContactsHTML(task.assignedTo, contacts)}
                <img src="../assets/icons/prio-${task.priority}.svg" alt="${task.priority}-priority icon">
            </div>
        </li>
    `
}


/**
 * Returns the detailed HTML view of a task.
 *
 * @param {Object} task - Task to display.
 * @param {Object[]} contacts - Available contacts.
 * @returns {string} Task detail HTML.
 */
export function returnTaskView(task, contacts) {
    const escapedTitle = escapeHTML(task.title);
    const escapedDescription = escapeHTML(task.description);
    return `
        <article class="task-detail" data-task-id="${task.id}">
            <header class="task-detail-header">
                <span class="task-category ${task.category.replace(/\s+/g, '-').toLowerCase()}">
                    ${task.category}
                </span>
                <button type="button" id="close-task-dialog" class="task-close-btn" aria-label="Close task"></button>
            </header>

            <h2 class="task-title">
                ${escapedTitle}
            </h2>
            <p class="task-description">
                ${escapedDescription}
            </p>

            <dl class="task-information">
                <div>
                    <dt>Due date:</dt>
                    <dd class="task-due-date">${task.dueDate}</dd>
                </div>
                <div>
                    <dt>Priority:</dt>
                    <dd class="task-priority">${task.priority}<img src="../assets/icons/prio-${task.priority}.svg" alt=""></dd>
                </div>
            </dl>

            <section class="task-assigned">
                <h3>Assigned To:</h3>
                <ul class="task-assigned-list">
                    ${returnAssignedContactsHTML(task.assignedTo, contacts, true)}
                </ul>
            </section>

            ${returnSubtasksHTML(task.subtasks)}

            <footer class="task-actions">
                <button type="button" class="delete-task-btn" id="delete-task-btn">Delete</button>
                <button type="button" class="edit-task-btn">Edit</button>
            </footer>
        </article>
    `
}


/**
 * Returns the placeholder HTML for an empty task column.
 *
 * @param {string} columnTitle - Title of the column.
 * @returns {string} Placeholder HTML.
 */
export function returnNoTaskHTML(columnTitle) {
    return `<div class="no-tasks">No tasks ${columnTitle}</div>`;
}


/**
 * Returns move menu options excluding the current task status.
 *
 * @param {string} currentStatus - Current status of the task.
 * @returns {string} HTML for the available status options.
 */
function returnMoveTaskMenuHTML(currentStatus) {
    const availableStatuses = taskStatuses.filter(status => status !== currentStatus);
    const currentIndex = taskStatuses.indexOf(currentStatus);

    return availableStatuses.map(status => {
        const direction = taskStatuses.indexOf(status) < currentIndex ? "up" : "down";
        return `
            <li>
                <button type="button" data-status="${status}">
                    <img src="../assets/icons/arrow-${direction}.svg" alt="">
                    ${status}
                </button>
            </li>`;
    }).join("");
}