import { database } from './firebase-config.js';
import { push, set, ref, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { getRandomContactColor, isValidEmail } from './contact-utils.js';


const contactsRef = ref(database, "contacts");


function saveContact() {

}


function deleteContact() {

}


// dialog_topic_area -> innerHTML
// dialog_input_name -> value
// dialog_input_mail -> value
// dialog_input_phone -> value
// dialog_button_area -> innerHTML

function openDialog() {
    let dialog = document.getElementById('dialog');
    clearContactError();
    dialog.showModal();
}


function closeDialog() {
    let dialog = document.getElementById('dialog');
    CONTACT_FIELD_IDS.forEach((id) => {
        document.getElementById(id).value = "";
    });
    dialog.close();
}


function cancelDialog() {

}


function stopBubbleling(event) {
    event.stopPropagation();
}



const CONTACT_FIELD_IDS = ['dialog_input_name', 'dialog_input_mail', 'dialog_input_phone'];


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


async function addContact() {
    const name = document.getElementById('dialog_input_name').value.trim();
    const email = document.getElementById('dialog_input_mail').value.trim();
    const phone = document.getElementById('dialog_input_phone').value.trim();

    clearContactError();

    if (!name || !email || !phone) {
        showContactError(CONTACT_FIELD_IDS, 'Please fill in all fields.');
        return;
    }

    if (!isValidEmail(email)) {
        showContactError(['dialog_input_mail'], 'Please enter a valid email address.');
        return;
    }

    const contact = { name, email, phone, color: getRandomContactColor() };

    const newContactRef = push(contactsRef);
    set(newContactRef, contact);

    closeDialog();
}


/**
 * Builds the HTML for a single contact list item.
 *
 * @param {string} id - The Firebase key of the contact.
 * @param {object} contact - The contact data (name, email, phone, color).
 * @returns {string} The generated HTML markup.
 */
function generateContactHTML(id, contact) {
    return `
        <div class="contact-list-item" data-id="${id}">
            <div class="contact-content">
                <div class="initials-box">
                    <div class="contact-initials" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>
                </div>
                <div class="contact-item">
                    <div class="contact-list-name">${contact.name}</div>
                    <div class="contact-list-email">${contact.email}</div>
                </div>
            </div>
        </div>
    `;
}


/**
 * Builds the initials from a contact's full name.
 *
 * @param {string} name - The contact's full name.
 * @returns {string} The uppercase initials.
 */
function getInitials(name) {
    return name.split(" ").map(w => w[0]).join("").toUpperCase();
}


onValue(contactsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const entries = Object.entries(data);
    const html = entries.filter(([id, contact]) => typeof contact === "object").sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, contact]) => generateContactHTML(id, contact)).join("");
    document.getElementById("contact_list").innerHTML = html;
});


function editContact() {
    setDialogMode(true);

    document.getElementById('dialog_topic_area').innerHTML = "";
    document.getElementById('dialog_topic_area').innerHTML = `
        <img class="dialog-join-logo" src="../assets/imgs/dialog-join-logo.svg" alt="">
        <h2 class="dialog-topic-title">Edit Contact</h2>
        <div class="dialog-topic-underline"></div>
    `;

    openDialog();
}


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

