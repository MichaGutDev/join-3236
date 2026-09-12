import { database } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

let valueLog = [];
let editingTaskId = null;
const subtasks = [];
const formRef = document.querySelector('#task-form');
const addSubtaskBtnRef = document.getElementById("add-subtask-btn");
const logger = document.getElementById('logger');

addSubtaskBtnRef.addEventListener("click", addSubtask);
formRef.addEventListener("submit", (event) => {
  event.preventDefault();
  getValues();
});
logger.addEventListener("click", logSubtasks);

async function getValues() {
    const formData = new FormData(formRef);
    const task = createTaskObject(formData);
    valueLog.push(task);
    // await saveTask(task, editingTaskId);
    logSubtasks();
    resetTaskForm();
    logSubtasks();
}

function createTaskObject(formData) {
    return {
        title: formData.get("title"),
        description: formData.get("description"),
        dueDate: formData.get("dueDate"),
        prio: formData.get("priority"),
        category: formData.get("category"),
        assignedTo: formData.getAll("assignedTo"),
        subtasks: [...subtasks],
        status: formData.get("status"),
    };
}

// async function saveTask(task, id = null) {
//     if (id) {
//         const taskRef = ref(database, `tasks/${id}`);
//         await set(taskRef, task);
//         return;
//     }

//     const tasksRef = ref(database, "tasks");
//     const newTaskRef = push(tasksRef);

//     await set(newTaskRef, task);
// }

function resetTaskForm() {
    formRef.reset();
    subtasks.length = 0;
    editingTaskId = null;

    renderSubtasks();
}

function addSubtask() {
  const subTaskInputRef = document.getElementById("new-subtask");
  subtasks.push({
    description: subTaskInputRef.value,
    completion: false
  });
  renderSubtasks();
  document.getElementById("new-subtask").value = "";
}

function updateSubtaskDelButtons() {
  const deleteSubtaskButtons = document.querySelectorAll(".subtask-delete-btn");
  deleteSubtaskButtons.forEach(button => { button.addEventListener("click", deleteSubtask); });
}

function renderSubtasks() {
  const subTaskListRef = document.getElementById('subtask-list');
  subTaskListRef.innerHTML = "";
  for (let index = 0; index < subtasks.length; index++) {
    const subtask = subtasks[index];
    subTaskListRef.innerHTML += returnSubtaskHTML(subtask, index);
  }
  updateSubtaskDelButtons();
}

function returnSubtaskHTML(subtask, index) {
  return `
        <li class="subtask-item">
            <span class="subtask-description">
                ${subtask.description}
            </span>

            <button
                type="button"
                class="subtask-delete-btn"
                aria-label="Subtask ${subtask.description} löschen"
                data-index="${index}"
            >
                Löschen
            </button>
        </li>
    `;
}

function deleteSubtask(event) {
  const index = Number(event.currentTarget.dataset.index);
  subtasks.splice(index, 1)
  renderSubtasks();
}

function logSubtasks() {
  console.log(subtasks);
  console.log(valueLog);
}