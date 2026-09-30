import { listenToContacts } from "./db.js";
import { initTaskForm, updateFormContacts } from "./taskForm.js";

function init() {
  initTaskForm();
  listenToContacts((updatedContacts) => {
    updateFormContacts(updatedContacts);
  });
}


init();