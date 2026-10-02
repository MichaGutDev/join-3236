import { listenToContacts } from "./db.js";
import { initTaskForm, updateFormContacts } from "./task-form.js";

function init() {
  initTaskForm();
  listenToContacts((updatedContacts) => {
    updateFormContacts(updatedContacts);
  });
}


init();