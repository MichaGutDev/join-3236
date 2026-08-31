import { database } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
// const task = [
//   {
//     id: 1,
//     title: "Create login page",
//     description: "Build the basic structure and styling for the login page.",
//     dueDate: "2026-08-25",
//     prio: "urgent",
//     category: "User Story",
//     assignedTo: ["contactId1", "contactId2"],
//     status: "To Do",
//     subtasks: [
//       { subtask: "Create HTML structure", completion: true },
//       { subtask: "Add responsive styling", completion: false },
//     ],
//   }
// ];
const formRef = document.querySelector('#task-form');

formRef.addEventListener("submit", (event) => {
  event.preventDefault();
  getValues();
});

function getValues() {
  const formData = new FormData(formRef);
  createTaskObject([...formData])
};

let valueLog = [];

/**
 * creates the task object based on the data given by getValues
 * @param {array} formData - array of [key, value] from input submit
 */
async function createTaskObject(formData) {
  const data = {
    assignedTo: [],
    subtasks: [],
  };
  formData.forEach(([key, value]) => {
    if (key === "assignedTo" || key === "subtask") {
      data[key].push(value);
    } else {
      data[key] = value;
    }
  });
  valueLog.push(data);
  // await addTask(data); // ENABLE THIS HERE TO UPLOAD
}

// const newTaskRef = push(ref(database, 'tasks'));

// set(newTaskRef, {
//   title: "Login-Seite bauen",
//   description: "...",
//   dueDate: "2026-08-30",
//   priority: "urgent",
//   category: "Technical Task",
//   status: "todo",
//   assignedTo: ["contactId1", "contactId2"],
//   subtasks: [
//     { title: "Formular bauen", done: false }
//   ]
// });

async function addTask(task) {
  const tasksRef = ref(database, "tasks");
  const newTaskRef = push(tasksRef);

  await set(newTaskRef, task);
}

let subtasks = [];

const addSubtaskBtnRef = document.getElementById("add-subtask-btn");

addSubtaskBtnRef.addEventListener("click", addSubtask);

function addSubtask() {
    const subTaskInputRef = document.getElementById("new-subtask");
    subtasks.push({
        description: subTaskInputRef.value,
        completion: false
    });
    renderSubtasks();
}

function renderSubtasks() {
  const subTaskListRef = document.getElementById('subtask-list');
  subTaskListRef.innerHTML = "";
  for (let index = 0; index < subtasks.length; index++) {
    const subtask = subtasks[index];
    subTaskListRef.innerHTML += returnSubtaskHTML(subtask);
  }
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
                onclick="deleteSubtask(${index})"
            >
                Löschen
            </button>
        </li>
    `;
}