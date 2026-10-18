import { database } from "./firebase-config.js";
import { ref, onValue, update, push, set, remove } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const tasksRef = ref(database, "tasks");
const contactsRef = ref(database, "contacts");


/**
 * Subscribes to Firebase task updates and passes the task list to the callback.
 *
 * @param {(tasks: Object[]) => void} callback - Receives the updated tasks.
 */
export function listenToTasks(callback) {
    onValue(tasksRef, (snapshot) => {
        const taskData = snapshot.val();
        const tasks = taskData
            ? Object.entries(taskData).map(([id, task]) => {
                return { ...task, id };
            })
            : [];
        callback(tasks);
    });
}


/**
 * Updates a task's status in Firebase.
 *
 * @param {string} id - ID of the task.
 * @param {string} status - New task status.
 * @returns {Promise<void>}
 */
export function updateTaskStatus(id, status) {
    const updates = {};
    updates[`/tasks/${id}/status`] = status;
    return update(ref(database), updates);
}


/**
 * Creates a new task or updates an existing task in Firebase.
 *
 * @param {Object} task - Task data to save.
 * @param {string|null} [id=null] - ID of the task to update.
 * @returns {Promise<void>}
 */
export async function saveTask(task, id = null) {
    if (id) {
        const taskRef = ref(database, `tasks/${id}`);
        await set(taskRef, task);
        return;
    }
    const newTaskRef = push(tasksRef);
    await set(newTaskRef, task);
}


/**
 * Updates a subtask's completion state in Firebase.
 *
 * @param {string} id - ID of the parent task.
 * @param {number} index - Index of the subtask.
 * @param {boolean} completion - New completion state.
 * @returns {Promise<void>}
 */
export function updateSubtaskCompletion(id, index, completion) {
    const updates = {};
    updates[`/tasks/${id}/subtasks/${index}/completion`] = completion;
    return update(ref(database), updates);
}


/**
 * Deletes a task from Firebase.
 *
 * @param {string} id - ID of the task to delete.
 * @returns {Promise<void>}
 */
export function deleteTask(id) {
    const taskRef = ref(database, `tasks/${id}`);
    return remove(taskRef);
}


/**
 * Subscribes to Firebase contact updates.
 *
 * @param {(contacts: Object[]) => void} callback - Receives the updated contacts.
 * @returns {() => void} Function to unsubscribe from updates.
 */
export function listenToContacts(callback) {
    return onValue(contactsRef, (snapshot) => {
        const contactsData = snapshot.val();
        const contacts = contactsData
            ? Object.entries(contactsData).map(([id, contact]) => {
                return { ...contact, id };
            })
            : [];
        callback(contacts);
    });
}