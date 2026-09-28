import { database } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { saveTask, listenToContacts } from "./db.js";
import { initTaskForm, renderContacts } from "./taskForm.js";
// import { field } from '/firebase/firestore/pipelines';
let contacts = [];
let contactsRendered = false;

function init() {
  listenToContacts((updatedContacts) => {
    contacts = updatedContacts;
    if (!contactsRendered) {
      renderContacts(contacts);
      contactsRendered = true;
    }
  })
}

init();
initTaskForm();