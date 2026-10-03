import { getInitials } from "./contact-templates.js";

export function returnAddTaskForm() {
    return ` <button type="button" id="close-task-dialog" aria-label="Close task">x</button>
            <section class="form-wrapper">
            <h1>Add Task</h1>
            <form id="task-form" class="task-form" novalidate>
                <div class="task-form-columns">
                    <div class="task-form-column">
                        <!-- Title -->
                        <div class="form-group">
                            <label for="title">Title<span class="error-message">*</span></label>
                            <input type="text" id="title" name="title" class="task-input" placeholder="Enter a title">
                            <span id="title-error" class="form-error">This field is required</span>
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
                            <input type="date" id="dueDate" name="dueDate" class="task-input task-date-input">
                            <span id="dueDate-error" class="form-error">This field is required</span>
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

                        <!-- Assigned To -->
                        <div class="form-group">
                            <label for="assigned-to">Assigned To</label>

                            <select id="assigned-to" name="assignedTo" class="task-input" >
                                <option>Select contacts to assign</option>
                            </select>
                        </div>

                        <!-- Category -->
                        <div class="form-group">
                            <label for="category">Category<span class="error-message">*</span></label>
                            <select id="category" name="category" class="task-input">
                                <option value="">Select task category</option>
                                <option value="User Story">User Story</option>
                                <option value="Technical Task">Technical Task</option>
                            </select>
                            <span id="category-error" class="form-error">This field is required</span>
                        </div>

                        <!-- Subtasks -->
                        <div class="form-group">
                            <label for="new-subtask">Subtasks</label>

                            <div class="subtask-input">
                                <input type="text" id="new-subtask" class="task-input" placeholder="Add new subtask">

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

export function returnTaskHTML(task, contacts) {
    const escapedTitle = escapeHTML(task.title);
    const escapedDescription = escapeHTML(task.description);
    return `
        <li class="task-box" draggable="true" data-task-id="${task.id}">
            <h3 class="${task.category.replace(/\s+/g, '-').toLowerCase()} task-category">${task.category}</h3>
            <h4>${escapedTitle}</h4>
            <span class="task-descr">${escapedDescription}</span>
            ${returnSubtaskProgressHTML(task.subtasks)}
            <div class="initials-container">
                ${returnAssignedToHTML(task.assignedTo, contacts)}
                <img src="../assets/icons/prio-${task.priority}.svg" alt="${task.priority}-priority icon">
            </div>
        </li>
    `
}

export function returnTaskView(task, contacts) {
    const escapedTitle = escapeHTML(task.title);
    const escapedDescription = escapeHTML(task.description);
    return `
        <article class="task-detail" data-task-id="${task.id}">
            <header class="task-detail-header">
                <span class="task-category ${task.category.replace(/\s+/g, '-').toLowerCase()}">
                    ${task.category}
                </span>
                <button type="button" id="close-task-dialog" aria-label="Close task">x</button>
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
                    <dd class="task-priority">${task.priority}</dd>
                </div>
            </dl>

            <section class="task-assigned">
                <h3>Assigned To:</h3>
                <ul class="task-assigned-list">
                    ${returnAssignedToHTML(task.assignedTo, contacts, true)}
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

export function returnNoTaskHTML() {
    return `<div>No Tasks here</div>`;
}

function returnSubtaskProgressHTML(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";
    }
    const subtaskStats = getSubtaskStats(subtasks);
    return returnSubtaskCompletionHTML(subtaskStats);
}

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

export function returnAssignedToHTML(assignedToList, contacts, showName = false) {
    if (!assignedToList || assignedToList.length === 0) {
        return "<div></div>";
    }

    const assignedToHTML = assignedToList.map(contactID =>
        returnContactHTML(
            contacts.find(contact => contact.id === contactID),
            showName
        )
    );
    return assignedToHTML.join("");
}


function returnContactHTML(contact, showName = false) {
    if (!contact) {
        return "";
    }
    const escapedInitials = escapeHTML(getInitials(contact.name));
    return `
    <div class="user-avatar" style="background: ${contact.color};">${escapedInitials}</div>
    ${showName ? returnNameHTML(contact.name) : ""}
    `;
}


function returnNameHTML(name) {
    const escapedName = escapeHTML(name);
    return `
        <span>${escapedName}</span>
    `;
}

export function returnSubtaskEditHTML(subtask, index) {
    return `
    <input type="text" id="subtask-edit-${index}" class="task-input subtask-edit-input" value="${escapeHTML(subtask.description)}">
    <button type="button" class="subtask-edit-cancel-btn">X</button>
    <button type="button" class="subtask-edit-confirm-btn">✓</button>
  `
}

export function returnSubtaskHTML(subtask, index) {
    const escapedDescription = escapeHTML(subtask.description);
    return `
        <li class="subtask-item" data-index="${index}">
            <span class="subtask-description">
                ${escapedDescription}
            </span>

            <button
                type="button"
                class="subtask-edit-btn"
                aria-label="Subtask ${escapedDescription} editieren"
            >
                Edit
            </button>
            <button
                type="button"
                class="subtask-delete-btn"
                aria-label="Subtask ${escapedDescription} löschen"
            >
                Delete
            </button>
        </li>
    `;
}

function escapeHTML(text) {
    const characters = [
        ["&", "&amp;"],
        ["<", "&lt;"],
        [">", "&gt;"],
        ['"', "&quot;"],
        ["'", "&#039;"]
    ];
    characters.forEach(([character, entity]) => {
        text = text.replaceAll(character, entity);
    });

    return text;
}