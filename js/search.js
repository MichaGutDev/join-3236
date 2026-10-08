// import { displayTasks } from "./board.js";

/**
 * Filters tasks by title and description based on the current search input value, and returns the array.
 * @param {array} tasks from board
 * @param {string} searchTerm from board input field
 */
export function filterTasks(tasks, searchTerm) {
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
    );
    return filteredTasks
}

/**
 * Filters contacts by name based on the current search input value, and returns the array.
 * @param {array} contacts from task-form
 * @param {string} searchTerm from assignedTo search bar
 * @returns 
 */
export function filterContacts(contacts, searchTerm) {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(normalizedSearchTerm)
    );
    return filteredContacts;
}