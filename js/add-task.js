import { initTaskForm } from "./task-form.js";
import { showToast } from "./toast.js";


/**
 * Initializes the task creation form.
 */
function init() {
  initTaskForm("To Do", null, showTaskAddedToast);
}


/**
 * Displays a success toast with a callback to navigate to the board.
 */
function showTaskAddedToast() {
  showToast("Task added to board", goToBoard, "../assets/icons/board-icon.svg");
}


/**
 * Redirects the user to the board page.
 */
function goToBoard() {
  window.location.href = "board.html";
}


init();