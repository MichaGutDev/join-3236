import { returnSubtaskProgressHTML, returnAssignedToHTML } from "./board.js";
import { getInitials } from "./contact-templates.js";
import { renderContacts } from "./add_task.js";

export function returnAddTaskForm() {
    return` <button type="button" id="close-task-dialog" aria-label="Close task">x</button>
            <form id="task-form" class="task-form">
                <div class="task-form-columns">
                    <div class="task-form-column">
                        <!-- Title -->
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" class="task-input" placeholder="Enter a title"
                                required>
                        </div>

                        <!-- Description -->
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" class="task-input task-textarea"
                                placeholder="Enter a description" required></textarea>
                        </div>

                        <!-- Due Date -->
                        <div class="form-group">
                            <label for="dueDate">Due Date</label>
                            <input type="date" id="dueDate" name="dueDate" class="task-input" required>
                        </div>
                    </div>

                    <div class="task-form-divider"></div>

                    <div class="task-form-column">
                        <!-- Priority -->
                        <div class="form-group">
                            <fieldset class="priority">
                                <legend>Priority</legend>

                                <label class="priority-urgent">
                                    <input type="radio" name="priority" value="urgent" id="urgent">
                                    <span>Urgent</span><img src="../assets/icons/prio-urgent.svg" alt="">
                                </label>

                                <label class="priority-medium">
                                    <input type="radio" name="priority" value="medium" id="medium">
                                    <span>Medium</span><img src="../assets/icons/prio-medium.svg" alt="" checked>
                                </label>

                                <label class="priority-low">
                                    <input type="radio" name="priority" value="low" id="low">
                                    <span>Low</span><img src="../assets/icons/prio-low.svg" alt="">
                                </label>
                            </fieldset>
                        </div>

                        <!-- Assigned To -->
                        <div class="form-group">
                            <label for="assigned-to">Assigned To</label>

                            <select id="assigned-to" name="assignedTo" class="task-input" multiple>
                                <option value="" selected>Select contacts to assign</option>
                            </select>
                        </div>

                        <!-- Category -->
                        <div class="form-group">
                            <label for="category">Category</label>
                            <select id="category" name="category" class="task-input" required>
                                <option value="">Select task category</option>
                                <option value="User Story">User Story</option>
                                <option value="Technical Task">Technical Task</option>
                            </select>
                        </div>

                        <!-- Subtasks -->
                        <div class="form-group">
                            <label for="new-subtask">Subtasks</label>

                            <div class="subtask-input">
                                <input type="text" id="new-subtask" class="task-input" placeholder="Add new subtask">

                                <button type="button" id="add-subtask-btn" class="btn-primary subtask-add-btn">
                                    Add
                                </button>
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
                        <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel
                            <img src="../assets/icons/cancel-icon.svg" alt=""></button>
                        <button type="submit" class="btn btn-primary" id="submit-btn">Create Task
                            <img src="../assets/icons/check-icon.svg" alt=""></button>
                    </div>
                </div>
            </form>
            `
}

export function returnTaskHTML(task) {
    return `
        <li class="task-box" draggable="true" data-task-id="${task.id}">
            <h3 class="${task.category.replace(/\s+/g, '-').toLowerCase()} task-category">${task.category}</h3>
            <h4>${task.title}</h4>
            <span class="task-descr">${task.description}</span>
            ${returnSubtaskProgressHTML(task.subtasks)}
            <div class="initials-container">
                ${returnAssignedToHTML(task.assignedTo)}
                <img src="../assets/icons/prio-${task.priority}.svg" alt="${task.priority}-priority icon">
            </div>
        </li>
    `
}

export function returnTaskView(task) {
    return `
        <article class="task-detail" data-task-id="${task.id}">
            <header class="task-detail-header">
                <span class="task-category ${task.category.replace(/\s+/g, '-').toLowerCase()}">
                    ${task.category}
                </span>
                <button type="button" id="close-task-dialog" aria-label="Close task">x</button>
            </header>

            <h2 class="task-title">
                ${task.title}
            </h2>
            <p class="task-description">
                ${task.description}
            </p>

            <dl class="task-information">
                <div>
                    <dt>Due date:</dt>
                    <dd class="task-due-date">${task.dueDate}</dd>
                </div>
                <div>
                    <dt>Priority:</dt>
                    <dd class="task-priority">${task.priority}</dd>
                </div>
            </dl>

            <section class="task-assigned">
                <h3>Assigned To:</h3>
                <ul class="task-assigned-list">
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

export function returnSubtasksHTML(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";
    }

    return `
        <section class="task-subtasks">
            <h3>Subtasks</h3>

            <ul class="task-subtask-list">
                ${subtasks.map(({ description, completion }, index) =>
        `
                        <li class="subtask-item">
                            <input
                                class="subtask-item-input"
                                type="checkbox"
                                data-subtask-index="${index}"
                                ${completion ? "checked" : ""}
                            >

                            <span class="subtask-description">
                                ${description}
                            </span>
                        </li>`).join("")}
            </ul>
        </section>
    `;
}

export function returnSubtaskCompletionHTML(subtaskStats) {
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

export function returnContactHTML(contact) {
    return `
        ${returnContactInitialsHTML(contact)}
        <span> ${contact.name} </span>
        `
}

export function returnContactInitialsHTML(contact) {
    return `
        <div class="initials-box">
            <div class="contact-initials" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>
        </div>
        `
}