import { database } from './firebase-config.js';
import { push, get, set, remove, ref, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { getRandomContactColor, isValidEmail } from './contact-utils.js';
import { getInitials, generateContactListHTML } from './contact-templates.js';


const contactsRef = ref(database, "contacts");
const tasksRef = ref(database, "tasks");
const CONTACT_FIELD_IDS = ['dialog_input_name', 'dialog_input_email', 'dialog_input_phone'];
let contactsData = {};
let selectedContactId = null;


/**
 * Saves changes to the currently edited contact.
 */
function saveContact() {
    const name = document.getElementById('dialog_input_name').value.trim();
    const email = document.getElementById('dialog_input_email').value.trim();
    const phone = document.getElementById('dialog_input_phone').value.trim();

    clearContactError();
    if (!isContactFormValid(name, email, phone)) return;

    const contact = { name, email, phone, color: contactsData[selectedContactId].color };
    const contactRef = ref(database, "contacts/" + selectedContactId);
    set(contactRef, contact);

    renderContactDetails(contact);
    closeDialog();
}


/**
 * Deletes the currently selected or edited contact.
 */
function deleteContact() {
    const contactRef = ref(database, "contacts/" + selectedContactId);
    remove(contactRef);

    document.getElementById('contact_details').hidden = true;

    removeContactFromTasks(selectedContactId);

    closeDialog();
}


/**
 * Removes a contact id from the assignedTo list of every task that has it.
 *
 * @param {string} contactId - The id of the deleted contact.
 * @returns {Promise<void>}
 */
async function removeContactFromTasks(contactId) {
    const snapshot = await get(tasksRef);
    const tasksData = snapshot.val();
    const taskEntries = Object.entries(tasksData);

    taskEntries.forEach(([taskId, task]) => {
        const isAssigned = task.assignedTo.includes(contactId);

        if (isAssigned) {
            const updatedAssignedTo = task.assignedTo.filter(id => id !== contactId);
            set(ref(database, "tasks/" + taskId + "/assignedTo"), updatedAssignedTo);
        }
    });
}


/**
 * Opens the contact dialog and clears any previous error state.
 */
function openDialog() {
    let dialog = document.getElementById('dialog');
    clearContactError();
    dialog.showModal();
}


/**
 * Closes the contact dialog and resets the form fields.
 */
function closeDialog() {
    let dialog = document.getElementById('dialog');
    CONTACT_FIELD_IDS.forEach((id) => {
        document.getElementById(id).value = "";
    });
    dialog.close();
}


/**
 * Cancels the current dialog action without saving.
 */
function cancelDialog() {
    closeDialog();
}


/**
 * Stops a click event from bubbling up to the dialog backdrop.
 *
 * @param {MouseEvent} event
 */
function stopBubbleling(event) {
    event.stopPropagation();
}


/**
 * Shows an error message and highlights the given fields.
 *
 * @param {string[]} fieldIds - The ids of the input fields to highlight.
 * @param {string} message - The error message to display.
 */
function showContactError(fieldIds, message) {
    document.getElementById('contact-form-error').textContent = message;
    fieldIds.forEach((id) => {
        document.getElementById(id).classList.add('field-error');
    });
}


/**
 * Clears the contact form error message and removes highlighting from all fields.
 */
function clearContactError() {
    document.getElementById('contact-form-error').textContent = "";
    CONTACT_FIELD_IDS.forEach((id) => {
        document.getElementById(id).classList.remove('field-error');
    });
}


/**
 * Validates the contact form fields and shows an error message if invalid.
 *
 * @param {string} name - The entered name.
 * @param {string} email - The entered email.
 * @param {string} phone - The entered phone number.
 * @returns {boolean} True if the form is valid.
 */
function isContactFormValid(name, email, phone) {
    if (!name || !email || !phone) {
        showContactError(CONTACT_FIELD_IDS, 'Please fill in all fields.');
        return false;
    }

    if (!isValidEmail(email)) {
        showContactError(['dialog_input_email'], 'Please enter a valid email address.');
        return false;
    }

    return true;
}


/**
 * Reads the contact form, validates it and saves a new contact to Firebase.
 */
async function addContact() {
    const name = document.getElementById('dialog_input_name').value.trim();
    const email = document.getElementById('dialog_input_email').value.trim();
    const phone = document.getElementById('dialog_input_phone').value.trim();

    clearContactError();
    if (!isContactFormValid(name, email, phone)) return;

    const contact = { name, email, phone, color: getRandomContactColor() };
    const newContactRef = push(contactsRef);
    set(newContactRef, contact);

    closeDialog();
}


/**
 * Opens the contact dialog in edit mode.
 */
function editContact() {
    setDialogMode(true);

    const contact = contactsData[selectedContactId];
    document.getElementById('dialog_input_name').value = contact.name;
    document.getElementById('dialog_input_email').value = contact.email;
    document.getElementById('dialog_input_phone').value = contact.phone;

    const dialogInitials = document.getElementById('dialog-initials');
    dialogInitials.textContent = getInitials(contact.name);
    dialogInitials.style.backgroundColor = contact.color;


    document.getElementById('dialog_topic_area').innerHTML = "";
    document.getElementById('dialog_topic_area').innerHTML = `
        <img class="dialog-join-logo" src="../assets/imgs/dialog-join-logo.svg" alt="">
        <h2 class="dialog-topic-title">Edit Contact</h2>
        <div class="dialog-topic-underline"></div>
    `;

    openDialog();
}


/**
 * Opens the contact dialog in add mode.
 */
function createContact() {
    setDialogMode(false);

    document.getElementById('dialog_topic_area').innerHTML = "";
    document.getElementById('dialog_topic_area').innerHTML = `
        <img class="dialog-join-logo" src="../assets/imgs/dialog-join-logo.svg" alt="">
        <h2 class="dialog-topic-title">Add contact</h2>
        <p class="dialog-topic-slogan">Tasks are better with a team</p>
        <div class="dialog-topic-underline"></div>
    `;
    openDialog();
}


/**
 * Toggles which dialog buttons and avatar are visible depending on add or edit mode.
 *
 * @param {boolean} isEdit - True to show edit buttons, false to show add buttons.
 */
function setDialogMode(isEdit) {
    const cancelContactBtnDialog = document.getElementById('cancel-contact-btn-dialog');
    cancelContactBtnDialog.hidden = isEdit;
    const createContactBtnDialog = document.getElementById('create-contact-btn-dialog');
    createContactBtnDialog.hidden = isEdit;
    const dialogAvatarPlaceholder = document.getElementById('dialog-avatar-placeholder');
    dialogAvatarPlaceholder.hidden = isEdit;
    const dialogInitials = document.getElementById('dialog-initials');
    dialogInitials.hidden = !isEdit;
    const deleteContactBtnDialog = document.getElementById('delete-contact-btn-dialog');
    deleteContactBtnDialog.hidden = !isEdit;
    const saveContactBtnDialog = document.getElementById('save-contact-btn-dialog');
    saveContactBtnDialog.hidden = !isEdit;
}


/**
 * Shows the details of the contact that was clicked or activated via keyboard, and highlights it in the list.
 *
 * @param {MouseEvent|KeyboardEvent} event
 */
function handleContactClick(event) {
    const contactItem = event.target.closest('.contact-list-item');
    if (contactItem === null) {
        return;
    }

    const id = contactItem.dataset.id;
    const contact = contactsData[id];

    renderContactDetails(contact);

    document.getElementById('contact_details').hidden = false;
    selectedContactId = id;

    document.querySelector('.contact-list-item.active')?.classList.remove('active');
    contactItem.classList.add('active');
}


/**
 * Renders a contact's data into the details panel.
 *
 * @param {object} contact - The contact data (name, email, phone, color).
 */
function renderContactDetails(contact) {
    document.getElementById('contact_details_name').textContent = contact.name;
    document.getElementById('contact_details_email').textContent = contact.email;
    document.getElementById('contact_details_email').href = 'mailto:' + contact.email;
    document.getElementById('contact_details_phone').textContent = contact.phone;
    document.getElementById('contact_details_initials').textContent = getInitials(contact.name);
    document.querySelector('.contact-details-initials').style.backgroundColor = contact.color;
}


/**
 * Activates a contact via keyboard (Enter or Space), same as a click.
 *
 * @param {KeyboardEvent} event
 */
function handleContactKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleContactClick(event);
}


onValue(contactsRef, (snapshot) => {
    const data = snapshot.val() || {};
    contactsData = data;
    const entries = Object.entries(data);

    const validContacts = entries.filter(([id, contact]) => typeof contact === "object" && contact.name);
    const sortedContacts = validContacts.sort((a, b) => a[1].name.localeCompare(b[1].name));

    const html = generateContactListHTML(sortedContacts);
    document.getElementById("contact_list").innerHTML = html;
});


const addContactBtn = document.getElementById('add-contact-btn');
if (addContactBtn) {
    addContactBtn.addEventListener('click', createContact);
}


const dialog = document.getElementById('dialog');
if (dialog) {
    dialog.addEventListener('click', closeDialog);
}


const dialogCloseBtn = document.getElementById('dialog-close-btn');
if (dialogCloseBtn) {
    dialogCloseBtn.addEventListener('click', closeDialog);
}


const dialogBox = document.getElementById('dialog-box');
if (dialogBox) {
    dialogBox.addEventListener('click', stopBubbleling);
}


const editContactBtn = document.getElementById('edit-contact-btn');
if (editContactBtn) {
    editContactBtn.addEventListener('click', editContact);
}


const deleteContactBtnDetails = document.getElementById('delete-contact-btn-details');
if (deleteContactBtnDetails) {
    deleteContactBtnDetails.addEventListener('click', deleteContact);
}


const deleteContactBtnDialog = document.getElementById('delete-contact-btn-dialog');
if (deleteContactBtnDialog) {
    deleteContactBtnDialog.addEventListener('click', deleteContact);
}


const cancelContactBtnDialog = document.getElementById('cancel-contact-btn-dialog');
if (cancelContactBtnDialog) {
    cancelContactBtnDialog.addEventListener('click', cancelDialog);
}


const saveContactBtnDialog = document.getElementById('save-contact-btn-dialog');
if (saveContactBtnDialog) {
    saveContactBtnDialog.addEventListener('click', saveContact);
}


const createContactBtnDialog = document.getElementById('create-contact-btn-dialog');
if (createContactBtnDialog) {
    createContactBtnDialog.addEventListener('click', addContact);
}


const contactList = document.getElementById('contact_list');
if (contactList) {
    contactList.addEventListener('click', handleContactClick);
    contactList.addEventListener('keydown', handleContactKeydown);
}
