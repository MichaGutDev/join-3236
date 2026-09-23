import { database } from "./firebase-config.js";
import { ref, onValue, update, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const tasksRef = ref(database, "tasks");
const contactsRef = ref(database, "contacts");

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

export function updateTaskStatus(id, status) {
    const updates = {};
    updates[`/tasks/${id}/status`] = status;
    return update(ref(database), updates);
}


export async function saveTask(task, id = null) {
    if (id) {
        const taskRef = ref(database, `tasks/${id}`);
        await set(taskRef, task);
        return;
    }
    const tasksRef = ref(database, "tasks");
    const newTaskRef = push(tasksRef);
    await set(newTaskRef, task);
}

export function updateSubtaskCompletion(id, index, completion) {
    const updates = {};
    updates[`/tasks/${id}/subtasks/${index}/completion`] = completion;
    return update(ref(database), updates);
}

export function listenToContacts(callback) {
    onValue(contactsRef, (snapshot) => {
        const contactsData = snapshot.val();
        const contacts = contactsData
            ? Object.entries(contactsData).map(([id, contact]) => {
                return { ...contact, id };
            })
            : [];
        callback(contacts);
    });
}

// listenToContacts((updatedContacts) => {
//         contacts = updatedContacts;});