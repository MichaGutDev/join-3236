import { auth, database } from './firebase-config.js';
import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


const tasksRef = ref(database, "tasks");


/**
 * This helper function counts and writes the corresponding value to the DOM
 * 
 * @param {object} tasksData
 * @param {string} status
 * @param {string} elementId
 * @returns {void}
 */
function updateCount(tasksData, status, elementId) {
    const count = Object.values(tasksData).filter(task => task.status === status).length;
    document.getElementById(elementId).textContent = count;

}


/**
 * Filters, sorts and writes the nearest urgent deadline to the DOM
 *
 * @param {object} tasksData
 * @returns {void}
 */
function updateUrgentDeadline(tasksData) {
    const urgentData = Object.values(tasksData).filter(task => task.priority === "urgent" && task.status !== "Done");
    urgentData.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const nextUrgentTask = urgentData[0];

    if (nextUrgentTask === undefined) {
        document.getElementById("urgent-date").textContent = "No deadline";
    } else {
        const formattedDate = new Date(nextUrgentTask.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        document.getElementById("urgent-date").textContent = formattedDate;
    }

}


/**
 * Determines the greeting text based on the current time of day.
 *
 * @returns {string} The greeting text.
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    else if (hour < 18) return "Good afternoon,";
    else return "Good evening,";
}


// Listens for changes under "tasks" and updates all task-related dashboard counts
onValue(tasksRef, (snapshot) => {
    const tasksData = snapshot.val();

    updateCount(tasksData, "To Do", "todo-count");
    updateCount(tasksData, "Done", "done-count");
    updateCount(tasksData, "In Progress", "progress-count");
    updateCount(tasksData, "Awaiting Feedback", "feedback-count");

    updateUrgentDeadline(tasksData);

    const boardCount = Object.values(tasksData).length;
    document.getElementById("board-count").textContent = boardCount;
    const urgentCount = Object.values(tasksData).filter(task => task.priority === "urgent" && task.status !== "Done").length;
    document.getElementById("urgent-count").textContent = urgentCount;

})


function displayUserGreeting(user) {
    // get(ref(database, "contacts")).then((snapshot) => {console.log(snapshot.val());});
}


/**
 * Shows the greeting overlay once after login on small screens, then fades it out.
 *
 * @returns {void}
 */
function showGreetingOverlay() {
    if (sessionStorage.getItem("showGreeting") !== "true" || window.innerWidth > 1280) return;
    sessionStorage.removeItem("showGreeting");

    const overlay = document.getElementById("greeting-overlay");
    document.getElementById("greeting-overlay-welcome").textContent = getGreeting();
    overlay.classList.add("visible");

    setTimeout(() => {
        overlay.classList.add("fade-out");
        overlay.addEventListener("transitionend", () => overlay.classList.remove("visible", "fade-out"), { once: true });
    }, 1200);
}


document.getElementById("greeting-welcome").textContent = getGreeting();


showGreetingOverlay();


onAuthStateChanged(auth, (user) => { displayUserGreeting(user); });





