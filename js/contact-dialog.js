import { isValidEmail, isValidPhone } from './contact-utils.js';
import { getInitials } from './contact-templates.js';


const CONTACT_FIELD_IDS = ['dialog_input_name', 'dialog_input_email', 'dialog_input_phone'];


/**
 * Opens the contact dialog and clears any previous error state.
 */
export function openDialog() {
    let dialog = document.getElementById('dialog');
    clearContactError();
    dialog.showModal();
}


/**
 * Closes the contact dialog and resets the form fields.
 */
export function closeDialog() {
    let dialog = document.getElementById('dialog');
    CONTACT_FIELD_IDS.forEach((id) => {
        document.getElementById(id).value = "";
    });
    document.getElementById('save-contact-btn-dialog').disabled = false;
    document.getElementById('create-contact-btn-dialog').disabled = false;
    setDeleteButtonsDisabled(false);
    dialog.close();
}


/**
 * Cancels the current dialog action without saving.
 */
export function cancelDialog() {
    closeDialog();
}


/**
 * Stops a click event from bubbling up to the dialog backdrop.
 *
 * @param {MouseEvent} event
 */
export function stopBubbleling(event) {
    event.stopPropagation();
}


/**
 * Enables or disables all buttons that can trigger a contact deletion.
 *
 * @param {boolean} disabled - True to disable the buttons.
 */
export function setDeleteButtonsDisabled(disabled) {
    document.getElementById('delete-contact-btn-details').disabled = disabled;
    document.getElementById('delete-contact-btn-mobile').disabled = disabled;
    document.getElementById('delete-contact-btn-dialog').disabled = disabled;
}


/**
 * Shows an error message and highlights the given fields.
 *
 * @param {string[]} fieldIds - The ids of the input fields to highlight.
 * @param {string} message - The error message to display.
 */
export function showContactError(fieldIds, message) {
    document.getElementById('contact-form-error').textContent = message;
    fieldIds.forEach((id) => {
        document.getElementById(id).classList.add('field-error');
    });
}


/**
 * Clears the contact form error message and removes highlighting from all fields.
 */
export function clearContactError() {
    document.getElementById('contact-form-error').textContent = "";
    CONTACT_FIELD_IDS.forEach((id) => {
        document.getElementById(id).classList.remove('field-error');
    });
}


/**
 * Determines the first validation error for the given contact form values.
 *
 * @param {string} name - The entered name.
 * @param {string} email - The entered email.
 * @param {string} phone - The entered phone number.
 * @returns {{fields: string[], message: string}|null} The error to show, or null if valid.
 */
function getContactValidationError(name, email, phone) {
    if (!name || !email || !phone) {
        return { fields: CONTACT_FIELD_IDS, message: 'Please fill in all fields.' };
    }
    if (!isValidEmail(email)) {
        return { fields: ['dialog_input_email'], message: 'Please enter a valid email address.' };
    }
    if (!isValidPhone(phone)) {
        return { fields: ['dialog_input_phone'], message: 'Please enter a valid phone number.' };
    }
    return null;
}


/**
 * Validates the contact form fields and shows an error message if invalid.
 *
 * @param {string} name - The entered name.
 * @param {string} email - The entered email.
 * @param {string} phone - The entered phone number.
 * @returns {boolean} True if the form is valid.
 */
export function isContactFormValid(name, email, phone) {
    const error = getContactValidationError(name, email, phone);
    if (!error) return true;

    showContactError(error.fields, error.message);
    return false;
}


/**
 * Shows a toast with the given message for a short moment.
 *
 * @param {string} message - The text to display in the toast.
 */
export function showContactToast(message) {
    const toast = document.getElementById('contact-toast');
    toast.textContent = message;
    toast.style.display = 'flex';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 1500);
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
 * Opens the contact dialog in edit mode, pre-filled with the given contact.
 *
 * @param {object} contact - The contact data (name, email, phone, color).
 */
export function editContact(contact) {
    setDialogMode(true);

    document.getElementById('dialog_input_name').value = contact.name;
    document.getElementById('dialog_input_email').value = contact.email;
    document.getElementById('dialog_input_phone').value = contact.phone;

    const dialogInitials = document.getElementById('dialog-initials');
    dialogInitials.textContent = getInitials(contact.name);
    dialogInitials.style.backgroundColor = contact.color;

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
export function createContact() {
    setDialogMode(false);

    document.getElementById('dialog_topic_area').innerHTML = `
        <img class="dialog-join-logo" src="../assets/imgs/dialog-join-logo.svg" alt="">
        <h2 class="dialog-topic-title">Add contact</h2>
        <p class="dialog-topic-slogan">Tasks are better with a team</p>
        <div class="dialog-topic-underline"></div>
    `;
    openDialog();
}
