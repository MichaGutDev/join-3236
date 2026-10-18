/**
 * Filters tasks by title and description based on the current search input value, and returns the array.
 *
 * @param {Object[]} tasks - The tasks from the board.
 * @param {string} searchTerm - The search input value.
 * @returns {Object[]} The matching tasks.
 */
export function filterTasks(tasks, searchTerm) {
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
    );
    return filteredTasks;
}


/**
 * Filters contacts by name based on the current search input value, and returns the array.
 *
 * @param {Object[]} contacts - The contacts from the task form.
 * @param {string} searchTerm - The search input value.
 * @returns {Object[]} The matching contacts.
 */
export function filterContacts(contacts, searchTerm) {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(normalizedSearchTerm)
    );
    return filteredContacts;
}