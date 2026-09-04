let currentDraggedTaskId;

const taskContainerMap = {
    "To Do" : document.getElementById('to_do'),
    "In Progress" : document.getElementById('in_progress'),
    "Awaiting Feedback" : document.getElementById('await_feedback'),
    "Done" : document.getElementById('done'),
}

const taskTest = [
    {
        id: 1,
        title: "Create login page",
        description: "Build the basic structure and styling for the login page.",
        dueDate: "2026-08-25",
        priority: "urgent",
        category: "User Story",
        assignedTo: ["contactId1", "contactId2"],
        status: "To Do",
        subtasks: [
            { subtask: "Create HTML structure", completion: true },
            { subtask: "Add responsive styling", completion: false },
        ],
    },
    {
        id: 2,
        title: "Design task cards",
        description: "Create the layout for task cards on the board.",
        dueDate: "2026-08-28",
        priority: "medium",
        category: "Technical Task",
        assignedTo: ["contactId3"],
        status: "To Do",
        subtasks: [
            { subtask: "Create card layout", completion: false },
            { subtask: "Add priority icons", completion: false },
        ],
    },
    {
        id: 3,
        title: "Add contact form",
        description: "Create a form for adding new contacts.",
        dueDate: "2026-09-02",
        priority: "low",
        category: "User Story",
        assignedTo: ["contactId2"],
        status: "To Do",
        subtasks: [],
    },
];



function init() {
    displayTasks();
}


// rework here : progress bar into seperate function, that returns the html and progress of the bar, if there are tasks present


function returnTaskHTML(task) { // takes full object
    return `
        <li class="task-box" draggable="true" ondragstart="startDragging(event, ${task.id})" ondragend="stopDragging(event)">
            <h3 class="${task.category.replace(/\s+/g, '-').toLowerCase()} task-category">${task.category}</h3>
            <h4>${task.title}</h4>
            <span class="task-descr">${task.description}</span>
            <div class="subtask-progress-container">
                <div class="progress-bar-outer">
                    <div class="progress-bar" style="width: ${returnSubtaskCompletionPercent(task.subtasks)}%;"></div>
                </div>
                <span>${returnSubtaskCompletionNum(task.subtasks)} Subtasks</span>
            </div>
            <div class="initials-container">
                <div class="user-avatar">RB</div>
                <img src="../assets/icons/prio-${task.priority}.svg" alt="${task.priority}-priority icon">
            </div>
        </li>
    `
}

/**
 * Renders all tasks into the respective containers.
 */
function displayTasks() {
    clearTaskHTML();
    tasks.forEach(task => {
        taskContainerMap[task.status].innerHTML += returnTaskHTML(task)
    });
}

/**
 * Clears all HTML Task Containers.
 */
function clearTaskHTML() {
    Object.values(taskContainerMap).forEach(taskContainer => {taskContainer.innerHTML = ""});
}

/**
 * Calculates the percentage of completed subtasks.
 *
 * @param {Array} subtaskList - List of subtasks belonging to a task.
 * @returns {number} Percentage of completed subtasks.
 */
function returnSubtaskCompletionPercent(subtaskList) {
    let completionData = returnSubtaskValues(subtaskList);
    let percentCompletion = completionData[0] / completionData[1] * 100;
    if (!percentCompletion) {
        percentCompletion = 0;
    }
    return percentCompletion
}

/**
 * Returns the number of completed subtasks and total subtasks.
 *
 * @param {{completion: boolean}[]} subtaskList - List of subtasks.
 * @returns {string} Completion count in the format "completed / total".
 */
function returnSubtaskCompletionNum(subtaskList) {
    let completionData = returnSubtaskValues(subtaskList);
    return `${completionData[0]}/${completionData[1]}`
}

/**
 * Counts completed subtasks and returns completion statistics.
 *
 * @param {{subtask: string, completion: boolean}[]} subtaskList
 * @returns {[number, number]} Completed subtasks and total subtasks.
 */
function returnSubtaskValues(subtaskList) {
    let counter = 0;
    subtaskList.forEach(subtask => {
        if (subtask.completion === true) {
            counter++;
        }
    });
    return [counter, subtaskList.length]
}

const taskDialogRef = document.getElementById("task-edit-dialog");
function openTaskEdit() {
    // insertTask(insertTaskTest);
    taskDialogRef.showModal();
}

function closeTaskEdit() {
    taskDialogRef.close();
}

let insertTaskTest = {
        id: 1,
        title: "Create login page",
        description: "Build the basic structure and styling for the login page.",
        // dueDate: "2026-08-25",
        // priority: "urgent",
        category: "User Story",
        assignedTo: ["contactId1", "contactId2"],
        status: "To Do",
        subtasks: [
            { subtask: "Create HTML structure", completion: true },
            { subtask: "Add responsive styling", completion: false },
        ],
    };

function insertTask(task) {
    Object.entries(task).forEach(([key, value]) => {
        if (key !== "id") {
            document.getElementById(key).value = value;
        }
    });
}


/**
 * Stores the id of the dragged task and applies a visual dragging style to the element.
 * 
 * @param {DragEvent} event 
 * @param {number} id 
 */
function startDragging(event, id) {
    currentDraggedTaskId = id;
    event.target.classList.add('dragging');
}


/**
 * Removes the visual dragging style from the element.
 * 
 * @param {DragEvent} event 
 */
function stopDragging(event) {
     event.target.classList.remove('dragging');
}


/**
 * Prevents the browser's default behavior during dragover, allowing the element to become a valid drop target.
 * 
 * @param {DragEvent} event 
 */
function allowDrop(event) {
    event.preventDefault();
}


/**
 * Finds the dragged task by its id, updates its status, removes the drop-target highlight, and re-renders the board.
 * 
 * @param {string} status 
 */
function moveTaskTo(status) {
    const draggedTask = tasks.find(task => task.id === currentDraggedTaskId);
    draggedTask.status = status;
    document.querySelector('.drag-area-highlight')?.classList.remove('drag-area-highlight');
    displayTasks();
}


/**
 * Adds the dashed highlight style to the column with the given id.
 * 
 * @param {string} id 
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}


/**
 * Removes the dashed highlight style from the column with the given id.
 * 
 * @param {string} id 
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}