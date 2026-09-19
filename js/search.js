import { displayTasks } from "./board.js";

/**
 * Filters tasks by title and description based on the current search input value, and displays the matching results.
 * @param {array} tasks from board
 * @param {string} searchTerm from board input field
 */
export function filterTasks(tasks, searchTerm) {
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
    );
    return filteredTasks
}