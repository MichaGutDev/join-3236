import { database } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


const tasksRef = ref(database, "tasks");


// Listens for changes under "tasks" and updates all task-related dashboard counts
onValue(tasksRef, (snapshot) => {
    const tasksData = snapshot.val();

    updateCount(tasksData, "To Do", "todo-count");
    updateCount(tasksData, "Done", "done-count");
    updateCount(tasksData, "In Progress", "progress-count");
    updateCount(tasksData, "Awaiting Feedback", "feedback-count");

    const boardCount = Object.values(tasksData).length;
    document.getElementById("board-count").textContent = boardCount;
    const urgentCount = Object.values(tasksData).filter(task => task.priority === "urgent" && task.status !== "Done").length;
    document.getElementById("urgent-count").textContent = urgentCount;

})


/**
 * This helper function counts and writes the corresponding value to the DOM
 * 
 * @param {object} tasksData 
 * @param {string} status 
 * @param {string} elementId 
 */
function updateCount(tasksData, status, elementId) {
    const count = Object.values(tasksData).filter(task => task.status === status).length;
    document.getElementById(elementId).textContent = count;

}




