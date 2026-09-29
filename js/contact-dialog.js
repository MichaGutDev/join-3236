import { isValidEmail, isValidPhone } from './contact-utils.js';
import { getInitials } from './contact-templates.js';


const CONTACT_FIELD_IDS = ['dialog_input_name', 'dialog_input_email', 'dialog_input_phone'];
const ERROR_SPAN_SUFFIXES = { dialog_input_name: 'name', dialog_input_email: 'email', dialog_input_phone: 'phone' };


/**
 * Returns the id of the error message span belonging to the given field.
 *
 * @param {string} fieldId - The id of the input field.
 * @returns {string} The id of the field's error message span.
 */
function getErrorSpanId(fieldId) {
    return `contact-form-error-${ERROR_SPAN_SUFFIXES[fieldId]}`;
}


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
 * Shows an error message and highlights the given field.
 *
 * @param {string} fieldId - The id of the input field to highlight.
 * @param {string} message - The error message to display.
 */
export function showContactError(fieldId, message) {
    document.getElementById(getErrorSpanId(fieldId)).textContent = message;
    document.getElementById(fieldId).classList.add('field-error');
}


/**
 * Clears all contact form error messages and removes highlighting from all fields.
 */
export function clearContactError() {
    CONTACT_FIELD_IDS.forEach((id) => {
        document.getElementById(id).classList.remove('field-error');
        document.getElementById(getErrorSpanId(id)).textContent = '';
    });
}


/**
 * Determines the validation error message for a single field's value.
 *
 * @param {string} fieldId - The id of the field being checked.
 * @param {string} value - The field's current value.
 * @returns {string|null} The error message, or null if valid.
 */
function getFieldError(fieldId, value) {
    if (!value) return 'This field is required.';
    if (fieldId === 'dialog_input_email' && !isValidEmail(value)) {
        return 'Please enter a valid email address.';
    }
    if (fieldId === 'dialog_input_phone' && !isValidPhone(value)) {
        return 'Please enter a valid phone number.';
    }
    return null;
}


/**
 * Clears the highlight and error message on a single field.
 *
 * @param {string} fieldId - The id of the field to clear.
 */
function clearFieldError(fieldId) {
    document.getElementById(fieldId).classList.remove('field-error');
    document.getElementById(getErrorSpanId(fieldId)).textContent = '';
}


/**
 * Validates a single contact field on blur and updates its own error state.
 *
 * @param {string} fieldId - The id of the field to validate.
 */
export function validateContactField(fieldId) {
    const value = document.getElementById(fieldId).value.trim();
    const error = getFieldError(fieldId, value);

    if (error) {
        showContactError(fieldId, error);
    } else {
        clearFieldError(fieldId);
    }
}


/**
 * Validates all contact form fields, highlighting each invalid field individually.
 *
 * @param {string} name - The entered name.
 * @param {string} email - The entered email.
 * @param {string} phone - The entered phone number.
 * @returns {boolean} True if the form is valid.
 */
export function isContactFormValid(name, email, phone) {
    const values = { dialog_input_name: name, dialog_input_email: email, dialog_input_phone: phone };
    let isValid = true;

    Object.entries(values).forEach(([fieldId, value]) => {
        const error = getFieldError(fieldId, value);
        if (error) {
            showContactError(fieldId, error);
            isValid = false;
        }
    });

    return isValid;
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
