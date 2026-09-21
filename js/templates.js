import { returnSubtaskCompletionPercent, returnSubtaskCompletionNum } from "./board.js";

export function returnAddTaskForm() {
    return `<div class="form-wrapper">
            <form id="task-form">
                <!-- Title -->
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" placeholder="Enter a title" required>
                </div>

                <!-- Description -->
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" placeholder="Enter a description" required></textarea>
                </div>

                <!-- Due Date -->
                <div class="form-group">
                    <label for="due-date">Due Date</label>
                    <input type="date" id="due-date" name="dueDate" required>
                </div>

                <!-- Priority -->
                <div class="form-group">
                    <fieldset class="priority">
                        <legend>Priority</legend>

                        <label class="priority-high">
                            <input type="radio" name="priority" value="urgent">
                            <span>Urgent</span><img src="../assets/icons/prio-urgent.svg" alt="">
                        </label>

                        <label class="priority-medium">
                            <input type="radio" name="priority" value="medium" checked>
                            <span>Medium</span><img src="../assets/icons/prio-medium.svg" alt="">
                        </label>

                        <label class="priority-low">
                            <input type="radio" name="priority" value="low">
                            <span>Low</span><img src="../assets/icons/prio-low.svg" alt="">
                        </label>
                    </fieldset>
                </div>

                <!-- Category -->
                <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" name="category" required>
                        <option value="">Select category</option>
                        <option value="User Story">User Story</option>
                        <option value="Technical Task">Technical Task</option>
                    </select>
                </div>

                <!-- Assigned To -->
                <div class="form-group">
                    <label for="assigned-to">Assigned To</label>

                    <select id="assigned-to" name="assignedTo" multiple>
                        <option value="contactId1" selected>Contact 1</option>
                        <option value="contactId2">Contact 2</option>
                        <option value="contactId3" selected>Contact 3</option>
                        <option value="contactId3">Contact 4</option>
                        <option value="contactId3">Contact 5</option>
                        <option value="contactId3">Contact 6</option>
                        <option value="contactId3">Contact 7</option>
                        <option value="contactId3">Contact 8</option>
                    </select>
                </div>

                <!-- Subtasks -->
                <div class="form-group">
                    <label for="new-subtask">Subtasks</label>

                    <div class="subtask-input">
                        <input type="text" id="new-subtask" placeholder="Add new subtask">

                        <button type="button" id="add-subtask-btn" class="btn-primary">
                            Add
                        </button>
                    </div>

                    <ul id="subtask-list" class="subtask-list">
                        <!-- Subtasks hier rendern -->
                    </ul>
                </div>

                <div class="form-actions">
                    <button type="reset" class="btn-secondary">Clear</button>
                    <button type="submit" class="btn-primary">Create Task</button>
                </div>
            </form>
        </div>`
}

export function returnTaskHTML(task) {
    return `
        <li class="task-box" draggable="true" data-task-id="${task.id}">
            <h3 class="${task.category.replace(/\s+/g, '-').toLowerCase()} task-category">${task.category}</h3>
            <h4>${task.title}</h4>
            <span class="task-descr">${task.description}</span>
            <div class="subtask-progress-container">
                <div class="progress-bar-outer">
                    
                </div>
                
            </div>
            <div class="initials-container">
                <div class="user-avatar">RB</div>
                <img src="../assets/icons/prio-${task.priority}.svg" alt="${task.priority}-priority icon">
            </div>
        </li>
    `
}

export function returnTaskView(task) {
    return `
        <article class="task-detail">
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

            <section class="task-subtasks">
                <h3>Subtasks</h3>
                <ul class="task-subtask-list">
                </ul>
            </section>

            <footer class="task-actions">
                <button type="button" class="delete-task-btn">Delete</button>
                <button type="button" class="edit-task-btn">Edit</button>
            </footer>
        </article>
    `
}

//<div class="progress-bar" style="width: ${returnSubtaskCompletionPercent(task.subtasks)}%;"></div>
//<span>${returnSubtaskCompletionNum(task.subtasks)} Subtasks</span>